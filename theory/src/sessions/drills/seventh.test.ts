import { describe, expect, it } from 'vitest';
import { mulberry32 } from '@shared/core/rng';
import { seventh } from './seventh';
import type { DrillQuestion } from './types';

describe('seventh drill', () => {
  it('generates 200 questions satisfying all invariants', () => {
    const rng = mulberry32(12345);
    const questions: DrillQuestion[] = [];
    let prev: DrillQuestion | undefined;

    for (let i = 0; i < 200; i++) {
      const q = seventh.next(rng, prev);
      questions.push(q);
      prev = q;
    }

    const answersSeen = new Set<string>();
    const rootsSeen = new Set<string>();

    for (let i = 0; i < questions.length; i++) {
      const q = questions[i]!;
      answersSeen.add(q.answer);

      // Root is E, A, D, or G only
      expect(q.chord).toBeDefined();
      const rootLetter = q.chord!.root.letter;
      rootsSeen.add(rootLetter);
      expect(['E', 'A', 'D', 'G']).toContain(rootLetter);
      expect(q.chord!.root.alter).toBe(0);

      // detail ends in '7' exactly when answer is 'seventh'
      expect(q.detail).toBeDefined();
      if (q.answer === 'seventh') {
        expect(q.detail!.endsWith('7')).toBe(true);
      } else {
        expect(q.detail!.endsWith('7')).toBe(false);
      }

      // Never three equal answers in a row
      if (i >= 2) {
        const threeInARow =
          questions[i - 2]!.answer === q.answer && questions[i - 1]!.answer === q.answer;
        expect(threeInARow, `Found 3 equal answers '${q.answer}' at index ${i}`).toBe(false);
      }

      // sound is 1 strummed event at 80 BPM
      expect(q.sound.bpm).toBe(80);
      expect(q.sound.events).toHaveLength(1);
      expect(q.sound.events[0]!.strum).toBe(true);

      // compare is present and has events from other chord, then this chord
      expect(q.compare).toBeDefined();
      expect(q.compare!.events.length).toBe(2);
      expect(q.compare!.events[0]!.strum).toBe(true);
      expect(q.compare!.events[1]!.strum).toBe(true);
    }

    // Both answers occur
    expect(answersSeen).toEqual(new Set(['plain', 'seventh']));
    // Roots E, A, D, G occur
    expect(rootsSeen).toEqual(new Set(['E', 'A', 'D', 'G']));
  });
});
