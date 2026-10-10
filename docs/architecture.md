# Architecture

Current-state reference for how Guitarmateur is built.

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
│  └─ architecture.md           # this file
├─ index.html                   # Vite entry: title, meta, fonts, data-app="practice" (lime accent)
├─ public/                      # favicon, robots.txt, og image
├─ src/
│  ├─ main.tsx
│  ├─ music/                    # pitch spelling, keys, intervals, scale registry, chords/harmony
│  ├─ fretboard/                # tuning-aware note mapping, algorithmic position/box generation
│  ├─ lick/                     # lick data model (rhythm + techniques), generation, difficulty
│  ├─ state/                    # versioned app state, reducer, localStorage persistence + migrations
│  ├─ audio/                    # metronome + lick playback via Web Audio synthesis
│  ├─ i18n/                     # translator, plural rules, locale detection/validation — leaf layer
│  └─ ui/                       # React components — the only layer that imports react/react-dom
├─ theory/                      # the Theory app (/theory) — see docs/theory.md
├─ shared/                      # code both apps use, imported as @shared/… — see below
│  ├─ i18n/                     # the shared language setting (gm.lang) and browser-language matching
│  ├─ platform/                 # browser APIs behind a safe wrapper: browserStorage()
│  └─ ui/                       # the shared look: tokens.css, base.css, controls.css + controls.tsx
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
ui, state → i18n                              i18n imports nothing in src/ (only @shared)
```

Lower layers **never** import from higher ones. `music`, `fretboard`, `lick`, and `state` must
never import `react`, `state`, or `ui`. This is enforced by an ESLint `no-restricted-imports` rule
(`eslint.config.js`) — a violating import fails the build. If lint blocks an import, the fix is
almost always to move logic down a layer, not to relax the rule.

`i18n/` is a separate leaf layer, sibling to `music/`: pure TypeScript that imports nothing from
the rest of the app (not even `music`) and is never imported by `music`, `fretboard`, `lick`, or
`audio` — those engines stay locale-free and return ids/notation, never translated strings. `ui`
and `state` may both import `i18n` (`state` only for the `LocaleId` type and validation, since it
persists the preference but never renders). See [`docs/i18n.md`](i18n.md) for the contributor-facing
guide to adding a new language.

## Shared code (`shared/`)

The practice app (`src/`) and the Theory app (`theory/`) never import each other. What both use
lives in `shared/` and is imported through the `@shared/*` alias (`paths` in `tsconfig.app.json`
and `tsconfig.theory.json`, `resolve.alias` in `vite.config.ts`, which Vitest also uses):

```
src/  ──→ shared/ ←──  theory/        shared/ imports neither app
```

- `shared/core/` and `shared/i18n/` are pure TypeScript: no React, no browser globals (storage is
  passed in; `shared/platform/` has the safe `browserStorage()` accessor). `shared/ui/` is for React
  components and design tokens both apps render.
- ESLint enforces it: `shared/**` may not import `src/` or `theory/`; `shared/core` and
  `shared/i18n` may not import React. The apps' own layer rules never apply to `@shared/…` imports.
- Tests are colocated (`shared/**/*.test.ts`) and run with the rest.

Today it holds `shared/i18n/language.ts` — the `gm.lang` key, carrying an old per-app choice over,
and the browser-language rule — — used by `src/i18n/detect.ts` and `src/state/persistence.ts` here
and by `theory/src/i18n/lang.ts` in Theory; `shared/platform/storage.ts`, the localStorage
accessor both apps use; and the shared look in `shared/ui/` (Theory's, the reference):

- `tokens.css` — colours (light + dark), fonts, radius, spacing and type scale. Each app has its
  own `--accent`: Theory's blue by default; `<html data-app="practice">` (Practice's
  `index.html`) switches to lime.
  Each page's `index.html` loads the fonts (Bricolage Grotesque, Be Vietnam Pro, JetBrains Mono).
- `base.css` — element styles (body type, headings, links, focus ring, reduced motion).
- `controls.css` + `controls.tsx` — the site header, card (`.board`), segmented control
  (`ChipGroup`, `OnOff`, `Chip`), `Button`, `Slider` and the "Takeaway / Try it" hint panel
  (`.takeaways`). Components take their text from the caller: no copy lives in `shared/` (ESLint
  rejects literal JSX text and literal `aria-label`/`title`/`alt` in `shared/ui/**/*.tsx`).

An app imports the CSS once, in order, from its entry (`tokens`, `base`, `controls`, then its own).

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
engine.ts      AudioContext lifecycle (created on first user gesture), master gain, and the
               fixed guitar amp chain on the note path:
               noteBus → pickup peak (3 kHz) → preGain → waveShaper (soft-clip, 4x
               oversampled) → cabinet (highpass 90 Hz + cascaded lowpass ~4 kHz) →
               tone stack → noteOut → master
scheduler.ts   lookahead scheduler (the standard "tale of two clocks" pattern:
               setInterval(25ms) schedules events falling in the next 100ms window
               on the AudioContext clock) — sample-accurate, tab-throttle-proof
voices.ts      click(when, accented) — short filtered noise/oscillator blip, two pitches
               pluck(when, midi, durationSec, opts) — one string: two sawtooth oscillators
               7 cents apart plus a pick-noise transient, through a lowpass whose cutoff
               falls as the note decays; rings past its notated length so notes overlap
transport.ts   play/stop/loop state machine; converts Lick + tempo into scheduled events;
               emits beat/position callbacks for UI highlighting
```

The amp chain lives on the bus, not per note: a `WaveShaperNode` curve is a 2048-sample array that
would otherwise be rebuilt every note, and distortion is non-linear, so applying it once after the
mix is what a real amp does. `setNoteGain` rides `noteOut` (post-drive) so the mix slider doesn't
change how hard the waveshaper is driven.

`useTransport()` in `src/ui/` adapts the transport to React (play state, current beat, current
card). Techniques are rendered as articulation: hammer-ons/pull-offs skip the pick transient and
sound softer; slides and bends ramp `frequency` from the previous note's pitch (`AudioEvent`
carries `technique` + `fromMidi` for this), with bends leaning in slower than slides. Notes held
past ~0.5s get a delayed-onset vibrato LFO on `detune`. Note pitch comes from `LickNote.pitch` →
`midi()`.

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
- **Styling:** plain CSS + the shared design tokens (`shared/ui/tokens.css`, imported in
  `src/main.tsx` before `src/ui/global.css`). Inline styles read them through `src/ui/theme.ts`,
  whose values are CSS variables (`var(--surface)`…); SVG paint goes in `style`, not the
  `fill`/`stroke` attributes. Light and dark follow the system, like Theory; only the accent
  differs (lime). Labels use the shared sans font; mono is for numbers (BPM, frets, tab, numerals).
  Segmented options are the shared `.chip` (`PillButton`, `wide` = words), cards the shared
  `.board` (`Panel`), buttons `.btn`. No Tailwind, no CSS-in-JS runtime.
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
