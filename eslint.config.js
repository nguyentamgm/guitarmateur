import js from '@eslint/js';
import globals from 'globals';
import reactHooks from 'eslint-plugin-react-hooks';
import reactRefresh from 'eslint-plugin-react-refresh';
import tseslint from 'typescript-eslint';

/**
 * Layer dependency rule (see AGENTS.md / docs/architecture.md):
 *   ui → state → (lick → fretboard → music);  audio → lick/state
 * Lower layers must never import React or a higher layer. Enforced below with
 * per-directory `no-restricted-imports`. A violating import fails `npm run lint`.
 */
const noReact = ['react', 'react/*', 'react-dom', 'react-dom/*'];
const forbid = (group, why) => ({
  rules: {
    'no-restricted-imports': ['error', { patterns: [{ group, message: why }] }],
  },
});

export default tseslint.config(
  { ignores: ['dist', 'node_modules'] },

  // Base config for all TS/TSX
  {
    files: ['**/*.{ts,tsx}'],
    extends: [js.configs.recommended, ...tseslint.configs.recommended],
    languageOptions: {
      ecmaVersion: 2023,
      globals: globals.browser,
    },
    plugins: {
      'react-hooks': reactHooks,
      'react-refresh': reactRefresh,
    },
    rules: {
      'react-hooks/rules-of-hooks': 'error',
      'react-hooks/exhaustive-deps': 'warn',
      'react-refresh/only-export-components': ['warn', { allowConstantExport: true }],
    },
  },

  // --- Layer-boundary enforcement ---
  {
    files: ['src/music/**/*.ts'],
    ...forbid([...noReact, '**/fretboard/**', '**/lick/**', '**/state/**', '**/audio/**', '**/ui/**', '**/i18n/**'],
      'src/music may not import React or a higher layer (music is the lowest layer).'),
  },
  {
    files: ['src/fretboard/**/*.ts'],
    ...forbid([...noReact, '**/lick/**', '**/state/**', '**/audio/**', '**/ui/**', '**/i18n/**'],
      'src/fretboard may only import from src/music.'),
  },
  {
    files: ['src/lick/**/*.ts'],
    rules: {
      'no-restricted-imports': ['error', { patterns: [{ group: [...noReact, '**/state/**', '**/audio/**', '**/ui/**', '**/i18n/**'], message: 'src/lick may only import from src/fretboard and src/music.' }] }],
      'no-restricted-properties': ['error', { object: 'Math', property: 'random', message: 'Licks must be deterministic — use the seeded RNG from ./rng instead of Math.random.' }],
    },
  },
  {
    files: ['src/state/**/*.ts'],
    ...forbid([...noReact, '**/audio/**', '**/ui/**'],
      'src/state may only import from src/lick, src/fretboard, src/music, and src/i18n (types + validator only).'),
  },
  {
    files: ['src/audio/**/*.ts'],
    ...forbid([...noReact, '**/ui/**', '**/i18n/**'],
      'src/audio may only import from src/lick and src/state (no React, no UI, no i18n).'),
  },
  {
    files: ['src/i18n/**/*.ts'],
    ...forbid([...noReact, '**/music/**', '**/fretboard/**', '**/lick/**', '**/state/**', '**/audio/**', '**/ui/**'],
      'src/i18n is a leaf layer: pure TypeScript with zero app coupling — it may not import React or any other layer.'),
  },
);
