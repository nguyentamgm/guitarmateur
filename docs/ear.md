# Ear training — conventions

The ear trainer is a third page in this repo, served at `/ear`: a short chord cadence sets a key,
one note sounds, and the player names its **degree** in that key (1, ♭3, 5…). It trains
*functional* hearing, so the skill carries over to any key and any song. It shares tooling (Vite,
TypeScript, Vitest, ESLint, CI) and the look with Practice (`src/`) and Theory (`theory/`), never
imports either, and shares code with them only through `shared/` (`@shared/…`, see
[`architecture.md`](architecture.md#shared-code-shared)). The plan and its issues: #227.

Today the page has the trainer card (#220): Start, the cadence, the note, an answer on a strip of
one string, feedback, Next, with the settings and stats stored. The rest comes in phases
(#221–#226); a rule below that names one of those issues is a rule for the code that issue adds.

## Layout

```
ear/
├─ index.html            data-app="practice" (Practice's lime accent) → dist/ear/index.html
└─ src/
   ├─ core/              pure TypeScript, unit-tested: degrees.ts (degrees, spelled notes, presets),
   │                     context.ts (cadence, drone), questions.ts, resolution.ts, session.ts
   │                     (the session reducer, see "Session" below), stats.ts (stats math)
   ├─ store/             settings.ts (defaults, reading them back), store.ts (`gm.ear`): see
   │                     "Storage" below
   ├─ audio/             timeline.ts (each sound of the session, note by note, pure), driver.ts
   │                     (`createEarAudio`: plays the session's effects, sends `audioDone` back)
   ├─ i18n/              lang.ts: the shared `gm.lang`, `?lang=`, `fill()`; strings.ts: EN + VI UI
   │                     strings; index.ts re-exports both (ui imports '../i18n'); i18n.test.ts
   ├─ ui/                React: App (the page: the player, `gm.ear` data; App.test.tsx), Header
   │                     (the shared SiteHeader, current = Ear training), Trainer (the card and its
   │                     answer strip; Trainer.test.tsx), useTrainer (session → driver → audioDone,
   │                     first answers → stats), Settings (the settings card; Settings.test.tsx),
   │                     Stats ("Your ear": the stats card; Stats.test.tsx),
   │                     editSettings.ts (major ↔ minor, before each question), labels.ts
   │                     (degree, note, key, preset text), keys.ts (shortcuts); ear.css
   └─ main.tsx           imports @shared/ui tokens, base and controls CSS, then ui/ear.css;
                         registers the site-wide service worker
```

Planned, not built yet (each folder arrives with its issue):

```
   └─ ui/                the neck (#224)
```

`/ear` is one page with no client-side routes. `vercel.json` rewrites every `/ear/*` path to it
in production; the `pageRoutes` plugin in `vite.config.ts` does the same for every extension-less
`/ear` path in dev and preview; `public/sw.js` falls back to the cached `/ear` shell offline
(`/ear` is one of its `SHELLS`). `tsconfig.ear.json` typechecks `ear/src` (and `shared/`); Vitest
picks up `ear/**/*.test.{ts,tsx}` with the rest.

## Import rules (enforced by ESLint)

```
ui → store → core          ui → audio → core          ui → i18n
```

- `ear/` never imports `src/` or `theory/`, and neither imports `ear/`. All three may import
  `shared/`; `shared/` imports none of them.
- `core/` is pure: no React, and none of `ui/`, `store/`, `audio/`, `i18n/`. It returns ids,
  numbers and spelled notes, never text, so it stays locale-free and testable.
- `audio/` and `store/` may import `core/`, never React, `ui/`, `i18n/` or each other.
- `i18n/` imports nothing else in `ear/`, and no React.
- The rules for `core/`, `store/` and `audio/` are in `eslint.config.js` already, ahead of the
  folders.
- Every user-facing string in `ui/**/*.tsx` comes from `i18n` (ESLint rejects literal JSX text and
  literal `aria-label`/`title`/`placeholder`/`alt`), in English and Vietnamese with the same keys
  and placeholders (`i18n/i18n.test.ts`), using the words of [`glossary.md`](glossary.md) (the
  same test runs the glossary check over the strings).
- The look comes from `shared/ui/`. A neck drawn on this page (#224) uses `@shared/ui/Fretboard`
  and adds `@shared/ui/fretboard.css` to `main.tsx`, before `ui/ear.css`; what only this page
  draws stays in `ear.css`.

## Music rules

The music comes from `shared/core/music` (`@shared/core/music`); the ear trainer adds none of its
own theory.

- **Degrees** use the glossary's notation: 1 ♭2 2 ♭3 3 4 ♯4 / ♭5 5 ♭6 6 ♭7 7. In data they are
  degree labels (`'1'`, `'b2'`, `'b3'`…), the strings `interval()` reads. ♯4 / ♭5 is one answer.
- **Notes are spelled from the key,** with `transpose(tonic, interval('b3'))`: in C, ♭3 is E♭,
  never D♯; in A, ♭6 is F. The degree label never changes, whatever the note is called.
- **No double accidentals.** `transpose()` returns them, so the ear trainer respells such a note as
  its enharmonic (the label stays). Over the keys below, the cases are:

  | Key | Degree | `transpose()` | Shown |
  | --- | --- | --- | --- |
  | D♭ major | ♭2, ♭6 | E𝄫, B𝄫 | D, A |
  | A♭ major | ♭2 | B𝄫 | A |
  | E♭ minor | ♭5 | B𝄫 | A |
  | G♯ minor | 7 | F𝄪 | G |

- **The tritone** is spelled ♯4 in major keys (it leads up to 5) and ♭5 in minor keys (the blue
  note, which falls to 4): `interval('#4')` or `interval('b5')`.
- **Keys** come from `MAJOR_KEY_TONICS` / `MINOR_KEY_TONICS` (`shared/core/music/keys.ts`): 12
  each, around the circle of fifths. Never hand-type a list of keys.
- **Cadence chords** come from `diatonicChords(key)` (triads): I–IV–V7–I in major (A D E7 A),
  i–iv–V7–i in minor (Am Dm E7 Am). The V is always its degree-5 root with `dom7`, since neither
  mode gives a V7 as is: the triads have a plain V in major, and `diatonicChords()` reads the
  natural minor, so a minor key gets a minor v (Em), which does not pull home. The full cadence is
  #213.
- **Voicings are derived:** `chordMidis()` and `bassMidi()` (`shared/core/audio/backing.ts`) voice
  a chord, `strumDelays()` (`shared/core/rhythm`) spreads its strum. Never hand-type a voicing.
- **The drone** is 1 and 5, low, with no 3rd, so one drone fits both modes (#213).
- **Resolution** walks the mode's scale to the nearest tonic; a note outside the scale first moves
  a half step to the scale note in that direction. ♯4 / ♭5, as far from both, follows its spelling:
  up in major (♯4 → 5), down in minor (♭5 → 4). The tables are in #215.

## Session

`core/session.ts` is a pure reducer: `step(state, event) → { state, effects }`. The effects say
what should sound; the audio driver (#219) carries them out and answers with `audioDone(phase)`.
The question's random draw comes from a seed kept in the state, so the same state and event
always give the same step (React may call a reducer twice).

```
idle ─start─▶ context ─done─▶ prompt ─done─▶ waiting ─answer─▶ (answered ─done─▶) resolving ─done─▶ review
                 ▲                │  (an answer during the note is fine)                               │
                 └──── next, or auto-next's pause ◀─────────────────────────────────────────────────────┘
```

- **Context policy:** the cadence before every question, or at the start and when the key changes,
  or never ("drone only": the drone holds the key, alone for `DRONE_LEAD_BEATS` before the first
  note in a key). A new key restarts the drone in it.
- **Drone mode:** off; continuous (the whole session); or with each question (it starts with the
  question's context and stops in review, once the answer's sounds are done). "Drone only" holds
  it throughout, whatever the mode.
- **Only the first answer scores** (a `score` effect, the one stats count). A wrong one goes
  through `answered`: the note picked, then the right note. With resolution on, the walk home
  follows; off, review comes straight after.
- **In review**, an answer button plays its note next to the question's (in the octave up from the
  tonic at or below the question), to compare; replays play the note, the cadence or the tonic.
  None of these score, carry a `done`, or move the phase, and each cancels what was playing,
  auto-next's pause included: touching the trainer in review stops auto-next for that question.
- **Replays** work in `waiting` and `review`; while the cadence, the note or the answer's sounds
  play, they are ignored.
- **Settings changed mid-question:** only a new key, or switching off the degree being asked,
  drops the question (unscored) and asks a new one, with the context again if the key changed (or
  the cadence was cut short). Everything else (other degrees, the register, the tempo…) applies
  from the next question, so a player can change several settings without losing the question each
  time; the drone follows its setting at once.
- **The cadence's tonic** sounds where the questions do, `questionTonic()`: an octave below
  `TONIC_OCTAVE` when the active degrees would pass the top of the guitar's range.
- Events that make no sense in the current phase are ignored: same state, no effects.

## Sound

The trainer card wires the session to the audio driver (`ui/useTrainer.ts`): each event steps the
reducer once, outside React's render, and its effects go to `audio/driver.ts`, which carries them
out:

- **Timing:** each part (the cadence, the note, the comparison, the walk home, a wait) is laid out
  note by note in `audio/timeline.ts` and handed to the player at once, every note with its exact
  delay, `LEAD_SEC` (0.05 s) after `player.now()`. One coarse timer (25 ms) only watches the audio
  clock for the end of a part with a `done`, then sends `audioDone`; a `cancelAudio` drops it.
- **Lengths, in beats of the cadence tempo:** the question note 2; the comparison: the note picked
  1, a half-beat gap, the right note 1, a half-beat rest; the walk home an eighth a note and the
  closing tonic 1.
- **Voices:** the cadence's chords are always the guitar; single notes (the cadence's tonic, the
  question, the comparison, the walk home, replays) are the guitar or the clean tone
  (`player.tone`), as set. A right answer with no walk home (resolution off) is one accented click.
- **The drone** (`player.hold`) starts with the session, crossfades on a key change, stops on stop
  and on `dispose()` (leaving the page), and sits at `DRONE_DUCK` (half) while a cadence plays.
  Its level is the `droneLevel` setting (the player's `drone` level), halved under a cadence.

- Notes and the cadence are the shared guitar pluck: one `Player` from `createPlayer()`
  (`shared/core/audio`). The drone is `player.hold(droneNotes(key))` and the clean tone
  `player.tone()`, both the shared sustained voice (`sustain.ts`), so Practice and Theory can use
  them too; nothing in `ear/` synthesizes. The session's `cancelAudio` is `player.cancel()`, which
  stops every note, click and tone but not a hold: the drone stops with its own `stop()`.
- The `AudioContext` is created on the first sound, from the Start button (a user gesture), never
  at load. Audio failures are swallowed, but when audio cannot start at all (`player.now()` is
  null), the page says so instead of running a silent quiz. iOS mutes Web Audio while the silent
  switch is on.
- Schedule against `player.now()` (the audio clock), as the shared `Scheduler` and `Sequencer`
  do; never one `setTimeout` per note.
- **No error buzzer.** A wrong answer plays the note picked, then the right note, then the
  resolution: hearing the two side by side is the lesson.
- **Hearing safety:** the drone starts quiet, is never louder than the notes, and always fades in
  and out. It is what a listener hears longest, often on headphones. The player sees to the
  fades (a hold fades in over `HOLD_FADE_SEC`, 1 s by default, out over its `stop()`'s fade, never
  under `MIN_FADE_SEC`) and holds at `HOLD_LEVEL` (0.3 of a note's level) times the `drone` level.

## Keyboard and screen readers

- **Shortcuts** (`ui/keys.ts`, listed under the card): Space / Enter start, then Next; R replays
  the note, K the key (the cadence), T plays 1; 1–7 answer the degrees, and Shift + digit a half
  step lower (Shift+3 is ♭3, Shift+5 is ♯4/♭5), read from the physical key (`e.code`), so any
  layout works. A degree that is off does nothing. Like Practice's shortcuts: never with Ctrl / Alt
  / ⌘, never on key repeat, never while typing, and Space / Enter on a focused button, link or
  summary are that control's own.
- **Focus:** Start moves it to the card (left on the button, now Stop, the next Space would stop);
  an answer keeps it on the strip, on the cell answered; when the question is done it moves to
  Next, unless it is elsewhere on the page. Controls the session ignores for now are
  `aria-disabled`, not `disabled`, so they never drop the focus.
- **Names:** an answer cell is named by its label, then as spoken, then its fret ("♭3 (flat
  three), fret 3"): the label first for voice control (WCAG 2.5.3), the words for a screen reader.
  Fret numbers sit in a row of their own, out of the buttons. Prompts and feedback are in a polite
  live region. The right / wrong highlight's pop is off with `prefers-reduced-motion`.

## Storage

- **Language:** the shared `gm.lang`, through `shared/i18n/language.ts` (`ear/src/i18n/lang.ts`),
  as on the other pages: with nothing stored, the browser's languages decide (`browserLanguages()`,
  `shared/platform/languages.ts`), English is the fallback. A change made in another tab shows
  here (`storage` event). A link's `?lang=` (`linkLanguage()`) sets the language for that visit
  only: it is not saved, and `App` takes it off the address.
- **Settings and stats** (`store/store.ts`): one localStorage key, `gm.ear`, holding
  `{ version, settings, stats }`, read and written through `browserStorage()`
  (`shared/platform/storage.ts`); never the practice app's or Theory's keys. The language is not
  part of `gm.ear`.
  - Missing, corrupt, unversioned or newer-version data gives the defaults; within a readable
    payload each setting and each stats entry is checked on its own and falls back alone. A
    version bump adds a step to `MIGRATIONS`. Data a newer build stored is never overwritten.
  - Every write (`saveSettings`, `storeAnswer`, `resetStats`) starts from what is stored now, so
    another tab's answers are kept; `onStoredChange()` follows changes made in another tab
    (`storage` event), as `gm.lang` does. Storage that fails only means nothing is remembered.
  - Defaults (`DEFAULT_SETTINGS`): A major, 1 3 5, the full cadence before every question, above
    the root, a fixed key, 90 BPM, resolution on, drone off (level 1, its quiet maximum), auto-next
    off, guitar sound. Question weights are never stored: they come from the stats. A field added
    later (`cadenceForm`, `droneLevel`) falls back on its own, so it needs no version bump; the
    first payloads' `drone: true / false` reads as continuous / off.
- **Stats** (`core/stats.ts`, pure) count **right first try** only (the session's `score` effect,
  as Theory's quizzes do), and are kept per mode: ♭3 is in the scale in minor and outside it in
  major. Per mode: asked and right per degree id; mix-ups (wrong first answers, by degree asked,
  then heard: "♭3 heard as 3"); per local day, the last 30 days (a day after the answer's,
  from a clock set back, is kept, never dropped); the streak and best streak.
- **The stats card** ("Your ear", `ui/Stats.tsx`) shows one mode at a time, the key's first: the
  totals, accuracy per degree asked (bars in the accent from 80%, amber from 50%, muted below, the
  number always written), the three mix-ups heard most, each with "Practise these" (the active
  degrees become 1 and that pair), and the last 14 days. "Practise weak notes" (`weakNotes`)
  weighs questions by `weakWeights()`: 1 + 3 × the miss rate, smoothed by one right and one wrong
  answer more, so 1 to 4 and 2.5 for a degree never asked. Reset asks first and keeps the settings.
