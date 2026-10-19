import { describe, expect, it } from 'vitest';
import { format, mod, pc } from '@shared/core/music';
import { MIDDLE_RANGE, askedAnswers, findLevel, sameAnswer } from './levels';
import { findRootQuestion } from './stage5';

const level = findLevel(15)!;
const ask = (step: number, answer: number, seed: number) =>
  findRootQuestion(level, { level: 15, step, answer, seed });

describe('level 15: find the root', () => {
  it('the root of every key sits at its fret of the thickest string: E at 0 or 12, F at 1 … E♭ at 11', () => {
    const tonicAt = (fret: number) => format(ask(1, fret, 7).key.tonic);
    expect(askedAnswers(level, 1)).toEqual([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]);
    for (let fret = 0; fret <= 12; fret++)
      expect(mod(pc(ask(1, fret, fret).key.tonic) - 4, 12)).toBe(fret % 12);
    expect([0, 12, 1, 5, 11].map(tonicAt)).toEqual(['E', 'E', 'F', 'A', 'E♭']);
    expect(sameAnswer(level, 0, 12)).toBe(true);
    expect(sameAnswer(level, 5, 7)).toBe(false);
    // Step A: the beginner keys, A, G, E and C, only.
    expect(askedAnswers(level, 0)).toEqual([0, 3, 5, 8, 12]);
  });

  it('step A ends on the root, over chords; later steps may not; step C has no chords', () => {
    for (let seed = 0; seed < 40; seed++) {
      for (const fret of askedAnswers(level, 0) as number[]) {
        const a = ask(0, fret, seed);
        expect(a.melody[0]).toBe(a.melody.at(-1));
        expect(mod(a.melody.at(-1)! - pc(a.key.tonic), 12)).toBe(0);
        expect(a.chords).toHaveLength(4);
      }
      const c = ask(2, seed % 13, seed);
      expect(c.chords).toBeNull();
      expect(mod(c.melody[0]! - pc(c.key.tonic), 12)).toBe(0);
      for (const m of c.melody) expect(m).toBeGreaterThanOrEqual(MIDDLE_RANGE.low);
      for (const m of c.melody) expect(m).toBeLessThanOrEqual(MIDDLE_RANGE.high);
    }
    const endings = new Set(
      Array.from({ length: 40 }, (_, s) => mod(ask(1, 5, s).melody.at(-1)! - 57, 12)),
    );
    expect([...endings].sort((a, b) => a - b)).toEqual([3, 4, 7]);
  });

  it('is the same tune for the same seed', () => {
    expect(ask(1, 3, 99)).toEqual(ask(1, 3, 99));
  });
});
