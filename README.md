# Guitarmateur

A free, fully-static **pentatonic & blues fretboard trainer** — visualize scales, target the chord
tones under your progression, and generate simple licks to solo over any backing track. No accounts,
no backend; everything persists in `localStorage`.

🌐 [guitarmateur.com](https://guitarmateur.com)

## Tech stack

React 19 · TypeScript 6 (strict) · Vite 8 · Vitest 4 · ESLint 10 (flat config) · Prettier.
Runtime dependencies are `react` + `react-dom` only. Hosted on Vercel (Hobby), auto-deployed on
merge to `main`.

## Getting started

```bash
npm install
npm run dev        # start the dev server
```

## Scripts

| Script | What it does |
|---|---|
| `npm run dev` | Vite dev server |
| `npm run build` | Type-check + production build to `dist/` |
| `npm run preview` | Serve the production build locally |
| `npm test` | Run unit tests (Vitest) |
| `npm run test:watch` | Vitest in watch mode |
| `npm run lint` | ESLint |
| `npm run typecheck` | `tsc --noEmit` |
| `npm run format` | Prettier |

CI runs `lint → typecheck → test → build` on every PR and gates merges.

## Architecture

Pure, unit-tested TypeScript engines under the UI, with a strictly one-directional dependency rule:

```
ui → state → (lick → fretboard → music)      audio → lick/state
```

Lower layers never import React or a higher layer (enforced by an ESLint rule). See
[`AGENTS.md`](AGENTS.md) for conventions and [`docs/plans/`](docs/plans/) for the full design.
