# Plan 02 — Music Core (`src/music/`)

## Goals

A pure, dependency-free music-theory library that every other layer builds on. It must fix the
mockup's two foundational flaws:

1. **Pitch classes only, sharps only** → we model *spelled* notes (F minor contains B♭, not A♯).
2. **Scales/chords as hardcoded special cases** → scales and chord qualities are **data entries in
   registries**; adding one is adding a record, never adding an `if`.

No React, no DOM, no randomness in this package.

## Pitch & interval model (`pitch.ts`, `interval.ts`)

```ts
type Letter = 'C'|'D'|'E'|'F'|'G'|'A'|'B';
interface NoteName { letter: Letter; alter: -2|-1|0|1|2 }   // alter: ♭♭..♯♯
interface Pitch extends NoteName { octave: number }          // scientific: A2 = open 5th string
type PitchClass = number;                                    // 0..11, C = 0

pc(n: NoteName): PitchClass
midi(p: Pitch): number                                       // C4 = 60
format(n: NoteName): string                                  // 'B♭', 'F♯' (unicode ♭/♯)
```

**Intervals carry letter distance, not just semitones** — this is what makes spelling automatic:

```ts
interface Interval { degrees: number; semitones: number }    // m3 = {2, 3}, P5 = {4, 7}
transpose(n: NoteName, iv: Interval): NoteName               // m3 above F = A♭ (never G♯)
transposePitch(p: Pitch, iv: Interval): Pitch
const IV = { P1, m2, M2, m3, M3, P4, d5, P5, m6, M6, m7, M7, P8 };  // named constants
```

`transpose` walks `degrees` letters up, then sets `alter` so the semitone count matches.
Result alters outside −2..2 (theoretical keys) are out of scope: the key picker only offers the
12 practical tonics below.

## Keys (`key.ts`)

```ts
interface Key { tonic: NoteName; scaleId: ScaleId }
```

Tonic picker list (covers all 12 pcs with conventional minor-key spellings, A first to match the
mockup UI): `A, B♭, B, C, C♯, D, E♭, E, F, F♯, G, G♯`. Store the **spelled tonic** in state, not a
pitch class — spelling is information we must not throw away.

## Scale registry (`scales.ts`)

```ts
interface ScaleDef {
  id: ScaleId;                        // 'minorPentatonic' | 'majorPentatonic' | 'blues' | ...
  name: string;                       // display name
  intervals: Interval[];              // from tonic, ascending, excluding octave
  decoration?: {                      // for "decorated" scales (see below)
    baseScaleId: ScaleId;             // whose box shapes we inherit
    addedIntervals: Interval[];       // passing tones filled inside the box
  };
}
```

v1 entries:

| id | intervals | decoration |
|---|---|---|
| `minorPentatonic` | P1 m3 P4 P5 m7 | — |
| `majorPentatonic` | P1 M2 M3 P5 M6 | — |
| `blues` (minor blues) | P1 m3 P4 d5 P5 m7 | base `minorPentatonic`, added `d5` |

**Decorated scales** formalize what the mockup hacked: box *shapes* come from the base scale's
positions; the added tones are filled wherever they fall inside the box's fret range (plan 03
consumes this). A future `majorBlues` = majorPentatonic + ♭3 is one registry row. 7-note scales
(dorian, aeolian, mixolydian…) are plain non-decorated entries — the box generator (plan 03)
handles any interval count.

Helpers: `scaleNoteNames(key): NoteName[]` (spelled via `transpose`), `scalePcs(key): Set<PitchClass>`.

## Chords with tone roles (`chords.ts`)

```ts
type ToneRole = 'R' | '3' | '5' | '7';                       // extensible: '9' | '11' | '13'
interface ChordQuality { id: QualityId; suffix: string; tones: { role: ToneRole; iv: Interval }[] }
interface Chord { root: NoteName; quality: QualityId }

chordLabel(ch): string                                       // 'B♭m7', 'E7', 'F'
chordTones(ch): { role: ToneRole; name: NoteName; pc: PitchClass }[]
```

Quality registry (v1): `maj [R,3(M3),5]`, `min [R,3(m3),5]`, `7 [R,M3,5,m7(7)]`,
`m7 [R,m3,5,m7]`, `maj7 [R,M3,5,M7]`, `dim [R,m3,d5(5)]`, `sus4 [R,P4('3' slot),5]`.
Roles are the point: they let the lick engine target "the 3rd of the current chord" and the UI
label a highlighted note as *3rd*, which pitch-class sets can never do.

## Harmony helpers (`harmony.ts`)

Per **scale id**, small data-driven tables (kept beside the scale registry so adding a scale
forces the question "what do we suggest for it?"):

```ts
defaultProgression(key): Chord[]      // spelled from the tonic via transpose
suggestedChords(key): { chord: Chord; numeral: string }[]   // numeral: 'i', '♭VII', 'IV7'…
```

| scale | default progression | suggestions (with numerals) |
|---|---|---|
| minorPentatonic | i–♭VII–♭VI–♭VII | i, ♭III, iv, v, ♭VI, ♭VII |
| majorPentatonic | I–V–vi–IV | I, ii, iii, IV, V, vi |
| blues | I7–IV7–I7–V7 (condensed 12-bar) | I7, IV7, V7, i, ♭III, iv, v |

Roman numerals appear as secondary labels on suggestion chips (plan 05) — cheap theory education.

## Tests (highest-value package to test — be thorough)

- `transpose`: table of spelling cases — m3 above F = A♭, M3 above E = G♯, m3 above C♯ = E,
  d5 above B♭ = F♭, P5 above F♯ = C♯ (~20 cases covering every interval constant, expectations
  taken from a reference table, not derived by the same code under test).
- `scaleNoteNames`: full spellings for F minorPentatonic (F A♭ B♭ C E♭), B♭ blues,
  E majorPentatonic; loop-assert that no note uses double accidentals for any of the 12 offered
  tonics × 3 scales. (Strict interval spelling can yield exotic-but-correct names like F♭ for the
  ♭5 in B♭ blues — accept these; consistency beats prettiness, and the offered tonic list avoids
  the truly ugly keys.)
- `chordTones`: roles and spellings for B♭m7, E7, Fmaj7, C♯dim.
- `harmony`: exact progressions/suggestions for A minorPentatonic (Am G F G), C majorPentatonic,
  A blues; every suggested chord's tones ⊆ … (not required — iv contains a non-scale tone; instead
  assert roots are scale members for non-blues suggestions).
- Registry invariants: interval lists strictly ascending in semitones, within one octave; decorated
  scales reference an existing base and their `intervals` = base ∪ added.

## Acceptance criteria

- [ ] No imports outside the package; fully deterministic.
- [ ] Adding a scale or chord quality = one registry entry + one harmony row, zero engine edits
      (prove it in review by describing the `majorBlues` diff).
- [ ] All 12 offered tonics spell correctly in all v1 scales (tested).
- [ ] Public API exported via `src/music/index.ts` and consumed by plans 03–05 without reaching
      into internals.
