import { describe, expect, it } from 'vitest';
import { mergedBox, areAdjacent } from './merge';
import type { Position } from './positions';

function pos(overrides: Partial<Position> & { index: number }): Position {
  return {
    notes: [],
    minFret: 0,
    maxFret: 0,
    ...overrides,
  };
}

function note(string: number, fret: number, isDecoration = false) {
  return {
    string,
    fret,
    pitch: { letter: 'C' as const, alter: 0 as const, octave: 4 },
    degree: 1,
    isTonic: false,
    isDecoration,
  };
}

describe('mergedBox', () => {
  it('returns an empty box when no positions are selected', () => {
    const positions: Position[] = [pos({ index: 0, minFret: 0, maxFret: 3 })];
    const box = mergedBox(positions, []);
    expect(box.notes).toEqual([]);
    expect(box.minFret).toBe(Infinity);
    expect(box.maxFret).toBe(-Infinity);
  });

  it('merges notes from selected positions', () => {
    const positions: Position[] = [
      pos({ index: 0, notes: [note(0, 0)], minFret: 0, maxFret: 3 }),
      pos({ index: 1, notes: [note(0, 5)], minFret: 4, maxFret: 7 }),
    ];
    const box = mergedBox(positions, [0, 1]);
    expect(box.notes).toHaveLength(2);
    expect(box.minFret).toBe(0);
    expect(box.maxFret).toBe(7);
  });

  it('deduplicates notes on the same (string, fret) cell', () => {
    const positions: Position[] = [
      pos({ index: 0, notes: [note(0, 5)], minFret: 3, maxFret: 7 }),
      pos({ index: 1, notes: [note(0, 5)], minFret: 3, maxFret: 7 }),
    ];
    const box = mergedBox(positions, [0, 1]);
    expect(box.notes).toHaveLength(1);
  });

  it('prefers a non-decoration note over a decoration on the same cell', () => {
    const positions: Position[] = [
      pos({ index: 0, notes: [note(0, 5, true)] }),    // decoration
      pos({ index: 1, notes: [note(0, 5, false)] }),   // base
    ];
    const box = mergedBox(positions, [0, 1]);
    expect(box.notes).toHaveLength(1);
    expect(box.notes[0]!.isDecoration).toBe(false);
  });

  it('computes span across the union of selected positions', () => {
    const positions: Position[] = [
      pos({ index: 0, notes: [note(0, 0)], minFret: 0, maxFret: 4 }),
      pos({ index: 1, notes: [note(0, 5)], minFret: 5, maxFret: 9 }),
      pos({ index: 2, notes: [note(0, 10)], minFret: 10, maxFret: 14 }),
    ];
    const box = mergedBox(positions, [0, 2]); // skip middle
    expect(box.minFret).toBe(0);
    expect(box.maxFret).toBe(14);
  });
});

describe('areAdjacent', () => {
  it('returns true for neighboring positions in fret order', () => {
    const positions: Position[] = [
      pos({ index: 0, minFret: 0, maxFret: 3 }),
      pos({ index: 1, minFret: 4, maxFret: 7 }),
      pos({ index: 2, minFret: 8, maxFret: 11 }),
    ];
    expect(areAdjacent(positions, 0, 1)).toBe(true);
    expect(areAdjacent(positions, 1, 2)).toBe(true);
  });

  it('returns false for non-neighboring positions', () => {
    const positions: Position[] = [
      pos({ index: 0, minFret: 0, maxFret: 3 }),
      pos({ index: 1, minFret: 4, maxFret: 7 }),
      pos({ index: 2, minFret: 8, maxFret: 11 }),
    ];
    expect(areAdjacent(positions, 0, 2)).toBe(false);
  });

  it('works regardless of argument order', () => {
    const positions: Position[] = [
      pos({ index: 0, minFret: 0, maxFret: 3 }),
      pos({ index: 1, minFret: 4, maxFret: 7 }),
    ];
    expect(areAdjacent(positions, 0, 1)).toBe(true);
    expect(areAdjacent(positions, 1, 0)).toBe(true);
  });

  it('uses minFret order, not index order', () => {
    // Position 2 has lower minFret than position 0
    const positions: Position[] = [
      pos({ index: 0, minFret: 5, maxFret: 8 }),
      pos({ index: 1, minFret: 9, maxFret: 12 }),
      pos({ index: 2, minFret: 0, maxFret: 3 }),
    ];
    // In fret order: 2 (0-3) → 0 (5-8) → 1 (9-12)
    expect(areAdjacent(positions, 2, 0)).toBe(true);
    expect(areAdjacent(positions, 0, 1)).toBe(true);
    expect(areAdjacent(positions, 2, 1)).toBe(false);
  });

  it('returns false for unknown indices', () => {
    const positions: Position[] = [
      pos({ index: 0, minFret: 0, maxFret: 3 }),
    ];
    expect(areAdjacent(positions, 0, 99)).toBe(false);
    expect(areAdjacent(positions, 99, 0)).toBe(false);
  });
});
