import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// On `vite build`, default `base` to '/spotify2/' so the bundle works under
// https://<user>.github.io/spotify2/ on GitHub Pages. Override with
// VITE_BASE='/whatever/' when deploying elsewhere. Dev server stays at '/'
// so the OAuth redirect URI in development is just http://localhost:5173/.
export default defineConfig(({ command }) => ({
  base: command === 'build' ? (process.env.VITE_BASE ?? '/spotify2/') : '/',
  plugins: [react()],
  server: { port: 5173, open: true },
}));
