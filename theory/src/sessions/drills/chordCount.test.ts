import { describe, expect, it } from 'vitest';
import { mulberry32 } from '@shared/core/rng';
import { chordCount } from './chordCount';
import type { DrillQuestion } from './types';

describe('chordCount drill', () => {
  it('has answers "two" and "three"', () => {
    expect(chordCount.answers).toEqual(['two', 'three']);
  });

  it('generates 200 questions: distinct chords match the answer, both occur, no 3-in-a-row', () => {
    const rng = mulberry32(301);
    const questions: DrillQuestion[] = [];
    let prev: DrillQuestion | undefined;

    for (let i = 0; i < 200; i++) {
      const q = chordCount.next(rng, prev);
      questions.push(q);
      prev = q;
    }

    const seenAnswers = new Set<string>();

    questions.forEach((q, i) => {
      seenAnswers.add(q.answer);

      expect(q.sound.bpm).toBe(90);
      expect(q.compare?.bpm).toBe(70);

      expect(q.sound.events).toHaveLength(8);
      expect(q.sound.events.map((e) => [e.at, e.length, e.strum])).toEqual([
        [0, 2, true],
        [2, 2, true],
        [4, 2, true],
        [6, 2, true],
        [8, 2, true],
        [10, 2, true],
        [12, 2, true],
        [14, 2, true],
      ]);

      expect(q.compare?.events).toEqual(q.sound.events);

      const symbols = q.detail?.split(' – ') ?? [];
      expect(symbols).toHaveLength(4);

      const distinctSymbols = new Set(symbols);
      const distinctMidis = new Set(q.sound.events.map((e) => JSON.stringify(e.midis)));

      if (q.answer === 'two') {
        expect(distinctSymbols.size).toBe(2);
        expect(distinctMidis.size).toBe(2);
        expect(['G – C – G – C', 'G – D – G – D']).toContain(q.detail);
      } else {
        expect(q.answer).toBe('three');
        expect(distinctSymbols.size).toBe(3);
        expect(distinctMidis.size).toBe(3);
        expect(['G – C – D – G', 'G – D – C – G']).toContain(q.detail);
      }

      if (i >= 2) {
        const threeSame =
          questions[i - 2]!.answer === q.answer && questions[i - 1]!.answer === q.answer;
        expect(threeSame, `three '${q.answer}' in a row at question ${i}`).toBe(false);
      }
    });

    expect(seenAnswers).toEqual(new Set(['two', 'three']));
  });

  it('breaks a run even when random always says the same', () => {
    let prev: DrillQuestion | undefined;
    for (let i = 0; i < 50; i++) {
      const q = chordCount.next(() => 0.1, prev);
      if (prev?.run === 2) {
        expect(q.answer).not.toBe(prev.answer);
      }
      prev = q;
    }
  });
});
