# Theory — conventions

Theory is a separate app in this repo: visual, animated music-theory lessons for electric guitar,
served at `/theory`. It shares tooling (Vite, TypeScript, Vitest, ESLint, CI) with the practice
app in `src/` but **no code**. Plan and progress: [`theory-plan.md`](theory-plan.md). What to
teach: [`theory-knowledge/`](theory-knowledge/README.md).

## Layout

```
theory/
└─ src/
   ├─ core/              pure TypeScript, unit-tested
   │  ├─ music/          spelled pitches, intervals, scales, chords, keys, roman numerals
   │  ├─ fretboard/      neck grid, octave shapes, positions (boxes, 3-notes-per-string)
   │  └─ audio/          plucked-string synth (pure) + Web Audio player
   ├─ i18n/              languages (en default), UI strings, `fill()`, copy-shape test helpers
   ├─ lessons/           one folder per lesson: steps + concept IDs, copy.en.ts, copy.vi.ts,
   │                     scenes.ts (pure scene data derived from core), registry in index.ts
   ├─ ui/                React: App, router, Fretboard, pages, lessons/<Lesson>Scene.tsx
   └─ main.tsx           entry of theory/index.html
```

Theory is a second Vite page: `theory/index.html` builds to `dist/theory/index.html`. Routes are
`/theory` (contents) and `/theory/<slug>`; `vercel.json` (production, rewrite destination `/theory`:
with `cleanUrls`, a destination ending in `.html` is not served) and the `theory-routes`
plugin in `vite.config.ts` (dev, preview) serve the Theory page for every `/theory/*` path. The
site-wide service worker (`public/sw.js`) falls back to the cached `/theory` shell offline.

## Import rules (enforced by ESLint)

```
ui → lessons → core/fretboard → core/music
 │      │      core/audio (→ core/music allowed)
 └──────┴────→ i18n (imports nothing in Theory)
```

- `theory/` never imports from `src/`, and `src/` never imports from `theory/`.
- `core/music` imports nothing else in Theory. `core/fretboard` imports only `core/music`.
- `core/` never imports React, `lessons/` or `ui/`.
- `lessons/` is data: core and i18n only, never React or `ui/`.
- Every user-facing string in `ui/**/*.tsx` comes from `i18n` or lesson copy (ESLint rejects
  literal JSX text and literal `aria-label`/`title`/`alt`).
- `tsconfig.theory.json` typechecks `theory/src`; Vitest picks up `theory/**/*.test.ts`.

## Music invariants

- **Spelled notes only.** Notes are letter + accidental (`parseNote('Bb')`), never a bare pitch
  class. F minor shows B♭; C°7 shows B𝄫. Pitch classes are for comparison only.
- **Formulas are degree labels** (`'1'`, `'b3'`, `'#5'`, `'bb7'`, `'9'`), the same notation as the
  knowledge base, converted by `interval()`.
- **No shape tables.** Boxes and positions come from `positions()`. Never hand-type frets of a
  scale or chord into lesson data; derive them.
- **String numbering is guitar numbering:** 1 = high E (top line of tab), 6 = low E.
- When the book and the knowledge base disagree, the knowledge base wins (see its errata).

## Audio

- `pluckSamples()` is pure and deterministic (seeded noise); tune the sound there, with tests.
- `createPlayer()` makes its `AudioContext` on the first `pluck()`. Call it only from a user
  gesture. Audio failures are swallowed: a lesson must work silently.

## Languages

- **English is the primary language and always the default.** Vietnamese is chosen with the
  EN/VI switch and remembered in `localStorage` under `theory.lang` (never the practice app's key).
- Slugs and code are English. Copy is written in English first, then Vietnamese.

## Lessons

- **Adding a lesson:** create `lessons/<slug>/` (steps with concept IDs, `copy.en.ts`,
  `copy.vi.ts`, pure `scenes.ts` + test), add it to `LESSONS` in `lessons/index.ts`, and add a
  case to `ui/lessons/LessonScene.tsx`. Shared tests then check: unique slug, concept IDs exist in
  `docs/theory-knowledge`, same keys/lengths/placeholders in vi and en, no empty strings.
- Scenes draw on `ui/Fretboard.tsx` (dots you click to hear, optional box frame, `onDot` to react
  to a click) and `ui/Tab.tsx` (six-line tab whose numbers play). Positions come from `scenes.ts`,
  never from the component.
- Lessons are listed in curriculum order in `LESSONS`; the contents page numbers them from it.

- Each lesson lists the concept IDs it teaches (`K3.4`…). If teaching differs from the knowledge
  base, update the knowledge base in the same PR.
- Every lesson ships **vi and en together**; a test checks both have the same steps and keys.
  Use the glossary in `theory-knowledge/README.md` (relative key = *giọng song song*).
- Write copy in our own words. No quotes, exercises, diagrams or transcriptions from the book;
  exercises are generated.
- Each step: one animated picture, one sentence of takeaway, one thing to try. List what is
  deliberately left out ("not yet").

## Commands

Same as the rest of the repo: `npm run lint`, `npm run typecheck`, `npm test`, `npm run build`
(CI order). `npx vitest run theory` runs only Theory tests.

Ending a session (self-review, PR to `main`, self-merge once CI is green, check production): follow
the checklist in [`theory-plan.md`](theory-plan.md#checklist-kết-thúc-phiên). Open follow-ups from
earlier sessions live in its "Việc còn treo" section.
