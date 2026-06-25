import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
// Self-hosted Ergo typefaces (Fontsource), bundled by Vite — no third-party font
// request, so an ad/script blocker (e.g. uBlock) can't break first paint.
import '@fontsource/space-grotesk/500.css'
import '@fontsource/space-grotesk/600.css'
import '@fontsource/space-grotesk/700.css'
import '@fontsource/inter/400.css'
import '@fontsource/inter/500.css'
import '@fontsource/inter/600.css'
import '@fontsource/jetbrains-mono/400.css'
import '@fontsource/jetbrains-mono/500.css'
import '@fontsource/jetbrains-mono/700.css'
// Metric-adjusted system fallbacks — eliminates CLS on font swap.
import './styles/fonts.css'
import './styles/tokens.css'
import './styles/app.css'
import App from './App.tsx'
import { MotionProvider } from './motion/MotionProvider'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <MotionProvider>
      <App />
    </MotionProvider>
  </StrictMode>,
)
