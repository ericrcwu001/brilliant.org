import { defineConfig } from 'vite'
import react, { reactCompilerPreset } from '@vitejs/plugin-react'
import babel from '@rolldown/plugin-babel'

// React Compiler is enabled globally via the Babel preset below.
//
// Per-file opt-out for Konva stage files:
// The React Compiler can rewrite render output in ways that break Konva's
// imperative refs and animations (see docs/mvp_prd.md "Implementation Notes").
// Any file that mounts a Konva <Stage> (the state graph, coin stream, and
// simulation chart) must opt out by adding the directive
//
//     'use no memo';
//
// as the first statement in the file. `babel-plugin-react-compiler` honors
// this directive and skips compiling that module.
// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), babel({ presets: [reactCompilerPreset()] })],
  build: {
    rollupOptions: {
      output: {
        manualChunks(id: string) {
          if (!id.includes('node_modules')) return
          if (id.includes('@firebase/firestore') || id.includes('firebase/firestore')) return 'fb-firestore'
          if (id.includes('@firebase/functions') || id.includes('firebase/functions')) return 'fb-functions'
          if (id.includes('@firebase/analytics') || id.includes('firebase/analytics')) return 'fb-analytics'
          if (id.includes('@firebase') || id.includes('firebase/')) return 'fb-core'
          if (id.includes('/react-dom/') || id.includes('/react/') || id.includes('/scheduler/')) return 'react-vendor'
          if (id.includes('/motion/') || id.includes('/framer-motion/') || id.includes('/motion-dom/') || id.includes('/motion-utils/')) return 'motion-vendor'
          if (id.includes('/zod/')) return 'zod'
        },
      },
    },
  },
})
