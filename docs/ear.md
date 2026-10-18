# Ear training — conventions

The ear trainer is a third page in this repo, served at `/ear`: a guided path of beginner levels
([`ear-levels.md`](ear-levels.md), tracked in #249), from "same or different?" to finding a song's
root on the guitar. It trains *relative* hearing, so the skill carries over to any key and any
song. It shares tooling (Vite, TypeScript, Vitest, ESLint, CI) and the look with Practice (`src/`)
and Theory (`theory/`), never imports either, and shares code with them only through `shared/`
(`@shared/…`, see [`architecture.md`](architecture.md#shared-code-shared)).

It replaced the first trainer screen ("name the degree", #227), removed in #257 with its settings,
stats, deep links and Practice's link to it; the levels reuse its core (degrees, the cadence,
resolution, the neck window).

## Layout

```
ear/
├─ index.html            data-app="practice" (Practice's lime accent) → dist/ear/index.html
└─ src/
   ├─ core/              pure TypeScript, unit-tested: degrees.ts (degrees, spelled notes, presets),
   │                     context.ts (the cadence that sets a key), questions.ts (a degree
   │                     question's range), resolution.ts (the walk home), position.ts (the neck
   │                     window), stats.ts (counts and `missWeight`), levels.ts (the levels as
   │                     data), round.ts (one round of a level, see "Rounds"), progress.ts (level
   │                     progress and unlocking), stage1.ts (levels 1–4's notes)
   ├─ store/             store.ts (`gm.ear`): see "Storage"
   ├─ audio/             timeline.ts (each sound, note by note, pure), driver.ts (`createEarAudio`:
   │                     plays one part at a time), levelSounds.ts (each level kind's sounds)
   ├─ i18n/              lang.ts: the shared `gm.lang`, `?lang=`, `fill()`; strings.ts: EN + VI UI
   │                     strings; index.ts re-exports both (ui imports '../i18n'); i18n.test.ts
   ├─ ui/                React: App (the page: the player, `gm.ear` data), Header (the shared
   │                     SiteHeader, current = Ear training), Levels (the flow and its driver),
   │                     Welcome, LevelMap, LevelIntro, Question, RoundEnd, useRound (round →
   │                     driver → store), NotesPicture (Stage 1's wrong-answer picture),
   │                     levelWords.ts (a level's words, `playable`), keys.ts (shortcuts),
   │                     labels.ts (degree, note, key text); kept for levels 14–15: AnswerStrip
   │                     (answers on one string) and NeckAnswer (the answer on a neck window);
   │                     ear.css
   └─ main.tsx           imports @shared/ui tokens, base, controls and fretboard CSS, then
                         ui/ear.css; registers the site-wide service worker
```

`/ear` is one page with no client-side routes. `vercel.json` rewrites every `/ear/*` path to it
in production; the `pageRoutes` plugin in `vite.config.ts` does the same for every extension-less
`/ear` path in dev and preview; `public/sw.js` falls back to the cached `/ear` shell offline
(`/ear` is one of its `SHELLS`). `tsconfig.ear.json` typechecks `ear/src` (and `shared/`); Vitest
picks up `ear/**/*.test.{ts,tsx}` with the rest. An old link's query (`?key=&mode=&notes=`) is
ignored.

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
- Every user-facing string in `ui/**/*.tsx` comes from `i18n` (ESLint rejects literal JSX text and
  literal `aria-label`/`title`/`placeholder`/`alt`), in English and Vietnamese with the same keys
  and placeholders (`i18n/i18n.test.ts`), using the words of [`glossary.md`](glossary.md) (the
  same test runs the glossary check over the strings).
- The look comes from `shared/ui/`. A neck drawn on this page uses `@shared/ui/Fretboard`; what
  only this page draws stays in `ear.css`.

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
  natural minor, so a minor key gets a minor v (Em), which does not pull home.
- **Voicings are derived:** `chordMidis()` and `bassMidi()` (`shared/core/audio/backing.ts`) voice
  a chord, `strumDelays()` (`shared/core/rhythm`) spreads its strum. Never hand-type a voicing.
- **Resolution** walks the mode's scale to the nearest tonic; a note outside the scale first moves
  a half step to the scale note in that direction. ♯4 / ♭5, as far from both, follows its spelling:
  up in major (♯4 → 5), down in minor (♭5 → 4). The tables are in #215.

## Rounds

`core/round.ts` runs one round of a level as a pure reducer: `startRound(level, step, seed,
counts)`, then `stepRound(state, event) → { state, effects }`. The same state and event always
give the same step (React may call a reducer twice).

```
question ─answer─▶ feedback ─next─▶ question … ─next (after the 10th)─▶ done
                      └─next (4 wrong in a row)─▶ stuck ─keepGoing─▶ question
                                                    └─easier─▶ demo ─next─▶ question
```

- **The round picks each question's right answer and a seed** (`RoundQuestion`); the level kind's
  generator turns them into sounds, so the same question always sounds the same, and the round
  knows nothing of notes. The answers come from `askedAnswers(level, step)`, weighted by
  `missWeight()` (`core/stats.ts`) of the level's counts, never the same one three times in a row.
- **10 questions**, starting at the step reached. **5 right in a row** move the next question up
  one step (a `step` effect), never past the last and never down by itself.
- **4 wrong in a row:** after that answer's feedback, an `offerEasier` instead of the next
  question; the count starts over, so the next offer needs 4 more. "Easier" goes one step down
  (none below A) and plays the demo (`playDemo`); "keep going" asks the next question.
- **Only the first answer counts** (a `score` effect); replays are free, and a changed answer is
  ignored. On level 15 any fret of the root's note is right (`sameAnswer()`: 0 and 12).
- **The pass:** `LEVEL_RULES`, 8 of 10 right, and the round ends on the level's last step
  (`passes()`). The "test me" quiz (#264) is a round with its own `RoundRules`; each question
  carries its level and step, so a round can mix levels.

## The screens

`ui/Levels.tsx` shows the levels ([`ear-levels.md`](ear-levels.md) "The screens"): welcome (first
visit only, until `welcomed` is stored) → level map → a level's intro (before its first round, or
from "How does this level work?") → the questions → the end of the round.

- **Playable:** a level opens once its kind has sounds in `LEVEL_SOUNDS` (`audio/levelSounds.ts`:
  `question`, `compare`, `demo`) **and** its words in `ui.play` (`i18n/strings.ts`); until then its
  card says "Coming soon". Each stage issue adds both for its kinds; Stage 1 (levels 1–4) is built
  (#256). Every level has its map name and one-line "what you'll learn" from the start.
- **The round** (`ui/useRound.ts`) starts from a click, never a mount, so its first sound comes
  from a user gesture (iOS) and StrictMode's double mount plays nothing twice. Each round effect
  goes to the store (`storeRoundEffect`) as it happens, so a reload loses no answer. A question's
  sound plays by itself; a right answer waits `RIGHT_PAUSE_BEATS` (2 at 90 BPM) and asks the next;
  a wrong one plays the kind's `compare` and waits for Next.
- **Stage 1** (`core/stage1.ts`): a question's notes come from its seed, single notes in
  `MIDDLE_RANGE`, each move as many frets as the step says. A wrong answer replays the question
  (level 3's tune at `STAGE_ONE_SLOW_BPM`) and shows `NotesPicture`: the notes as dots by pitch,
  or for level 4 the two notes on one string of the neck.
- **Sound check:** one guitar note (`SOUND_CHECK_MIDI`). When audio cannot start at all, the
  welcome and the question screen say so (`levelsNoAudio`) instead of asking.
- **Sizes:** no text under 18px, answer buttons 56px tall, every other tap at least 44px; right is
  the accent, a miss is amber, never red. Two answers sit side by side, three in a row, four to six
  wrap to two rows on a phone.
- **Keyboard** (`keys.ts` `levelShortcut`): Space plays again, Enter goes on, 1–6 answer by place,
  and with two answers ← and → too; never with Ctrl / Alt / ⌘, on key repeat, or while typing.
  Space and Enter on a focused button press that button. A new question moves the focus to Play
  again, an answer to Next, a new screen to its heading; feedback and the "make it easier"
  question are announced (`aria-live`).

## Sound

- **Parts:** each sound is laid out note by note in `audio/timeline.ts` (pure): two notes (levels
  1, 2, 4), a tune (3, 15), one chord strummed or arpeggiated (5), a progression of strummed chords
  (6), the cadence that sets a key and the walk home (Stage 3 on), a wrong answer's "what you
  picked, then what it was" (`answerComparePart`), a level's demo (`demoPart`), and the six open
  strings to tune by (15). Each length is a named constant in beats (the tuning notes in seconds),
  starting values to judge by ear on real devices (#265). A strum is one down stroke,
  `STRUM_SPREAD_SEC` (20 ms) a string; an arpeggio's notes each stop as the next starts. The parts
  play the notes they are given: a level's generator keeps single notes and tunes in
  `MIDDLE_RANGE` (A2–A4, `core/levels.ts`).
- **Timing:** the driver (`audio/driver.ts`) hands a part to the player at once, every note with
  its exact delay, `LEAD_SEC` (0.05 s) after `player.now()`; one coarse timer (25 ms) only watches
  the audio clock for the part's end. `playPart(part, onEnd)` first stops what was playing (so
  "Play again" starts over); `cancel()` stops it and drops its `onEnd` (moving on). Never one
  `setTimeout` per note.
- **One voice:** the shared guitar pluck, one `Player` from `createPlayer()` (`shared/core/audio`);
  nothing in `ear/` synthesizes. The `AudioContext` is created on the first sound, from a click,
  never at load. Audio failures are swallowed, but when audio cannot start at all (`player.now()`
  is null), the page says so instead of running a silent quiz. iOS mutes Web Audio while the silent
  switch is on.
- **No error buzzer.** A wrong answer replays what was heard, or the pick and then the right
  answer: hearing the two side by side is the lesson.

## The answer on the neck (levels 14–15)

`ui/NeckAnswer.tsx` shows where a note sits on a five-fret window of the shared `Fretboard`:
`core/position.ts` picks a root on string 6 or 5 (frets 0–15) whose window, from a fret below it,
holds the note heard **at its pitch**, choosing the root nearest in pitch to the tonic the note was
heard against (then the lower fret, then string 6). The window can reach fret 18: held to 15, the
top notes (F major's 7 at E5) could not be shown at the pitch heard. Dots: the root and every 1 in
`home`, the other active degrees `soft`, the note heard `target` with a halo; clicking one plays
it. `ui/AnswerStrip.tsx` answers on one string from the root: fret 0 is 1, fret 3 is ♭3… An answer
is named by its label, then as spoken, then its fret ("♭3 (flat three), fret 3"): the label first
for voice control (WCAG 2.5.3). Standard tuning only.

## Storage

- **Language:** the shared `gm.lang`, through `shared/i18n/language.ts` (`ear/src/i18n/lang.ts`),
  as on the other pages: with nothing stored, the browser's languages decide (`browserLanguages()`,
  `shared/platform/languages.ts`), English is the fallback. A change made in another tab shows
  here (`storage` event). A link's `?lang=` (`linkLanguage()`) sets the language for that visit
  only: it is not saved, and `App` takes it off the address.
- **Level progress** (`store/store.ts`): one localStorage key, `gm.ear`, holding
  `{ version: 2, welcomed, levels }`, read and written through `browserStorage()`
  (`shared/platform/storage.ts`); never the practice app's or Theory's keys, and never the
  language.
  - `welcomed`: the welcome screen and its sound check are done (`storeWelcomed`). `levels`: by
    level id, `{ step, best, done, counts }`: the step the next round starts at, the best round,
    passed once, and every answer asked with how often it was right first try (the round's
    weighting). `storeRoundEffect` keeps a round's `step`, `score` and `end` effects
    (`core/progress.ts`). A level is **unlocked** when it is level 1 or the level before it is
    done (`isUnlocked()`): worked out, never stored.
  - Version 1 was the old trainer's settings and stats: it migrates to version 2 not welcomed,
    with no level played, and those fields are no longer read (the next write drops them).
  - Missing, corrupt, unversioned or newer-version data gives the defaults; within a readable
    payload each level and each of its fields is checked on its own and falls back alone. A
    version bump adds a step to `MIGRATIONS`. Data a newer build stored is never overwritten.
  - Every write starts from what is stored now, so another tab's progress is kept;
    `onStoredChange()` follows changes made in another tab (`storage` event), as `gm.lang` does.
    Storage that fails only means nothing is remembered.
