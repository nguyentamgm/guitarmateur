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
│  ├─ architecture.md           # this file
│  └─ glossary.md               # one term per idea, EN + VI, for both apps
├─ index.html                   # Vite entry: title, meta, fonts, data-app="practice" (lime accent)
├─ public/                      # favicon, robots.txt, og image
├─ src/
│  ├─ main.tsx
│  ├─ music/                    # pitch spelling, keys, intervals, scale registry, chords/harmony
│  ├─ fretboard/                # tuning-aware note mapping, algorithmic position/box generation
│  ├─ lick/                     # lick data model (rhythm + techniques), generation, difficulty
│  ├─ state/                    # versioned app state, reducer, localStorage persistence + migrations
│  ├─ audio/                    # licks → timeline for the shared sequencer (shared/core/audio)
│  ├─ i18n/                     # translator, plural rules, locale detection/validation — leaf layer
│  └─ ui/                       # React components — the only layer that imports react/react-dom
├─ theory/                      # the Theory app (/theory) — see docs/theory.md
├─ shared/                      # code both apps use, imported as @shared/… — see below
│  ├─ core/                     # pure: neck.ts (string numbering, names per tuning); music/, rhythm/
│  │                            # (Theory's); audio/ (synths, player, backings, scheduler, sequencer)
│  ├─ i18n/                     # the shared language setting (gm.lang), browser-language matching,
│  │                            # the glossary check (glossary.ts)
│  ├─ platform/                 # browser APIs behind a safe wrapper: browserStorage()
│  └─ ui/                       # the shared look: tokens/base/controls CSS + controls.tsx; the neck:
│                               # Fretboard.tsx, geometry.ts, PositionFrame.tsx, fretboard.css;
│                               # BarGrid.tsx (a chord form as bars), GlobeIcon.tsx; useClock,
│                               # useBacking (hooks taking a player)
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
- Tests are colocated (`shared/**/*.test.{ts,tsx}`) and run with the rest.

Today it holds `shared/i18n/language.ts` — the `gm.lang` key, carrying an old per-app choice over,
and the browser-language rule — — used by `src/i18n/detect.ts` and `src/state/persistence.ts` here
and by `theory/src/i18n/lang.ts` in Theory; `shared/i18n/glossary.ts`, which reads the words
[`glossary.md`](glossary.md) says to avoid and finds them in copy (each app's glossary test runs it
over its own strings); `shared/platform/storage.ts`, the localStorage
accessor both apps use; and the shared look in `shared/ui/` (Theory's, the reference):

- `tokens.css` — colours (light + dark), fonts, radius, spacing and type scale. Each app has its
  own `--accent`: Theory's blue by default; `<html data-app="practice">` (Practice's
  `index.html`) switches to lime.
  Each page's `index.html` loads the fonts (Bricolage Grotesque, Be Vietnam Pro, JetBrains Mono).
- `base.css` — element styles (body type, headings, links, focus ring, reduced motion).
- `controls.css` + `controls.tsx` — the site header, card (`.board`), segmented control
  (`ChipGroup`, `OnOff`, `Chip`), `Button`, `Slider`, the key picker (`KeyPicker`, `.finder`: each
  key's name and its fret on the lowest string, "A 5"; the caller spells the keys and finds the
  fret, Practice with `homeFret(tuning, tonic)`) and the "Takeaway / Try it" hint panel
  (`.takeaways`; Theory ends each lesson step with it, Practice each of its three steps). Components take their text from the caller: no copy lives in `shared/` (ESLint
  rejects literal JSX text and literal `aria-label`/`title`/`alt` in `shared/ui/**/*.tsx`).
- `BarGrid.tsx` (styled in `controls.css`, `.bars`) — a chord form as lines of four bars: the
  Roman numeral above the chord, the bar being heard filled (`current`), optional `marks`. Theory
  draws its lesson forms with it; Practice's Step 2 shows the progression with it (a 2-bar chord
  fills two cells), lit by Step 3's playback.

- `Fretboard.tsx` + `geometry.ts` + `PositionFrame.tsx` + `fretboard.css` — the neck both apps
  draw (Theory's): wood, frets, inlays, an optional box frame, clickable note dots. Sound is a
  `play(midi)` prop (each app has its own audio). Dots carry a `degree` and a `name` (`labels`
  picks which shows; an explicit `label` wins) and a tone: `home`/`homeMajor` (root), `blue`
  (♭5), `soft`, `chord` (chord tone), `target`; plus `halo` (landing note) and `mark` (role).
  `stringNames` follows the tuning (`DROP_D_STRING_NAMES` in `shared/core/neck.ts`) and
  `leftHanded` mirrors the neck with its text kept upright. A merged box is one `box` span.
  `neckGeometry(frets, { from })` draws a window of the neck (frets `from + 1`…`frets`, no nut),
  as Practice's lick cards do. On the dark wood an app may set a lighter `--neck-accent`.
  Practice maps its notes onto it in `src/ui/neck.ts` (`boxDots`, `tuningNames`) and sounds a
  clicked note through `src/ui/notePlayer.ts`.
- The tab look is in `fretboard.css` too (`.tab`, `.tabline`, `.tabname`, `.tabnum` boxes, the
  sounding one `.on`, `.tabbar`, `.tabcount`): Theory's `ui/Tab.tsx` (columns) and Practice's
  `TabStaff` (notes placed by start beat, beat ticks and numbers on top, then a chord-tone row
  and a duration row under it) draw with it. Both write a technique into the number as Theory does
  (`h7`, `p5`, `/9`, `7b9`; Practice's `tabText` in `src/ui/labels.ts`), and a number plays its
  note when clicked. A dense lick scrolls sideways rather than shrinking its numbers.
- `GlobeIcon.tsx` — the globe beside both headers' language switcher.

**Sound (`shared/core/audio`, Theory's).** Plucked strings and clicks rendered once into buffers
and played by a `Player` (`createPlayer`): one AudioContext, created on the first sound (a user
gesture); `setEnabled` turns it on or off, `setLevels({ note, click })` the mix, `now()` the audio
clock. On it: `backing.ts` (shuffle, strum, rock, comp patterns per chord), `useClock` /
`useBacking` (a step clock and a backing track over one chord per bar, swung when the style
swings), and `Sequencer`: a timeline of notes (with length, glide, palm mute) and clicks played
sample-accurately through the lookahead `Scheduler`, looping pass after pass, reporting each event
as it sounds. Practice's licks reach it through `src/audio/sharedPasses.ts`: `compileProgression`
still lays out count-in, swing, bars per chord and the metronome; `lickPasses` turns that into
sequencer passes (a note rings until the next one on its string; a technique becomes a glide).

An app imports the CSS once, in order, from its entry (`tokens`, `base`, `controls`, `fretboard`,
then its own).

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

Practice has no synth of its own: it plays on the shared guitar sound (`shared/core/audio`, above).
What is left in `src/audio/` is what turns licks into a timeline:

```
compile.ts       compileProgression: Lick[] + tempo → time-sorted pluck/click events (count-in,
                 swing, bars per chord, metronome); a pluck carries its string, technique and
                 the previous note's pitch, a downbeat click the bar it starts
sharedPasses.ts  lickPasses / toSeqEvents: those events → passes for the shared Sequencer; a note
                 rings until the next pick on its string, a technique becomes a glide into it;
                 tags are a `NoteTag` (which card and note) or a `BarTag` (which bar)
```

In `src/ui/`, `audioPlayer.ts` holds the page's one `Player`; `useTransport()` drives a
`Sequencer` on it (play state, the sounding note for card/tab highlighting, the bar being heard
for Step 2's bar grid, the click/note mix), and
`notePlayer.ts` plucks a note clicked on a neck.

**Autoplay gate**: the `AudioContext` is created on the first sound — the play button or a clicked
note (browsers require a user gesture) — never at module load.

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
