import { describe, expect, it } from 'vitest';
import { scoreLick, type ScorableNote } from './score';

function note(overrides: Partial<ScorableNote> = {}): ScorableNote {
  return {
    string: 0,
    fret: 0,
    startBeat: 0,
    technique: undefined,
    isDecoration: false,
    ...overrides,
  };
}

describe('scoreLick', () => {
  it('returns 1 for empty notes', () => {
    expect(scoreLick([], 4)).toBe(1);
  });

  it('returns near-minimum score for sparse on-beat notes on one string', () => {
    // 4 on-beat notes on one string — no off-beats, no techniques, no decorations
    const notes = [
      note({ string: 0, fret: 0, startBeat: 0 }),
      note({ string: 0, fret: 2, startBeat: 1 }),
      note({ string: 0, fret: 4, startBeat: 2 }),
      note({ string: 0, fret: 5, startBeat: 3 }),
    ];
    // The minimum non-empty score, accounting for density + span contributions
    expect(scoreLick(notes, 4)).toBeLessThan(3);
  });

  it('scores higher with off-beat notes', () => {
    const onBeat = [
      note({ string: 0, fret: 0, startBeat: 0 }),
      note({ string: 0, fret: 2, startBeat: 1 }),
    ];
    const offBeat = [
      note({ string: 0, fret: 0, startBeat: 0 }),
      note({ string: 0, fret: 2, startBeat: 0.5 }),
    ];
    const onScore = scoreLick(onBeat, 4);
    const offScore = scoreLick(offBeat, 4);
    expect(offScore).toBeGreaterThan(onScore);
  });

  it('scores higher with wider fret span', () => {
    const narrow = [
      note({ string: 0, fret: 0, startBeat: 0 }),
      note({ string: 0, fret: 1, startBeat: 1 }),
    ];
    const wide = [
      note({ string: 0, fret: 0, startBeat: 0 }),
      note({ string: 0, fret: 12, startBeat: 1 }),
    ];
    expect(scoreLick(wide, 4)).toBeGreaterThan(scoreLick(narrow, 4));
  });

  it('scores higher with string crossings', () => {
    const noCross = [
      note({ string: 0, fret: 0, startBeat: 0 }),
      note({ string: 0, fret: 2, startBeat: 1 }),
      note({ string: 0, fret: 3, startBeat: 2 }),
    ];
    const cross = [
      note({ string: 0, fret: 0, startBeat: 0 }),
      note({ string: 2, fret: 5, startBeat: 1 }),
      note({ string: 4, fret: 8, startBeat: 2 }),
    ];
    expect(scoreLick(cross, 4)).toBeGreaterThan(scoreLick(noCross, 4));
  });

  it('scores higher with techniques', () => {
    const plain = [
      note({ string: 0, fret: 0, startBeat: 0 }),
      note({ string: 0, fret: 2, startBeat: 1 }),
    ];
    const withTech = [
      note({ string: 0, fret: 0, startBeat: 0 }),
      note({ string: 0, fret: 2, startBeat: 1, technique: 'slide' }),
    ];
    expect(scoreLick(withTech, 4)).toBeGreaterThan(scoreLick(plain, 4));
  });

  it('scores higher with decoration tones', () => {
    const plain = [
      note({ string: 0, fret: 0, startBeat: 0 }),
      note({ string: 0, fret: 2, startBeat: 1 }),
    ];
    const decorated = [
      note({ string: 0, fret: 0, startBeat: 0 }),
      note({ string: 0, fret: 2, startBeat: 1, isDecoration: true }),
    ];
    expect(scoreLick(decorated, 4)).toBeGreaterThan(scoreLick(plain, 4));
  });

  it('scores higher with denser note placement', () => {
    const sparse = [
      note({ string: 0, fret: 0, startBeat: 0 }),
      note({ string: 0, fret: 2, startBeat: 2 }),
    ];
    const dense = [
      note({ string: 0, fret: 0, startBeat: 0 }),
      note({ string: 0, fret: 1, startBeat: 0.25 }),
      note({ string: 0, fret: 2, startBeat: 0.5 }),
      note({ string: 0, fret: 3, startBeat: 0.75 }),
    ];
    expect(scoreLick(dense, 2)).toBeGreaterThan(scoreLick(sparse, 4));
  });

  it('returns a score between 1 and 5', () => {
    const notes = [
      note({ string: 0, fret: 0, startBeat: 0 }),
      note({ string: 1, fret: 3, startBeat: 0.5, technique: 'slide' }),
      note({ string: 2, fret: 5, startBeat: 1, isDecoration: true }),
      note({ string: 1, fret: 7, startBeat: 1.5 }),
      note({ string: 0, fret: 8, startBeat: 2 }),
      note({ string: 3, fret: 10, startBeat: 2.5, technique: 'bendFull' }),
      note({ string: 2, fret: 12, startBeat: 3 }),
      note({ string: 0, fret: 14, startBeat: 3.5 }),
    ];
    const score = scoreLick(notes, 4);
    expect(score).toBeGreaterThanOrEqual(1);
    expect(score).toBeLessThanOrEqual(5);
  });
});
