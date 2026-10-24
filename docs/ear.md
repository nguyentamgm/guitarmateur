# Ear training — conventions

The ear trainer is a third page in this repo, served at `/ear-training`: a guided path of beginner levels
([`ear-levels.md`](ear-levels.md), tracked in #249), from "same or different?" to finding a song's
root on the guitar. It trains _relative_ hearing, so the skill carries over to any key and any
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
   │                     progress and unlocking), stage1.ts (levels 1–4's notes), stage2.ts
   │                     (levels 5–6), stage3.ts (levels 7–14's degree question), stage5.ts
   │                     (level 15's song)
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
   │                     labels.ts (degree, note, key text); AnswerStrip (level 14's answers
   │                     on one string) and NeckAnswer (the note on a neck window after it);
   │                     FretStrip (level 15's answers: the thickest string's frets); ear.css
   └─ main.tsx           imports @shared/ui tokens, base, controls and fretboard CSS, then
                         ui/ear.css; registers the site-wide service worker
```

`/ear-training` is one page with no client-side routes. `vercel.json` rewrites every `/ear-training/*` path to it
in production (and permanently redirects the old `/ear` and `/ear/*` there, query kept); the `pageRoutes` plugin in `vite.config.ts` does the same for every extension-less
`/ear-training` path in dev and preview; `public/sw.js` falls back to the cached `/ear-training` shell offline
(`/ear-training` is one of its `SHELLS`). `tsconfig.ear.json` typechecks `ear/src` (and `shared/`); Vitest
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

  | Key      | Degree | `transpose()` | Shown |
  | -------- | ------ | ------------- | ----- |
  | D♭ major | ♭2, ♭6 | E𝄫, B𝄫        | D, A  |
  | A♭ major | ♭2     | B𝄫            | A     |
  | E♭ minor | ♭5     | B𝄫            | A     |
  | G♯ minor | 7      | F𝄪            | G     |

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
  (`passes()`).
- **A stage's test** ("I already know this: test me", #264): `startTest(stage, seed)` is a round
  on `TEST_RULES`, 9 of 10 and no easier step, its questions on the stage's levels in turn (Stage
  3: 7, 8, 9, 10, 7…), each at its level's last step. Each question carries its level and step
  (`questionLevel()`), so the screens and sounds follow the question, not the round. Its `end`
  effect names the stage (`test`): passed, every level of that stage and the stages before it is
  marked done, scores and counts untouched; failed, nothing changes. Its first answers count
  under their own levels, as any round's do.

## The screens

`ui/Levels.tsx` shows the levels ([`ear-levels.md`](ear-levels.md) "The screens"): welcome (first
visit only, until `welcomed` is stored) → level map → a level's intro (before its first round, or
from "How does this level work?") → the questions → the end of the round.

- **Playable:** a level opens once its kind has sounds in `LEVEL_SOUNDS` (`audio/levelSounds.ts`:
  `question`, `compare`, `demo`) **and** its words in `ui.play` (`i18n/strings.ts`); until then its
  card says "Coming soon". Each stage issue added both for its kinds; all 15 levels are built
  (#256, #258, #260, #261, #262, #263). Every level has its map name and one-line "what you'll learn" from the start.
- **The round** (`ui/useRound.ts`) starts from a click, never a mount, so its first sound comes
  from a user gesture (iOS) and StrictMode's double mount plays nothing twice. Each round effect
  goes to the store (`storeRoundEffect`) as it happens, so a reload loses no answer. A question's
  sound plays by itself; a right answer waits `RIGHT_PAUSE_BEATS` (2 at 90 BPM) and asks the next;
  a wrong one plays the kind's `compare` and waits for Next. A level answered on the neck
  (`answerOn: 'string'`, levels 14–15) waits for Next after a right answer too, so its neck window
  can be looked at.
- **Stage 1** (`core/stage1.ts`): a question's notes come from its seed, single notes in
  `MIDDLE_RANGE`, each move as many frets as the step says. A wrong answer replays the question
  (level 3's tune at `STAGE_ONE_SLOW_BPM`) and shows `NotesPicture`: the notes as dots by pitch,
  or for level 4 the two notes on one string of the neck.
- **Stage 2** (`core/stage2.ts`): level 5 is one chord, major or minor as answered: open roots (E,
  A, D) at step A, every other root at B, its notes one by one at C; a wrong answer plays the same
  chord in the other quality, then as it was. Level 6 is four strummed chords from
  `diatonicChords(key)`: finished is I–IV–V–I, not finished stops on V or IV (I–IV–I–V,
  I–V–I–IV), in A until step C; a wrong answer plays them again with the home chord after.
- **Stage 3** (`core/stage3.ts`, the `degree` kind): the cadence sets the key, a beat of silence,
  then one note, placed as the old trainer placed them (`questionTonic`, the step's register). Only
  a key whose mode asks the answer is drawn, so level 10's mixed step plays 3 in major keys and ♭3
  in minor ones (a major 3 is never heard in a minor key, so #215's "3 ♭3 2 1" row never plays).
  A wrong answer walks the note home (`resolution()`); on levels 9–10 it plays the key's chord,
  then the note. The feedback names the letter as the key spells it (`feedbackHeard`: "that was
  5: the note E, in the key of A major"), and a degree button with ♭ or ♯ is named as said ("♭3
  (flat three)", "bậc 3 giáng": glossary.md).
- **Stage 4** (levels 11–13, the same `degree` kind, minor keys): ♭7, then 4 (the minor
  pentatonic), then the blue note. The blue note's answer id is `#4` (one answer for ♯4 / ♭5); in a
  minor key it is always spelled and shown ♭5, and a wrong answer to it plays the note sliding
  down into 4 (`slidePart`, the shared `slide` glide). The blues ♭5's spelling in a _major_ key
  (#212) does not come up: the levels only use it in minor keys.
- **Level 14** (the `degree` kind, `answerOn: 'string'`): Stage 4's notes, answered on one string
  from the root (`AnswerStrip`): the minor pentatonic in A minor, then with the blue note, then in
  every minor key, each note within an octave above the root, so its fret is 0–11. Only the step's
  degrees can be tapped. The feedback names the fret first (`heardFret`, `fretFromRoot()` in
  `core/position.ts`: "fret 3 from the root is ♭3: the note C, in the key of A minor"), then the
  note lights up on a neck window (`NeckAnswer`). A wrong blue note slides into 4, as on level 13.
- **Level 15** (`core/stage5.ts`, the `findRoot` kind): a key whose root is at the answer's fret of
  the thickest string (E2 + fret; E at 0 or 12, both right: `sameAnswer()`), and a song in it at
  `FIND_ROOT_BPM` (80), slow enough to play along: eight notes, two over each chord of the cadence
  (I–IV–V7–I, i–iv–V7–i), each a tone of its chord (over V7 only 5 and 2: its 3rd is the raised 7th
  in minor), from the 5 below the root to the 5 above it. It starts on the root; at step A (keys A,
  G, E, C) it ends on it too, else on the home chord's 3 or 5; step C plays the tune alone
  (`songPart`). The intro first asks for a guitar in tune and plays the open strings
  (`tuningPart`). The answer is a fret of the thickest string (`FretStrip`, frets 0–12 with the
  guitar's fret markers; no digit keys, Tab reaches them). The feedback is its own line
  (`findRootLine`: "Right! Fret 5: that's A. The song is in A major." / "Close! You picked fret 7
  (B). The root was fret 5 (A). …", each note spelled from the key); a wrong answer plays the home
  chord and the fret picked, then the chord and the root's fret. Like level 14 it waits for Next.
  Passing it, the last level, says "You finished every level!" with a link to Practice
  (`/?lang=`). The app never listens to the guitar.
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

## Links

- **Into a level:** `/ear-training?level=n` opens level n's intro when it is open (unlocked and built), else
  the map with "Level n opens once you have passed the levels before it."; after the welcome on a
  first visit. `App` takes `level` (and `lang`) off the address, so a reload goes back to the map.
- **From Practice:** Step 1 (`src/ui/components/ScalePositionSection.tsx`) links to
  `/ear-training?level=12&lang=…` on the minor pentatonic and `/ear-training?level=13&lang=…` on the minor blues
  scale, and nowhere else. The two apps never import each other: the link is this plain URL.
- **To Practice:** passing level 12 offers "Now play these notes on your guitar." with a link
  that opens Practice on the A minor pentatonic (`ui/practiceLink.ts`): Practice's share format
  (`/?s=v1:` + base64 JSON), written by hand as Theory's `trainerLink.ts` does, over Practice's own
  saved state with only the key replaced (positions and language dropped), plus `&lang=`.

## Sound

- **Parts:** each sound is laid out note by note in `audio/timeline.ts` (pure): two notes (levels
  1, 2, 4), a tune (3, 15), one chord strummed or arpeggiated (5), a progression of strummed chords
  (6), the cadence that sets a key and the walk home (Stage 3 on), level 15's song (a tune over
  strummed chords, `songPart`), a wrong answer's "what you
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
it. Its strings are 46 units apart, not the shared 26, its frets 48 (not 52), and its dots of
radius 20, not the shared 11 (`neckGeometry`'s `dotRadius`; the neck's text grows with its dots):
at phone width (360px) the window is drawn at full size, so the dot labels, fret numbers and string
names are 19px or more, the 18px of the beginner screens (#283), and each dot keeps a 40px tap
(the shared neck's tap reach, `TAP_REACH_PX`).
`ui/AnswerStrip.tsx` answers on one string from the root: fret 0 is 1, fret 3 is ♭3… each degree
as the key spells it (♭5 in minor); at phone width only the active frets show, as large buttons.
An answer is named by its label, then as spoken, then its fret ("♭3 (flat three), fret 3"): the
label first for voice control (WCAG 2.5.3). Standard tuning only.

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
    done (`isUnlocked()`): worked out, never stored. A level done with no round played (`best` 0) was skipped by a stage's test (`skipped()`): that is how the test is stored, and its card
    says so ("Done · skipped by the test").
  - Version 1 was the old trainer's settings and stats: it migrates to version 2 not welcomed,
    with no level played, and those fields are no longer read (the next write drops them).
  - Missing, corrupt, unversioned or newer-version data gives the defaults; within a readable
    payload each level and each of its fields is checked on its own and falls back alone. A
    version bump adds a step to `MIGRATIONS`. Data a newer build stored is never overwritten.
  - Every write starts from what is stored now, so another tab's progress is kept;
    `onStoredChange()` follows changes made in another tab (`storage` event), as `gm.lang` does.
    Storage that fails only means nothing is remembered.
