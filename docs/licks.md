# How licks are made

The Practice page's licks come from `src/lick/`. This page explains the design so that changes to
it stay musical. The short version: **most licks are real phrases from a written vocabulary, fitted
to the moment**. The rest are generated, which keeps variety and covers what the vocabulary cannot
fit.

```
generateLick (generate.ts)
├── vocabulary route, ~75% of licks
│   ├── select.ts      pick a phrase for this chord, level and place in the progression; vary it
│   ├── realize.ts     resolve its pitches, finger it on the box, build the notes
│   └── vocabulary.ts  the phrases themselves (data)
└── generated route (fallback, ~25%)
    ├── rhythm.ts      a rhythm that breathes
    ├── phrase.ts      a motif-built line along a contour, scored for musical sense
    └── bends.ts, approach.ts, techniques.ts, vibrato.ts   articulation
```

## The solo, not the lick

`licksForState` (`src/state/selectors.ts`) generates the progression's licks in order and passes
each one:

- **`prevLastMidi`**: the previous lick's last note. The next lick starts on a common tone or the
  nearest chord tone (`voiceLeadingWeight`), so a chord change sounds like one line moving.
- **`arc`**: where this lick sits in the solo (`progressionArc`). The solo builds to a climax about
  70% of the way through and then settles. The landing note's register follows the arc.
- **`turnaround`**: set on the last chord. Turnaround phrases are offered almost only there.
- **`previousSource`**: the phrase the previous lick used, so the same one is not played twice in
  a row.

## The vocabulary (`vocabulary.ts`)

Each phrase is data written in musical terms, never frets, so it plays in any key, box and octave.
The fretboard rule "no hardcoded shape tables" still holds: fingering is always worked out by
`realize.ts`.

A note's pitch is one of:

| spec                      | meaning                                                                                                                                                                            |
| ------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `{ s }`                   | semitones above the reference: the key's tonic (`ref: 'key'`, blues vocabulary played over the whole progression) or the chord root (`ref: 'chord'`, lines that outline the chord) |
| `{ ct }`                  | a chord tone of the current chord, the nearest one                                                                                                                                 |
| `{ step }`                | scale steps from the note before (motifs that work in any scale)                                                                                                                   |
| `{ above }` / `{ below }` | the scale note above / the half step below the next note (enclosures, approaches)                                                                                                  |
| `{ target }`              | the landing: the chord tone the player asked for. Every phrase ends with one                                                                                                       |

A bend or release has no pitch spec. It follows from the note before it (half or whole step up,
then back to where the bend started).

### Adding a phrase

1. Add it to `PHRASES`, under the kind it belongs to. Give it a short comment saying what it is
   musically.
2. It must end with a `target` note that finishes exactly on the bar line (4 or 8 beats). There
   must be no overlaps, and notes flagged `chromatic` must move by half step to a neighbour.
   `vocabulary.test.ts` checks all of this.
3. Only write techniques (`tech`, `partner` for a double stop, `vibrato`) where they are the idiom.
   **Most phrases should have none**: a lick does not need a bend to be a lick, and a vocabulary
   where every phrase bends is just another formula. Below level 3 a phrase is played plain anyway.
4. `minLevel` is the lowest level it suits. The rhythm also sets a floor (`rhythmLevel`):
   halves and quarters for level 1, 8ths from 2, dotted values from 3, 16ths from 4.
5. You do not need to check that it fits every scale. A phrase whose notes are not in the box's
   scale (a major 3rd in minor pentatonic, say) is simply not offered there.

### Selection and variation (`select.ts`)

- Phrases are weighted by kind, by how close their level is to the requested one, and by
  context: turnarounds at the end, no immediate repeats.
- A few that fit are compared, and the one that best continues the solo (voice leading, arc)
  wins.
- Variations keep the vocabulary from sounding canned:
  - **displacement**: half a beat later, level 3 and up;
  - **a rest**: one inner note left out;
  - **call and response for 2-bar licks**: a one-bar phrase whose ending is changed to an open
    chord tone (the question), then the same phrase or another as the answer.

## On the card

A lick card names the kind of phrase it was built from next to "Lick" ("Lick · Bend", "Lick ·
Turnaround"), via `phraseKind(lick.source)`, so players practise each idiom by its name. A new
kind needs a `practice.phrase.<kind>` string in every locale.

## Playback (`src/audio/`)

`noteVelocity` accents beats 1 and 3, plays the "and"s lighter, and plays hammer-ons, pull-offs
and releases softer (they are not picked). Vibrato is laid on held notes after any glide, so a held
bend shakes at its top (`withVibrato` in `shared/core/audio/glide.ts`). A double stop is struck as
two notes at once.

## Tests that guard the musical intent

- **`vocabulary.test.ts`**:
  - the phrases are well formed;
  - most phrases have no technique;
  - every level has phrases;
  - realization (bends, releases, double stops, spelling);
  - selection (turnarounds, no immediate repeats, not every lick has a technique).
- **`phrase.test.ts`**: the generated route (motifs, contours, call and response, step approach,
  leap limits).
- **`solo.test.ts`**: voice leading across chord changes and the arc.
- **`generate.sweep.test.ts`**: the whole UI parameter space stays playable and lands on the
  requested chord tone.
