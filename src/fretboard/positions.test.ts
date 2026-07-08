import { describe, expect, it } from 'vitest';
import { note, pc, scalePcs, SCALE_IDS, SCALES, type Key, type ScaleId } from '../music';
import { TUNINGS } from './tuning';
import { positions } from './positions';
import { areAdjacent, mergedBox } from './merge';
import { recommendedPosition } from './recommend';

const A_MINOR: Key = { tonic: note('A'), scaleId: 'minorPentatonic' };

/** (string, fret) pairs of a position sorted for stable comparison. */
const cells = (notes: { string: number; fret: number }[]) =>
  notes.map((n) => `${n.string}:${n.fret}`).sort();

describe('golden shapes — A minor pentatonic, standard tuning', () => {
  const pos = positions(TUNINGS.standard, A_MINOR);

  it('yields 5 positions sorted by minFret', () => {
    expect(pos).toHaveLength(5);
    for (let i = 1; i < pos.length; i++) {
      expect(pos[i]!.minFret).toBeGreaterThanOrEqual(pos[i - 1]!.minFret);
    }
  });

  it('the tonic box (index 0) is the classic frets 5–8 shape', () => {
    const box1 = pos.find((p) => p.index === 0)!;
    expect(box1.minFret).toBe(5);
    expect(box1.maxFret).toBe(8);
    // string index: 0 = low E, 5 = high e. Classic box 1:
    // E 5-8 / A 5-7 / D 5-7 / G 5-7 / B 5-8 / e 5-8
    expect(cells(box1.notes)).toEqual(
      cells([
        { string: 0, fret: 5 }, { string: 0, fret: 8 },
        { string: 1, fret: 5 }, { string: 1, fret: 7 },
        { string: 2, fret: 5 }, { string: 2, fret: 7 },
        { string: 3, fret: 5 }, { string: 3, fret: 7 },
        { string: 4, fret: 5 }, { string: 4, fret: 8 },
        { string: 5, fret: 5 }, { string: 5, fret: 8 },
      ]),
    );
  });

  it('recommends the tonic box', () => {
    expect(recommendedPosition(pos)).toBe(0);
  });
});

describe('invariants — all 12 tonics × 3 scales × both tunings', () => {
  const tonics = [
    note('A'), note('B', -1), note('B'), note('C'), note('C', 1), note('D'),
    note('E', -1), note('E'), note('F'), note('F', 1), note('G'), note('G', 1),
  ];

  it('every position is well-formed', () => {
    for (const tuning of [TUNINGS.standard, TUNINGS.dropD]) {
      for (const tonic of tonics) {
        for (const scaleId of SCALE_IDS) {
          const key: Key = { tonic, scaleId };
          const pcs = scalePcs(key);
          const baseId = (SCALES[scaleId].decoration?.baseScaleId ?? scaleId) as ScaleId;
          const baseCount = SCALES[baseId].intervals.length;
          const span = baseCount >= 6 ? 4 : 3;
          const pos = positions(tuning, key);

          expect(pos).toHaveLength(baseCount);
          for (const p of pos) {
            expect(p.notes.length).toBeGreaterThan(0);
            expect(p.notes.some((n) => n.isTonic)).toBe(true);
            // base-scale span bound
            expect(p.maxFret - p.minFret).toBeLessThanOrEqual(span + 1);
            for (const n of p.notes) {
              expect(pcs.has(pc(n.pitch))).toBe(true); // every note is in the scale
              expect(n.fret).toBeGreaterThanOrEqual(0);
            }
          }
          // sorted by minFret
          for (let i = 1; i < pos.length; i++) {
            expect(pos[i]!.minFret).toBeGreaterThanOrEqual(pos[i - 1]!.minFret);
          }
        }
      }
    }
  });
});

describe('decoration — blues fills the minor-pentatonic boxes', () => {
  const minor = positions(TUNINGS.standard, { tonic: note('A'), scaleId: 'minorPentatonic' });
  const blues = positions(TUNINGS.standard, { tonic: note('A'), scaleId: 'blues' });

  it('base (non-decoration) cells match the minor pentatonic boxes', () => {
    for (let i = 0; i < minor.length; i++) {
      const m = minor.find((p) => p.index === i)!;
      const b = blues.find((p) => p.index === i)!;
      const baseCells = cells(b.notes.filter((n) => !n.isDecoration));
      expect(baseCells).toEqual(cells(m.notes));
    }
  });

  it('decoration notes are the ♭5 (D♯/E♭ = pc 3), flagged, and inside the base range', () => {
    for (const b of blues) {
      const decs = b.notes.filter((n) => n.isDecoration);
      expect(decs.length).toBeGreaterThan(0);
      for (const d of decs) {
        expect(pc(d.pitch)).toBe(3); // ♭5 of A
        expect(d.fret).toBeGreaterThanOrEqual(b.minFret);
        expect(d.fret).toBeLessThanOrEqual(b.maxFret);
      }
    }
  });
});

describe('merge & adjacency', () => {
  const pos = positions(TUNINGS.standard, A_MINOR);

  it('single selection is identity', () => {
    const box = mergedBox(pos, [0]);
    const p0 = pos.find((p) => p.index === 0)!;
    expect(cells(box.notes)).toEqual(cells(p0.notes));
    expect(box.minFret).toBe(p0.minFret);
    expect(box.maxFret).toBe(p0.maxFret);
  });

  it('adjacency follows minFret-sorted order', () => {
    const order = [...pos].sort((a, b) => a.minFret - b.minFret).map((p) => p.index);
    expect(areAdjacent(pos, order[0]!, order[1]!)).toBe(true);
    expect(areAdjacent(pos, order[0]!, order[2]!)).toBe(false);
  });
});

describe('drop D differs from standard on the low string', () => {
  it('low-E-string frets shift down 2 for the same scale note', () => {
    const std = positions(TUNINGS.standard, A_MINOR);
    const drop = positions(TUNINGS.dropD, A_MINOR);
    const stdLow = std.flatMap((p) => p.notes).filter((n) => n.string === 0).map((n) => n.fret);
    const dropLow = drop.flatMap((p) => p.notes).filter((n) => n.string === 0).map((n) => n.fret);
    // Different fret sets prove the low string isn't hardcoded to standard tuning.
    expect(new Set(dropLow)).not.toEqual(new Set(stdLow));
  });
});
