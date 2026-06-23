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
})
