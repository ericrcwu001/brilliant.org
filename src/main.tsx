import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
// Self-hosted IBM Plex (Fontsource), bundled by Vite — no third-party font
// request, so an ad/script blocker (e.g. uBlock) can't break first paint.
// Weights mirror the former Google Fonts set: Sans/Mono 400·500·600, Serif 500·600.
import '@fontsource/ibm-plex-sans/400.css'
import '@fontsource/ibm-plex-sans/500.css'
import '@fontsource/ibm-plex-sans/600.css'
import '@fontsource/ibm-plex-mono/400.css'
import '@fontsource/ibm-plex-mono/500.css'
import '@fontsource/ibm-plex-mono/600.css'
import '@fontsource/ibm-plex-serif/500.css'
import '@fontsource/ibm-plex-serif/600.css'
import './styles/tokens.css'
import './styles/app.css'
import App from './App.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
