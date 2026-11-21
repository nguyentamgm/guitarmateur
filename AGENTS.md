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
merges. A husky `pre-push` hook (`.husky/pre-push`, installed by `npm install`) runs lint →
typecheck → test before every push and stops it on a failure; don't bypass it with `--no-verify`.

## Working agreements for agents

- **Read [`docs/architecture.md`](docs/architecture.md) before touching a layer** — it
  carries the design intent (dependency rule, conventions, invariants) that this file only points at.
- Respect the layer dependency rule; don't reach for a new dependency to avoid it — an ESLint rule
  fails the build on a bad cross-layer import.
- Keep new code stylistically consistent with the layer it lives in; colocate its `*.test.ts`.
- **Test the critical cases only.** This is a small hobby project: a few focused tests per change,
  not exhaustive coverage. Test core logic and music rules, stored data (reading and migration),
  and the main user path of a new screen. Skip obvious edge cases, every permutation, copy and
  styling, and headless-browser checks unless the issue asks for them.
  - **Before adding a test**, name the bug a user could hit, then look for an existing test that
    already catches it. If one does, leave the suite alone. If the behaviour changed, update the test
    that covers it rather than adding another next to it.
  - **Music rules: test the logic layer with representative cases.** Example: a lick that resolves
    to the next chord lands on that chord's tone at the change, shown with one change whose chords
    share few notes, not a loop over every key, box and level.
  - **UI: test what the learner does and what they get.** Example: pressing Stop stops the notes
    (no more plucks after the timers run), not the class names or the markup.
  - **Widen to more keys, seeds or languages only when they can fail differently**: a sharp or
    flat spelling, a shape that wraps an octave, a placeholder only one language has. The same rule
    over 12 keys is one case.
  - **Don't copy data into a test** (a count of IDs, a list of slugs repeated, a CSS class string,
    one config field). Test the rule the data must follow instead: unique, valid references, both
    languages in step.
- **No code review step is needed before merging:** CI (lint → typecheck → test → build) is the gate.
- **Code the apps share** goes in `shared/` (imported as `@shared/…`; it imports none of them) —
  see the "Shared code" section of [`docs/architecture.md`](docs/architecture.md).
- **Working on the Theory app (`theory/`)?** It is a separate app with its own rules: read
  [`docs/theory.md`](docs/theory.md) and [`docs/theory-knowledge/`](docs/theory-knowledge/README.md) first;
  when working on a session (`theory/src/sessions/`), read [`docs/theory-sessions.md`](docs/theory-sessions.md) first.
- **Working on the ear trainer (`ear/`, served at `/ear-training`)?** It is a third app with its own layers
  and music rules, being built in phases (#227): read [`docs/ear.md`](docs/ear.md) first.
- **Working on the lick generator (`src/lick/`)?** Read [`docs/licks.md`](docs/licks.md) first: most licks
  come from a phrase vocabulary (data), not from note-by-note rules.
- **Adding a language?** Follow [`docs/i18n.md`](docs/i18n.md) — a non-developer guide for shipping a new locale.
