# Theory sessions — the plan

**Status:** plan, tracked in #292. Sessions are built one issue at a time; this file is the design
they all follow. If an issue and this file disagree, the issue wins and the same PR fixes this file.

## What a session is

Theory has two kinds of pages:

- **Lessons** (`theory/src/lessons/`, `/theory/<slug>`): 13 pages grouped by topic. They stay as
  they are and are listed under **Reference** (`/theory/library`).
- **Sessions** (`theory/src/sessions/`, `/theory/s/<slug>`): short sittings (15–20 minutes) in a
  fixed order, grouped into **paths**. A session is complete in itself: it repeats whatever theory
  it needs, so the learner never has to open another page. **Repeating theory between sessions is
  intended.**

The far goal of Theory is still **lead guitar on electric**. Path 1, "Play songs by ear"
(`accompany`), comes first because choosing notes for a lead needs an ear for chords. Path 2,
"Lead guitar", will re-cut the 13 lessons into sessions later; until then the lessons are the way
to learn lead.

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
- Every string a learner sees comes from the session's copy or from `i18n/strings.ts`
  (ESLint rejects literal text in `ui/**/*.tsx`).
- Sound goes through the one `player` from `useTheory()`. Anything in time uses `useClock`.
  Start sound only from a click.
- Tests: the critical cases only (see `AGENTS.md`): the pure generator or judge function of a new
  block, stored data, and the main path of a new screen.

## Data model (built in issue 2, extended by later issues)

```ts
// theory/src/sessions/types.ts
export type PathId = 'accompany';
export type StageId = 'A' | 'B' | 'C' | 'D';
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
  | { readonly kind: 'reveal'; readonly key: string; readonly drill: DrillId };
  // later issues add: 'melodyEcho', 'changeTap', 'fillBars', 'song', 'transpose'

export interface Session {
  readonly slug: string;               // English, URL-safe: /theory/s/<slug>
  readonly path: PathId;
  readonly stage: StageId;
  readonly concepts: readonly ConceptId[];
  readonly parts: Readonly<Record<PartId, readonly Block[]>>;
  /** Index of the right option of each check question. */
  readonly checkAnswers: readonly number[];
  readonly copy: Readonly<Record<Lang, SessionCopy>>;
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

`BlockCopy` by block kind (every kind has `intro`, one or two sentences shown above the block):

| kind | copy fields |
| --- | --- |
| `lesson` | `intro` (the scene itself uses the lesson's own scene copy) |
| `chords` | `intro` |
| `strumAlong` | `intro` |
| `listen` | `intro`, `ask`, `answers` (label per answer id), `right`, `wrong` (may use `{answer}` and `{detail}`) |
| `reveal` | `intro`, `ask`, `answer` (may use `{answer}` and `{detail}`) |

Buttons and labels shared by every session ("Play", "Play again", "Next", "Show answer",
"Question {n} of {total}", …) are in `i18n/strings.ts` under `session`.

## Blocks

| kind | What the learner sees | Built in |
| --- | --- | --- |
| `lesson` | One existing lesson scene (`LessonScene`), e.g. `chords` / `open`. | issue 3 |
| `chords` | A card per chord: its open shape on a small neck (from `openVoicing()`), its symbol and Roman numeral, click to strum. A chord with no open voicing shows its E- or A-shape barre (`barreVoicing()`). | issue 5 |
| `listen` | A multiple-choice ear drill of 8 questions. Play → answer. Only the first answer counts. Right: say so, Next. Wrong: play the comparison, say what it was, Next. Score for this visit only. | issue 5 |
| `reveal` | The app plays something; the learner finds or plays it on their own guitar; "Show answer" shows it. No score. | issue 5 |
| `strumAlong` | Bars drawn as a grid, a metronome click and the app strumming each bar's chord; a tempo slider; optional key chips (`keys`) to move the same numbers to another key; `numeralsOnly` hides chord names. | issue 6 |
| `melodyEcho` | The app plays 3–4 notes of a major scale on one string; the learner taps them back on a one-string neck. | issue 8 |
| `changeTap` | The app plays 8 bars; the learner taps a button each time the chord changes; then the grid shows where the changes were. | issue 10 |
| `fillBars` | The app plays 4 bars; the learner picks a Roman numeral for each bar; Check marks each bar. | issue 11 |
| `song` | The song bench: a public-domain melody over a grid of chord slots; the learner picks a chord per slot, hears the tune over their chords, and checks against a reference. Any key. | issue 12 |
| `transpose` | A table: the same progression by numbers in several keys, with a capo row; click a row to hear it. | issue 13 |

### Sound of a drill

A drill's sound is pure data, so it can be tested and always plays the same:

```ts
// theory/src/sessions/sound.ts
export interface SoundEvent {
  readonly at: number;                 // beats from the start
  readonly midis?: readonly number[];  // low to high; one note, or a chord
  readonly strum?: boolean;            // spread the notes as a down strum
  readonly length?: number;            // beats the note rings (default 1)
  readonly click?: 'accent' | 'plain'; // a metronome click instead of notes
}
export interface Sound { readonly bpm: number; readonly events: readonly SoundEvent[] }
```

`ui/sessions/playSound.ts` hands every event to the player at once, each with its exact delay
(`player.pluck(midi, delay, length)`, `player.click(accent, delay)`); `player.cancel()` stops it.
Never one `setTimeout` per note.

### Drills (for `listen` and `reveal`)

```ts
// theory/src/sessions/drills/types.ts
export interface DrillQuestion {
  readonly answer: string;             // one of the drill's answer ids
  readonly sound: Sound;
  readonly compare?: Sound;            // played after a wrong answer
  readonly detail?: string;            // fills {detail} in copy: a chord symbol, a fret, a note name
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
| `keyMode` | 11 | I–IV–V–I in a major key or i–iv–V7–i in a minor key. | `major`, `minor` | the other mode on the same tonic |
| `seventh` | 12 | One open chord, plain major or dominant 7 (roots E, A, D, G). | `plain`, `seventh` | the other one, then this one |
| `meter` | 13 | Two or three bars of clicks with strums, beat 1 accented, 3 or 4 beats in a bar. | `three`, `four` | the other meter |
| `sameChord` | 14 | An open chord, then a barre chord: the same chord, or another chord of the key. | `same`, `different` | both again |
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
| 5 | `listen chordCount` | `lesson keys/family` | `chords` G C D with numerals; `strumAlong` I IV V I in G | `strumAlong` I IV V I, `numeralsOnly`, keys G |
| 6 | `changeTap` (easy: a change every 2 bars) | `lesson rhythm/strum` | `strumAlong` I I IV IV V V I I, pattern `D-D-D-DU` | `changeTap` (changes after 1 or 2 bars) |
| 7 | `listen fourOrFive` | `lesson keys/numbers` | `strumAlong` I IV I V, then I V IV I | `fillBars` pool I IV V |
| 8 | `song` Frère Jacques (listen: one chord fits the whole tune) | `chords` G C D with the degrees of each chord | `strumAlong` over Mary Had a Little Lamb's chords | `song` Mary Had a Little Lamb, then Twinkle Twinkle |
| 9 | `transpose` I IV V I in G and D (listen: same song, two keys) | `transpose` with the capo row | `chords` A, E; `strumAlong` I IV V I with keys G D A | `song` Twinkle Twinkle in D, then A |
| 10 | `listen minorBar` | `lesson keys/family` | `chords` Em in G; `strumAlong` I V vi IV and I vi IV V | `fillBars` pool I IV V vi, keys G D |
| 11 | `listen keyMode` | `lesson keys/relative` | `chords` Am Dm E; `strumAlong` in A minor: i iv V i, then i VI VII i | `fillBars` in A minor and E minor |
| 12 | `listen seventh` | `lesson chord-table/sevenths`, `lesson keys/twoFive` | `chords` D7 G7 E7 A7; `strumAlong` I IV V7 I in G, D, A | `song` Twinkle Twinkle with V7 offered |
| 13 | `listen meter` | `lesson rhythm/beat` | `strumAlong` 3 beats in a bar: I I IV I | `song` Happy Birthday, then Amazing Grace |
| 14 | `listen sameChord` | `lesson barre/slide`, `lesson barre/eShape`, `lesson barre/aShape` | `chords` F, Bm; `strumAlong` I IV V I in F and B♭ | `strumAlong` I V vi IV, `numeralsOnly`, keys F B♭ E♭ |
| 15 | `listen oddChord` | `chords` ♭VII, iv, III7 in G next to the key's own chords | `strumAlong` I ♭VII IV I; I IV iv I; I III7 vi IV | `fillBars` pool I IV V vi ♭VII iv III7 |
| 16 | — (text only: the five steps) | `transpose` (the keys the learner now knows) | `strumAlong` review: I V vi IV in G, D, A, C | `song` London Bridge, Ode to Joy, Jingle Bells, with no hints |

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

## Songs (public domain melodies)

Songs are data in `theory/src/sessions/songs/` (issue 12): a melody as scale degrees, so it plays
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

- `theory.sessions` (issue 4): `{ v: 1, ticks: { [slug]: number[] } }`, the indexes of the
  "I can do this" boxes ticked in each session. A session is **done** when every box of its
  `canDo` is ticked; done is worked out, never stored. Read and written through
  `platform/storage.ts`; never throws; unknown slugs are kept, broken entries dropped.
- Check answers and drill scores are for the visit only (not stored).

## Order of work

1. This document, the knowledge base (M8, K1.6), concept names.
2. Session model, registry, tests; session 1's data and copy.
3. Routes and pages: `/theory/s/<slug>`, the path page at `/theory`, the lessons at `/theory/library`.
4. Progress: check questions, "I can do this", done, next session.
5. Sound, drills, the `listen`, `reveal` and `chords` blocks; session 1 complete.
6. The `strumAlong` block; session 2. **Then the owner tries sessions 1–2 before more is built.**
7. Session 3. 8. `melodyEcho`, session 4. 9. Session 5. 10. `changeTap`, session 6.
11. `fillBars`, session 7. 12. Songs, the `song` block, session 8. 13. `transpose`, session 9.
14. Sessions 10–11. 15. Sessions 12–13. 16. Sessions 14–15. 17. Session 16.
18. Links with Ear training, the review page, final docs.
