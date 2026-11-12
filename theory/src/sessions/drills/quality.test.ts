import { describe, expect, it } from 'vitest';
import { mulberry32 } from '@shared/core/rng';
import { quality } from './quality';
import type { DrillQuestion } from './types';

describe('quality drill', () => {
  it('generates 200 questions satisfying all invariants', () => {
    const rng = mulberry32(12345);
    const questions: DrillQuestion[] = [];
    let prev: DrillQuestion | undefined;

    for (let i = 0; i < 200; i++) {
      const q = quality.next(rng, prev);
      questions.push(q);
      prev = q;
    }

    const answersSeen = new Set<string>();
    const rootsSeen = new Set<string>();

    for (let i = 0; i < questions.length; i++) {
      const q = questions[i]!;
      answersSeen.add(q.answer);

      // Root is E, A, or D only
      expect(q.chord).toBeDefined();
      const rootLetter = q.chord!.root.letter;
      rootsSeen.add(rootLetter);
      expect(['E', 'A', 'D']).toContain(rootLetter);
      expect(q.chord!.root.alter).toBe(0);

      // detail ends in 'm' exactly when the answer is 'minor'
      expect(q.detail).toBeDefined();
      if (q.answer === 'minor') {
        expect(q.detail!.endsWith('m')).toBe(true);
      } else {
        expect(q.detail!.endsWith('m')).toBe(false);
      }

      // Never three equal answers in a row
      if (i >= 2) {
        const threeInARow =
          questions[i - 2]!.answer === q.answer && questions[i - 1]!.answer === q.answer;
        expect(threeInARow, `Found 3 equal answers '${q.answer}' at index ${i}`).toBe(false);
      }

      // the sound's chord differs from compare's first chord in exactly one midi
      expect(q.sound.events).toHaveLength(1);
      const soundMidis = q.sound.events[0]!.midis!;

      expect(q.compare).toBeDefined();
      expect(q.compare!.events.length).toBeGreaterThanOrEqual(1);
      const compareMidis = q.compare!.events[0]!.midis!;

      expect(soundMidis).toHaveLength(compareMidis.length);
      let midiDiffs = 0;
      for (let j = 0; j < soundMidis.length; j++) {
        if (soundMidis[j] !== compareMidis[j]) {
          midiDiffs++;
          expect(Math.abs(soundMidis[j]! - compareMidis[j]!)).toBe(1);
        }
      }
      expect(midiDiffs).toBe(1);
    }

    // Both answers occur
    expect(answersSeen).toEqual(new Set(['major', 'minor']));
    // Only roots E, A, D occur
    expect(rootsSeen).toEqual(new Set(['E', 'A', 'D']));
  });
});
