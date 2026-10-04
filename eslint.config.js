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

/**
 * The Theory app (theory/) and the practice app (src/) share no code (docs/theory-plan.md).
 * Every src/ block carries `fromTheory`, every theory/ block carries `fromSrc`, because a later
 * block's `no-restricted-imports` replaces an earlier one's instead of merging with it.
 */
const fromTheory = {
  group: ['**/theory/**'],
  message: 'src/ (practice app) may not import from theory/ — the two apps share no code.',
};
const fromSrc = {
  group: ['**/src/**'],
  message: 'theory/ may not import from the practice app in src/ — the two apps share no code.',
};
const forbid = (group, why) => ({
  rules: {
    'no-restricted-imports': ['error', { patterns: [{ group, message: why }, fromTheory] }],
  },
});
const dir = (name) => [`**/${name}`, `**/${name}/**`];
const forbidTheory = (group, why) => ({
  rules: {
    'no-restricted-imports': ['error', { patterns: [{ group, message: why }, fromSrc] }],
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
  // Default for every src/ file; the per-layer blocks below re-state it alongside their own rule.
  {
    files: ['src/**/*.{ts,tsx}'],
    rules: { 'no-restricted-imports': ['error', { patterns: [fromTheory] }] },
  },
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
      'no-restricted-imports': ['error', { patterns: [{ group: [...noReact, '**/state/**', '**/audio/**', '**/ui/**', '**/i18n/**'], message: 'src/lick may only import from src/fretboard and src/music.' }, fromTheory] }],
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
    // Runtime i18n code: leaf layer, zero app coupling. (Test files are excepted below so the
    // drift test can read the engine registries.)
    files: ['src/i18n/**/*.ts'],
    ignores: ['src/i18n/**/*.test.ts'],
    ...forbid([...noReact, '**/music/**', '**/fretboard/**', '**/lick/**', '**/state/**', '**/audio/**', '**/ui/**'],
      'src/i18n is a leaf layer: pure TypeScript with zero app coupling — it may not import React or any other layer.'),
  },
  {
    // i18n tests may import the engine registries (music, fretboard) for the catalog drift check,
    // but still never React, state, lick, audio, or ui.
    files: ['src/i18n/**/*.test.ts'],
    ...forbid([...noReact, '**/lick/**', '**/state/**', '**/audio/**', '**/ui/**'],
      'src/i18n tests may only import engine registries (music, fretboard) for drift checks — never React or higher layers.'),
  },

  // --- Theory app (theory/): separate app, own layers. See docs/theory.md. ---
  // `dir('x')` matches both '../x' and '../x/file': a bare '**/x/**' misses the index import.
  {
    files: ['theory/**/*.{ts,tsx}'],
    rules: { 'no-restricted-imports': ['error', { patterns: [fromSrc] }] },
  },
  {
    files: ['theory/src/core/**/*.ts'],
    ...forbidTheory([...noReact, ...dir('lessons'), ...dir('ui')],
      'theory/src/core is the lowest Theory layer: no React, no lessons, no UI.'),
  },
  {
    files: ['theory/src/core/music/**/*.ts'],
    ...forbidTheory([...noReact, ...dir('lessons'), ...dir('ui'), ...dir('fretboard'), ...dir('audio')],
      'theory/src/core/music is the lowest layer: it may not import fretboard, audio, lessons, UI or React.'),
  },
  {
    files: ['theory/src/core/fretboard/**/*.ts'],
    ...forbidTheory([...noReact, ...dir('lessons'), ...dir('ui'), ...dir('audio')],
      'theory/src/core/fretboard may only import from theory/src/core/music.'),
  },

  // --- Hard-coded UI copy guard (T13): every user-facing string must flow through t(). ---
  {
    files: ['src/ui/**/*.tsx'],
    rules: {
      'no-restricted-syntax': [
        'error',
        {
          selector: 'JSXText[value=/\\p{L}/u]',
          message:
            "Hard-coded UI copy: use t('key') from src/i18n instead of literal JSX text. Notation glyphs (▶ ■ ↻ × · — – →) and digits are exempt.",
        },
        {
          selector: "JSXAttribute[name.name=/^(aria-label|title|placeholder)$/] > Literal",
          message:
            "Hard-coded UI copy: aria-label/title/placeholder must use t('key') from src/i18n, not a string literal.",
        },
      ],
    },
  },
);
