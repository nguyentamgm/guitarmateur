# Plan 04 — Lick Engine (`src/lick/`)

## Goals

Generate practice licks that are **musical, rhythmic, and graded by difficulty** — replacing the
mockup's rhythmless random walk. Three properties the mockup lacked, now first-class:

1. **Rhythm**: a lick is notes *in time* over a known chord duration, not a bag of pitches.
2. **Purpose**: licks *end on a target chord tone* ("land the target note" — the actual practice
   goal), with selectable target role (root/3rd/5th) and, at higher levels, resolution into the
   *next* chord.
3. **Difficulty**: a 1–5 level controls rhythm density, range, techniques, and physical cost —
   "simple to complex" is a scored, testable property.

Pure TS; imports `music/` + `fretboard/`. All randomness flows through an injected seeded RNG.

## Data model (`model.ts`)

```ts
type Technique = 'hammer' | 'pull' | 'slide' | 'bendHalf' | 'bendFull';
interface LickNote {
  string: number; fret: number;
  pitch: Pitch;
  startBeat: number;         // offset from lick start, in beats
  durationBeats: number;     // 0.25 = 16th, 0.5 = 8th, 1 = quarter, 1.5 = dotted, etc.
  technique?: Technique;     // articulation *into* this note from the previous one
  role?: ToneRole;           // chord-tone role vs. the card's chord, if any
}
interface Lick {
  notes: LickNote[];
  lengthBeats: number;       // v1: one 4/4 bar = 4 beats per chord
  difficulty: number;        // computed score, 1..5 scale
}
interface LickParams {
  level: 1|2|3|4|5;
  targetRole: 'R'|'3'|'5';
  resolveToNext: boolean;    // land on *next* chord's target at the bar line (M4)
  seed: number;
}
generateLick(box: Box, chord: Chord, next: Chord | null, params: LickParams): Lick
```

**Persistence contract** (plan 06 depends on this): a lick is fully determined by
`(box inputs, chord, next, params)` — same seed ⇒ identical lick. State stores params + seed,
never note arrays, so schema changes can't strand stale licks.

## RNG (`rng.ts`)

`mulberry32(seed)` (~10 lines, public domain) returning `() => number` in [0,1), plus
`choice`, `weightedChoice`, `int(lo,hi)` helpers. No `Math.random` anywhere in `src/lick/`
(lint-guard it with `no-restricted-properties`).

## Generation pipeline (`generate.ts` orchestrating one module per stage)

Stages run in order; each is a small pure function taking `(draft, ctx, rng)`:

### 1. Rhythm skeleton (`rhythm.ts`)
Pick a rhythm pattern for `lengthBeats` from a **per-level pattern library** (data, not code):

| level | pattern pool (examples for one 4/4 bar) |
|---|---|
| 1 | 4 quarters; 2 halves+... — sparse, on-beat (3–4 notes) |
| 2 | quarters + paired 8ths (4–6 notes) |
| 3 | straight 8ths, 8th rests, pickup starts (6–8 notes) |
| 4 | syncopation (off-beat starts, ties), 8th triplet groups (6–9 notes) |
| 5 | 16th pairs/runs, mixed tuplets (8–12 notes) |

The last note must start in the final beat (level 1–2: on beat 4; higher: allowed off-beat) and
sustain to the bar line — it's the landing note.

### 2. Contour & anchors (`contour.ts`)
Choose a contour: `ascend | descend | arch | valley | wave` (weights vary by level; level 1 favors
mono-directional). Fix the anchors: **last note = target tone** — the chord tone with
`params.targetRole` nearest an available box note (fallback order 3→5→R if the role is absent,
e.g. sus chords); when `resolveToNext`, the target comes from `next`. First note: a chord tone of
the current chord (any role), placed to give the contour room to move toward the target.

### 3. Path fill (`path.ts`)
Fill interior slots with box notes, walking from first anchor toward last: weighted choice
combining (a) physical proximity — the mockup's `1/(1.6·Δstring + Δfret + 1)²` idea survives here
as one factor, (b) contour direction adherence, (c) mild penalty for immediate repeats, (d) level
cap on total fret span and string skips (level 1: no skips, span ≤ 4; level 5: skips + full-box
span allowed). Decoration notes (blues ♭5) are passing tones: never on beat 1 or the landing slot,
and only from level 2 up.

### 4. Technique decoration (`techniques.ts`) — levels 3+ (ships in M4; stage is a no-op pass-through in M3)
Probabilistically (per level) convert eligible adjacent pairs: same-string ascending step ⇒
`hammer`, descending ⇒ `pull`, 2-fret same-string move ⇒ `slide`; level 5 may replace a step up
to a target tone with `bendHalf/bendFull` from below (bend target must be a scale tone). Cap:
≤ 1 technique per beat, none on the landing note before level 4.

### 5. Difficulty scoring & accept/retry (`score.ts`)
`score(lick): number` — weighted sum of note density (notes/beat), rhythmic complexity (off-beats,
tuplets), physical cost (span, string crossings, position shifts), technique count, decoration
usage; normalized to 1–5. Generator runs generate→score up to K=12 attempts (deterministic:
attempt i uses `seed + i`) keeping the first lick whose score is within ±0.75 of `params.level`;
otherwise keeps the closest-scoring attempt. This bounds worst-case work and guarantees output.

## Non-goals (v1)

Multi-bar licks per chord, swing feel, motif development across cards, vibrato notation,
melodic-minor-style chromatic approach tones. The stage architecture leaves room; don't build them.

## Tests

- **Determinism**: same inputs ⇒ deep-equal licks; different seeds ⇒ (almost always) different.
- **Invariant loop** (200 seeded runs × levels 1–5 × a progression in A minor pent + A blues):
  every note in the box; timing sums valid (notes sorted by `startBeat`, no overlap, last note
  sustains to bar line); landing note's pc = requested target role's pc (or documented fallback);
  level 1 has no techniques/16ths/decorations; level caps on span & skips respected.
- **Rhythm patterns**: every library pattern sums to `lengthBeats`, landing-slot rule holds.
- **Techniques**: hammers ascend / pulls descend on the same string; bends only to scale tones.
- **Score monotonicity** (statistical): mean score over 100 seeds strictly increases from level 1
  to 5.
- **resolveToNext**: landing pc comes from the next chord.

## Acceptance criteria

- [ ] `generateLick` is pure & deterministic; no `Math.random` in the package (lint-enforced).
- [ ] M3 ships levels 1–3 (stages 1–3 + scoring); M4 adds stage 4 and levels 4–5 without
      changing the public API or persisted shape of `LickParams`.
- [ ] All invariant/statistical tests pass in CI.
- [ ] The tab renderer (plan 05) can render every field of `LickNote` (rhythm + technique glyphs).
