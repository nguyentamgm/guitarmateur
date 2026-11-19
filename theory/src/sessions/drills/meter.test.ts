import { describe, expect, it } from 'vitest';
import { mulberry32 } from '@shared/core/rng';
import { meter } from './meter';
import type { DrillQuestion } from './types';

describe('meter drill', () => {
  it('accented clicks are 3 beats apart for three and 4 for four', () => {
    const qThree = meter.next(() => 0.1);
    expect(qThree.answer).toBe('three');
    const threeAccents = qThree.sound.events
      .filter((e) => e.click === 'accent')
      .map((e) => e.at);
    expect(threeAccents).toEqual([0, 3, 6, 9]);
    for (let i = 1; i < threeAccents.length; i++) {
      expect(threeAccents[i]! - threeAccents[i - 1]!).toBe(3);
    }

    const qFour = meter.next(() => 0.9);
    expect(qFour.answer).toBe('four');
    const fourAccents = qFour.sound.events
      .filter((e) => e.click === 'accent')
      .map((e) => e.at);
    expect(fourAccents).toEqual([0, 4, 8]);
    for (let i = 1; i < fourAccents.length; i++) {
      expect(fourAccents[i]! - fourAccents[i - 1]!).toBe(4);
    }
  });

  it('generates 200 questions satisfying all invariants', () => {
    const rng = mulberry32(12345);
    const questions: DrillQuestion[] = [];
    let prev: DrillQuestion | undefined;

    for (let i = 0; i < 200; i++) {
      const q = meter.next(rng, prev);
      questions.push(q);
      prev = q;
    }

    const answersSeen = new Set<string>();

    for (let i = 0; i < questions.length; i++) {
      const q = questions[i]!;
      answersSeen.add(q.answer);

      // Never three equal answers in a row
      if (i >= 2) {
        const threeInARow =
          questions[i - 2]!.answer === q.answer && questions[i - 1]!.answer === q.answer;
        expect(threeInARow, `Found 3 equal answers '${q.answer}' at index ${i}`).toBe(false);
      }

      // sound and compare have bpm 100
      expect(q.sound.bpm).toBe(100);
      expect(q.compare).toBeDefined();
      expect(q.compare!.bpm).toBe(100);

      // clicks on every beat, strums on every beat
      const clickEvents = q.sound.events.filter((e) => e.click !== undefined);
      const strumEvents = q.sound.events.filter((e) => e.strum);
      expect(clickEvents.length).toBe(strumEvents.length);

      if (q.answer === 'three') {
        expect(clickEvents).toHaveLength(10);
        expect(q.compare!.events.filter((e) => e.click !== undefined)).toHaveLength(9);
      } else {
        expect(clickEvents).toHaveLength(9);
        expect(q.compare!.events.filter((e) => e.click !== undefined)).toHaveLength(10);
      }
    }

    expect(answersSeen).toEqual(new Set(['three', 'four']));
  });
});
