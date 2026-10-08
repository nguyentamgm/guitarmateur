# Theory — conventions

Theory is a separate app in this repo: visual, animated music-theory lessons for electric guitar,
served at `/theory`. It shares tooling (Vite, TypeScript, Vitest, ESLint, CI) with the practice
app in `src/` but **no code**. What to teach: [`theory-knowledge/`](theory-knowledge/README.md).

## Layout

```
theory/
└─ src/
   ├─ core/              pure TypeScript, unit-tested
   │  ├─ music/          spelled pitches, intervals, scales, chords, keys, roman numerals
   │  ├─ fretboard/      neck grid, octave shapes, positions (boxes, 3-notes-per-string)
   │  ├─ rhythm/         time as a grid: BPM, note lengths in cells, counting, strum patterns
   │  └─ audio/          plucked-string and click synths (pure) + Web Audio player
   ├─ platform/          browser APIs behind a safe wrapper: `browserStorage()` (localStorage)
   ├─ i18n/              languages (en default), UI strings, `fill()`, copy-shape test helpers
   ├─ lessons/           one folder per lesson: steps + concept IDs, copy.en.ts, copy.vi.ts,
   │                     scenes.ts (pure scene data derived from core), registry in index.ts
   ├─ ui/                React: App, router, Fretboard, pages, lessons/<Lesson>Scene.tsx
   └─ main.tsx           entry of theory/index.html
```

Theory is a second Vite page: `theory/index.html` builds to `dist/theory/index.html`. Routes are
`/theory` (contents), `/theory/review` and `/theory/<slug>`; `vercel.json` (production, rewrite destination `/theory`:
with `cleanUrls`, a destination ending in `.html` is not served) and the `theory-routes`
plugin in `vite.config.ts` (dev, preview) serve the Theory page for every `/theory/*` path. The
site-wide service worker (`public/sw.js`) falls back to the cached `/theory` shell offline.

## Import rules (enforced by ESLint)

```
ui → lessons → core/fretboard → core/music
 │      │      core/audio (→ core/music allowed)
 │      │      core/rhythm (imports nothing in Theory)
 └──────┴────→ i18n ──→ platform (imports nothing in Theory)
 └─────────────────────→ platform
```

- `theory/` never imports from `src/`, and `src/` never imports from `theory/`.
- `core/music` imports nothing else in Theory. `core/fretboard` imports only `core/music`.
- `core/` never imports React, `lessons/`, `ui/` or `platform/`: it stays pure.
- `platform/` is the only code that touches localStorage (`browserStorage()`, never throws); `i18n`
  and `ui` use it, and it imports nothing else in Theory.
- `lessons/` is data: core and i18n only, never React or `ui/`.
- Every user-facing string in `ui/**/*.tsx` comes from `i18n` or lesson copy (ESLint rejects
  literal JSX text and literal `aria-label`/`title`/`alt`).
- `tsconfig.theory.json` typechecks `theory/src`; Vitest picks up `theory/**/*.test.ts`.

## Music invariants

- **Spelled notes only.** Notes are letter + accidental (`parseNote('Bb')`), never a bare pitch
  class. F minor shows B♭; C°7 shows B𝄫. Pitch classes are for comparison only.
- **Progressions come from the core:** `PROGRESSIONS` / `progression()` give the chords and numerals of a
  progression in any key, `twoFive()` the ii–V into a chord. Never type a list of chord names.
- **Key names come from the core:** `MAJOR_KEY_TONICS` / `majorKeyTonic()` and
  `MINOR_KEY_TONICS` / `minorKeyTonic()` (no double accidentals, fewest accidentals; F♯ major
  over G♭, E♭ minor over D♯). Do not hand-type lists of keys.
- **Formulas are degree labels** (`'1'`, `'b3'`, `'#5'`, `'bb7'`, `'9'`), the same notation as the
  knowledge base, converted by `interval()`.
- **No shape tables.** Boxes and positions come from `positions()`, practice orders (groups of
  3, 4, skips) from `sequence()`, open chords from `openVoicing()`, stacked triads from
  `triadShape()`, barre chords from `barreVoicing()` (the open E or A voicing moved up; every place a chord can go from `barreOptions()`, the loop with least travel from `closestPath()`, which also takes an accessor to find a melody line by pitch). `openVoicing()` is a
  small search: essential tones (`essentialDegrees()`), fewest fretted notes, optional `bass` for
  inversions. Label chord tones with `chordToneDegree()` so a 9 or 11 keeps its name. Never hand-type frets or tab of a scale or chord into lesson
  data; derive them.
- **String numbering is guitar numbering:** 1 = high E (top line of tab), 6 = low E.
- When the book and the knowledge base disagree, the knowledge base wins (see its errata).

## Audio

- `pluckSamples()` is pure and deterministic (seeded noise); tune the sound there, with tests.
- `createPlayer()` makes its `AudioContext` on the first `pluck()` or `click()`. Call it only
  from a user gesture. Audio failures are swallowed: a lesson must work silently.
- `pluck(midi, delay, length, glide)` damps the note after `length` seconds; `mute(midi, delay)` is
  a palm-muted chug (`pluckSamples({ muted: true })`, K6.5); `click(accent, delay)` is the
  metronome (`clickSamples()` is pure, like `pluckSamples()`).
- A `glide` (`bend`, `bendRelease`, `legato`, `slide`, `vibrato` in `core/audio/glide.ts`) moves
  the pitch of the same plucked sound through `playbackRate`: a hammer-on, pull-off or slide is
  never picked again. `semisAt()` reads the same points, so `ui/PitchCurve.tsx` draws what is heard.
- Swing is a delay, not a different grid: a clock steps in straight eighths and adds
  `swingDelay(eighth, swing, bpm)` to each off-beat (`core/rhythm`, K1.5).
- A backing track is `ui/useBacking.ts` over `backingAt(chord, style, eighth)` from
  `core/audio/backing.ts` (styles `shuffle`, `strum`, `rock`, `comp`; `bassMidi()` and `chordMidis()`
  voice it). Its `onEighth` callback gets the same swung delay, so a melody over it stays in time.
  Do not write a per-lesson backing. `useBacking(…, loop = false)` plays the form once (a recorded take, K7.6).
  A bar may carry `midis` (its voicing, low to high), so a strum or comp sounds the shape a scene draws;
  `useStrumLoop(views, bpm)` strums a loop of drawn chord shapes, one bar each (`/theory/barre`, `/theory/keys`).
  `BarGrid` takes optional `marks` per bar (a short text, good or not, and a spoken description).
- Anything that plays in time uses `ui/useClock.ts`: it hands each step to the player ahead of
  time with its exact delay, so timer jitter moves only the cursor, never the sound. `useSequence`
  stays for short demos where a few ms do not matter.

## Languages

- **English is the primary language and always the default.** Vietnamese is chosen with the
  EN/VI switch and remembered in `localStorage` under `theory.lang` (never the practice app's key).
- Slugs and code are English. Copy is written in English first, then Vietnamese.

## Progress and review

- Quiz scores are stored under `theory.progress` (never the practice app's key) by `ui/progress.ts`:
  one record per quiz in `QUIZZES` (lesson slug + step), pure `recordAnswer()` / `nextReview()`,
  and a storage boundary that never throws and drops broken records.
- A quiz scene keeps its score with `useQuizScore(id)` (`ui/useQuizScore.ts`): `settle(right)`
  counts one question once, in the score shown for this visit and in stored progress together.
  A new quiz adds its entry to `QUIZZES`.
- Tempos are stored under `theory.tempo` by `ui/tempos.ts`. A drill (`DRILLS`) uses
  `useStoredTempo(id, fallback)`: the last tempo set, and the best (fastest tempo of a whole round;
  the scene's clock calls `step(i, steps)`). Every other scene with a tempo slider is in `PLAYERS`
  and uses `useLastTempo(id, fallback)`, which keeps only the last tempo the learner set; the solo
  backings keep one tempo per backing (`solo-<backing>`), and a shared take's tempo is not saved.
  A new scene with a tempo adds its id. localStorage is reached only through `platform/storage.ts`.
- `ui/TrainerLink.tsx` opens the practice app on a key and progression (`ui/trainerLink.ts` writes its
  share link by hand; the apps share no code). It renders nothing when the practice app lacks the
  scale or a chord.
- A solo take (K7.6) is saved and shared by `ui/savedTake.ts`: the last take under `theory.take`, written
  when a recording pass ends (and emptied by Clear), and a link `/theory/solo?take=<encodeTake()>#record`.
  Opening a link never saves over your own take, and `?take=` is dropped from the address once read. `decodeTake()` rejects any code that is not a
  take of a known backing, key, tempo and box. A page opened with a `#step` scrolls to it.
- `/theory/review` (`ui/ReviewPage.tsx`) lists every quiz, the one to do next first: never tried,
  then under 80% right in the last 20 answers, then not practised for 7 days.

## Lessons

- **Adding a lesson:** create `lessons/<slug>/` (steps with concept IDs, `copy.en.ts`,
  `copy.vi.ts`, pure `scenes.ts` + test), add it to `LESSONS` in `lessons/index.ts`, and add a
  case to `ui/lessons/LessonScene.tsx`. Shared tests then check: unique slug, concept IDs exist in
  `docs/theory-knowledge`, same keys/lengths/placeholders in vi and en, no empty strings.
- Time is drawn on `ui/BeatGrid.tsx` (one bar as cells; a note is a block as long as it lasts,
  a rest an empty outline, count words underneath).
- Scenes draw on `ui/Fretboard.tsx` (dots you click to hear, optional box frame, `onDot` to react
  to a click, `faint` dots for places to click that are not notes of the picture) and `ui/Tab.tsx` (six-line tab whose numbers play). Positions come from `scenes.ts`,
  never from the component. `Tab` scrolls itself to keep the playing column in view; a note's
  `text` replaces its fret number for technique marks (`7b9`, `h7`, `/7~`). With `counts` it shows
  the count word each column starts on, and `barLines` draws bar lines.
- Melodic ideas come from `motif()` / `landOn()` in `core/music/licks.ts` (indexes into a
  pitch-ordered list of scale notes), never typed in.
- A barre is drawn with `ui/BarreBar.tsx`. Shared controls live in `ui/controls.tsx` (`ChipGroup`, `OnOff`, `Tempo`, `KeyFinder`); a chord
  form is drawn with `ui/BarGrid.tsx`. Key lists for a finder come from `byHomeFret()`.
- Notes on the neck come from `core/fretboard`: `NeckNote` (position, midi, spelled name, degree,
  tonic), `neckNote()`, `scaleNeck(tonic, scale, maxFret)`, `samePos()`, and `upAndDown()` for a run
  up and back. A lesson that needs more (blues: `isBlue`) extends `NeckNote`; it does not redefine it.
  A numbered box or position outline is `ui/PositionFrame.tsx`.
- `ui/keys.ts` holds the small helpers every scene uses (`posKey`, `signed`, `degreeText`); do not
  redefine them in a scene file.
- Lessons are listed in curriculum order in `LESSONS`; the contents page numbers them from it.

- Each lesson lists the concept IDs it teaches (`K3.4`…). If teaching differs from the knowledge
  base, update the knowledge base in the same PR.
- Every lesson ships **vi and en together**; a test checks both have the same steps and keys.
  Use the glossary in `theory-knowledge/README.md`: Vietnamese copy prefers the English term (root, box, bend…) unless the Vietnamese word is already plain.
- Write copy in our own words. No quotes, exercises, diagrams or transcriptions from the book;
  exercises are generated.
- Each step: one animated picture, one sentence of takeaway, one thing to try. List what is
  deliberately left out ("not yet").

## Commands

Same as the rest of the repo: `npm run lint`, `npm run typecheck`, `npm test`, `npm run build`
(CI order). `npx vitest run theory` runs only Theory tests.
