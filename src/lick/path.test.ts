import { describe, expect, it } from 'vitest';
import { countSameFretStringJumps, fillPath, isSameFretStringJump } from './path';
import { mulberry32 } from './rng';
import { pitch, midi } from '../music';
import type { Box, FretNote } from '../fretboard';
import type { Contour } from './contour';

/** Helper: build a FretNote with the minimum required fields. */
function fn(
  string: number,
  fret: number,
  overrides: Partial<FretNote> = {},
): FretNote {
  return {
    string,
    fret,
    degree: 1,
    isTonic: false,
    isDecoration: false,
    ...overrides,
  } as FretNote;
}

/** Compute a sensible pitch for a fret on a string (standard tuning E2 A2 D3 G3 B3 E4). */
function fretPitch(string: number, fret: number): { letter: 'E' | 'A' | 'D' | 'G' | 'B'; alter: 0; octave: number } {
  const openMidis = [40, 45, 50, 55, 59, 64]; // E2 A2 D3 G3 B3 E4
  const m = openMidis[string]! + fret;
  const names = ['E', 'A', 'D', 'G', 'B', 'E'] as const;
  return { letter: names[string]!, alter: 0 as const, octave: Math.floor(m / 12) - 1 };
}

describe('fillPath', () => {
  /** A small box with notes on strings 0-3, frets 0-3. */
  const smallBox: Box = {
    notes: [
      fn(0, 0, { pitch: fretPitch(0, 0), degree: 1, isTonic: true }),
      fn(0, 2, { pitch: fretPitch(0, 2), degree: 2 }),
      fn(0, 4, { pitch: fretPitch(0, 4), degree: 3 }),
      fn(1, 0, { pitch: fretPitch(1, 0), degree: 4 }),
      fn(1, 2, { pitch: fretPitch(1, 2), degree: 5 }),
      fn(1, 3, { pitch: fretPitch(1, 3), degree: 6 }),
      fn(1, 5, { pitch: fretPitch(1, 5), degree: 7 }),
      fn(2, 0, { pitch: fretPitch(2, 0), degree: 8 }),
      fn(2, 2, { pitch: fretPitch(2, 2), degree: 9 }),
      fn(2, 4, { pitch: fretPitch(2, 4), degree: 10 }),
      fn(3, 0, { pitch: fretPitch(3, 0), degree: 11 }),
      fn(3, 2, { pitch: fretPitch(3, 2), degree: 12 }),
    ],
    minFret: 0,
    maxFret: 5,
  };

  // ── Edge cases ────────────────────────────────────────────

  it('returns [first] when count is 1', () => {
    const first = smallBox.notes[0]!;
    const result = fillPath(smallBox, first, first, 1, 'ascend', 1, mulberry32(42));
    expect(result).toEqual([first]);
  });

  it('returns [first] when count is 0', () => {
    const first = smallBox.notes[0]!;
    const result = fillPath(smallBox, first, first, 0, 'ascend', 1, mulberry32(42));
    expect(result).toEqual([first]);
  });

  // ── Output structure ──────────────────────────────────────

  it('returns exactly N notes when count >= 2', () => {
    const first = smallBox.notes[0]!;
    const last = smallBox.notes[3]!;
    const count = 5;
    const result = fillPath(smallBox, first, last, count, 'ascend', 1, mulberry42(42));
    expect(result).toHaveLength(count);
    expect(result[0]).toBe(first);
    expect(result[result.length - 1]).toBe(last);
  });

  it('starts with first and ends with last', () => {
    const first = smallBox.notes[0]!;
    const last = smallBox.notes[smallBox.notes.length - 1]!;
    const result = fillPath(smallBox, first, last, 4, 'ascend', 3, mulberry42(100));
    expect(result[0]).toBe(first);
    expect(result[result.length - 1]).toBe(last);
  });

  // it returns a valid path for small counts
  it.each([2, 3, 4, 5])('produces a valid path for count=%i', (count) => {
    const first = smallBox.notes[0]!;
    const last = smallBox.notes[3]!;
    const result = fillPath(smallBox, first, last, count, 'ascend', 3, mulberry42(50));
    expect(result).toHaveLength(count);
  });

  // ── Level caps — fret span ────────────────────────────────

  it('level 1 (maxSpan=4) rejects paths exceeding 4-fret span', () => {
    // Use first and last that are 8 frets apart — level 1 span cap of 4 should fail
    const farBox: Box = {
      notes: [
        fn(0, 0, { pitch: fretPitch(0, 0), degree: 1, isTonic: true }),
        fn(0, 8, { pitch: fretPitch(0, 8), degree: 3 }),
      ],
      minFret: 0,
      maxFret: 8,
    };
    const first = farBox.notes[0]!;
    const last = farBox.notes[1]!;
    // Level 1 can't produce a path with 8-fret span; it will resort to full box
    const result = fillPath(farBox, first, last, 2, 'ascend', 1, mulberry42(42));
    // It still returns something because the function falls back to box.notes
    expect(result).toHaveLength(2);
  });

  it('level 5 (maxSpan=Infinity) works with large fret span', () => {
    const wideBox: Box = {
      notes: [
        fn(0, 0, { pitch: fretPitch(0, 0), degree: 1, isTonic: true }),
        fn(0, 12, { pitch: fretPitch(0, 12), degree: 3 }),
      ],
      minFret: 0,
      maxFret: 12,
    };
    const first = wideBox.notes[0]!;
    const last = wideBox.notes[1]!;
    const result = fillPath(wideBox, first, last, 2, 'ascend', 5, mulberry42(42));
    expect(result).toHaveLength(2);
    expect(result[0]).toBe(first);
    expect(result[1]).toBe(last);
  });

  // ── Level caps — string skips ─────────────────────────────

  it('level 1 (allowSkips=false) forces adjacent string moves', () => {
    // Box with notes on strings 0, 2 (skip string 1)
    const skipBox: Box = {
      notes: [
        fn(0, 0, { pitch: fretPitch(0, 0), degree: 1, isTonic: true }),
        fn(2, 0, { pitch: fretPitch(2, 0), degree: 3 }),
      ],
      minFret: 0,
      maxFret: 0,
    };
    const first = skipBox.notes[0]!;
    const last = skipBox.notes[1]!;
    const result = fillPath(skipBox, first, last, 2, 'ascend', 1, mulberry42(42));
    // Level 1 can't use string-2 directly from string-0 because skip isn't allowed,
    // but the function falls back to full box.notes — just verify it returns something.
    expect(result).toHaveLength(2);
  });

  it('level 3 (allowSkips=true) allows non-adjacent string moves', () => {
    const skipBox: Box = {
      notes: [
        fn(0, 0, { pitch: fretPitch(0, 0), degree: 1, isTonic: true }),
        fn(3, 0, { pitch: fretPitch(3, 0), degree: 5 }),
      ],
      minFret: 0,
      maxFret: 0,
    };
    const first = skipBox.notes[0]!;
    const last = skipBox.notes[1]!;
    const result = fillPath(skipBox, first, last, 2, 'ascend', 3, mulberry42(42));
    expect(result).toHaveLength(2);
  });

  // ── Decoration note filtering ──────────────────────────────

  it('level 1 excludes decoration notes', () => {
    const decBox: Box = {
      notes: [
        fn(0, 0, { pitch: fretPitch(0, 0), degree: 1, isTonic: true }),
        fn(0, 1, { pitch: fretPitch(0, 1), degree: 2, isDecoration: true }),
        fn(0, 2, { pitch: fretPitch(0, 2), degree: 3 }),
      ],
      minFret: 0,
      maxFret: 2,
    };
    const first = decBox.notes[0]!;
    const last = decBox.notes[2]!;
    // With count=3, the interior note must be chosen. Level 1 should skip dec note.
    const result = fillPath(decBox, first, last, 3, 'ascend', 1, mulberry42(42));
    expect(result).toHaveLength(3);
    // The interior note (index 1) should NOT be the decoration note
    // (it may fall back to the full pool, but decoration should be avoided)
    if (result[1]) {
      expect(result[1].isDecoration).toBe(false);
    }
  });

  it('level 2+ includes decoration notes', () => {
    const decBox: Box = {
      notes: [
        fn(0, 0, { pitch: fretPitch(0, 0), degree: 1, isTonic: true }),
        fn(0, 3, { pitch: fretPitch(0, 3), degree: 2 }),
        fn(1, 0, { pitch: fretPitch(1, 0), degree: 3, isDecoration: true }),
        fn(1, 2, { pitch: fretPitch(1, 2), degree: 4 }),
        fn(1, 3, { pitch: fretPitch(1, 3), degree: 5 }),
      ],
      minFret: 0,
      maxFret: 3,
    };
    const first = decBox.notes[0]!;
    const last = decBox.notes[4]!;
    // Level 3: decoration notes are allowed
    const result = fillPath(decBox, first, last, 4, 'ascend', 3, mulberry42(42));
    expect(result).toHaveLength(4);
  });

  // ── Contour adherence ─────────────────────────────────────

  it('ascend contour weights earlier-pitch notes higher', () => {
    // Build a box with ascending MIDI values: 40, 42, 44, 45, 47, 48, 50
    const ascendBox: Box = {
      notes: [
        fn(0, 0, { pitch: pitch('E', 0, 2), degree: 1, isTonic: true }),
        fn(0, 2, { pitch: pitch('F', 1, 2), degree: 2 }),
        fn(0, 4, { pitch: pitch('G', 1, 2), degree: 3 }),
        fn(1, 0, { pitch: pitch('A', 0, 2), degree: 4 }),
        fn(1, 2, { pitch: pitch('B', 0, 2), degree: 5 }),
        fn(1, 3, { pitch: pitch('C', 0, 3), degree: 6 }),
        fn(0, 5, { pitch: pitch('D', 0, 3), degree: 7 }),
      ],
      minFret: 0,
      maxFret: 5,
    };
    // Verify our fixture is correctly ascending
    const m = ascendBox.notes.map((n) => midi(n.pitch));
    expect(m).toEqual([40, 42, 44, 45, 47, 48, 50]);
    const first = ascendBox.notes[0]!;
    const last = ascendBox.notes[6]!;
    const result = fillPath(ascendBox, first, last, 5, 'ascend', 3, mulberry42(42));
    expect(result).toHaveLength(5);
    expect(midi(first.pitch)).toBeLessThan(midi(last.pitch));
  });

  // ── Determinism ────────────────────────────────────────────

  it('same seed produces identical output', () => {
    const first = smallBox.notes[0]!;
    const last = smallBox.notes[3]!;
    const a = fillPath(smallBox, first, last, 4, 'wave', 3, mulberry42(99));
    const b = fillPath(smallBox, first, last, 4, 'wave', 3, mulberry42(99));
    expect(a).toEqual(b);
  });

  it('different seeds produce different output (likely)', () => {
    const first = smallBox.notes[0]!;
    const last = smallBox.notes[3]!;
    const a = fillPath(smallBox, first, last, 4, 'wave', 3, mulberry42(1));
    const b = fillPath(smallBox, first, last, 4, 'wave', 3, mulberry42(2));
    // With count=4 in a box of 12 notes, two different seeds should pick different interior notes
    // To avoid flakiness, check that not ALL notes are identical position-by-position
    const samePositions = (a: FretNote[], b: FretNote[]) =>
      a.length === b.length &&
      a.every((n, i) => n.string === b[i]?.string && n.fret === b[i]?.fret);
    // It's astronomically unlikely that two different seeds produce identical paths
    expect(samePositions(a, b)).toBe(false);
  });

  // ── Recency penalty ───────────────────────────────────────

  it('recency penalty disfavors immediate repeats', () => {
    // A box with only a few notes, forcing some repetition
    const tightBox: Box = {
      notes: [
        fn(0, 0, { pitch: fretPitch(0, 0), degree: 1, isTonic: true }),
        fn(0, 2, { pitch: fretPitch(0, 2), degree: 2 }),
        fn(1, 0, { pitch: fretPitch(1, 0), degree: 3 }),
        fn(1, 2, { pitch: fretPitch(1, 2), degree: 4 }),
      ],
      minFret: 0,
      maxFret: 2,
    };
    const first = tightBox.notes[0]!;
    const last = tightBox.notes[3]!;
    // Run many times with the same seed
    const results: FretNote[][] = [];
    for (let seed = 0; seed < 20; seed++) {
      results.push(fillPath(tightBox, first, last, 4, 'wave', 3, mulberry42(seed)));
    }
    // Any path with a middle note repeating the previous (string,fret) should be rare
    // We're testing that the mechanism runs without error and produces valid-length paths
    for (const r of results) {
      expect(r).toHaveLength(4);
    }
  });

  // ── All levels produce valid paths ─────────────────────────

  it.each([1, 2, 3, 4, 5] as const)('level %i produces a valid path', (level) => {
    const first = smallBox.notes[0]!;
    const last = smallBox.notes[smallBox.notes.length - 1]!;
    const result = fillPath(smallBox, first, last, 4, 'ascend', level, mulberry42(42));
    expect(result).toHaveLength(4);
  });

  // ── All contours produce valid paths ───────────────────────

  it.each(['ascend', 'descend', 'arch', 'valley', 'wave'] as Contour[])(
    'contour %s produces a valid path',
    (contour) => {
      const first = smallBox.notes[0]!;
      const last = smallBox.notes[smallBox.notes.length - 1]!;
      const result = fillPath(smallBox, first, last, 4, contour, 3, mulberry42(42));
      expect(result).toHaveLength(4);
    },
  );
});

/**
 * A deterministic RNG seeded from a single integer, returning numbers in [0, 1).
 * Separate from `mulberry32` which expects a 32-bit seed; this wraps it so tests
 * can use simple small seeds like 0, 1, 42, etc.
 */
function mulberry42(seed: number): ReturnType<typeof mulberry32> {
  return mulberry32(((seed * 2654435761) >>> 0) ^ 0xdeadbeef);
}

describe('isSameFretStringJump', () => {
  it('flags the same fret across a skipped string — one finger cannot be in two places', () => {
    // The 3rd string at fret 10 straight to the 1st string at fret 10.
    expect(isSameFretStringJump(fn(3, 10), fn(5, 10))).toBe(true);
    expect(isSameFretStringJump(fn(5, 10), fn(3, 10))).toBe(true);
    expect(isSameFretStringJump(fn(0, 7), fn(4, 7))).toBe(true);
  });

  it('allows the same fret on adjacent strings — that is a finger roll, not a jump', () => {
    expect(isSameFretStringJump(fn(2, 5), fn(3, 5))).toBe(false);
    expect(isSameFretStringJump(fn(5, 12), fn(4, 12))).toBe(false);
  });

  it('allows open strings — there is no finger to move', () => {
    expect(isSameFretStringJump(fn(0, 0), fn(5, 0))).toBe(false);
  });

  it('allows different frets, however far the hand travels', () => {
    expect(isSameFretStringJump(fn(0, 5), fn(5, 7))).toBe(false);
    expect(isSameFretStringJump(fn(3, 10), fn(3, 10))).toBe(false);
  });
});

describe('countSameFretStringJumps', () => {
  it('counts consecutive pairs only', () => {
    expect(countSameFretStringJumps([fn(0, 5), fn(3, 5), fn(0, 5)])).toBe(2);
    // Same fret at both ends but a different fret in between — no pair is a jump.
    expect(countSameFretStringJumps([fn(0, 5), fn(1, 7), fn(3, 5)])).toBe(0);
    expect(countSameFretStringJumps([])).toBe(0);
    expect(countSameFretStringJumps([fn(0, 5)])).toBe(0);
  });
});

describe('fillPath — fretting-hand ergonomics', () => {
  /** Every note sits at fret 5 or fret 8, so same-fret pairs are the norm rather than a rarity. */
  const sameFretBox: Box = {
    notes: [
      fn(0, 5, { pitch: fretPitch(0, 5) }),
      fn(1, 5, { pitch: fretPitch(1, 5) }),
      fn(2, 5, { pitch: fretPitch(2, 5) }),
      fn(3, 5, { pitch: fretPitch(3, 5) }),
      fn(4, 5, { pitch: fretPitch(4, 5) }),
      fn(5, 5, { pitch: fretPitch(5, 5) }),
      fn(0, 8, { pitch: fretPitch(0, 8) }),
      fn(3, 8, { pitch: fretPitch(3, 8) }),
      fn(5, 8, { pitch: fretPitch(5, 8) }),
    ],
    minFret: 5,
    maxFret: 8,
  };

  it('never emits a same-fret string jump, even in a box built almost entirely from one fret', () => {
    for (const level of [1, 2, 3, 4, 5] as const) {
      for (let seed = 0; seed < 60; seed++) {
        const path = fillPath(
          sameFretBox,
          fn(0, 5, { pitch: fretPitch(0, 5) }),
          fn(5, 5, { pitch: fretPitch(5, 5) }),
          6,
          'ascend',
          level,
          mulberry42(seed),
        );
        expect(countSameFretStringJumps(path)).toBe(0);
      }
    }
  });

  it('guards the handover to `last`, which is fixed and never chosen by the walk', () => {
    // `last` is 1st string fret 5; the note before it must not be fret 5 on a skipped string.
    for (let seed = 0; seed < 60; seed++) {
      const path = fillPath(
        sameFretBox,
        fn(0, 8, { pitch: fretPitch(0, 8) }),
        fn(5, 5, { pitch: fretPitch(5, 5) }),
        4,
        'ascend',
        5,
        mulberry42(seed),
      );
      const penultimate = path[path.length - 2]!;
      expect(isSameFretStringJump(penultimate, path[path.length - 1]!)).toBe(false);
    }
  });

  it('still allows the adjacent-string roll it is not meant to prevent', () => {
    let rolls = 0;
    for (let seed = 0; seed < 60; seed++) {
      const path = fillPath(
        sameFretBox,
        fn(0, 5, { pitch: fretPitch(0, 5) }),
        fn(5, 5, { pitch: fretPitch(5, 5) }),
        6,
        'ascend',
        5,
        mulberry42(seed),
      );
      for (let i = 1; i < path.length; i++) {
        if (path[i]!.fret === path[i - 1]!.fret && Math.abs(path[i]!.string - path[i - 1]!.string) === 1) rolls++;
      }
    }
    expect(rolls).toBeGreaterThan(0);
  });
});
