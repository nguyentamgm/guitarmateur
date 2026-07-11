# Guitarmateur — Project Overview & Plan Index

## What we are building

**Guitarmateur** (guitarmateur.com) is a free guitar practice web app. Its first product is a
**pentatonic/blues fretboard trainer** built around a three-step practice loop:

1. **See the scale** — pick a key, scale, and fretboard position(s); visualize them on an
   interactive fretboard diagram.
2. **Set the context** — build the chord progression of your backing track.
3. **Practice with purpose** — for each chord, the app highlights chord tones on the scale and
   generates short practice licks (with rhythm, techniques, and a difficulty level) shown as
   fretboard + guitar tab, designed to make you *land target notes on the chord changes*.

No accounts, no server-side state, no sponsors: the app is a fully static SPA on free-tier
hosting, and everything the user does persists in `localStorage`.

## Role of the design mockup

[`Pentatonic Practice.dc.html`](../../Pentatonic%20Practice.dc.html) is an **early visual mockup
only** — authoritative for *look and feel* (colors, typography, spacing, the 3-step page rhythm)
but **not** for logic. Its embedded script is a throwaway prototype whose known flaws (hardcoded
box shapes, pitch-class-only theory, rhythmless random-walk licks) are exactly what this plan set
is designed to avoid. When porting anything from it, port **pixels, not algorithms**.
`support.js` is the mockup's preview runtime — never shipped.

## Architecture

Pure static frontend; every layer below the UI is a pure, unit-tested TypeScript library with no
React/DOM dependency, so future features (new scales, audio, even a CLI) reuse them unchanged.

```
src/
├─ music/      pitch spelling, keys, intervals, scale registry, chords with tone roles, harmony
├─ fretboard/  tuning-aware note mapping, algorithmic position/box generation, box merging
├─ lick/       lick data model (rhythm + techniques), generation pipeline, difficulty scoring
├─ state/      versioned app state, reducer, localStorage persistence + migrations
├─ audio/      (phase 2) metronome + lick playback via Web Audio synthesis
└─ ui/         React components: fretboard/tab SVG renderers, the 3-step page, app shell
```

Dependency rule: `ui → state → (lick → fretboard → music)`; `audio → lick/state`. Lower layers
never import from higher ones.

Hosting: **Vercel Hobby (free)**, auto-deploy on merge to `main`, no staging. Domain
**guitarmateur.com** at Namecheap, DNS pointed at Vercel. See plan 08.

## Plan index

| # | Plan | Layer / deliverable |
|---|------|---------------------|
| 01 | [Tech stack & scaffolding](01-tech-stack.md) | Vite + React + TS skeleton, tooling, layout |
| 02 | [Music core](02-music-core.md) | `src/music/` — pitches with spelling, keys, scale registry, chords with tone roles |
| 03 | [Fretboard engine](03-fretboard-engine.md) | `src/fretboard/` — tunings, algorithmic box generation |
| 04 | [Lick engine](04-lick-engine.md) | `src/lick/` — rhythm-aware generation pipeline, difficulty levels |
| 05 | [UI](05-ui.md) | `src/ui/` — design system from the mockup, all components |
| 06 | [State & persistence](06-state-and-persistence.md) | `src/state/` — versioned schema, migrations |
| 07 | [Audio (phase 2)](07-audio.md) | `src/audio/` — metronome, lick playback, tempo |
| 08 | [CI & deployment](08-deployment.md) | GitHub Actions + Vercel + guitarmateur.com |
| 09 | [Progress tracker](09-progress.md) | **Current status — check here first** |

## Milestones (build order)

**M1 — Walking skeleton.** Plan 01 + plan 08: scaffolded app with the page header on the dark
theme, CI green, **deployed to guitarmateur.com**. Deploy first, build features on top — every
merge from here on is visible in production.

**M2 — Scale explorer.** Plans 02, 03 + the Step-1 UI from plan 05: pick key / scale
(minor pentatonic, major pentatonic, blues) / positions; see correctly-spelled notes on the
fretboard. Useful on its own; ship it.

**M3 — MVP practice loop (v1 launch).** Plan 04 (levels 1–3) + Steps 2–3 UI + plan 06:
progression builder, per-chord practice cards with rhythmic tab, difficulty control, full
localStorage persistence. This is the public v1.

**M4 — Musicality.** Lick engine levels 4–5: techniques (hammer/pull/slide/bend), target-note
modes (root / 3rd / 5th), "land on the next chord" resolution mode.

**M5 — Audio (phase 2).** Plan 07: metronome, count-in, lick playback, tempo control, per-chord
bar counts.

**Later / unscheduled:** 7-note scales & modes (engine supports them from M2 — only UI +
registry entries needed), alternate tunings UI (drop D ships in the registry from M2 but stays
hidden until then), left-handed view, preset sharing via URL, PWA/offline.

## Definition of done (v1 = end of M3)

This is the spec's definition, fixed at plan time. For live checked/unchecked status against the
current codebase, see [09-progress.md](09-progress.md) — don't hand-edit checkboxes here.

- https://guitarmateur.com serves the app over HTTPS; www and http variants redirect.
- Merging to `main` deploys automatically; CI (lint, typecheck, test, build) gates PRs.
- Keys are spelled correctly (F minor shows B♭, not A♯) across all 12 keys × 3 scales.
- Positions are generated algorithmically — no hardcoded shape tables anywhere.
- Licks have rhythm, respect the chosen difficulty level, and end on the selected target
  chord tone; regenerating with the same seed reproduces the same lick.
- State (including licks, via seeds) survives reload; schema is versioned with a migration path.
- All engine/state packages ≥ solidly unit-tested; `npm test` passes in CI.

## Constraints & non-goals

- **Zero budget**: only free tiers (Vercel Hobby, GitHub Free/Actions, Namecheap already owned).
  No paid APIs, no samples requiring licensing — audio uses synthesis, not soundfont downloads,
  unless a public-domain asset is small and self-hosted.
- **No E2E test framework** (Playwright/Cypress): quality comes from heavily unit-tested pure
  engines + per-milestone manual verification checklists in the plans. Revisit only if manual
  checks become the bottleneck.
- No accounts, no backend, no analytics in v1.
- No audio before M5; no notation (standard staff) rendering — tab only.
