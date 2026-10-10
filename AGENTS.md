# AGENTS.md — Guitarmateur

Guidance for AI coding agents working in this repository. Humans: [`docs/`](docs/) for development docs.

## What this is

**Guitarmateur** (guitarmateur.com) is a free, fully-static guitar practice web app. Its first
product is a **pentatonic/blues fretboard trainer**: pick a key/scale/position → build a chord
progression → get per-chord practice licks (rhythm + technique + tab) that land target notes on the
changes. No accounts, no backend, no analytics — all user state lives in `localStorage`.

Architecture, tech stack, layer rules, conventions, and deployment: see
[`docs/architecture.md`](docs/architecture.md).

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

- **Read [`docs/architecture.md`](docs/architecture.md) before touching a layer** — it
  carries the design intent (dependency rule, conventions, invariants) that this file only points at.
- Respect the layer dependency rule; don't reach for a new dependency to avoid it — an ESLint rule
  fails the build on a bad cross-layer import.
- Keep new code stylistically consistent with the layer it lives in; colocate its `*.test.ts`.
- **Code both apps need** goes in `shared/` (imported as `@shared/…`; it imports neither app) —
  see the "Shared code" section of [`docs/architecture.md`](docs/architecture.md).
- **Working on the Theory app (`theory/`)?** It is a separate app with its own rules: read
  [`docs/theory.md`](docs/theory.md) and [`docs/theory-knowledge/`](docs/theory-knowledge/README.md) first.
- **Adding a language?** Follow [`docs/i18n.md`](docs/i18n.md) — a non-developer guide for shipping a new locale.
