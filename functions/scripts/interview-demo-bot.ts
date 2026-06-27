// Headless candidate bot: runs REAL AI capstone interviews end-to-end and
// captures presentable artifacts (transcript, graded report, audio WAV).
//
// Run: cd functions && OPENAI_API_KEY=sk-... npm run interview:demo
//
// NO top-level await — functions/ has no "type" field (CommonJS).

import WebSocket from 'ws'
import * as fs from 'node:fs'
import * as path from 'node:path'
import { initializeApp } from 'firebase-admin/app'
import {
  InterviewPackSchema,
  type InterviewPack,
  type Question,
  type Turn,
  type InterviewReport,
} from '../src/interviewPack'

// ── Types ──────────────────────────────────────────────────────────────────────

type ExtractFn = (data: { output?: unknown; output_text?: unknown }) => string

interface Args {
  questionId: string
  personas: string[]
  maxTurns: number
  outDir: string
  realtimeModel: string | undefined
  brainModel: string
  ttsModel: string
  ttsVoice: string
  graderModel: string | undefined
  dryRun: boolean
  sequential: boolean
  help: boolean
}

interface InterviewerTurn {
  text: string
  audio: Buffer
}

interface RealtimeSession {
  send(msg: object): void
  collectResponse(timeoutMs?: number): Promise<InterviewerTurn>
  waitWhisper(timeoutMs?: number): Promise<string>
  close(): void
  rawEvents: object[]
}

interface PersonaResult {
  persona: string
  transcript: Turn[]
  report: InterviewReport
  audioTimeline: Buffer[]
  intendedTexts: string[]
}

// ── Constants ─────────────────────────────────────────────────────────────────

const REPO_ROOT = path.resolve(__dirname, '../..')
const RUN_TS = new Date().toISOString()

const WRAP_UP_PHRASES = [
  'thank you for your time',
  'that concludes',
  'that wraps up',
  'concludes our interview',
  'good luck',
  'this concludes',
]

// ── Args ──────────────────────────────────────────────────────────────────────

function parseArgs(argv: string[]): Args {
  const args: Args = {
    questionId: 'tmpl-coupon-collector#full-N5',
    personas: ['weak', 'average', 'strong'],
    maxTurns: 8,
    outDir: path.join(REPO_ROOT, 'artifacts', 'interview-demo', RUN_TS.replace(/:/g, '-').replace(/\..+/, '')),
    realtimeModel: undefined,
    brainModel: 'gpt-5.5',
    ttsModel: 'gpt-4o-mini-tts',
    ttsVoice: 'onyx',
    graderModel: undefined,
    dryRun: false,
    sequential: false,
    help: false,
  }
  for (let i = 0; i < argv.length; i++) {
    switch (argv[i]) {
      case '--help': case '-h':  args.help = true; break
      case '--dry-run':          args.dryRun = true; break
      case '--sequential':       args.sequential = true; break
      case '--question':         args.questionId = argv[++i]; break
      case '--personas':         args.personas = argv[++i].split(',').map((s) => s.trim()); break
      case '--max-turns':        args.maxTurns = parseInt(argv[++i], 10); break
      case '--out':              args.outDir = path.resolve(REPO_ROOT, argv[++i]); break
      case '--realtime-model':   args.realtimeModel = argv[++i]; break
      case '--brain-model':      args.brainModel = argv[++i]; break
      case '--tts-model':        args.ttsModel = argv[++i]; break
      case '--tts-voice':        args.ttsVoice = argv[++i]; break
      case '--grader-model':     args.graderModel = argv[++i]; break
    }
  }
  return args
}

function printHelp(): void {
  console.log(`
interview-demo-bot — Headless AI capstone interview artifact tool

Usage:
  cd functions && OPENAI_API_KEY=sk-... npm run interview:demo [options]

Options:
  --question <id>        Question ID (default: tmpl-coupon-collector#full-N5)
  --personas <csv>       Comma-separated: weak,average,strong (default: all three)
  --max-turns <n>        Max candidate turns per interview (default: 8)
  --out <dir>            Output dir, relative to repo root (default: artifacts/interview-demo/<ts>)
  --realtime-model <m>   Override Realtime model (default: imported REALTIME_MODEL constant)
  --brain-model <m>      Candidate brain model (default: gpt-5.5)
  --tts-model <m>        TTS model for candidate audio (default: gpt-4o-mini-tts)
  --tts-voice <v>        TTS voice for candidate (default: onyx)
  --grader-model <m>     Override grader model (default: imported GRADER_MODEL constant)
  --sequential          Run personas one at a time (default: parallel)
  --dry-run              Run preflight checks only, then exit 0
  --help                 Print this help and exit 0

Examples:
  OPENAI_API_KEY=sk-... npm run interview:demo
  OPENAI_API_KEY=sk-... npm run interview:demo --dry-run
  OPENAI_API_KEY=sk-... npm run interview:demo --personas strong --max-turns 6
`)
}

// ── Persona prompts ────────────────────────────────────────────────────────────

function personaSystem(persona: string, question: Question): string {
  const base = [
    'You are role-playing a candidate in a LIVE SPOKEN quant mock interview. Your words are',
    'spoken aloud via TTS, so be conversational and think out loud — NO markdown, NO LaTeX,',
    'spell math in words (say "one half", "H sub 5"). Keep each turn to ~2-6 sentences like',
    "real speech. Answer the interviewer's latest turn.",
    '',
    'This is a ROLE-PLAY. Stay fully in character at your assigned ability level for the ENTIRE',
    'interview — through every follow-up and after every hint. Do NOT break character by',
    'suddenly producing a flawless answer.',
    '',
    `The question: ${question.prompt}`,
    '',
  ]
  const wrongTurns = question.hidden.wrongTurns.map((w) => `- ${w}`).join('\n')
  const clauses: Record<string, string> = {
    weak: [
      'You are a WEAK candidate who has NOT mastered this topic. You must give genuinely WRONG or',
      'oversimplified answers: do NOT state the correct method or the correct final number, and do',
      'NOT secretly solve it correctly. Adopt these specific misconceptions as your real reasoning',
      'and defend them when asked:',
      wrongTurns || '- (oversimplify; assume the naive/obvious answer is right)',
      'Guess, sound unsure, and sometimes contradict yourself. When the interviewer hints, get',
      'confused or only partially adjust — you should still end up wrong or hand-wavy and never',
      'reach the clean solution or the exact value. You simply do not know the trick.',
    ].join('\n'),
    average: [
      'You are an AVERAGE candidate: the right general idea but shaky and error-prone. Start with a',
      'concrete mistake or two — e.g. one of these classic slips:',
      wrongTurns || '- (a plausible but wrong first guess)',
      '— or an arithmetic error or a garbled per-stage probability. Only AFTER the interviewer hints',
      'or pushes do you partially self-correct. Do NOT deliver a clean, flawless answer on the first',
      'try; you should visibly need nudging and may still leave small errors.',
    ].join('\n'),
    strong: [
      'You are a STRONG candidate: reason correctly and crisply, structure your approach, get the',
      'exact right answer, and handle follow-ups well, with only occasional natural hesitation.',
    ].join('\n'),
  }
  return [...base, clauses[persona] ?? clauses.strong].join('\n')
}

function personaTone(persona: string): string {
  const tones: Record<string, string> = {
    weak:    'Hesitant and unsure, with filler words and pauses.',
    average: 'Thoughtful, occasionally uncertain.',
    strong:  'Confident, clear, and measured.',
  }
  return tones[persona] ?? 'Natural.'
}

// ── Audio ─────────────────────────────────────────────────────────────────────

function pcmToWav(pcm: Buffer, opts: { sampleRate: number; channels: number; bitDepth: number }): Buffer {
  const { sampleRate, channels, bitDepth } = opts
  const byteRate = sampleRate * channels * (bitDepth / 8)
  const blockAlign = channels * (bitDepth / 8)
  const hdr = Buffer.allocUnsafe(44)
  hdr.write('RIFF', 0)
  hdr.writeUInt32LE(36 + pcm.length, 4)
  hdr.write('WAVE', 8)
  hdr.write('fmt ', 12)
  hdr.writeUInt32LE(16, 16)
  hdr.writeUInt16LE(1, 20)          // PCM format
  hdr.writeUInt16LE(channels, 22)
  hdr.writeUInt32LE(sampleRate, 24)
  hdr.writeUInt32LE(byteRate, 28)
  hdr.writeUInt16LE(blockAlign, 32)
  hdr.writeUInt16LE(bitDepth, 34)
  hdr.write('data', 36)
  hdr.writeUInt32LE(pcm.length, 40)
  return Buffer.concat([hdr, pcm])
}

// ── Network helpers ────────────────────────────────────────────────────────────

async function tts(text: string, model: string, voice: string, instructions: string, key: string): Promise<Buffer> {
  const res = await fetch('https://api.openai.com/v1/audio/speech', {
    method: 'POST',
    headers: { Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ model, input: text, voice, instructions, response_format: 'pcm' }),
  })
  if (!res.ok) throw new Error(`TTS failed ${res.status}: ${await res.text()}`)
  return Buffer.from(await res.arrayBuffer())
}

async function callBrain(
  messages: Array<{ role: string; content: string }>,
  model: string,
  effort: 'low' | 'medium',
  key: string,
  extractFn: ExtractFn,
): Promise<string> {
  const res = await fetch('https://api.openai.com/v1/responses', {
    method: 'POST',
    headers: { Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ model, input: messages, reasoning: { effort } }),
  })
  if (!res.ok) throw new Error(`Brain call failed ${res.status}: ${await res.text()}`)
  const data = (await res.json()) as { output?: unknown; output_text?: unknown }
  const text = extractFn(data)
  if (!text.trim()) throw new Error('Brain model returned empty response')
  return text
}

async function gradeTranscript(opts: {
  question: Question
  transcript: Turn[]
  model: string
  key: string
  buildPromptFn: (q: Question, t: Turn[]) => string
  extractFn: ExtractFn
  schema: object
}): Promise<InterviewReport> {
  const { question, transcript, model, key, buildPromptFn, extractFn, schema } = opts
  const prompt = buildPromptFn(question, transcript)
  const res = await fetch('https://api.openai.com/v1/responses', {
    method: 'POST',
    headers: { Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model,
      input: prompt,
      reasoning: { effort: 'medium' },
      text: { format: { type: 'json_schema', name: 'interview_grade', strict: true, schema } },
    }),
  })
  if (!res.ok) throw new Error(`Grader failed ${res.status}: ${await res.text()}`)
  const data = (await res.json()) as { output?: unknown; output_text?: unknown }
  const json = extractFn(data)
  if (!json.trim()) throw new Error('Grader returned empty output')
  return JSON.parse(json) as InterviewReport
}

// ── Preflight ─────────────────────────────────────────────────────────────────

async function checkChat(model: string, key: string): Promise<{ ok: boolean; error?: string }> {
  try {
    const res = await fetch('https://api.openai.com/v1/responses', {
      method: 'POST',
      headers: { Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ model, input: 'ping', max_output_tokens: 16 }),
    })
    return res.ok ? { ok: true } : { ok: false, error: `${res.status}: ${await res.text()}` }
  } catch (err) {
    return { ok: false, error: (err as Error).message }
  }
}

async function checkTts(model: string, voice: string, key: string): Promise<{ ok: boolean; error?: string }> {
  try {
    const res = await fetch('https://api.openai.com/v1/audio/speech', {
      method: 'POST',
      headers: { Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ model, input: 'test', voice, response_format: 'pcm' }),
    })
    if (!res.ok) return { ok: false, error: `${res.status}: ${await res.text()}` }
    const buf = Buffer.from(await res.arrayBuffer())
    return buf.length > 0 ? { ok: true } : { ok: false, error: 'Empty audio response' }
  } catch (err) {
    return { ok: false, error: (err as Error).message }
  }
}

async function checkRealtime(model: string, key: string): Promise<{ ok: boolean; error?: string }> {
  return new Promise((resolve) => {
    const url = `wss://api.openai.com/v1/realtime?model=${encodeURIComponent(model)}`
    let ws: WebSocket
    try {
      ws = new WebSocket(url, { headers: { Authorization: `Bearer ${key}` } })
    } catch (err) {
      resolve({ ok: false, error: (err as Error).message })
      return
    }
    const timer = setTimeout(() => {
      ws.terminate()
      resolve({ ok: false, error: 'Timed out waiting for session.created' })
    }, 20000)
    ws.on('message', (raw) => {
      const event = JSON.parse(raw.toString()) as { type: string; error?: unknown }
      if (event.type === 'session.created') {
        clearTimeout(timer); ws.close(); resolve({ ok: true })
      } else if (event.type === 'error') {
        clearTimeout(timer); ws.close()
        resolve({ ok: false, error: JSON.stringify(event.error) })
      }
    })
    ws.on('error', (err: Error) => {
      clearTimeout(timer); resolve({ ok: false, error: err.message })
    })
  })
}

async function preflight(
  args: Args,
  key: string,
  realtimeModel: string,
  graderModel: string,
): Promise<boolean> {
  console.log('\nPreflight checks:')
  type Check = { label: string; run: () => Promise<{ ok: boolean; error?: string }> }
  const checks: Check[] = [
    { label: `brain (${args.brainModel})`,      run: () => checkChat(args.brainModel, key) },
    ...(graderModel !== args.brainModel
      ? [{ label: `grader (${graderModel})`,    run: () => checkChat(graderModel, key) }]
      : []),
    { label: `tts (${args.ttsModel})`,          run: () => checkTts(args.ttsModel, args.ttsVoice, key) },
    { label: `realtime (${realtimeModel})`,     run: () => checkRealtime(realtimeModel, key) },
  ]
  let allOk = true
  for (const { label, run } of checks) {
    process.stdout.write(`  ${label.padEnd(38)}`)
    const { ok, error } = await run()
    console.log(ok ? 'OK' : `FAIL — ${error ?? 'unknown error'}`)
    if (!ok) allOk = false
  }
  console.log('\nEstimated cost: ~$0.50–$1.50 per persona for Realtime audio + grading; 3 personas ≈ a few dollars.')
  if (!allOk) {
    console.log('\nGuidance: your key may not have access to one or more models.')
    console.log('Override with: --realtime-model / --brain-model / --grader-model / --tts-model / --tts-voice')
  }
  return allOk
}

// ── Realtime session ──────────────────────────────────────────────────────────

async function connectRealtime(
  realtimeModel: string,
  key: string,
  instructions: string,
  realtimeVoice: string,
): Promise<RealtimeSession> {
  const url = `wss://api.openai.com/v1/realtime?model=${encodeURIComponent(realtimeModel)}`
  const ws = new WebSocket(url, { headers: { Authorization: `Bearer ${key}` } })
  const rawEvents: object[] = []

  let audioChunks: Buffer[] = []
  let transcriptChunks: string[] = []
  let finalTranscript: string | null = null
  let onResponseDone: ((t: InterviewerTurn) => void) | null = null
  let onWhisper: ((text: string) => void) | null = null
  let onSessionCreated: (() => void) | null = null

  ws.on('message', (raw) => {
    const event = JSON.parse(raw.toString()) as Record<string, unknown>
    rawEvents.push(event)
    const type = event.type as string

    if (type === 'error') console.error('\n[Realtime ERROR]', JSON.stringify(event.error ?? event))

    if (type === 'session.created' && onSessionCreated) {
      const cb = onSessionCreated; onSessionCreated = null; cb()
    }
    if (type === 'response.output_audio.delta') {
      audioChunks.push(Buffer.from(event.delta as string, 'base64'))
    }
    if (type === 'response.output_audio_transcript.delta') {
      transcriptChunks.push((event.delta as string) ?? '')
    }
    if (type === 'response.output_audio_transcript.done') {
      finalTranscript = (event.transcript as string | undefined) ?? transcriptChunks.join('')
    }
    if (type === 'response.done' && onResponseDone) {
      const text = (finalTranscript ?? transcriptChunks.join('')).trim() || '(no transcript)'
      const audio = Buffer.concat(audioChunks)
      audioChunks = []; transcriptChunks = []; finalTranscript = null
      const cb = onResponseDone; onResponseDone = null; cb({ text, audio })
    }
    // Whisper provides the canonical candidate transcript; the brain's intended text
    // is a fallback only when Whisper times out.
    if (type === 'conversation.item.input_audio_transcription.completed' && onWhisper) {
      const cb = onWhisper; onWhisper = null; cb((event.transcript as string) ?? '')
    }
  })

  await new Promise<void>((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error('Timed out waiting for session.created')), 20000)
    onSessionCreated = () => { clearTimeout(timer); resolve() }
    ws.on('error', (err: Error) => { clearTimeout(timer); reject(err) })
    ws.on('close', () => { clearTimeout(timer); reject(new Error('WS closed before session.created')) })
  })

  // Manual VAD: bot drives turn-taking deterministically; silence detection would
  // fire on candidate pauses mid-utterance and break the loop.
  ws.send(JSON.stringify({
    type: 'session.update',
    session: {
      type: 'realtime',
      instructions,
      output_modalities: ['audio'],
      reasoning: { effort: 'low' },
      audio: {
        input: {
          format: { type: 'audio/pcm', rate: 24000 },
          transcription: { model: 'gpt-realtime-whisper', language: 'en' },
          turn_detection: null,
          noise_reduction: { type: 'near_field' },
        },
        output: { format: { type: 'audio/pcm', rate: 24000 }, voice: realtimeVoice, speed: 1.0 },
      },
    },
  }))

  return {
    send(msg: object) { ws.send(JSON.stringify(msg)) },

    collectResponse(timeoutMs = 60000): Promise<InterviewerTurn> {
      audioChunks = []; transcriptChunks = []; finalTranscript = null
      return new Promise<InterviewerTurn>((resolve) => {
        let done = false
        const timer = setTimeout(() => {
          if (done) return
          done = true
          const text = (finalTranscript ?? transcriptChunks.join('')).trim() || '(response timeout)'
          const audio = Buffer.concat(audioChunks)
          audioChunks = []; transcriptChunks = []; finalTranscript = null; onResponseDone = null
          resolve({ text, audio })
        }, timeoutMs)
        onResponseDone = (turn: InterviewerTurn) => {
          if (done) return
          done = true; clearTimeout(timer); resolve(turn)
        }
      })
    },

    waitWhisper(timeoutMs = 15000): Promise<string> {
      return new Promise<string>((resolve) => {
        let done = false
        const timer = setTimeout(() => {
          if (done) return
          done = true; onWhisper = null; resolve('')
        }, timeoutMs)
        onWhisper = (text: string) => {
          if (done) return
          done = true; clearTimeout(timer); resolve(text)
        }
      })
    },

    close() { try { ws.close() } catch (_e) { /* already closed */ } },
    rawEvents,
  }
}

// ── Interview loop ────────────────────────────────────────────────────────────

async function runInterview(opts: {
  pack: InterviewPack
  question: Question
  persona: string
  key: string
  realtimeModel: string
  brainModel: string
  ttsModel: string
  ttsVoice: string
  realtimeVoice: string
  maxTurns: number
  buildLiveInstructionsFn: (p: InterviewPack, q: Question) => string
  extractFn: ExtractFn
}): Promise<{ transcript: Turn[]; audioTimeline: Buffer[]; intendedTexts: string[]; rawEvents: object[] }> {
  const {
    pack, question, persona, key,
    realtimeModel, brainModel, ttsModel, ttsVoice, realtimeVoice,
    maxTurns, buildLiveInstructionsFn, extractFn,
  } = opts

  const turns: Turn[] = []
  const audioTimeline: Buffer[] = []
  const intendedTexts: string[] = []
  const history: Array<{ role: 'user' | 'assistant'; content: string }> = []

  const instructions = buildLiveInstructionsFn(pack, question)
  console.log(`  [${persona}] Connecting to Realtime...`)
  const session = await connectRealtime(realtimeModel, key, instructions, realtimeVoice)

  try {
    console.log(`  [${persona}] Requesting first interviewer question...`)
    session.send({ type: 'response.create' })
    const q1 = await session.collectResponse(60000)

    console.log(`  [${persona}] Interviewer: ${q1.text.slice(0, 100)}`)
    turns.push({ role: 'interviewer', text: q1.text, ts: Date.now(), final: true })
    audioTimeline.push(q1.audio)
    history.push({ role: 'user', content: q1.text })

    for (let i = 0; i < maxTurns; i++) {
      console.log(`  [${persona}] Candidate turn ${i + 1}/${maxTurns}...`)

      // Build message history: interviewer = 'user', candidate = 'assistant'
      // (the brain is being prompted AS the candidate responding TO the interviewer).
      const messages = [
        { role: 'system', content: personaSystem(persona, question) },
        ...history,
      ]
      const effort: 'low' | 'medium' = persona === 'strong' ? 'medium' : 'low'
      const intendedText = await callBrain(messages, brainModel, effort, key, extractFn)
      intendedTexts.push(intendedText)

      console.log(`  [${persona}] TTS candidate turn ${i + 1}...`)
      const candidatePCM = await tts(intendedText, ttsModel, ttsVoice, personaTone(persona), key)

      // Set up Whisper wait before sending audio so we don't miss the event.
      const whisperPromise = session.waitWhisper(15000)
      const CHUNK = 32768
      for (let off = 0; off < candidatePCM.length; off += CHUNK) {
        session.send({
          type: 'input_audio_buffer.append',
          audio: candidatePCM.slice(off, off + CHUNK).toString('base64'),
        })
      }
      session.send({ type: 'input_audio_buffer.commit' })
      // Prepare the response collector before requesting, so early audio deltas aren't missed.
      const interviewerPromise = session.collectResponse(60000)
      session.send({ type: 'response.create' })

      const [whisperText, interviewerReply] = await Promise.all([whisperPromise, interviewerPromise])

      // Whisper text is canonical (mirrors the real pipeline); intended text is fallback only.
      const candidateText = whisperText.trim() || intendedText
      if (!whisperText.trim()) {
        console.log(`  [${persona}] Whisper timed out — using intended text as fallback`)
      }

      turns.push({ role: 'candidate', text: candidateText, ts: Date.now(), final: true })
      audioTimeline.push(candidatePCM)
      history.push({ role: 'assistant', content: candidateText })

      console.log(`  [${persona}] Interviewer: ${interviewerReply.text.slice(0, 100)}`)
      turns.push({ role: 'interviewer', text: interviewerReply.text, ts: Date.now(), final: true })
      audioTimeline.push(interviewerReply.audio)
      history.push({ role: 'user', content: interviewerReply.text })

      if (WRAP_UP_PHRASES.some((p) => interviewerReply.text.toLowerCase().includes(p))) {
        console.log(`  [${persona}] Wrap-up detected — ending interview early`)
        break
      }
    }
  } finally {
    session.close()
  }

  return { transcript: turns, audioTimeline, intendedTexts, rawEvents: session.rawEvents }
}

// ── Artifacts ─────────────────────────────────────────────────────────────────

function writeArtifacts(opts: {
  outDir: string
  persona: string
  question: Question
  pack: InterviewPack
  transcript: Turn[]
  report: InterviewReport
  audioTimeline: Buffer[]
  intendedTexts: string[]
  rawEvents: object[]
  timestamp: string
  brainModel: string
  realtimeModel: string
}): void {
  const {
    outDir, persona, question, pack, transcript, report,
    audioTimeline, intendedTexts, rawEvents, timestamp, brainModel, realtimeModel,
  } = opts
  const dir = path.join(outDir, persona)
  fs.mkdirSync(dir, { recursive: true })

  // transcript.md
  const turnLines = transcript
    .map((t) => `**${t.role === 'interviewer' ? 'Interviewer' : 'Candidate'}:** ${t.text}`)
    .join('\n\n')
  fs.writeFileSync(
    path.join(dir, 'transcript.md'),
    [
      '# Interview Transcript',
      '',
      `- **Concept:** ${pack.concept}`,
      `- **Question ID:** ${question.id}`,
      `- **Prompt:** ${question.prompt}`,
      `- **Persona:** ${persona}`,
      `- **Brain model:** ${brainModel}`,
      `- **Realtime model:** ${realtimeModel}`,
      `- **Timestamp:** ${timestamp}`,
      '',
      '---',
      '',
      turnLines,
    ].join('\n'),
    'utf8',
  )

  // report.json
  fs.writeFileSync(path.join(dir, 'report.json'), JSON.stringify(report, null, 2), 'utf8')

  // report.md
  const dimNames = ['correctness', 'approach', 'rigor', 'communication', 'speed'] as const
  const dimRows = dimNames
    .map((d) => {
      const dim = report.dimensions[d]
      return `| ${d[0].toUpperCase() + d.slice(1)} | ${dim.score}/5 | ${dim.evidence} |`
    })
    .join('\n')
  fs.writeFileSync(
    path.join(dir, 'report.md'),
    [
      `# Interview Report — ${persona}`,
      '',
      '## Summary',
      '',
      report.summary,
      '',
      '## Dimensions',
      '',
      '| Dimension | Score | Evidence |',
      '|-----------|-------|----------|',
      dimRows,
      '',
      '## Strengths',
      '',
      report.strengths.map((s) => `- ${s}`).join('\n'),
      '',
      '## Areas to Improve',
      '',
      report.fixes.map((f) => `- ${f}`).join('\n'),
    ].join('\n'),
    'utf8',
  )

  // conversation.wav (PCM16, 24 kHz, mono)
  const allPCM = audioTimeline.length > 0 ? Buffer.concat(audioTimeline) : Buffer.alloc(0)
  fs.writeFileSync(
    path.join(dir, 'conversation.wav'),
    pcmToWav(allPCM, { sampleRate: 24000, channels: 1, bitDepth: 16 }),
  )

  // debug.json
  fs.writeFileSync(
    path.join(dir, 'debug.json'),
    JSON.stringify(
      {
        persona,
        questionId: question.id,
        transcript,
        intendedTexts,
        counts: {
          turns: transcript.length,
          interviewerTurns: transcript.filter((t) => t.role === 'interviewer').length,
          candidateTurns: transcript.filter((t) => t.role === 'candidate').length,
        },
        rawEvents,
      },
      null,
      2,
    ),
    'utf8',
  )
}

function writeComparison(opts: {
  outDir: string
  question: Question
  results: PersonaResult[]
  timestamp: string
}): void {
  const { outDir, question, results, timestamp } = opts
  const cols = results.map((r) => r.persona)
  const dimNames = ['correctness', 'approach', 'rigor', 'communication', 'speed'] as const
  const dimRows = dimNames.map((d) => {
    const cells = results.map((r) => `${r.report.dimensions[d].score}/5`)
    return `| ${d[0].toUpperCase() + d.slice(1)} | ${cells.join(' | ')} |`
  })
  const summaries = results.map((r) => `**${r.persona}:** ${r.report.summary}`).join('\n\n')

  fs.mkdirSync(outDir, { recursive: true })
  fs.writeFileSync(
    path.join(outDir, 'comparison.md'),
    [
      '# Side-by-Side Comparison',
      '',
      `**Question:** ${question.id} — ${question.prompt}`,
      `**Run:** ${timestamp}`,
      '',
      `| Dimension | ${cols.join(' | ')} |`,
      `|-----------|${cols.map(() => '---------|').join('')}`,
      ...dimRows,
      '',
      '## Summaries',
      '',
      summaries,
    ].join('\n'),
    'utf8',
  )
}

// ── Main ──────────────────────────────────────────────────────────────────────

async function main(): Promise<void> {
  const args = parseArgs(process.argv.slice(2))

  if (args.help) { printHelp(); process.exit(0) }

  const key = process.env.OPENAI_API_KEY
  if (!key) {
    console.error('Error: OPENAI_API_KEY environment variable is not set.')
    console.error('Set it with: OPENAI_API_KEY=sk-... npm run interview:demo')
    process.exit(1)
  }

  // initializeApp must run BEFORE the dynamic import below: interview.ts calls
  // getFirestore() at module load, which throws unless an Admin app already exists.
  initializeApp({ projectId: 'brilliant-org' })

  const {
    buildLiveInstructions,
    buildGraderPrompt,
    extractGradeJson,
    INTERVIEW_REPORT_SCHEMA,
    REALTIME_MODEL,
    REALTIME_VOICE,
    GRADER_MODEL,
  } = await import('../src/interview')

  const realtimeModel = args.realtimeModel ?? REALTIME_MODEL
  const graderModel   = args.graderModel   ?? GRADER_MODEL
  const realtimeVoice = REALTIME_VOICE

  const packPath = path.resolve(REPO_ROOT, 'interviews', 'course-expected-value.json')
  let pack: InterviewPack
  try {
    pack = InterviewPackSchema.parse(JSON.parse(fs.readFileSync(packPath, 'utf8')))
  } catch (err) {
    console.error(`Failed to load interview pack: ${(err as Error).message}`)
    process.exit(1)
  }

  const question = pack.questions.find((q) => q.id === args.questionId)
  if (!question) {
    console.error(`Question not found: ${args.questionId}`)
    console.error(`Available IDs: ${pack.questions.map((q) => q.id).join(', ')}`)
    process.exit(1)
  }

  console.log('\nInterview Demo Bot')
  console.log(`  Question:    ${args.questionId}`)
  console.log(`  Prompt:      ${question.prompt.slice(0, 100)}`)
  console.log(`  Personas:    ${args.personas.join(', ')}`)
  console.log(`  Max turns:   ${args.maxTurns}`)
  console.log(`  Brain model: ${args.brainModel}`)
  console.log(`  Grader:      ${graderModel}`)
  console.log(`  Realtime:    ${realtimeModel}`)
  console.log(`  Output:      ${args.outDir}`)

  const allOk = await preflight(args, key, realtimeModel, graderModel)

  if (args.dryRun) { console.log('\n--dry-run: exiting after preflight.'); process.exit(0) }

  if (!allOk) {
    console.error('\nPreflight failed. Use override flags to select accessible models.')
    process.exit(1)
  }

  const timestamp = new Date().toISOString()
  const results: PersonaResult[] = []

  async function runPersona(persona: string): Promise<PersonaResult> {
    console.log(`\n${'='.repeat(60)}`)
    console.log(`Running interview: persona = ${persona}`)
    console.log('='.repeat(60))
    const { transcript, audioTimeline, intendedTexts, rawEvents } = await runInterview({
      pack,
      question: question!,
      persona,
      key: key!,
      realtimeModel,
      brainModel:              args.brainModel,
      ttsModel:                args.ttsModel,
      ttsVoice:                args.ttsVoice,
      realtimeVoice,
      maxTurns:                args.maxTurns,
      buildLiveInstructionsFn: buildLiveInstructions,
      extractFn:               extractGradeJson,
    })

    console.log(`  [${persona}] Grading transcript...`)
    const report = await gradeTranscript({
      question: question!,
      transcript,
      model:        graderModel,
      key: key!,
      buildPromptFn: buildGraderPrompt,
      extractFn:    extractGradeJson,
      schema:       INTERVIEW_REPORT_SCHEMA as unknown as object,
    })

    writeArtifacts({
      outDir:       args.outDir,
      persona,
      question: question!,
      pack,
      transcript,
      report,
      audioTimeline,
      intendedTexts,
      rawEvents,
      timestamp,
      brainModel:    args.brainModel,
      realtimeModel,
    })
    console.log(`  [${persona}] Artifacts → ${path.join(args.outDir, persona)}/`)

    return { persona, transcript, report, audioTimeline, intendedTexts }
  }

  if (args.sequential) {
    console.log(`\nRunning ${args.personas.length} personas sequentially...`)
    for (const persona of args.personas) {
      try {
        results.push(await runPersona(persona))
      } catch (err) {
        console.error(`\n[ERROR] Persona "${persona}" failed: ${(err as Error).message}`)
        if (process.env.DEBUG) console.error((err as Error).stack)
      }
    }
  } else {
    console.log(`\nRunning ${args.personas.length} personas in parallel... (logs will interleave; use --sequential to run one at a time)`)
    // Promise.allSettled preserves input order, so results stay in args.personas order.
    const settled = await Promise.allSettled(args.personas.map((p) => runPersona(p)))
    for (let idx = 0; idx < settled.length; idx++) {
      const outcome = settled[idx]
      if (outcome.status === 'fulfilled') {
        results.push(outcome.value)
      } else {
        console.error(`\n[ERROR] Persona "${args.personas[idx]}" failed: ${(outcome.reason as Error).message}`)
        if (process.env.DEBUG) console.error((outcome.reason as Error).stack)
      }
    }
  }

  if (results.length > 0) {
    writeComparison({ outDir: args.outDir, question, results, timestamp })
    console.log(`\nComparison → ${path.join(args.outDir, 'comparison.md')}`)
  }

  console.log('\nDone.')
  console.log(`Artifacts in: ${args.outDir}`)
  console.log()
  console.log('Layout:')
  for (const r of results) {
    console.log(`  ${r.persona}/  transcript.md  report.json  report.md  conversation.wav  debug.json`)
  }
  if (results.length > 0) console.log('  comparison.md')
}

main().catch((err: Error) => {
  console.error('\nFatal error:', err.message)
  if (process.env.DEBUG) console.error(err.stack)
  process.exit(1)
})
