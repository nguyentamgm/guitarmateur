# Theory sessions

**Status:** Path 1 has 16 playable sessions (#292). Path 2 has four playable sessions in Stage E (17–20) and the first two in Stage F (21–22). The remaining
sessions follow the curriculum plan (#332). Empty stages show “Coming soon” in the learner's language.

## What a session is

Theory has two kinds of pages:

- **Lessons** (`theory/src/lessons/`, `/theory/<slug>`): 13 pages grouped by topic. They stay as
  they are and are listed under **Reference** (`/theory/library`).
- **Sessions** (`theory/src/sessions/`, `/theory/s/<slug>`): short sittings (15–20 minutes) in a
  fixed order, grouped into **paths**. A session is complete in itself: it repeats whatever theory
  it needs, so the learner never has to open another page. **Repeating theory between sessions is
  intended.**

The far goal of Theory is still **lead guitar on electric**. Path 1, "Play songs by ear"
(`accompany`), comes first because choosing notes for a lead needs an ear for chords. Path 2, “Lead guitar” (`lead`),
continues the same session order. Completing session 16 leads directly to session 17. Learners can also open any of the 13 lessons in the library.

## The parts of a session

Every session has the same parts, in this order:

| Part | What it is |
| --- | --- |
| goal | One sentence: "After this session you can …", and what is needed (a guitar in tune). |
| recap | 0–3 short reminders of what earlier sessions taught and this one uses (none in session 1). |
| `listen` | A short ear drill: hear it before it has a name. |
| `understand` | Just enough theory to explain what was heard, with pictures. |
| `play` | An exercise on the guitar, with the app playing along. |
| `challenge` | One real task that joins the three parts above. |
| check | 3 multiple-choice questions on the idea, then "I can do this" boxes. All boxes ticked = session **done**. |

No session is locked. The path page only suggests the next one.

## Rules for copy

- English first, then Vietnamese, both in the same PR, same keys (a test checks it).
- A beginner reads this. **Never use a word the path has not taught yet** (see "Words, in order").
  Sound first, then the name.
- Follow `docs/glossary.md`; `glossary.test.ts` fails on banned words. The ones that bite here:
  - English: say **root**, never "home note". (A phrase like "it sounds like home" is fine.)
  - Vietnamese: **root** (never `nốt nhà`, `nốt gốc`), **scale** (never `âm giai`),
    **vòng hợp âm** (never `tiến trình hợp âm`), **dominant 7** (never `hợp âm át`), **bar**,
    **open chord**. "nghe như về nhà" is fine.
  - Degrees are 1 ♭3 5 ♭7 with real ♭ ♯. Chords by number are Roman numerals: I, IV, V, vi, ♭VII.
  - Note names are letters (C, D, E), never Đô Rê Mi.
- Short sentences. One idea per paragraph. No exclamation marks in instructions.
- Own words only: nothing copied from a book or a site.
- The app never listens to the guitar (no microphone). Where the learner plays, they judge
  themselves and then reveal the answer.

## Rules for code

- `theory/src/sessions/` is **data**, like `lessons/`: it may import `core/`, `i18n/` and
  `lessons/` (for pure scene helpers such as `openView()`), never React, `ui/` or `platform/`.
- React for sessions lives in `theory/src/ui/sessions/`.
- **Never type a chord shape, a fret list, a chord name list or MIDI numbers.** Derive them:
  `diatonicChords()`, `openVoicing()`, `barreVoicing()`, `chordMidis()`, `homeFret()`,
  `transpose()`, `scaleNotes()` (see "Music invariants" in `docs/theory.md`).
  Chord shapes for sessions come from `sessions/voicing.ts`: an open shape only for the chords
  of `OPEN_SHAPE_CHORDS`, otherwise the lowest barre ≥ 1 from `barreOptions()` (never "open
  voicing if one exists", which draws shapes nobody plays).
- Every string a learner sees comes from the session's copy or from `i18n/strings.ts`
  (ESLint rejects literal text in `ui/**/*.tsx`).
- Sound goes through the one `player` from `useTheory()`. Anything in time uses `useClock`.
  Start sound only from a click.
- Tests: the critical cases only (see `AGENTS.md`): the pure generator or judge function of a new
  block, stored data, and the main path of a new screen.

## Data model

```ts
// theory/src/sessions/types.ts
export type PathId = 'accompany' | 'lead';
export type StageId = 'A' | 'B' | 'C' | 'D' | 'E' | 'F' | 'G' | 'H';
export type PartId = 'listen' | 'understand' | 'play' | 'challenge';
export const PARTS: readonly PartId[] = ['listen', 'understand', 'play', 'challenge'];

/** A key by its tonic's name ('G', 'F#', 'Bb') and mode; parsed with parseNote() where used. */
export interface SessionKey { readonly tonic: string; readonly mode: Mode }

/** A chord by its place in the key: a scale degree (the key's own triad), or a root + quality. */
export type ChordSpec = number | { readonly root: DegreeLabel; readonly id: ChordId };

/** One interactive piece of a part. `key` names its copy in `copy.blocks[key]`. */
export type Block =
  | { readonly kind: 'lesson'; readonly key: string; readonly lesson: string; readonly step: string }
  | { readonly kind: 'chords'; readonly key: string; readonly in: SessionKey; readonly chords: readonly ChordSpec[] }
  | { readonly kind: 'strumAlong'; readonly key: string; readonly in: SessionKey; readonly bars: readonly ChordSpec[];
      readonly bpm: number; readonly beatsPerBar?: 3 | 4; readonly pattern?: string; readonly keys?: readonly string[];
      readonly numeralsOnly?: boolean }
  | { readonly kind: 'listen'; readonly key: string; readonly drill: DrillId }
  | { readonly kind: 'reveal'; readonly key: string; readonly drill: DrillId }
  | { readonly kind: 'melodyEcho'; readonly key: string; readonly tonic: string; readonly string: StringNumber;
      readonly phrases: readonly (readonly number[])[] | null; readonly notes?: 3 | 4 }
  | { readonly kind: 'changeTap'; readonly key: string; readonly in: SessionKey; readonly pool: readonly ChordSpec[];
      readonly holds: readonly (1 | 2)[]; readonly bars: number; readonly bpm: number }
  | { readonly kind: 'fillBars'; readonly key: string; readonly in: SessionKey; readonly keys?: readonly string[];
      readonly pool: readonly ChordSpec[]; readonly bpm: number;
      readonly bars: number | { readonly plan: readonly ChordSpec[]; readonly blanks: readonly number[] } }
  | { readonly kind: 'song'; readonly key: string; readonly song: SongId; readonly in: SessionKey;
      readonly pool: readonly ChordSpec[]; readonly start: 'all' | 'none'; readonly keys?: readonly string[];
      readonly bpm?: number }
  | { readonly kind: 'transpose'; readonly key: string; readonly bars: readonly ChordSpec[];
      readonly tonics: readonly string[]; readonly capoShapes?: string };

export interface Session {
  readonly slug: string;               // English, URL-safe: /theory/s/<slug>
  readonly path: PathId;
  readonly stage: StageId;
  readonly concepts: readonly ConceptId[];
  readonly parts: Readonly<Record<PartId, readonly Block[]>>;
  /** Index of the right option of each check question. */
  readonly checkAnswers: readonly number[];
  readonly copy: Readonly<Record<Lang, SessionCopy>>;
  /** Optional Ear training level (1–15) linked after the challenge part. */
  readonly earLevel?: number;
  /** Optional key and chords to open Practice on, shown once the session is done. */
  readonly practice?: SessionPractice;
  /** Controls shown in the session's sticky settings bar; the bar is hidden when empty. */
  readonly settings?: readonly SessionSettingId[];
}

export type SessionSettingId = 'strumSpeed';  // slow / medium / fast strum spread

export interface SessionPractice {
  readonly scale?: ScaleId;
  readonly boxes?: readonly number[]; // lesson numbering, 1–5
  readonly swing?: boolean;
  readonly in: SessionKey;
  readonly bars: readonly ChordSpec[];
}

export interface SessionCopy {
  readonly title: string;
  readonly summary: string;            // one line for the path page
  readonly goal: string;               // "After this session you can …"
  readonly needs: string;              // "A guitar in tune. About 15 minutes."
  readonly recap: readonly string[];
  readonly parts: Readonly<Record<PartId, { readonly title: string; readonly body: readonly string[] }>>;
  readonly blocks: Readonly<Record<string, BlockCopy>>;
  readonly check: readonly { readonly question: string; readonly options: readonly string[]; readonly why: string }[];
  readonly canDo: readonly string[];   // "I can …" boxes; all ticked = done
}
```

`BlockCopy` by block kind (every kind has `intro`, one or two sentences shown above the block, and
`BLOCK_COPY_FIELDS` in `theory/src/sessions/types.ts` lists the required fields checked by
`sessions.test.ts`):

| kind | copy fields |
| --- | --- |
| `lesson` | `intro` (the scene itself uses the lesson's own scene copy) |
| `chords` | `intro` |
| `strumAlong` | `intro` |
| `listen` | `intro`, `ask`, `answers` (label per answer id), `right`, `wrong` (may use `{answer}` and `{detail}`) |
| `reveal` | `intro`, `ask`, `answer` (may use `{answer}` and `{detail}`) |
| `melodyEcho` | `intro`, `ask`, `right`, `higher`, `lower`, `done` |
| `changeTap` | `intro`, `ask`, `result` (may use `{caught}`, `{total}`, `{extra}`) |
| `fillBars` | `intro`, `ask`, `allRight`, `someWrong` |
| `song` | `intro`, `ask`, `result` (may use `{right}`, `{total}`), `allRight` |
| `transpose` | `intro`, `caption` |

Buttons and labels shared by every session ("Play", "Play again", "Next", "Show answer",
"Question {n} of {total}", …) are in `i18n/strings.ts` under `session`.

**Settings bar.** `settings` lists the controls of the session's settings bar
(`ui/sessions/SessionSettings.tsx`), sticky at the top of the session page and hidden when the list
is empty or missing. The only id today is `'strumSpeed'`: blocks read it with
`useSessionStrumSpeed()` and pass `STRUM_SPREADS[speed]` to `strumDelays()` / `playSound()`.
**Rule: a session that strums chords anywhere declares `settings: ['strumSpeed']`; a session that
never strums does not.** "Strums" means any block in `STRUMMING_KINDS` (`strumAlong`, `chords`,
`changeTap`, `fillBars`, `song`, `transpose`), or a `listen` / `reveal` block whose drill's sound
has a strummed event, or a `backingTrack` with strum or comp style. `sessions.test.ts` checks it.

**Links to other apps.**
- **Ear training:** when `session.earLevel` (integer 1–15, checked by `sessions.test.ts`) is set,
  `SessionPage.tsx` renders a plain `<a>` after the challenge part to
  `/ear-training?level=<n>&lang=<lang>`. Linked sessions: `major-or-minor` (5), `find-the-root`
  (7), `melody-by-ear` (3), `chord-family` (6), `minor-pentatonic-box` (12).
- **Practice:** when `session.practice` (key, bars and optional scale, boxes and swing, checked by `sessions.test.ts`) is set and
  the session is marked done in `SessionDone.tsx`, a `TrainerLink` opens Practice on that key and
  progression. Session 16 opens G major over I–V–vi–IV. Session 17 opens A minor pentatonic box 1 over Am–Dm. Without a scale override the key mode selects major or natural minor.

## Blocks

| kind | Component (`ui/sessions/`) | What the learner sees |
| --- | --- | --- |
| `lesson` | `LessonScene` (`ui/lessons/`) | One existing lesson scene, e.g. `chords` / `open`. |
| `chords` | `ChordCards.tsx` | A card per chord: its symbol, Roman numeral, and shape on a small neck (open shape only for `OPEN_SHAPE_CHORDS`, otherwise lowest barre ≥ 1 from `barreOptions()`), click to strum. |
| `listen` | `ListenDrill.tsx` | A multiple-choice ear drill of 8 questions. Play → answer. Only the first answer counts. Right: say so, Next. Wrong: play the comparison, say what it was, Next. Score for this visit only. |
| `reveal` | `Reveal.tsx` | The app plays something; the learner finds or plays it on their own guitar; "Show answer" shows it. No score. |
| `strumAlong` | `StrumAlong.tsx` | Bars drawn as a grid, a metronome click and the app strumming each bar's chord; a tempo slider; optional key chips (`keys`) to move the same numbers to another key; `numeralsOnly` hides chord names. |
| `melodyEcho` | `MelodyEcho.tsx` | The app plays 3–4 notes of a major scale on one string; the learner taps them back on a one-string neck. |
| `changeTap` | `ChangeTap.tsx` | The app plays 8 bars; the learner taps a button each time the chord changes; then the grid shows where the changes were. |
| `fillBars` | `FillBars.tsx` | A random form gives the first bar. A fixed form takes one-based blank bar numbers and opens them for answers after a complete playback. The learner picks a Roman numeral for each blank. |
| `song` | `SongBench.tsx` | The song bench: a public-domain melody over a grid of chord slots; the learner picks a chord per slot, hears the tune over their chords, and checks against a reference. Any key. |
| `transpose` | `TransposeTable.tsx` | A table: the same progression by numbers in several keys, with an optional capo table; click a row to hear it. |

### Sound of a drill

A drill's sound is pure data, so it can be tested and always plays the same:

```ts
// theory/src/sessions/sound.ts
export interface SoundEvent {
  readonly at: number;                 // beats from the start
  readonly midis?: readonly number[];  // low to high; one note, or a chord
  readonly strum?: boolean;            // spread the notes as a down strum
  readonly length?: number;            // beats the note rings (default 1)
  readonly glide?: Glide;              // shared pitch curve in seconds and semitones
  readonly mute?: boolean;             // palm-muted attack
  readonly click?: 'accent' | 'plain'; // a metronome click instead of notes
}
export interface Sound { readonly bpm: number; readonly events: readonly SoundEvent[] }
```

`ui/sessions/playSound.ts` hands every event to the player at once, each with its exact delay
through `player.pluck(midi, delay, length, glide)`, `player.mute(midi, delay)` or
`player.click(accent, delay)`. Muted chords use the same strum offsets. `player.cancel()` stops playback.
Never one `setTimeout` per note.

### Drills (for `listen` and `reveal`)

```ts
// theory/src/sessions/drills/types.ts
export interface DrillQuestion {
  readonly answer: string;             // one of the drill's answer ids
  readonly sound: Sound;
  readonly compare?: Sound;            // played after a wrong answer
  readonly detail?: string;            // fills {detail} in copy: a chord symbol, a fret, a note name
  readonly chord?: Chord;
  readonly run?: number;               // optional run count for repetition avoidance
}
export interface Drill {
  readonly answers: readonly string[];
  next(random: () => number, previous?: DrillQuestion): DrillQuestion;
}
```

Each drill is one file in `theory/src/sessions/drills/` with a test, and one entry in `DRILLS`.
A drill never asks the same answer three times in a row.

| id | Session | Sound | Answers | After a wrong answer |
| --- | --- | --- | --- | --- |
| `quality` | 1 | One open chord strummed: root E, A or D, major or minor (`openVoicing()`). `detail`: its symbol. | `major`, `minor` | the other quality, then the chord again |
| `onBeat` | 2 | Four clicks (first accented) at 80 BPM with an Em strum on every click, or every strum half a beat after its click. | `on`, `off` | the other version |
| `finished` | 3 | Four strummed chords in a major key (G, A, D, C or E): I–IV–V–I, or stopping away from home (I–IV–I–V, I–V–I–IV). | `finished`, `notFinished` | the same four, then the I chord |
| `rootNote` | 3 (reveal) | I–IV–V–I in a key whose tonic is a natural note, then the I chord held. `answer`: the root's fret on string 6 (`homeFret()`), `detail`: the note name. | (reveal) | — |
| `moves` | 4 | Two notes of the G major scale: the second one scale step away, or 3–4 steps away, above or below. | `stepUp`, `stepDown`, `leapUp`, `leapDown` | both notes again, slower |
| `chordCount` | 5 | Four strummed bars in G: two different chords (I–IV–I–IV, I–V–I–V) or three (I–IV–V–I, I–V–IV–I). | `two`, `three` | the same bars again |
| `fourOrFive` | 7 | I, then IV or V, then I, in G, D, A or C. | `IV`, `V` | the other one, then this one |
| `minorBar` | 10 | Four bars from I, IV, V with exactly one vi in bar 2, 3 or 4. | `2`, `3`, `4` | the bars again, the vi bar held longer |
| `keyMode` | 11 | I–IV–V–I in a major key or i–iv–V7–i in a minor key (tonic A, E or D). | `major`, `minor` | the other mode on the same tonic, then this one |
| `seventh` | 12 | One open chord, plain major or dominant 7 (roots E, A, D, G). | `plain`, `seventh` | the other one, then this one |
| `meter` | 13 | Two or three bars of clicks with strums, beat 1 accented, 3 or 4 beats in a bar. | `three`, `four` | the other meter |
| `sameChord` | 14 | An open chord, then a barre chord: the same chord, or another chord of the same quality. | `same`, `different` | both again, then the second chord as an open chord |
| `oddChord` | 15 | Four bars in a major key; bar 2, 3 or 4 is ♭VII, iv or III7, the rest are I, IV, V. | `2`, `3`, `4` | the bars again, then the same bars with the key's own chord in that bar |

## Path 1 · Play songs by ear (`accompany`)

First key: **G** (I IV V vi = G C D Em, all open chords), then D, A, C.

| # | slug | Stage | Title (en) | Concepts |
| --- | --- | --- | --- | --- |
| 1 | `major-or-minor` | A | Happy or sad: major and minor | K0.1, K0.3, K4.1, K4.5 |
| 2 | `beat-and-bar` | A | Beat and bar | K1.1, K1.3, K1.4, K4.5 |
| 3 | `find-the-root` | A | The root: the note that sounds like home | K5.1, K0.2, K0.7 |
| 4 | `melody-by-ear` | A | Find a melody by ear | K2.1, K7.5 |
| 5 | `chord-family` | B | Three chords that belong together | K5.2, K5.3, K4.5 |
| 6 | `chord-changes` | B | When do the chords change? | K8.1, K1.4 |
| 7 | `one-four-five` | B | I, IV or V? | K8.2, K5.3 |
| 8 | `first-song` | B | Your first song by ear | K8.3, K8.2 |
| 9 | `change-key` | B | Change the key | K8.4, K5.3 |
| 10 | `the-six-chord` | C | The sad chord in a happy key: vi | K5.2, K5.3 |
| 11 | `minor-keys` | C | Songs in a minor key | K5.6, K2.8, K5.1 |
| 12 | `seventh-chords` | C | The 7th chord pulls home | K4.3, K5.5 |
| 13 | `three-four` | C | Three beats in a bar | K1.6, K1.4 |
| 14 | `barre-chords` | D | Barre chords: every key with two shapes | K4.6, K0.7 |
| 15 | `outside-chords` | D | Chords from outside the key | K8.5 |
| 16 | `new-song` | D | Work out a new song | K8.6 |

### What each session contains

Blocks are listed part by part. `lesson a/b` is the lesson block `{ lesson: 'a', step: 'b' }`.

| # | listen | understand | play | challenge |
| --- | --- | --- | --- | --- |
| 1 | `listen quality` | `lesson fretboard/strings`, `lesson chords/open` | `chords` Em, E (key E minor: 1; then `{root:'1', id:'major'}`) | `reveal quality`: hear E or Em, play it back, show the answer |
| 2 | `listen onBeat` | `lesson rhythm/beat`, `lesson rhythm/counting` | `chords` Em, Am; `strumAlong` Em Em Am Am at 60 BPM, pattern all downs | `strumAlong` Em Am Em Am, one bar each, 80 BPM: 8 bars without a late change |
| 3 | `listen finished` | `lesson fretboard/semitones`, `lesson fretboard/home` | `strumAlong` in G: I I I I (hum the root over it) | `reveal rootNote` |
| 4 | `listen moves` | `lesson major-scale/formula` | `melodyEcho` 3 notes, degrees 1–5 | `melodyEcho` the tune "Frère Jacques", phrase by phrase |
| 5 | `listen chordCount` | `lesson keys/family` | `chords` G C D with numerals; `strumAlong` I IV V I in G | `strumAlong` I IV V I in G (`numeralsOnly`) |
| 6 | `changeTap` (easy: a change every 2 bars) | `lesson rhythm/strum` | `strumAlong` I I IV IV V V I I, pattern `D-D-D-DU` | `changeTap` (changes after 1 or 2 bars) |
| 7 | `listen fourOrFive` | `lesson keys/numbers` | `strumAlong` I IV I V, then I V IV I | `fillBars` pool I IV V |
| 8 | `song` Frère Jacques (listen: one chord fits the whole tune) | `chords` G C D with the degrees of each chord | `strumAlong` over Mary Had a Little Lamb's chords | `song` Mary Had a Little Lamb, then Twinkle Twinkle |
| 9 | `transpose` I IV V I in G and D (listen: same song, two keys) | `transpose` in G, D, A, C with G capo shapes | `chords` A, D, E; `strumAlong` I IV V I with keys G D A | `song` Twinkle Twinkle with keys D, A |
| 10 | `listen minorBar` | `lesson keys/family` | `chords` G, D, Em, C in G; `strumAlong` I V vi IV and I vi IV V (keys G, D) | `fillBars` pool I IV V vi, keys G D |
| 11 | `listen keyMode` | `lesson keys/relative` | `chords` Am Dm E; `strumAlong` in A minor: i iv V i, then i VI VII i | `fillBars` pool i iv V VI VII, keys A minor and E minor |
| 12 | `listen seventh` | `lesson chord-table/sevenths`, `lesson keys/twoFive` | `chords` D/D7, A/A7, E/E7; `strumAlong` I IV V7 I in G, D, A | `song` Twinkle Twinkle with V7 offered, keys G, D, A |
| 13 | `listen meter` | `lesson rhythm/beat` | `strumAlong` 3 beats in a bar: I I IV I, then I V V I (`D-DUDU`) | `song` Happy Birthday, then Amazing Grace |
| 14 | `listen sameChord` | `lesson barre/slide`, `lesson barre/eShape`, `lesson barre/aShape` | `chords` F, B♭, C and Bm; `strumAlong` I IV V I in F and B♭ | `strumAlong` I V vi IV, `numeralsOnly`, keys F B♭ E♭ |
| 15 | `listen oddChord` | `chords` V, ♭VII, IV, iv, vi, III7 in G | `strumAlong` I ♭VII IV I; I IV iv I; I III7 vi IV | `fillBars` pool I IV V vi ♭VII iv III7, keys G, D |
| 16 | — (text only: the five steps) | `transpose` I V vi IV in G, D, A, C, F with G capo shapes | `strumAlong` review: I V vi IV in G, D, A, C (`numeralsOnly`) | `song` London Bridge, Ode to Joy, Jingle Bells (`start: 'none'`, keys G, D, A) |

### Words, in order

A word may be used from the session that teaches it, never before.

| Session | Words |
| --- | --- |
| 1 | string, fret, chord, major, minor, strum |
| 2 | beat, bar, tempo, count |
| 3 | root, key, semitone |
| 4 | scale, major scale, degree (1–7) |
| 5 | I, IV, V (Roman numerals), progression |
| 6 | chord change, strumming pattern |
| 8 | chord tone |
| 9 | transpose / change key, capo |
| 10 | vi |
| 11 | minor key, relative minor |
| 12 | 7th chord (dominant 7), ♭7 |
| 13 | time signature, 3/4 |
| 14 | barre chord |
| 15 | ♭VII, iv, III7 |

## Path 2 · Lead guitar (`lead`)

Stages E–H follow A–D on the path page. Global session numbers and next-session links follow
registry order. The table describes the planned 15–20 minute sessions and the ear drill each
introduces. The drill IDs are reserved now. Generators and playable sessions arrive in #334–#344.

| # · stage | Session slug | Ear task (drill) | Guitar challenge |
| --- | --- | --- | --- |
| 17 · E | `minor-pentatonic-box` | Hum a three-note call. After playing it, compare two scale phrases with the same endpoints (`pentatonicOrMajor`). | Echo the call in box 1 twice, alternate pick across two strings and silence them on the rest. |
| 18 · E | `pentatonic-keys-and-modes` | Compare major and minor pentatonic on the same tonic (`pentaMode`). | Keep a phrase while changing the root from C to A, then keep A as root and switch scales. Place box 1 in another key. |
| 19 · E | `octave-shapes` | Distinguish an octave from a fifth (`octaveOrFifth`). | Given the starting fret, find two higher octaves on strings 4 and 2 before revealing them (`rootAcrossStrings`). |
| 20 · E | `five-boxes-and-sequences` | Identify straight runs, groups of three and skips (`sequenceKind`). | Cross from box 1 into box 2 through a shared note and return in time. |
| 21 · F | `shuffle-and-twelve-bar` | Hear straight and shuffled eighths at the same tempo (`straightOrShuffle`). | Keep place in a full chorus and fill bars 5, 9 and 10, then try a quick change or turnaround. |
| 22 · F | `the-blue-note` | Hear whether a lick passes through ♭5 (`hasBlueNote`). | Echo a model that passes through ♭5 and resolves to 4 or 5. |
| 23 · F | `bends-and-vibrato` | Compare a bend against its reference pitch (`bendPitch`). | Match the fretted target, sustain the bend, then add vibrato. |
| 24 · F | `legato-and-slides` | Identify picked, legato and sliding attacks (`pickOrLegato`). | Play a marked lick with ascending and descending same-string pairs and a slide. |
| 25 · F | `first-blues-licks` | Hear whether the second phrase repeats or answers the first (`callAndResponse`). | Change the rhythm of three pitches. Answer the backing’s two-bar call, then change the ending on the next pass. |
| 26 · G | `power-chords-and-palm-mute` | Compare a muted riff with an open one (`muteOrOpen`). | Play E5–G5–A5 in eighth-note pairs, rest on beat four and move the riff to A and G. |
| 27 · G | `double-stops-and-boogie` | Hear a single note, double stop or octave (`singleDoubleOrOctave`). | Keep the boogie going through a full chorus and insert a double-stop answer in bars 11–12. |
| 28 · H | `chord-tones-in-the-box` | Hear whether a sustained landing belongs to the chord (`landedOnChordTone`). | Land on a tone of the incoming chord on beat one over the pop backing. |
| 29 · H | `guide-tones` | Hear the third of IV against the stationary tonic (`thirdOrRoot`). | Sing and play G→F♯ over A7→D7, then lead into F♯ with a short lick. |
| 30 · H | `phrasing-and-motifs` | Find the motif in two equal-length examples (`motifOrNoodling`). | Repeat a motif, change its landing for the new chord and leave space. |
| 31 · H | `three-notes-per-string` | Hear two or three notes per beat (`dupleOrTripletRun`). | Add B or F to an A minor pentatonic lick, then play it in a three-notes-per-string position. |
| 32 · H | `your-first-solo` | Find the root and mode of an unlabelled backing before revealing the key. | Compare and revise landings on screen. On guitar, keep the full form, return to a motif and land intentionally at two chosen changes. |

**Lead blocks (#334).** `boxEcho` plays three or four pitches in a six-string box. The block may give the first note; the learner can tap back the phrase with higher/lower feedback. An optional `firstPhrase` supplies a model by scale degree before the random questions. `backingTrack`
loops a supplied chord form, highlights the current bar and offers tempo, key and optional box
controls. Strum and comp styles use the session strum spread. Rock and shuffle have their own
patterns. Session 29 adds guide tones outside the selected scale in the same fret range.
`standardBlues12` is the common 12-bar blues form for session playback and the Practice handoffs in Sessions 21, 25 and 32.

After session 18 the owner tries both sessions and records where singing, finding the fret or
crossing strings first needs help, and whether both pentatonic comparisons are playable (#335).

### Library step coverage

Each number below refers to the session where the learner uses a scene and demonstrates
the skill. Optional activities fit after the core challenge. Reference steps remain accessible
at their existing lesson URLs.

| Library lesson | Required steps, session and task | Optional extension | Reference only |
| --- | --- | --- | --- |
| `fretboard` | 1 `strings`: identify a string. 3 `semitones`, `home`: move a semitone and find the root on string 6. 17 `tab`: read a three-note call. 19 `octaves`: find the next two octaves. | — | — |
| `rhythm` | 2 `beat`, `counting`: count and strum on the beat. 6 `strum`: keep the pattern through a change. 17 `fingers`: coordinate one finger per fret with the pick. 25 `lengths`: hold across a bar line and rest. | — | — |
| `major-scale` | 4 `formula`: find a melody by scale steps. 27 `shapes`: locate an interval on adjacent strings. 28 `intervals`: identify the interval of a chord tone. 31 `spelling`: name the two notes added to the pentatonic. | — | `degrees` |
| `chords` | 1 `open`: play E and Em. | — | `stack`, `qualities`, `sus`, `build` |
| `barre` | 14 `slide`, `eShape`, `aShape`: move each shape to play chords in a new key. | — | `find`, `changes` |
| `keys` | 5 `family`, 7 `numbers`: play I, IV and V by ear. 11 `relative`: find the relative minor. 12 `twoFive`: play the dominant resolving to I. | — | `home` |
| `chord-table` | 12 `sevenths`: compare a triad and dominant 7. 21 `openSevenths`: play the dominant 7 chords of a blues. | — | `table`, `inversions`, `simplify` |
| `pentatonic-map` | 17 `formula`, `boxes`: locate the five degrees in box 1. 18 `keys`, `home`: move the box and change the root. 19 `grid`: cross the G–B shift. | — | — |
| `pentatonic` | 18 `major`, `choose`: choose a scale and place the box. 20 `boxes`, `connect`, `sequences`: locate adjacent boxes, cross between them and play a sequence. | — | — |
| `blues` | 21 `shuffle`, `twelveBar`: play a shuffled chorus. 22 `blueNote`: resolve ♭5. 23 `bends`: match a target pitch. 24 `legato`: join notes with a single attack. | — | — |
| `electric` | 26 `power`, `mute`: mute a power-chord riff. 27 `boogie`, `doubleStops`: insert a two-note answer in a boogie chorus. | 27 `octaves`: play a melody with the middle string muted. | — |
| `solo` | 28 `scale`, `tones`: land on a tone of the sounding chord. 29 `guide`: connect two chords by a semitone. 30 `phrase`: vary a motif. 32 `record`: listen to a take and revise a landing. | 30 `ear`: echo another phrase with the first-note hint off. | — |
| `three-per-string` | 31 `strings`, `tile`, `triplets`, `keys`: play triplets across adjacent positions and move the pattern to another key. | — | — |

## Songs (public domain melodies)

Songs are data in `theory/src/sessions/songs/index.ts`: a melody as scale degrees, so it plays
in any key. Only the titles below, all traditional or long out of copyright. No lyrics are stored
or shown.

Notation used here: a number is a degree of the major scale; `,` after it is the octave below,
`'` the octave above; `:n` is its length in beats (default 1); `_` is a rest; `|` is a bar line.
Chords are one per slot: in 4/4 a slot is **half a bar** (two per bar), in 3/4 a slot is a whole
bar. `-` means no chord (a pickup).

**Frère Jacques** (4/4, 8 bars)
```
melody: 1 2 3 1 | 1 2 3 1 | 3 4 5:2 | 3 4 5:2 | 5:.5 6:.5 5:.5 4:.5 3 1 | 5:.5 6:.5 5:.5 4:.5 3 1 | 1 5, 1:2 | 1 5, 1:2
chords: I I | I I | I I | I I | I I | I I | I I | I I
```

**Mary Had a Little Lamb** (4/4, 8 bars)
```
melody: 3 2 1 2 | 3 3 3:2 | 2 2 2:2 | 3 5 5:2 | 3 2 1 2 | 3 3 3 3 | 2 2 3 2 | 1:4
chords: I I | I I | V V | I I | I I | I I | V V | I I
```

**Twinkle Twinkle Little Star** (4/4, 12 bars)
```
melody: 1 1 5 5 | 6 6 5:2 | 4 4 3 3 | 2 2 1:2 | 5 5 4 4 | 3 3 2:2 | 5 5 4 4 | 3 3 2:2 | 1 1 5 5 | 6 6 5:2 | 4 4 3 3 | 2 2 1:2
chords: I I | IV I | IV I | V I | I IV | I V | I IV | I V | I I | IV I | IV I | V I
```

**Ode to Joy** (4/4, 8 bars)
```
melody: 3 3 4 5 | 5 4 3 2 | 1 1 2 3 | 3:1.5 2:.5 2:2 | 3 3 4 5 | 5 4 3 2 | 1 1 2 3 | 2:1.5 1:.5 1:2
chords: I I | V V | I I | I V | I I | V V | I I | V I
```

**London Bridge** (4/4, 8 bars)
```
melody: 5:1.5 6:.5 5 4 | 3 4 5:2 | 2 3 4:2 | 3 4 5:2 | 5:1.5 6:.5 5 4 | 3 4 5:2 | 2:2 5:2 | 3 1:3
chords: I I | I I | V V | I I | I I | I I | V V | I I
```

**Jingle Bells** (chorus; 4/4, 8 bars)
```
melody: 3 3 3:2 | 3 3 3:2 | 3 5 1:1.5 2:.5 | 3:4 | 4 4 4:1.5 4:.5 | 4 3 3 3:.5 3:.5 | 3 2 2 3 | 2:2 5:2
chords: I I | I I | I I | I I | IV IV | IV I | V V | V V
```

**Happy Birthday** (3/4, a pickup bar then 8 bars)
```
melody: _:2 5,:.5 5,:.5 | 6, 5, 1 | 7,:2 5,:.5 5,:.5 | 6, 5, 2 | 1:2 5,:.5 5,:.5 | 5 3 1 | 7, 6, 4:.5 4:.5 | 3 1 2 | 1:3
chords: - | I | V | V | I | I | IV | I | I
```
(In the bar before last, V is also right: accept I or V.)

**Amazing Grace** (first half; 3/4, a pickup bar then 8 bars)
```
melody: _:2 5, | 1:2 3:.5 1:.5 | 3:2 2 | 1:2 6, | 5,:2 5, | 1:2 3:.5 1:.5 | 3:2 2 | 5:3 | 5:3
chords: - | I | I | IV | I | I | I | V | V
```

## Storage

- `theory.sessions` (`ui/sessionProgress.ts`): `{ v: 1, ticks: { [slug]: number[] } }`, the indexes
  of the "I can do this" boxes ticked in each session. A session is **done** when every box of its
  `canDo` is ticked; done is worked out, never stored. Read and written through
  `platform/storage.ts`; never throws; unknown slugs are kept, broken entries dropped.
- Check answers and drill scores are for the visit only (not stored).
- `theory.strumSpeed` (`ui/sessions/strumSpeed.ts`): `'slow' | 'medium' | 'fast'`, default
  `'medium'`; the strum speed chosen in the settings bar, shared by every session. Read and written
  by `loadStrumSpeed()` / `saveStrumSpeed()` through `platform/storage.ts`; never throws (a
  missing, unknown or blocked value reads as `'medium'`).

## Extending sessions

### Adding a session

1. Create `theory/src/sessions/<slug>/` with `index.ts` (a `Session` object), `copy.en.ts` and
   `copy.vi.ts` (matching keys, list lengths and placeholders; follow `docs/glossary.md`).
2. Follow the settings rule: if any block or drill in the session strums chords, declare
   `settings: ['strumSpeed']`; otherwise omit it. Optionally set `earLevel` (integer 1–15) to show
   an Ear training link after the challenge part, or `practice` (`{ in, bars }`) to show a Practice
   link once the session is done.
3. Export the session and add it in curriculum order to `SESSIONS` in `theory/src/sessions/index.ts`.
4. Add `<loc>https://guitarmateur.com/theory/s/<slug></loc>` in matching order to
   `public/sitemap.xml`.
5. Run `npx vitest run theory`. Existing suites automatically check:
   - `sessions.test.ts`: unique URL-safe slug, sitemap order, known concept IDs, `vi`/`en` copy
     shape and non-empty strings, unique block keys and `BLOCK_COPY_FIELDS`, valid lesson steps,
     drills, chord shapes, patterns, songs, `strumSpeed` rule, `earLevel` range (1–15), `practice`
     chords, 3 check questions with 3 options, and 2–4 `canDo` items.
   - `lessons/glossary.test.ts`: banned terms from `docs/glossary.md`.
   - Add a smoke test in `theory/src/ui/App.test.tsx` rendering `/theory/s/<slug>` in `en` and `vi`.

### Adding a block kind

1. Add the new variant to `Block`, its `*Copy` interface to `BlockCopy`, and its required copy keys
   to `BLOCK_COPY_FIELDS` in `theory/src/sessions/types.ts`.
2. If the block strums chords, add its `kind` to `STRUMMING_KINDS` in
   `theory/src/sessions/sessions.test.ts`, and read `useSessionStrumSpeed()` in the UI component.
3. Put pure logic (generation, grading, timing) and its colocated `*.test.ts` in
   `theory/src/sessions/`.
4. Build the React component in `theory/src/ui/sessions/` (using strings from `copy` or
   `i18n/strings.ts`, never literal JSX text) and wire a `case` in
   `theory/src/ui/sessions/SessionBlock.tsx`.

### Adding a session setting

1. Add the setting id to `SessionSettingId` in `theory/src/sessions/types.ts`.
2. Add a small storage helper in `theory/src/ui/sessions/` using `platform/storage.ts` under
   `theory.<name>` — never throws, returns a safe default when missing or invalid.
3. Hold its state in `SessionSettingsProvider` (`theory/src/ui/sessions/SessionSettings.tsx`) and
   expose reader/setter hooks in `theory/src/ui/sessions/sessionSettingsContext.ts`.
4. Draw its control in `SessionSettingsBar` (`SessionSettings.tsx`) with labels in `ui.session`
   (`en` + `vi`). When the bar holds more than one control, switch its `aria-label` from
   `ui.session.strumSpeed` to a general `ui.session.settings` label ("Session settings").
5. List the setting id in `settings` on the sessions that need it, and add a test that the choice
   is stored and changes what is played.

## Future ideas (out of scope for Path 1)

- Storing session drill scores and listing them on `/theory/review`.
- Links from Ear training back to sessions.
- More controls in the settings bar (e.g. melody / chord / click balance via `player.setLevels`,
  or a default tempo for every strum-along of a session).
