# AGENTS.md — Guitarmateur

Guidance for AI coding agents working in this repository. Humans: see [`docs/guide/`](docs/guide/)
for how to use the app, or [`docs/dev/`](docs/dev/) for development docs.

## What this is

**Guitarmateur** (guitarmateur.com) is a free, fully-static guitar practice web app. Its first
product is a **pentatonic/blues fretboard trainer**: pick a key/scale/position → build a chord
progression → get per-chord practice licks (rhythm + technique + tab) that land target notes on the
changes. No accounts, no backend, no analytics — all user state lives in `localStorage`.

Architecture, tech stack, layer rules, conventions, and deployment: see
[`docs/dev/architecture.md`](docs/dev/architecture.md).

## Current status & how to pick up work

See [`docs/dev/progress.md`](docs/dev/progress.md) for live milestone status and per-area
acceptance criteria — **check it before starting work**. For **what to build next and in what
increments**, see [`docs/dev/roadmap.md`](docs/dev/roadmap.md): work ships as **small, CI-green,
one-concern tasks**, not whole milestones. Before starting anything that spans multiple layers
(schema + engine + UI), slice it per the roadmap first. Update `progress.md` in the same PR that
closes a task.

## Commands

```bash
npm run dev         # Vite dev server
npm run build       # tsc -b && vite build  → static dist/
npm run preview     # serve the production build
npm test            # vitest run (unit only)
npm run test:watch  # vitest watch
npm run lint        # eslint
npm run typecheck   # tsc --noEmit
npm run format      # prettier
```

CI (`.github/workflows/ci.yml`) runs **lint → typecheck → test → build** on every PR and gates
merges. Match that order locally before pushing.

## Working agreements for agents

- **Read [`docs/dev/architecture.md`](docs/dev/architecture.md) before touching a layer** — it
  carries the design intent (dependency rule, conventions, invariants) that this file only points at.
- Respect the layer dependency rule; don't reach for a new dependency to avoid it — an ESLint rule
  fails the build on a bad cross-layer import.
- [`Pentatonic Practice.dc.html`](Pentatonic%20Practice.dc.html) is an early visual mockup —
  authoritative for **look & feel only** (colors, type, spacing, page rhythm), **not** for logic.
  Its embedded script has known flaws (hardcoded box shapes, pitch-class-only theory, rhythmless
  random-walk licks) that the real engines exist to avoid. Port pixels, not algorithms.
- `support.js` is the mockup's throwaway preview runtime. **Never shipped, never imported, never edited.**
- Keep new code stylistically consistent with the layer it lives in; colocate its `*.test.ts`.
