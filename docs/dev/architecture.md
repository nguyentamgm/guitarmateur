# Architecture

Current-state reference for how Guitarmateur is built. For live status and what's being worked on
next, see [`progress.md`](progress.md) and [`roadmap.md`](roadmap.md).

## What this is

Guitarmateur is a free guitar practice web app. Its first product is a pentatonic/blues fretboard
trainer built around a three-step practice loop:

1. **See the scale** — pick a key, scale, and fretboard position(s); visualize them on an
   interactive fretboard diagram.
2. **Set the context** — build the chord progression of your backing track.
3. **Practice with purpose** — for each chord, the app highlights chord tones on the scale and
   generates short practice licks (with rhythm, techniques, and a difficulty level) shown as
   fretboard + guitar tab, designed to make you land target notes on the chord changes.

No accounts, no server-side state: the app is a fully static SPA on free-tier hosting, and
everything the user does persists in `localStorage`.

## Repository layout

```
/
├─ docs/
│  ├─ guide/                    # user-facing feature docs (linked from README.md)
│  └─ dev/                      # this file, progress tracker, roadmap
├─ Pentatonic Practice.dc.html  # visual mockup (style reference only)
├─ support.js                   # mockup preview runtime (not shipped)
├─ index.html                   # Vite entry: title, meta, fonts, theme-color #0c0e0d
├─ public/                      # favicon, robots.txt, og image
├─ src/
│  ├─ main.tsx
│  ├─ music/                    # pitch spelling, keys, intervals, scale registry, chords/harmony
│  ├─ fretboard/                # tuning-aware note mapping, algorithmic position/box generation
│  ├─ lick/                     # lick data model (rhythm + techniques), generation, difficulty
│  ├─ state/                    # versioned app state, reducer, localStorage persistence + migrations
│  ├─ audio/                    # metronome + lick playback via Web Audio synthesis
│  └─ ui/                       # React components — the only layer that imports react/react-dom
├─ package.json
├─ tsconfig.json
├─ vite.config.ts
├─ vercel.json
└─ .github/workflows/ci.yml
```

Each engine package (`music/`, `fretboard/`, `lick/`, `state/`) exposes its public API through an
`index.ts`; tests are colocated as `*.test.ts` next to the code they cover.

## Layers & the dependency rule

Every layer below `ui/` is pure, unit-tested TypeScript with no React/DOM dependency, so the
engines are reusable (future audio, even a CLI) and testable without a renderer.

Dependency rule (strictly one-directional):

```
ui → state → (lick → fretboard → music)      audio → lick/state
```

Lower layers **never** import from higher ones. `music`, `fretboard`, `lick`, and `state` must
never import `react`, `state`, or `ui`. This is enforced by an ESLint `no-restricted-imports` rule
(`eslint.config.js`) — a violating import fails the build. If lint blocks an import, the fix is
almost always to move logic down a layer, not to relax the rule.

## Tech stack

Boring choices, zero runtime cost. Runtime dependencies are `react` + `react-dom` only — any
addition needs written justification in the PR. `package.json` is authoritative for exact
versions; roughly:

| Concern | Choice |
|---|---|
| Framework | React + React DOM |
| Language | TypeScript (strict) |
| Build/dev | Vite |
| React plugin | `@vitejs/plugin-react` |
| Tests | Vitest + jsdom |
| Lint | ESLint (flat config) + typescript-eslint + `eslint-plugin-react-hooks` |
| Format | Prettier |
| Package manager | npm |
| Runtime (CI + local) | Node 22 LTS |
| Hosting | Vercel Hobby (free) |

## `src/audio/` internals

```
engine.ts      AudioContext lifecycle (created on first user gesture), master gain
scheduler.ts   lookahead scheduler (the standard "tale of two clocks" pattern:
               setInterval(25ms) schedules events falling in the next 100ms window
               on the AudioContext clock) — sample-accurate, tab-throttle-proof
voices.ts      click(when, accented) — short filtered noise/oscillator blip, two pitches
               pluck(when, midi, durationSec) — Karplus-Strong plucked string:
               noise burst into a feedback delay line (delay = 1/f) with lowpass damping,
               via native DelayNode/BiquadFilterNode (no AudioWorklet)
transport.ts   play/stop/loop state machine; converts Lick + tempo into scheduled events;
               emits beat/position callbacks for UI highlighting
```

`useTransport()` in `src/ui/` adapts the transport to React (play state, current beat, current
card). Techniques map to playback pragmatically: slides/hammers/pulls retrigger softly (shorter
attack); bends play the target pitch rather than a pitch ramp. Note pitch comes from
`LickNote.pitch` → `midi()`.

**Autoplay gate**: the `AudioContext` is created/resumed only inside the play button's click
handler (browsers require a user gesture) — never at module load.

## Conventions & invariants

- **TypeScript strict**, plus `noUncheckedIndexedAccess` (fretboard math is array-indexed) and
  `verbatimModuleSyntax`. Model techniques/actions as discriminated unions.
- **No E2E framework by design.** Correctness lives in heavily unit-tested pure engines; UI is
  checked with manual verification passes. Property-style tests are plain seeded loops — no
  `fast-check`.
- **Correct pitch spelling is a hard requirement:** F minor shows B♭, not A♯, across all 12 keys.
  Work in spelled pitches, not pitch classes.
- **No hardcoded shape/box tables** — fretboard positions are generated algorithmically.
- **Licks are deterministic:** the same seed reproduces the same lick. State persists licks via
  seeds, not expanded note lists.
- **State is versioned** with a migration path; it must survive reload.
- **Styling:** plain CSS + design tokens in `src/ui/theme.ts`. No Tailwind, no CSS-in-JS runtime.
  One dark theme (base `#0c0e0d`, text `#e8ece9`, accent `#c3f04b`).
- **Zero budget / free tiers only.** No paid APIs; audio is synthesized, not sampled.

## Deployment

```
PR → GitHub Actions (lint, typecheck, test, build)     ← merge gate
   → Vercel preview deployment (automatic)
merge to main → Vercel production build & deploy → guitarmateur.com
```

Static SPA on **Vercel Hobby**. Vercel's Git integration deploys — CI never touches deploy tokens.
Merge to `main` → production at guitarmateur.com. No env vars, no secrets.

- **Rollback**: Vercel dashboard → Deployments → "Promote to Production" on any previous
  deployment (or `vercel rollback`).
- **Domain**: `guitarmateur.com` registered at Namecheap, DNS records point at Vercel
  (`A` record on `@`, `CNAME www → cname.vercel-dns.com`); Vercel auto-issues the TLS cert.
- **Monitoring**: Vercel's deploy emails/dashboard only — no separate uptime/analytics tooling.
