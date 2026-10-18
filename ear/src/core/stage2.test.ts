import { describe, expect, it } from 'vitest';
import { diatonicChords, pc } from '@shared/core/music';
import { findLevel } from './levels';
import { cadenceQuestion, chordQuestion } from './stage2';

const SEEDS = Array.from({ length: 200 }, (_, i) => i + 1);

describe('level 5: happy or sad', () => {
  const level = findLevel(5)!;
  it('the chord is major or minor as answered; open roots first, then elsewhere, then one by one', () => {
    for (const seed of SEEDS) {
      for (const answer of ['major', 'minor'] as const) {
        const [a, b, c] = [0, 1, 2].map((step) =>
          chordQuestion(level, { level: 5, step, answer, seed }),
        );
        for (const x of [a!, b!, c!]) expect(x.chord.id).toBe(answer);
        expect(['E', 'A', 'D']).toContain(a!.chord.root.letter);
        expect([4, 9, 2]).not.toContain(pc(b!.chord.root));
        expect([a!.style, b!.style, c!.style]).toEqual(['strum', 'strum', 'arpeggio']);
      }
    }
  });
});

describe('level 6: finished or not', () => {
  const level = findLevel(6)!;
  it('finished always ends on the I chord, not finished never; the key leaves A only at step C', () => {
    const keys = new Set<string>();
    for (const seed of SEEDS) {
      for (const step of [0, 1, 2]) {
        for (const answer of ['finished', 'notFinished'] as const) {
          const q = cadenceQuestion(level, { level: 6, step, answer, seed });
          const home = diatonicChords(q.key)[0]!.chord;
          expect(q.chords).toHaveLength(4);
          expect(q.chords[0]).toEqual(home);
          if (answer === 'finished') expect(q.chords.at(-1)).toEqual(home);
          else expect(q.chords.at(-1)).not.toEqual(home);
          if (step < 2) expect(q.key.tonic.letter + q.key.tonic.alter).toBe('A0');
          else keys.add(`${q.key.tonic.letter}${q.key.tonic.alter}`);
        }
      }
    }
    expect(keys.size).toBeGreaterThan(6);
  });
});
