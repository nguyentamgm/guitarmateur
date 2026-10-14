# Ear training — conventions

The ear trainer is a third page in this repo, served at `/ear`: a short chord cadence sets a key,
one note sounds, and the player names its **degree** in that key (1, ♭3, 5…). It trains
*functional* hearing, so the skill carries over to any key and any song. It shares tooling (Vite,
TypeScript, Vitest, ESLint, CI) and the look with Practice (`src/`) and Theory (`theory/`), never
imports either, and shares code with them only through `shared/` (`@shared/…`, see
[`architecture.md`](architecture.md#shared-code-shared)). The plan and its issues: #227.

Today the page is a shell: the site header, the page head and a "being built" card. The trainer
itself comes in phases (#212–#226); a rule below that names one of those issues is a rule for the
code that issue adds.

## Layout

```
ear/
├─ index.html            data-app="practice" (Practice's lime accent) → dist/ear/index.html
└─ src/
   ├─ core/              pure TypeScript, unit-tested: degrees.ts (degrees, spelled notes, presets),
   │                     context.ts (cadence, drone), questions.ts, resolution.ts, session.ts
   │                     (the session reducer, see "Session" below)
   ├─ i18n/              lang.ts: the shared `gm.lang`, `?lang=`, `fill()`; strings.ts: EN + VI UI
   │                     strings; index.ts re-exports both (ui imports '../i18n'); i18n.test.ts
   ├─ ui/                React: App (the page; App.test.tsx), Header (the shared SiteHeader,
   │                     current = Ear training); ear.css
   └─ main.tsx           imports @shared/ui tokens, base and controls CSS, then ui/ear.css;
                         registers the site-wide service worker
```

Planned, not built yet (each folder arrives with its issue):

```
   ├─ core/              stats math (#217)
   ├─ store/             settings and stats in localStorage under `gm.ear` (#217)
   ├─ audio/             plays the session on the shared player (#219)
   └─ ui/                the trainer card (#220), settings (#222), stats (#223), the neck (#224)
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
- **Only the first answer scores** (a `score` effect, the one stats count). A wrong one goes
  through `answered`: the note picked, then the right note. With resolution on, the walk home
  follows; off, review comes straight after.
- **In review**, an answer button plays its note next to the question's (in the octave up from the
  tonic at or below the question), to compare; replays play the note, the cadence or the tonic.
  None of these score, carry a `done`, or move the phase, and each cancels what was playing,
  auto-next's pause included: touching the trainer in review stops auto-next for that question.
- **Replays** work in `waiting` and `review`; while the cadence, the note or the answer's sounds
  play, they are ignored.
- **Settings changed mid-question:** a new key, degree set or register drops the question
  unscored and asks a new one, with the context again if the key changed (or the cadence was cut
  short); other settings apply from the next question, and the drone follows its setting at once.
- **The cadence's tonic** sounds where the questions do, `questionTonic()`: an octave below
  `TONIC_OCTAVE` when the active degrees would pass the top of the guitar's range.
- Events that make no sense in the current phase are ignored: same state, no effects.

## Sound

Nothing on the page plays yet. When it does (#219):

- Notes and the cadence are the shared guitar pluck: one `Player` from `createPlayer()`
  (`shared/core/audio`). The sustained voice for the drone and the clean tone are added to the
  shared player (#218), so Practice and Theory can use them too; nothing in `ear/` synthesizes.
- The `AudioContext` is created on the first sound, from the Start button (a user gesture), never
  at load. Audio failures are swallowed, but when audio cannot start at all (`player.now()` is
  null), the page says so instead of running a silent quiz. iOS mutes Web Audio while the silent
  switch is on.
- Schedule against `player.now()` (the audio clock), as the shared `Scheduler` and `Sequencer`
  do; never one `setTimeout` per note.
- **No error buzzer.** A wrong answer plays the note picked, then the right note, then the
  resolution: hearing the two side by side is the lesson.
- **Hearing safety:** the drone starts quiet, is never louder than the notes, and always fades in
  and out. It is what a listener hears longest, often on headphones.

## Storage

- **Language:** the shared `gm.lang`, through `shared/i18n/language.ts` (`ear/src/i18n/lang.ts`),
  as on the other pages: with nothing stored, the browser's languages decide (`browserLanguages()`,
  `shared/platform/languages.ts`), English is the fallback. A change made in another tab shows
  here (`storage` event). A link's `?lang=` (`linkLanguage()`) sets the language for that visit
  only: it is not saved, and `App` takes it off the address. This is all the page stores today.
- **Settings and stats** (#217): one localStorage key, `gm.ear`, holding
  `{ version, settings, stats }`, read and written through `browserStorage()`
  (`shared/platform/storage.ts`). Missing, corrupt or unknown data falls back to the defaults;
  never the practice app's or Theory's keys. The language is not part of `gm.ear`.
- Stats count **right first try** only (as Theory's quizzes do) and are kept per mode: ♭3 is in
  the scale in minor and outside it in major.
