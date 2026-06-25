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
    // Use rolldownOptions (not the deprecated rollupOptions alias) so that
    // codeSplitting is passed directly to rolldown without going through the
    // manualChunks→advancedChunks compatibility shim.  That shim defaults to
    // includeDependenciesRecursively: true, which causes rolldown to pull
    // @firebase/app, @firebase/util, etc. recursively into the fb-analytics
    // chunk — making analytics eager on the first-paint critical path even
    // after the source-level dynamic-import fixes in events.ts.
    rolldownOptions: {
      output: {
        codeSplitting: {
          // Only name the chunks that must be EAGER (loaded at first paint).
          // Lazy service chunks (firestore/functions/analytics) intentionally
          // have NO group: rolldown's auto-chunking puts them in lazy chunks
          // that are only loaded when the dynamic import fires, keeping them
          // off the HTML modulepreload list.
          //
          // fb-core uses the default includeDependenciesRecursively: true so
          // that ALL shared firebase internals (util, component, logger,
          // installations) are captured into fb-core together.  The service
          // packages depend on firebase app/auth (in fb-core) — not the other
          // way round — so they can't get pulled into the eager graph.
          groups: [
            // Shared firebase core (app init, auth, app-check, shared
            // internals).  The regex matches @firebase/app-check too because
            // "@firebase/app-check" contains "@firebase/app" as a substring.
            {
              name: 'fb-core',
              test: /@firebase\/(app|auth|util|component|logger|installations)|firebase\/(app|auth)/,
            },
            // UI framework and animation libs — stable, cache-friendly splits.
            {
              name: 'react-vendor',
              test: /\/react(-dom)?\/|\/scheduler\//,
            },
            {
              name: 'motion-vendor',
              test: /\/(framer-motion|motion|motion-dom|motion-utils)\//,
            },
            { name: 'zod', test: /\/zod\// },
          ],
        },
      },
    },
  },
})
