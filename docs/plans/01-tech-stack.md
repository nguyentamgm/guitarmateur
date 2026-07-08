# Plan 01 — Tech Stack & Project Scaffolding

## Goals

A buildable, lintable, testable skeleton with the layered structure from plan 00, deployable from
day one. Small stack, zero runtime cost, boring choices.

## Stack decisions

| Concern | Choice | Rationale |
|---|---|---|
| Framework | **React 18+** | SVG-heavy interactive UI; huge ecosystem; agents know it cold. |
| Language | **TypeScript, strict** | The engines are interval/degree arithmetic — types catch off-by-one theory bugs; discriminated unions model techniques/actions well. |
| Build | **Vite** | Static SPA output, fast dev server, first-class Vercel preset. |
| Styling | **Plain CSS + design tokens in TS** (`src/ui/theme.ts`) | One dark theme from the mockup. No Tailwind/CSS-in-JS runtime — keep deps at zero. |
| State | **`useReducer` + React context** | One page, one store; a pure reducer is unit-testable without extra libs. Revisit only if the app grows multiple routes with shared state. |
| Tests | **Vitest** | Native Vite integration. Unit tests only (see plan 00 — no E2E). Randomized-property style tests are written as plain seeded loops, no fast-check dependency. |
| Lint/format | **ESLint (typescript-eslint, react-hooks) + Prettier** | Defaults; add one custom rule: `no-restricted-imports` to enforce the layer dependency rule (music/fretboard/lick must not import react, state, or ui). |
| Routing | **None in v1** | Single page. The app shell (plan 05) is structured so react-router can be added later without surgery. |
| Package manager | **npm** | Least CI friction. |
| Hosting | **Vercel Hobby** | Free, git-integrated CD. Plan 08. |

Runtime dependencies: **`react`, `react-dom` only.** Any proposed addition needs a written
justification in the PR description.

## Repository layout

```
/
├─ docs/plans/                  # these documents
├─ Pentatonic Practice.dc.html  # visual mockup (style reference only)
├─ support.js                   # mockup preview runtime (not shipped)
├─ index.html                   # Vite entry: title, meta, fonts, theme-color #0c0e0d
├─ public/                      # favicon, robots.txt, og image
├─ src/
│  ├─ main.tsx
│  ├─ music/                    # plan 02 (pure TS, no React)
│  ├─ fretboard/                # plan 03 (pure TS, imports music only)
│  ├─ lick/                     # plan 04 (pure TS, imports fretboard/music)
│  ├─ state/                    # plan 06 (pure TS reducer + persistence)
│  ├─ audio/                    # plan 07 (phase 2; Web Audio, no React)
│  └─ ui/                       # plan 05 (React; the only layer that imports react)
│     ├─ App.tsx
│     ├─ theme.ts
│     └─ components/
├─ package.json
├─ tsconfig.json
├─ vite.config.ts
├─ vercel.json                  # plan 08
└─ .github/workflows/ci.yml    # plan 08
```

Each engine package (`music/`, `fretboard/`, `lick/`, `state/`) exposes its public API through an
`index.ts`; tests are colocated `*.test.ts`.

## Scaffolding steps

1. `npm create vite@latest . -- --template react-ts`, adapted around existing files
   (keep `docs/`, the mockup, `support.js`, `README.md`).
2. tsconfig: `strict`, `noUncheckedIndexedAccess` (cheap insurance for all the array-indexed
   fretboard math), `verbatimModuleSyntax`.
3. Vitest + ESLint + Prettier; npm scripts: `dev`, `build` (`tsc -b && vite build`), `preview`,
   `test` (`vitest run`), `test:watch`, `lint`, `typecheck` (`tsc --noEmit`), `format`.
4. ESLint layer-boundary rule as above.
5. `index.html`: `<title>Guitarmateur — Pentatonic Practice</title>`, meta description, JetBrains
   Mono from Google Fonts (weights 400–700, `display=swap`), `theme-color #0c0e0d`.
6. Global stylesheet with the mockup's base CSS: body `#0c0e0d`/`#e8ece9`, system font stack,
   link color `#c3f04b`, range `accent-color`, `::selection` tint.
7. Placeholder `App.tsx` rendering the page header (kicker "FRETBOARD TRAINER", h1, subtitle —
   copy from the mockup) so M1 has something visible to deploy.
8. Simple favicon (monogram "G" on `#0c0e0d`; don't block on art).

## Acceptance criteria

- [ ] `npm run dev` shows the dark-themed header; `build`, `test`, `lint`, `typecheck` pass on a clean checkout.
- [ ] Layer-boundary lint rule fails the build if e.g. `src/music/` imports React (verify with a deliberate bad import, then remove it).
- [ ] No runtime deps beyond react/react-dom.
- [ ] Ready for plan 08's M1 deploy (works as a static `dist/`).
