import { describe, expect, it } from 'vitest';
import { mulberry32 } from '@shared/core/rng';
import { TONICS, midi, note, pitchAt, type NoteName } from '../music';
import { TUNINGS, positions, mergedBox } from '../fretboard';
import { applyBends, isBendFrom } from './bends';
import { generateLick } from './index';
import type { LickNote } from './model';

const A = TONICS.find((t) => t.letter === 'A' && t.alter === 0)!;
const a7 = { tonic: A, quality: 'dom7' as const };
const A_PC = 9;
const TOP = 5;

/** A note on string `s` (0 = low E) at `fret`, in standard tuning. */
function at(s: number, fret: number, name: NoteName, startBeat: number, durationBeats = 0.5): LickNote {
  const open = [40, 45, 50, 55, 59, 64][s]!;
  return { string: s, fret, pitch: pitchAt(name, open + fret), startBeat, durationBeats };
}

describe('applyBends', () => {
  // G string: D (fret 7, the 4th of A) → E (fret 9, the 5th), then a landing on A (B string 10).
  const fourToFive = [at(3, 7, note('D'), 0), at(3, 9, note('E'), 0.5), at(4, 10, note('A'), 1, 3)];

  it('bends the 4th up to the 5th, written as the 4th cell pushed up a whole tone', () => {
    const bent = [0, 1, 2, 3, 4, 5, 6, 7].map((seed) => applyBends(fourToFive, a7, A_PC, TOP, 5, mulberry32(seed)));
    const withBend = bent.find((n) => n[1]!.technique === 'bendFull');
    expect(withBend).toBeDefined();
    expect(withBend![1]).toMatchObject({ string: 3, fret: 9 });
    expect(midi(withBend![1]!.pitch)).toBe(midi(fourToFive[1]!.pitch));
    expect(isBendFrom(withBend![1]!, withBend![0])).toBe(true);
  });

  it('never bends at levels 1-2, into the landing note, or into a note that is not a strong tone', () => {
    for (let seed = 0; seed < 30; seed++) {
      for (const level of [1, 2] as const) {
        expect(applyBends(fourToFive, a7, A_PC, TOP, level, mulberry32(seed)).some((n) => n.technique)).toBe(false);
      }
      // Two notes only: the step lands on the last note, which must stay fretted.
      expect(applyBends(fourToFive.slice(0, 2), a7, A_PC, TOP, 5, mulberry32(seed))[1]!.technique).toBeUndefined();
      // C → D: D is neither a chord tone of A7 nor the key's root or 5th.
      const toFourth = [at(3, 5, note('C'), 0), at(3, 7, note('D'), 0.5), at(4, 10, note('A'), 1, 3)];
      expect(applyBends(toFourth, a7, A_PC, TOP, 5, mulberry32(seed))[1]!.technique).toBeUndefined();
    }
  });
});

describe('generateLick — bends', () => {
  const pos = positions(TUNINGS.standard, { tonic: A, scaleId: 'minorPentatonic' });
  const box = mergedBox(pos, [pos.find((p) => p.minFret === 5)!.index]);

  it('bends appear from level 3, only into the root, 5th or a chord tone, on the top three strings', () => {
    let bends = 0;
    for (const level of [3, 4, 5] as const) {
      for (let seed = 0; seed < 60; seed++) {
        const notes = generateLick(box, a7, null, { level, targetRole: 'R', resolveToNext: false, seed }).notes;
        notes.forEach((n, i) => {
          if (n.technique !== 'bendHalf' && n.technique !== 'bendFull') return;
          bends++;
          expect(isBendFrom(n, notes[i - 1])).toBe(true);
          expect(n.string).toBeGreaterThanOrEqual(3);
          expect([0, 4, 7]).toContain((midi(n.pitch) - A_PC + 120) % 12); // R, 3 or 5 of A7
        });
      }
    }
    expect(bends).toBeGreaterThan(5);
  });
});
