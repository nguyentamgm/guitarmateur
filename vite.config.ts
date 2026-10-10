/// <reference types="vitest/config" />
import { readFileSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { defineConfig, type Plugin } from 'vite';
import react from '@vitejs/plugin-react';

function versionSwCache(): Plugin {
  return {
    name: 'version-sw-cache',
    apply: 'build',
    closeBundle() {
      const swPath = resolve(process.cwd(), 'dist/sw.js');
      try {
        const src = readFileSync(swPath, 'utf8');
        const stamped = src.replace(
          "CACHE_NAME = 'guitarmateur-v1'",
          `CACHE_NAME = 'guitarmateur-${Date.now().toString(36)}'`,
        );
        if (stamped === src) {
          console.warn('[version-sw-cache] CACHE_NAME placeholder not found in dist/sw.js — skipping');
          return;
        }
        writeFileSync(swPath, stamped);
        console.log('[version-sw-cache] stamped dist/sw.js CACHE_NAME');
      } catch (err) {
        console.warn('[version-sw-cache] could not stamp dist/sw.js:', err);
      }
    },
  };
}

/**
 * The Theory app (theory/) is a second page with client-side routes under /theory. Dev and
 * preview servers would answer /theory/<lesson> with the root index.html, so hand every
 * extension-less /theory path to theory/index.html, as vercel.json does in production.
 */
function theoryRoutes(): Plugin {
  const rewrite = (req: { url?: string }, _res: unknown, next: () => void) => {
    const path = req.url?.split('?')[0] ?? '';
    if (/^\/theory(\/[^.]*)?$/.test(path)) req.url = '/theory/index.html';
    next();
  };
  return {
    name: 'theory-routes',
    configureServer(server) {
      server.middlewares.use(rewrite);
    },
    configurePreviewServer(server) {
      server.middlewares.use(rewrite);
    },
  };
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), versionSwCache(), theoryRoutes()],
  // The code both apps share (shared/); mirrors `paths` in tsconfig.app.json / tsconfig.theory.json.
  resolve: {
    alias: { '@shared': resolve(import.meta.dirname, 'shared') },
  },
  build: {
    rolldownOptions: {
      input: {
        main: resolve(import.meta.dirname, 'index.html'),
        theory: resolve(import.meta.dirname, 'theory/index.html'),
      },
    },
  },
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './src/test/setup.ts',
  },
});
