# Ear training — the beginner levels plan

**Status:** plan, approved, not built yet; the work is tracked in #249. It replaces the trainer
screen at `/ear` that #227 finished (#220–#225). The rest of the site (Lessons, Review, Practice)
does not change.
"Ear training" is back in the site menu (moved up front, next to Practice).

## Who this is for

Someone who has **never learned music**. Picture a 50-year-old who just bought a guitar: they do
not know what a note name, a scale or a chord is, and they may not be sure they "have an ear" at
all. Every level must work for that person **on their own, with no teacher**.

So every screen follows these promises:

- **No word they have not been taught.** No "degree", "interval", "cadence", "major/minor" until a
  level has explained the idea with sound first, then given it a name.
- **One thing at a time.** One question per level, two answer buttons to start.
- **Big and calm.** Large text (at least 18 px), large buttons, high contrast, works on a phone. No
  timer, no score pressure, no losing lives.
- **Hear it before being asked.** Every level opens with a demo: the app plays the answer and says
  what it is, before asking anything.
- **Mistakes teach.** A wrong answer is never just "wrong": the app plays both sounds again and
  shows the difference.
- **Short sessions.** A round is 10 questions, about 3–5 minutes. The welcome screen suggests
  "10 minutes a day".

## What the learner can do at the end

1. Tell if two notes are the same, which is higher, and whether a tune goes up or down.
2. Hear if a chord sounds happy (major) or sad (minor).
3. Feel where a song's **root** (its "home" note) is, and hear when a tune has finished.
4. Recognise the notes of the **minor pentatonic** and **blues** scales — the notes used in most
   rock and blues guitar solos — and see where each one is on the neck.
5. Find a song's root **on their own guitar**, which turns "I hear the 5" into "that's an E".

### What it does **not** teach, and why

The learner will **not** be able to hear one note out of nowhere and say "that's a C". That skill
is _perfect pitch_: very few people have it, it usually forms in early childhood, and adults rarely
learn it reliably. Guitarists use _relative pitch_ instead — hearing how a note sits next to the
others — and that is what these levels train. To still learn the letter names:

- from Stage 3 on, every answer also says the letter: _"Right! That was 5 — the note E, in the key
  of A."_
- the last level teaches finding the root on the guitar; once the root is known, every other note
  name follows from it.

## The screens

### 1. Welcome (first visit only)

> **Train your ear, one small step at a time**
> You don't need to know anything about music. You only need your ears — and later, your guitar.
> Each level takes a few minutes. 10 minutes a day is plenty.
> 🎧 Headphones or good speakers help. A phone speaker can make low notes hard to hear.
>
> [ **Check my sound** ]

**Sound check:** the app plays a guitar note. _"Can you hear the guitar?"_ [ Yes ] [ No ].
"No" shows: _"Turn up the volume. On an iPhone, turn off the silent switch. Then try again."_
After "Yes", the learner goes to the level map.

### 2. Level map

- The 5 stages in a column, each with its levels as large cards.
- Each card: level number, name, a one-line "what you'll learn", and its state: 🔒 locked,
  ▶ ready, or ✓ done (with the best score).
- One button stands out: **Continue** — it opens the next level not done yet.
- Any unlocked or done level can be played again at any time.
- Under each stage not done yet: a small link **"I already know this — test me"** (see
  "Skipping ahead").

### 3. Level intro (before the first round of each level)

- The level name and one or two plain sentences: what to listen for, and why a guitarist cares.
- **Demo:** 2–3 example sounds, each with its answer shown and a "Play" button. Example for
  level 2: _"Listen: the second note is higher."_ ▶
- [ **I'm ready** ]

### 4. Question screen (the same for every level)

```
 Level 2 · Higher or lower?                ●●●●○○○○○○  (4 of 10)

                 [ ▶  Play again ]

        Was the second note higher or lower?

        [   ⬆ Higher   ]      [   ⬇ Lower   ]
```

- The sounds play by themselves when a question starts; **Play again** repeats them as often as
  wanted, with no penalty.
- Pick an answer → feedback right away:
  - **Right:** a green tick and one short line (_"Right — it went up."_). The next question starts
    after a short pause.
  - **Wrong:** an orange mark (not red), the right answer, and _"Listen to both again"_: the app
    plays what the learner picked and what it really was, one after the other. A **Next** button
    moves on when they are ready.
- Keyboard: Space plays again; the left and right arrows (or 1, 2, 3…) answer. Every button has a
  spoken label for screen readers.

### 5. End of a round

- _"8 of 10 right!"_ and the 10 dots in green and orange.
- **Passed** (8 or more right): _"Level done! You can now hear …"_ → [ Next level ] [ Play again ].
- **Not yet:** _"7 of 10 — almost! Play another round; most people need a few."_ → [ Play again ]
  [ Back to the map ].

### When the learner is stuck

If they get 4 wrong in a row, the app pauses and offers: _"This one is tricky. Want to make it a
bit easier?"_ [ Yes, easier ] [ No, keep going ]. "Easier" goes back one difficulty step (see
"Gets harder" in each level) and replays the demo. Nothing is lost.

## How a level works

- **Rounds of 10 questions.** **Pass = 8 of 10 right in one round.** Passing unlocks the next
  level.
- **Gets harder by itself.** Each level has 2–3 difficulty steps (A → B → C). A round starts at the
  step the learner reached; after 5 right in a row it moves up one step. The pass only counts when
  the round ends on the level's **last** step, so passing means the learner really has the skill.
- **Everyday guitar sound.** Every note and chord uses the guitar sound, in the comfortable middle
  range of the guitar (no very low or very high notes) until a level asks for more.
- **Keys.** Levels that use a key (Stage 3 on) start in **A** — the key most beginner guitar songs
  and solos use — and move to other keys only on their last step.

## The levels

### Stage 1 · Hearing differences

No music knowledge at all. This stage trains the ear to notice _any_ difference between notes.

#### Level 1 · Same or different?

- **You learn:** to tell if two notes are the same, or not.
- **Why it matters:** this is how you know if a guitar string is in tune.
- **Intro:** _"You'll hear two notes. Are they the same note, or different?"_
- **You hear:** two single notes, one after the other. Half the time they are the same.
- **Buttons:** [ Same ] [ Different ]
- **Gets harder:** A — when different, they are far apart (7 or more frets). B — 3 to 5 frets
  apart. C — 1 or 2 frets apart.
- **Wrong answer:** _"They were different: here is the first… and the second."_
- **Tip shown:** _"Hum the first note quietly, then compare."_

#### Level 2 · Higher or lower?

- **You learn:** to hear which way a note moved.
- **Why it matters:** every tune is notes going up and down; this is the first step to playing
  one by ear.
- **Intro:** _"You'll hear two notes. Is the second one higher or lower than the first?
  'Higher' is the sound of a thinner string or a fret closer to your body."_
- **Buttons:** [ ⬆ Higher ] [ ⬇ Lower ]
- **Gets harder:** A — 7 or more frets apart. B — 3 to 5 frets. C — 1 or 2 frets.
- **Wrong answer:** plays both notes again, with an arrow showing the way they went.
- **Tip shown:** _"Many people mix up 'higher' and 'louder'. Higher means thinner, like a bird;
  lower means deeper, like a big drum."_

#### Level 3 · Up or down?

- **You learn:** to follow the shape of a short tune.
- **Intro:** _"You'll hear three notes. Does the tune go up or down?"_
- **Buttons:** A–B: [ ⬆ Up ] [ ⬇ Down ]. C adds two more: [ ⛰ Up, then down ] [ ⌄ Down, then up ].
- **Gets harder:** A — big steps. B — small steps (1–2 frets). C — the four shapes, mixed.
- **Wrong answer:** plays the tune again slowly, drawing its shape as dots going up or down.

#### Level 4 · Close or far?

- **You learn:** to feel the _distance_ between two notes.
- **Why it matters:** in a solo, most notes move to a close neighbour; a big jump stands out.
  Hearing this helps you guess where the next note is on the neck.
- **Intro:** _"You'll hear two notes. Are they close together, or far apart? Close means 1 or 2
  frets apart; far means a big jump."_
- **Buttons:** [ Close ] [ Far ]
- **Gets harder:** A — close is 1–2 frets, far is 7 or more. B — far is 5 frets. C — the notes
  can go up or down.
- **Wrong answer:** plays both, then shows the two notes on a small neck drawing, so the gap is
  seen as well as heard.

### Stage 2 · Feelings

Music makes us feel things. This stage names two of those feelings, which the rest of the levels
build on.

#### Level 5 · Happy or sad?

- **You learn:** to hear a **major** chord (happy, bright) and a **minor** chord (sad, dark).
- **Intro:** _"You'll hear a chord — several notes played together. Does it sound happy or sad?"_
  The names are given only at the end of the level: _"Musicians call the happy chord **major** and
  the sad one **minor**."_
- **You hear:** a strummed chord (like E or Em, A or Am).
- **Buttons:** [ 🙂 Happy ] [ 🙁 Sad ]
- **Gets harder:** A — strummed open chords. B — chords in different places on the neck.
  C — the chord's notes played one by one (an arpeggio), not together.
- **Wrong answer:** plays the happy and sad version of the same chord, one after the other.

#### Level 6 · Finished or not?

- **You learn:** the feeling of a tune that has come **home**, and one that has not.
- **Why it matters:** the "home" feeling is how you find a song's key. The next stage is all about
  it.
- **Intro:** _"You'll hear a few chords. Does it sound finished — like the end of a song — or does
  it sound like it should keep going?"_
- **You hear:** 4 chords. "Finished" ends on the home chord (A–D–E–**A**). "Not finished" stops
  somewhere else (A–D–A–**E**).
- **Buttons:** [ Finished ] [ Not finished ]
- **Gets harder:** A — slow, always in A. B — faster. C — other keys.
- **Wrong answer:** plays it again, then plays the home chord after it: _"Hear how this last chord
  settles it?"_

### Stage 3 · Finding the root

From here on, each question first plays a few chords (the same I–IV–V–I as the current trainer) to
set the key, and every answer also gives the **letter name** of the note.

#### Level 7 · Root or not?

- **You learn:** the **root** — the note that sounds like home.
- **Intro:** _"Every song has one note that feels like home: musicians call it the **root**. You'll
  hear some chords, then one note. Is it the root, or not?"_
- **Buttons:** [ 🏠 Root ] [ Not the root ]
- **Gets harder:** A — the other notes are ones that clearly "want to move" (2 and 7). B — any note
  of the scale. C — the root can also be played higher or lower (it is still the root).
- **Wrong answer:** when the note was _not_ the root, the app plays it **walking home** to the root
  (the existing "resolve to 1" sound): _"Hear how it wants to go home?"_
- **Feedback:** _"Right! That was the root — A."_

#### Level 8 · Root or 5?

- **You learn:** your first named note besides the root: the **5**, the strong, stable note above
  it.
- **Intro:** _"After the root, the most solid note is called **5**. It sounds strong, but not quite
  home. Musicians call the root **1**."_
- **Buttons:** [ 1 (root) ] [ 5 ]
- **Gets harder:** A — in A, 5 is always above 1. B — 5 can be below. C — other keys.
- **Feedback:** _"Right! That was 5 — the note E, in the key of A."_
- **Tip shown:** _"Power chords — the chords of rock music — are just 1 and 5 together."_

#### Level 9 · 1, 3 or 5 — happy

- **You learn:** the **3**, the note that makes a chord happy.
- **Intro:** _"Remember happy chords? They have three notes: 1, 3 and 5. The **3** is the one that
  makes them happy."_
- **Buttons:** [ 1 ] [ 3 ] [ 5 ]
- **Gets harder:** A — in A major. B — notes in any order and range. C — other keys.
- **Wrong answer:** plays the full happy chord, then the note on its own.

#### Level 10 · 1, ♭3 or 5 — sad

- **You learn:** the **♭3** ("flat 3"), the note that makes a chord sad. _"Flat" means one fret
  lower._
- **Intro:** _"Sad chords have a 3 that is one fret lower. Musicians call it **flat 3**, written
  ♭3. This is the note that makes the blues sound bluesy."_
- **Buttons:** [ 1 ] [ ♭3 ] [ 5 ]
- **Gets harder:** A — in A minor. B — any order and range. C — happy and sad keys mixed, with
  four buttons [ 1 ] [ ♭3 ] [ 3 ] [ 5 ]: is it the happy 3 or the sad ♭3?

### Stage 4 · The soloing notes

These are the notes of the **minor pentatonic scale**, which most rock and blues solos use — the
same scale the Practice page teaches. One new note per level, so it never gets too much at once.

#### Level 11 · Add ♭7

- **Intro:** _"One more note: **♭7**, one whole step (2 frets) below the root. It's the note that
  makes a riff sound like rock or blues."_
- **Buttons:** [ 1 ] [ ♭3 ] [ 5 ] [ ♭7 ]
- **Gets harder:** A — in A minor. B — any range. C — other keys.

#### Level 12 · Add 4 — the full minor pentatonic

- **Intro:** _"The last note of the scale: **4**. Now you know all five notes of the minor
  pentatonic: 1, ♭3, 4, 5, ♭7."_
- **Buttons:** [ 1 ] [ ♭3 ] [ 4 ] [ 5 ] [ ♭7 ]
- **Level done screen:** links to the Practice page with the A minor pentatonic open: _"Now play
  these notes on your guitar."_

#### Level 13 · The blues note

- **Intro:** _"Add one note between 4 and 5 — the **blue note**, written ♭5 — and the pentatonic
  becomes the **blues scale**. It sounds tense and gritty, and it always wants to move."_
- **Buttons:** [ 1 ] [ ♭3 ] [ 4 ] [ ♭5 ] [ 5 ] [ ♭7 ]
- **Wrong answer:** for ♭5, plays it sliding into 4 or 5, the way guitarists use it.

### Stage 5 · On your guitar

Now the ear meets the guitar in the learner's hands.

#### Level 14 · See it on the neck

- **You learn:** where each sound you know sits on the guitar.
- **Intro:** _"Same notes as before, but now you answer on the guitar neck: tap the fret where the
  note is, counting from the root."_
- **You answer:** on one string drawn on screen, the root marked at the start (the current
  trainer's answer strip). After each answer, the note lights up on a small neck window (the
  current "show on the neck" view).
- **Gets harder:** A — the minor pentatonic notes. B — with the blue note. C — other keys.

#### Level 15 · Find the root on your guitar

- **You learn:** the real-world skill: hear a song, find its root on your own guitar, and so know
  the letter names of the notes you hear.
- **Before starting:** _"Your guitar needs to be in tune."_ A button plays the six open strings
  (E A D G B E) to tune by ear, and links to any tuner app.
- **Intro:** _"You'll hear a short tune. Play along on your **thickest string**, one fret at a time,
  until a note sounds like home. Then tap that fret here."_
- **You answer:** tap a fret on a drawing of the thickest string (frets 0–12). The app shows the
  letter name: _"Fret 5 — that's A. The song is in A."_
- **Gets harder:** A — the tune keeps playing its root at the end, and keys are A, G, E or C. B —
  any key. C — the tune is a single melody with no chords.
- **Wrong answer:** _"Close! You picked fret 7 (B). The root was fret 5 (A). Play both and hear
  which one feels like home."_
- **The app cannot hear the guitar** (no microphone needed): the learner plays along themselves
  and only taps the answer.

## Skipping ahead

Under every stage not done yet (Stage 1 too, for a learner who already plays a little): **"I
already know this — test me"**. It is a 10-question mix of that stage's last steps, with no demo
and no "make it easier". 9 or more right marks that stage and every stage before it done, so the
next stage opens: _"Well done! You skipped Stage n."_ Otherwise _"Good try! Start from the first
level of this stage — it'll be quick."_: nothing is lost, and the test can be taken again.

## Words the levels teach, in order

| Level | Word             | Explained as                                    |
| ----- | ---------------- | ----------------------------------------------- |
| 5     | major, minor     | the happy chord, the sad chord                  |
| 7     | root             | the note that sounds like home                  |
| 8     | 1, 5             | the root is 1; 5 is the strong note above it    |
| 9     | 3                | the note that makes a chord happy               |
| 10    | ♭ (flat), ♭3     | one fret lower; the note that makes a chord sad |
| 11    | ♭7               | two frets below the root, the rock/blues note   |
| 12    | minor pentatonic | the five soloing notes                          |
| 13    | ♭5, blues scale  | the blue note; the pentatonic with it           |

These follow [`glossary.md`](glossary.md): the button says **Root** (never "home note"); "home" is
used only inside the sentence that explains it. In Vietnamese the terms stay in English (root,
pentatonic, blues…), with a short Vietnamese explanation the first time, as the glossary asks.

## Languages

All text in **English and Vietnamese** from the first build, like the rest of the site. The
learner-facing sentences in this plan are the English source; the Vietnamese translation follows
[`i18n.md`](i18n.md) and gets the same plain-language review.

## Building it

### Reused from the current ear trainer (behind the scenes)

- `audio/` — the guitar sound and the playback timeline.
- `core/context.ts` — the chords that set the key (Stage 3 on).
- `core/degrees.ts` — note spelling in every key (for the letter names in feedback).
- `core/resolution.ts` — "walking home" to the root after a wrong answer (level 7).
- `ui/NeckAnswer.tsx`, the answer strip in `ui/Trainer.tsx`, and `@shared/ui/Fretboard` — the neck
  views of Stage 5.
- `core/stats.ts` — per-note mistakes, to repeat the notes a learner mixes up more often.

### New

- `core/levels.ts` — the list of levels: their questions, answer buttons, difficulty steps and pass
  rule, as pure data (unit-tested).
- `core/round.ts` — one round: pick 10 questions, step difficulty up after 5 right in a row, offer
  "easier" after 4 wrong, decide the pass.
- New question kinds the current trainer does not have: two notes (levels 1, 2, 4), three-note
  tunes (level 3), chord quality (level 5), finished/not finished (level 6), find the root (level
  15).
- `store/` — progress per level (locked / step reached / best score / done) in `gm.ear`. The old
  trainer's saved settings and stats are dropped.
- `ui/` — the Welcome, Level map, Level intro, Question and End-of-round screens.

### Removed

- The settings card (`ui/Settings.tsx`, `ui/editSettings.ts`) and the stats card (`ui/Stats.tsx`).
- The "Name the degree" start screen.
- The link from the Practice page into the old trainer (`src/ui/earLink.ts`). Later, it can point
  to level 12 (the minor pentatonic).

### Order of work

1. **The level engine + Stage 1** (levels 1–4), with the Welcome, Level map, Question and End
   screens. This proves the whole flow with the simplest sounds.
2. **Stage 2** (levels 5–6). Then test both stages with a real beginner, and fix what confused
   them. **Then show "Ear training" in the menu again.**
3. **Stage 3** (levels 7–10).
4. **Stage 4** (levels 11–13), with the link to and from the Practice page.
5. **Stage 5** (levels 14–15) and "test me" for every stage.

Each step follows the repo's usual checks (lint, typecheck, tests, build) and ships both
languages.

## Decisions

Confirmed by the owner (#250):

- **Pass mark:** 8 of 10 in one round, on the level's last difficulty step.
- **Skipping ahead:** allowed per stage, with a 10-question test (9 right to pass).
- **Starting key:** A, before moving to other keys.
- **Languages:** English and Vietnamese from the start.
