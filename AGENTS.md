# AGENTS.md — Guitarmateur

Guidance for AI coding agents working in this repository. Humans: see [`docs/plans/`](docs/plans/).

## What this is

**Guitarmateur** (guitarmateur.com) is a free, fully-static guitar practice web app. Its first
product is a **pentatonic/blues fretboard trainer**: pick a key/scale/position → build a chord
progression → get per-chord practice licks (rhythm + technique + tab) that land target notes on the
changes. No accounts, no backend, no analytics — all user state lives in `localStorage`.

## Current status

See [`docs/plans/09-progress.md`](docs/plans/09-progress.md) for live milestone status and
per-plan acceptance criteria — **check it before starting work** so you know which layers exist
and which milestone is next. Update it in the same PR that finishes a milestone or checks off an
acceptance-criteria item; don't let this file's status go stale again.

Existing files:
- `docs/plans/00–09` — the authoritative specs (`09-progress.md` is the live status tracker).
  **Read the relevant plan before implementing a layer.**
- `Pentatonic Practice.dc.html` — visual mockup. Authoritative for **look & feel only** (colors,
  type, spacing, the 3-step page rhythm). **Not** for logic.
- `support.js` — the mockup's throwaway preview runtime. **Never shipped, never imported, never edited.**

> When porting from the mockup: **port pixels, not algorithms.** Its embedded script has known flaws
> (hardcoded box shapes, pitch-class-only theory, rhythmless random-walk licks) that this plan set
> exists to avoid.

## Tech stack — pinned latest stable (verified 2026-07-08)

Boring choices, zero runtime cost. **Runtime deps are `react` + `react-dom` only** — any addition
needs written justification in the PR.

| Concern | Choice | Version |
|---|---|---|
| Framework | React + React DOM | `19.2` |
| Language | TypeScript (strict) | `6.0` |
| Build/dev | Vite | `8.1` |
| React plugin | `@vitejs/plugin-react` | `6.0` |
| Tests | Vitest | `4.1` |
| DOM for tests | jsdom | `29` |
| Lint | ESLint (flat config) | `10.6` |
| TS lint | typescript-eslint | `8.63` |
| React hooks lint | `eslint-plugin-react-hooks` | `7.1` |
| Format | Prettier | `3.9` |
| Types | `@types/react`, `@types/react-dom` | `19.2` |
| Package manager | npm | — |
| Runtime (CI + local) | Node | `22` LTS (Vite 8 needs `^20.19 \|\| >=22.12`) |
| Hosting | Vercel Hobby (free) | — |

Notes:
- The plan text says "React 18+" — go with **React 19**, the current stable major.
- ESLint is **flat config** (`eslint.config.js`), not `.eslintrc`.
- `@vitejs/plugin-react` 6 runs on Vite's Rolldown pipeline and can opt into the React Compiler
  (`babel-plugin-react-compiler` is now stable at v1). The compiler is **optional** and not part of
  the zero-dep baseline — don't add it without justifying it in the PR.

## Architecture — the layer rule is load-bearing

Every layer below `ui/` is **pure, unit-tested TypeScript with no React/DOM dependency**, so the
engines are reusable (future audio, even a CLI) and testable without a renderer.

```
src/
├─ music/      pitch spelling, keys, intervals, scale registry, chords with tone roles
├─ fretboard/  tuning-aware note mapping, algorithmic position/box generation, box merging
├─ lick/       lick data model (rhythm + techniques), generation pipeline, difficulty scoring
├─ state/      versioned app state, reducer, localStorage persistence + migrations
├─ audio/      (phase 2) metronome + lick playback via Web Audio
└─ ui/         React components — the ONLY layer that may import react/react-dom
```

**Dependency rule (strictly one-directional):**

```
ui → state → (lick → fretboard → music)      audio → lick/state
```

Lower layers **never** import from higher ones. `music`, `fretboard`, `lick`, and `state` must
**never** import `react`, `state`, or `ui`. This is enforced by an ESLint `no-restricted-imports`
rule — a violating import fails the build. If lint blocks an import, the fix is almost always to
move logic down a layer, not to relax the rule.

- Each engine package exposes its public API through an `index.ts`.
- Tests are **colocated** as `*.test.ts` next to the code they cover.

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

## Conventions & invariants

- **TypeScript strict**, plus `noUncheckedIndexedAccess` (fretboard math is array-indexed) and
  `verbatimModuleSyntax`. Model techniques/actions as discriminated unions.
- **No E2E framework by design.** Correctness lives in heavily unit-tested pure engines; UI is
  checked with the manual checklists in the plans. Property-style tests are plain seeded loops — no
  `fast-check`.
- **Correct pitch spelling is a hard requirement:** F minor shows B♭, not A♯, across all 12 keys.
  Work in spelled pitches, not pitch classes.
- **No hardcoded shape/box tables** — positions are generated algorithmically.
- **Licks are deterministic:** the same seed reproduces the same lick. State persists licks via
  seeds, not expanded note lists.
- **State is versioned** with a migration path; it must survive reload.
- **Styling:** plain CSS + design tokens in `src/ui/theme.ts`. No Tailwind, no CSS-in-JS runtime.
  One dark theme (base `#0c0e0d`, text `#e8ece9`, accent `#c3f04b`).
- **Zero budget / free tiers only.** No paid APIs; audio (phase 2) is synthesized, not sampled.

## Deployment

Static SPA on **Vercel Hobby**. Vercel's Git integration deploys — CI never touches deploy tokens.
Merge to `main` → production at guitarmateur.com. No env vars, no secrets. Rollback = "Promote to
Production" on a previous Vercel deployment. Details in
[`docs/plans/08-deployment.md`](docs/plans/08-deployment.md).

## Working agreements for agents

- **Read the relevant `docs/plans/NN-*.md` before touching a layer** — they carry the design intent
  and acceptance criteria that this file only summarizes.
- Respect the layer dependency rule above; don't reach for a new dependency to avoid it.
- Never edit or ship `support.js` or the `.dc.html` mockup.
- Keep new code stylistically consistent with the layer it lives in; colocate its `*.test.ts`.
