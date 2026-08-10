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

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), versionSwCache()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './src/test/setup.ts',
  },
});
