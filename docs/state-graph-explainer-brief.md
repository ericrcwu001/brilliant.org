# State Graph Explainer — implementation change spec

**Audience:** a coding agent implementing one focused addition to the already-built flagship
lesson (L1). This is a *what-to-change* spec; apply it surgically. It builds on the two-track
inclusive redesign already in the tree — see `docs/l1-inclusive-redesign-spec.md`.

**Goal.** The state graph (the `∅ / H / HH` circles + arrows) first appears in the `simulate`
beat, but nothing tells the learner how to *read* it (the prompt even says "watch the state
machine" without explaining what one is). Add a "what is a state graph" explainer, delivered
two ways:

1. A new **Track-A primer beat** (`primer-graph`) that pre-teaches the graph before `simulate`.
2. A compact **inline legend** shown on the first graph view for **both tracks** (Track B gets
   only this — no extra beat).

**Golden rule:** no engine/math change. `buildAutomaton` and `StateGraph` already carry
everything needed — each state has both `id` (`E0`) and `label` (`∅`), and `StateGraph`
already supports `labelMode='dual'` (`src/lesson/konva/StateGraph.tsx`). Every change below is
schema, a primer-component demo, fixture copy, one inline legend, or CSS.

---

## 1. Decisions (settled — do not re-litigate)

- Delivery = **hybrid** (primer beat + inline legend).
- The primer beat is **Track A only** (`track:'A'`, `required:false`); the inline legend shows
  for **both tracks**.
- **Track B stays structurally unchanged.** The inline legend must be non-interactive and must
  NOT gate Continue or touch the action-bar FSM.
- Mobile-first, tap-only, reduced-motion-complete (the existing conventions; the e2e mobile +
  reduced-motion projects assert completion).

---

## 2. Files in scope

| File | Change class |
|---|---|
| `src/content/schema.ts` | add `'graph'` to the primer `variant` enum |
| `src/lesson/beats/PrimerBeat.tsx` | add `GraphDemo`; thread `reducedMotion`; `TITLES.graph` |
| `fixtures/lesson-pattern-hitting-times.json` | insert the `primer-graph` beat before `simulate` |
| `src/lesson/phases.ts` | add `primer-graph` to `FLAGSHIP.offRailAfter` |
| `src/lesson/beats/CoinSimBeat.tsx` | render an inline `.coinsim__legend` when the graph is visible |
| `src/styles/app.css` | styles for the graph-demo key + `.coinsim__legend` |
| `src/content/schema.test.ts` | beat-count assertion `15 → 16` |
| `e2e/helpers.ts` | one extra `clickPrimary('Continue')` in `completeLessonTrackA` |

---

## 3. Schema — new primer variant

In `src/content/schema.ts`, the primer interaction (around line 134) declares:

```ts
variant: z.enum(['half', 'average', 'state', 'exponent', 'transitivity', 'custom']),
```

Add `'graph'`:

```ts
variant: z.enum(['half', 'average', 'state', 'exponent', 'transitivity', 'graph', 'custom']),
```

No other schema change — `title`, `body`, and `collapsible` already exist on the primer member.

---

## 4. PrimerBeat — the `graph` demo

`src/lesson/beats/PrimerBeat.tsx` currently:

- destructures `export function PrimerBeat({ beat, automaton, isLast, onAdvance }: BeatProps)`
  (line ~94) — **add `reducedMotion`**;
- routes demos in `PrimerDemo({ variant, automaton })` (line ~79);
- has a `TITLES` map (line ~13).

Make these changes:

1. Add imports:

```tsx
import { StateGraph } from '../konva/StateGraph'
import { useElementWidth } from '../konva/useElementWidth'
```

2. Add `TITLES.graph`:

```ts
graph: 'What a state graph is',
```

3. Add the demo (a mini dual-label graph + an annotated key; static, so it satisfies
   reduced-motion + tap-only by construction):

```tsx
function GraphDemo({
  automaton,
  reducedMotion,
}: {
  automaton: Automaton
  reducedMotion: boolean
}) {
  const [boxRef, width] = useElementWidth<HTMLDivElement>()
  return (
    <div className="primer__demo">
      <div className="canvas-frame primer__graph" ref={boxRef}>
        {width > 0 && (
          <StateGraph
            automaton={automaton}
            width={width}
            height={Math.max(150, Math.round(width * 0.42))}
            labelMode="dual"
            reducedMotion={reducedMotion}
          />
        )}
      </div>
      <ul className="primer__key">
        <li>
          <span className="primer__key-mark primer__key-mark--node" aria-hidden="true" />
          circle = a state (how much of HH you've matched)
        </li>
        <li>
          <span className="primer__key-mark primer__key-mark--h" aria-hidden="true" />
          gold arrow = a heads flip
        </li>
        <li>
          <span className="primer__key-mark primer__key-mark--t" aria-hidden="true" />
          teal arrow = a tails flip
        </li>
        <li>
          <span className="primer__key-mark primer__key-mark--ring" aria-hidden="true" />
          ringed circle = done (HH matched)
        </li>
      </ul>
    </div>
  )
}
```

4. Thread `reducedMotion` through `PrimerDemo` and route `'graph'`:

```tsx
function PrimerDemo({
  variant,
  automaton,
  reducedMotion,
}: {
  variant: string
  automaton: Automaton
  reducedMotion: boolean
}) {
  if (variant === 'half') return <HalfDemo />
  if (variant === 'state') return <StateDemo />
  if (variant === 'average') return <FirstSuccessTimeline automaton={automaton} />
  if (variant === 'graph') return <GraphDemo automaton={automaton} reducedMotion={reducedMotion} />
  return null
}
```

5. Update the `PrimerBeat` destructure to include `reducedMotion` and pass it at the call site
   (line ~131): `<PrimerDemo variant={variant} automaton={automaton} reducedMotion={reducedMotion} />`.

> Optional polish (not required): make the key items tap-to-highlight by passing `activeState` /
> `highlight` to `StateGraph` on tap. Keep it static for the first pass.

---

## 5. Fixture — the `primer-graph` beat

In `fixtures/lesson-pattern-hitting-times.json`, insert a new beat **between `primer-state`
(ends ~line 95) and `simulate` (line 97)** so the Track-A ladder reads
`primer-half → primer-state → primer-graph → simulate`:

```json
{
  "beatId": "primer-graph",
  "required": false,
  "track": "A",
  "prompt": "One more thing before we flip: how to read this picture.",
  "interaction": {
    "type": "primer",
    "variant": "graph",
    "title": "What a state graph is",
    "body": "This picture is a state graph. Each circle is a state — how much of HH you've matched so far: none, one H, or HH (the ringed circle = done). Each arrow is one coin flip: gold = heads, teal = tails. A flip moves you along an arrow — forward toward HH, back to the start, or looping in place.",
    "collapsible": false
  },
  "feedback": {
    "correct": "Got it.",
    "hints": ["Each circle is a state.", "Each arrow is a flip.", "Continue when ready."]
  }
}
```

(The `feedback` triple is required by `BeatSchema` but unused by `PrimerBeat` — keep it
minimal, mirroring `primer-half` / `primer-state`.)

---

## 6. Phases — keep it off-rail

`src/lesson/phases.ts`, `FLAGSHIP.offRailAfter` (line ~33) already lists the other Track-A
primers. Add `primer-graph`, anchored to the same rail beat the other pre-`simulate` primers
use:

```ts
'primer-graph': 'pattern-pick',
```

This keeps the progress rail correct while the learner is on the new (off-rail) beat; no rail
segment is added. `phases.test.ts` filters all off-rail beats automatically, so it needs no
change.

---

## 7. CoinSimBeat — inline legend (both tracks)

`src/lesson/beats/CoinSimBeat.tsx` renders the graph behind `showGraph` (`= phase !== 'stream'`,
line ~75) inside `{showGraph && (<div className="canvas-frame" ref={boxRef}> … </div>)}`
(line ~239). Add a compact, **non-interactive** legend immediately after that block, still
inside the `.coinsim` container:

```tsx
{showGraph && (
  <p className="coinsim__legend">
    <span className="coinsim__legend-item">circle = state</span>
    <span className="coinsim__legend-item">
      arrow = a flip (<span className="coin coin--H coin--inline">H</span> gold,{' '}
      <span className="coin coin--T coin--inline">T</span> teal)
    </span>
    <span className="coinsim__legend-item">ringed = done</span>
  </p>
)}
```

Behavior:

- **Track A** (`density:'split'`): the graph (and thus the legend) appears at the "Show the
  machine" reveal.
- **Track B** (`merged`): the graph is shown from the start, so the legend shows immediately.
- It is **one-time by construction** — it lives only in `simulate`, the first/only first-graph
  beat (the next graph beat, `failure-edge`, does not get it).

Do NOT change the primary/secondary action FSM or any `gated`/`phase` logic. The legend is
display-only and must not affect Continue/Flip/Step.

---

## 8. CSS

Append to the L1-redesign block at the end of `src/styles/app.css`. Use the existing tokens
(`--heads`, `--tails`, `--graphite`, etc.) and reuse the existing `.coin … coin--inline`
styling for the H/T swatches in the inline legend.

```css
/* --- State-graph explainer (primer graph demo + simulate legend) --- */
.primer__graph {
  margin: 0;
}
.primer__key {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: var(--s2);
  font-size: calc(14px * var(--fs));
  color: var(--graphite);
}
.primer__key li {
  display: flex;
  align-items: center;
  gap: var(--s2);
}
.primer__key-mark {
  flex: 0 0 auto;
  width: 16px;
  height: 16px;
}
.primer__key-mark--node {
  border: 1.5px solid var(--graphite);
  border-radius: var(--r-pill);
  background: var(--paper-0);
}
.primer__key-mark--ring {
  border: 2px solid var(--correct);
  border-radius: var(--r-pill);
  background: var(--paper-0);
}
.primer__key-mark--h {
  height: 3px;
  border-radius: 2px;
  background: var(--heads);
}
.primer__key-mark--t {
  height: 3px;
  border-radius: 2px;
  background: var(--tails);
}
.coinsim__legend {
  display: flex;
  flex-wrap: wrap;
  gap: var(--s2) var(--s4);
  margin: 0;
  font-size: calc(13px * var(--fs));
  color: var(--graphite);
}
.coinsim__legend-item {
  display: inline-flex;
  align-items: center;
  gap: var(--s1);
}
```

---

## 9. Copy (exact strings)

- **`primer-graph` body:** "This picture is a state graph. Each circle is a state — how much of
  HH you've matched so far: none, one H, or HH (the ringed circle = done). Each arrow is one
  coin flip: gold = heads, teal = tails. A flip moves you along an arrow — forward toward HH,
  back to the start, or looping in place."
- **Inline legend:** "circle = state · arrow = a flip (H gold, T teal) · ringed = done".
- **Demo key items:** circle = a state (how much you've matched); gold arrow = heads; teal
  arrow = tails; ringed circle = done.

Voice: warm-but-precise; do not drift into bubbly.

---

## 10. Two-track behavior

| Aspect | Track A (beginner) | Track B (current / expert) |
|---|---|---|
| `primer-graph` beat | shown, expanded (`collapsible:false`) | filtered out (it is `track:'A'`) |
| Inline legend in `simulate` | shown at the "Show the machine" reveal | shown with the graph immediately |
| Rail | `primer-graph` is off-rail (no new segment) | unchanged |

---

## 11. Verification checklist

- `src/content/schema.test.ts`: bump the beat-count assertion from `toHaveLength(15)` to
  `toHaveLength(16)` (line ~14) and update the comment.
- `e2e/helpers.ts` → `completeLessonTrackA`: add one `await clickPrimary(page, 'Continue')`
  after the `// primer: state` step and before the `// simulate (split)` block (one line). The
  Track-B helper (`completeLesson`) and `smoke.spec.ts` need NO step changes — confirm the new
  legend does not gate Continue.
- Run all gates green (call binaries directly, not `npm run`):
  - `./node_modules/.bin/tsx scripts/validate-fixtures.ts`
  - `./node_modules/.bin/tsc -p tsconfig.json --noEmit`
  - `./node_modules/.bin/vitest run`
  - `./node_modules/.bin/eslint .`
  - `./node_modules/.bin/tsc -b && ./node_modules/.bin/vite build`
  - `./node_modules/.bin/playwright test` (chromium / mobile / reduced-motion) — note the
    sandbox browser caveat in `HANDOFF.md` ("Last verified green").
- **Manual** (`/dev/lesson` and `/dev/lesson?track=A`): Track A shows the `primer-graph` card
  with the mini graph + key, then the legend under the `simulate` graph; Track B shows only the
  legend; confirm reduced-motion + mobile.

---

## 12. Constraints recap

- No `automaton.ts` / engine math change (golden tests stay green: `E[HH]=6`, `E[HT]=4`,
  `E[H]=2`).
- Tap-only + reduced-motion paths for the new primer (static graph + key) — already satisfied.
- Track B is structurally unchanged; the legend is additive and non-gating.
- Surgical: one primer beat, one inline legend, and the supporting schema / CSS / test edits —
  nothing else.
