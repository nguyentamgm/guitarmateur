# Plan 03 — Fretboard Engine (`src/fretboard/`)

## Goals

Map the abstract music core onto a physical guitar neck — **algorithmically**. The mockup's
hardcoded `PENTA` shape table is the single biggest scaling blocker; here, positions/boxes are
*generated* from `(tuning, key, scale)`, so new scales and new tunings need zero new shape data.

Pure TS; imports `src/music/` only.

## Tunings (`tuning.ts`)

```ts
interface Tuning { id: string; name: string; strings: Pitch[] }  // index 0 = lowest-pitched string
const TUNINGS = {
  standard: { strings: [E2, A2, D3, G3, B3, E4] },
  dropD:    { strings: [D2, A2, D3, G3, B3, E4] },
};
```

v1 UI only exposes `standard`; `dropD` exists from day one to keep every function honestly
tuning-parameterized (and is exercised in tests). String count is `tuning.strings.length` —
never a literal `6` in engine code. (UI renders strings high-to-low visually; that's a rendering
concern, not an engine one.)

## Notes on the neck (`neck.ts`)

```ts
interface FretNote {
  string: number;            // index into tuning.strings
  fret: number;              // 0 = open
  pitch: Pitch;              // absolute, spelled via the scale context
  degree: number;            // 1-based index into the scale's interval list
  isTonic: boolean;
  isDecoration: boolean;     // added tone of a decorated scale (blues ♭5)
}
scaleNotesOnNeck(tuning, key, scaleId, maxFret = 22): FretNote[]
```

Spelling: a fret's pitch class is matched against `scaleNoteNames(key)`; scale members get the
scale's spelling. (Non-scale notes aren't emitted in v1.)

## Position generation (`positions.ts`) — the core algorithm

A **position** is a playable window of the scale. For an N-note scale there are N positions, one
starting on each scale degree. Generation for position with starting degree `d`:

1. **Anchor**: on the lowest string, find the lowest fret ≥ 0 whose note is degree `d`.
2. **Walk the scale upward across strings**, lowest string first. Maintain a cursor = next scale
   degree to place. For each string, place ascending scale notes as long as the candidate fret
   lies within the position's span window; when the next note's fret on the current string would
   exceed `anchorFret + span`, move to the next string (candidate fret = lowest fret on that
   string ≥ `anchorFret − 1` producing the cursor degree, adjusting for the tuning's string
   intervals — the B-string offset falls out naturally because we search actual frets, never
   copy shapes between strings).
3. `span` default: 3 for pentatonic-family (yields the classic 2-notes-per-string boxes on
   standard tuning), 4 for scales with ≥ 6 base notes. Expose as an option; don't overfit.
4. **Normalization**: if the anchor pushes the whole box above fret 12+span, subtract 12 (boxes
   repeat at the octave); prefer the lowest playable placement, allowing open strings.
5. Result:

```ts
interface Position {
  index: number;             // 0..N-1, by starting degree
  notes: FretNote[];
  minFret: number; maxFret: number;   // computed from base-scale notes only
}
positions(tuning, key, scaleId): Position[]   // sorted by minFret (display order)
```

**Decorated scales** (blues): generate positions from the **base scale** (`decoration.baseScaleId`),
then for each added interval, insert every matching note inside `[minFret, maxFret]` on every
string (skipping frets already occupied), flagged `isDecoration: true`. Added tones never widen
the box — they fill it. This turns the mockup's blues `if`-patch into a general mechanism.

**Sanity check for correctness** (encode as a test, not a belief): for A minorPentatonic on
standard tuning, the 5 generated positions must equal the 5 classic boxes — position starting on
the tonic spans frets 5–8 with the familiar shape (2 notes per string:
e 5-8 / B 5-8 / G 5-7 / D 5-7 / A 5-7 / E 5-8). If the generator disagrees with the classic
shapes, the generator is wrong.

## Merged boxes (`merge.ts`)

```ts
mergedBox(positions: Position[], selected: number[]): Box
// Box = { notes: FretNote[]; minFret; maxFret }
```

Union of 1–2 positions' notes deduped by `(string, fret)`; min/max across the selection.
Adjacency rule for the UI (selectable pairs must be neighbors in the minFret-sorted order) lives
here as `areAdjacent(positions, a, b)` so it's testable without React.

## Recommendation (`recommend.ts`)

`recommendedPosition(positions): number` — v1: the position containing the lowest-fret tonic
anchor (replicates the mockup's "REC" badge sensibly). Kept as a function so smarter heuristics
(user level, previous practice) can slot in later.

## Tests

- **Golden shapes**: A minorPentatonic standard tuning → the 5 classic boxes, exact
  `(string, fret)` sets and fret ranges (the sanity check above, plus one more key, e.g. G).
- **Invariants across all 12 tonics × 3 scales × both tunings** (loop):
  every position note's pc ∈ scale pcs; degrees cycle correctly; `maxFret − minFret ≤ span + 1`;
  each position contains ≥ 1 tonic; positions count = base-scale note count; sorted by minFret.
- **Decoration**: blues boxes = minorPentatonic boxes ∪ ♭5 notes; all decorations flagged, inside
  the base range, none colliding with base notes.
- **Merge**: dedupe on shared notes; single selection = identity; adjacency matrix for the sorted
  order (0-1 ✓, 0-2 ✗).
- **Drop D**: positions still satisfy all invariants; lowest string frets differ from standard
  (proves nothing is silently hardcoded to standard tuning).

## Acceptance criteria

- [ ] Zero shape tables in the codebase; delete-proof: adding `dorian` to the scale registry
      yields 7 valid positions with no fretboard-engine changes.
- [ ] Golden-shape tests pass (generated boxes = classic pentatonic boxes).
- [ ] All invariant loops pass for both tunings.
- [ ] Public API via `src/fretboard/index.ts`: `TUNINGS, scaleNotesOnNeck, positions, mergedBox,
      areAdjacent, recommendedPosition` + types.
