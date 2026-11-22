import { describe, expect, it } from 'vitest';
import { diatonicChords, pc } from '@shared/core/music';
import { findLevel } from './levels';
import { cadenceQuestion, chordQuestion, otherQuality, progressionQuestion } from './stage2';

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

describe('level 16: major, minor or dominant 7th', () => {
  const level = findLevel(16)!;
  it('builds major, minor and dom7 chords across steps and compares the picked quality against the right one', () => {
    for (const seed of SEEDS.slice(0, 30)) {
      for (const answer of ['major', 'minor', 'dom7'] as const) {
        const [a, b, c] = [0, 1, 2].map((step) =>
          chordQuestion(level, { level: 16, step, answer, seed }),
        );
        for (const x of [a!, b!, c!]) expect(x.chord.id).toBe(answer);
        expect([a!.style, b!.style, c!.style]).toEqual(['strum', 'strum', 'arpeggio']);
      }
    }
    const q = { level: 16, step: 0, answer: 'dom7' as const, seed: 7 };
    const right = chordQuestion(level, q).chord;
    expect(otherQuality(right, 'major')).toEqual({ root: right.root, id: 'major' });
    expect(otherQuality(right, 'minor')).toEqual({ root: right.root, id: 'minor' });
  });
});

describe('level 17: four-bar chord progressions', () => {
  const level = findLevel(17)!;
  it('builds I–IV–V–I, I–V–vi–IV and i–iv–V7–i on the same tonic', () => {
    for (const seed of SEEDS.slice(0, 30)) {
      for (const step of [0, 1, 2]) {
        const turn = progressionQuestion(level, { level: 17, step, answer: 'I-IV-V-I', seed });
        const pop = progressionQuestion(level, { level: 17, step, answer: 'I-V-vi-IV', seed });
        const minor = progressionQuestion(level, { level: 17, step, answer: 'i-iv-V7-i', seed });
        const majorTriads = diatonicChords(turn.key);
        const minorTriads = diatonicChords(minor.key);

        expect(turn.chords).toEqual([
          majorTriads[0]!.chord,
          majorTriads[3]!.chord,
          majorTriads[4]!.chord,
          majorTriads[0]!.chord,
        ]);
        expect(pop.chords).toEqual([
          majorTriads[0]!.chord,
          majorTriads[4]!.chord,
          majorTriads[5]!.chord,
          majorTriads[3]!.chord,
        ]);
        expect(minor.chords).toEqual([
          minorTriads[0]!.chord,
          minorTriads[3]!.chord,
          { root: minorTriads[4]!.chord.root, id: 'dom7' },
          minorTriads[0]!.chord,
        ]);
      }
    }
  });
});
