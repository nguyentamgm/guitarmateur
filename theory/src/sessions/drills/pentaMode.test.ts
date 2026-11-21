import { describe, expect, it } from 'vitest';
import { mulberry32 } from '@shared/core/rng';
import { bassMidi } from '../../core/audio';
import { parseNote } from '../../core/music';
import { chordShape, shapeMidis } from '../voicing';
import { pentaMode } from './pentaMode';
import type { DrillQuestion } from './types';

describe('pentaMode drill', () => {
  it('strums a 2-beat major I chord followed by a 5-note pentatonic phrase and compares the other', () => {
    const first = pentaMode.next(() => 0);
    const second = pentaMode.next(() => 0, { ...first, run: 2 });

    expect([first.answer, second.answer]).toEqual(['minorPenta', 'majorPenta']);
    expect(first.detail).toBe('A');
    expect(second.detail).toBe('A');

    const expectedRootMidi = bassMidi(parseNote('A'));
    const expectedChordMidis = shapeMidis(chordShape({ root: parseNote('A'), id: 'major' }));

    for (const [question, intervals] of [
      [first, [0, 3, 5, 7, 12]],
      [second, [0, 2, 4, 7, 12]],
    ] as const) {
      const events = question.sound.events;
      expect(events).toHaveLength(6);
      expect(events[0]).toEqual({
        at: 0,
        midis: expectedChordMidis,
        strum: true,
        length: 2,
      });

      const noteEvents = events.slice(1);
      expect(noteEvents.map((e) => e.at)).toEqual([2, 3, 4, 5, 6]);
      expect(noteEvents.map((e) => e.midis![0]! - expectedRootMidi)).toEqual(intervals);
      for (const e of noteEvents) {
        expect(e.length).toBe(1);
      }

      // compare plays other first, then question.sound
      expect(question.compare).toBeDefined();
      expect(question.compare!.events).toHaveLength(12);
      // first event of compare is the chord of the other scale
      expect(question.compare!.events[0]!.strum).toBe(true);
      // after the 1-beat gap (at = 7 + 1 = 8), question.sound repeats
      expect(question.compare!.events[6]!.at).toBe(8);
      expect(question.compare!.events[6]!.strum).toBe(true);
    }
  });

  it('generates 200 questions satisfying all invariants', () => {
    const rng = mulberry32(12345);
    const questions: DrillQuestion[] = [];
    let prev: DrillQuestion | undefined;

    for (let i = 0; i < 200; i++) {
      const q = pentaMode.next(rng, prev);
      questions.push(q);
      prev = q;
    }

    const answersSeen = new Set<string>();
    const keysSeen = new Set<string>();

    for (let i = 0; i < questions.length; i++) {
      const q = questions[i]!;
      answersSeen.add(q.answer);
      keysSeen.add(q.detail!);

      expect(['minorPenta', 'majorPenta']).toContain(q.answer);
      expect(['A', 'G', 'E', 'C', 'D']).toContain(q.detail);
      expect(q.chord).toEqual({ root: parseNote(q.detail!), id: 'major' });

      // Never three equal answers in a row
      if (i >= 2) {
        const threeInARow =
          questions[i - 2]!.answer === q.answer && questions[i - 1]!.answer === q.answer;
        expect(threeInARow, `Found 3 equal answers '${q.answer}' at index ${i}`).toBe(false);
      }

      // 6 sound events: 1 chord + 5 phrase notes
      expect(q.sound.events).toHaveLength(6);
      expect(q.sound.events[0]!.strum).toBe(true);
      expect(q.sound.events[0]!.length).toBe(2);

      const root = bassMidi(parseNote(q.detail!));
      const expectedSteps =
        q.answer === 'minorPenta' ? [0, 3, 5, 7, 12] : [0, 2, 4, 7, 12];
      const phraseMidis = q.sound.events.slice(1).map((e) => e.midis![0]! - root);
      expect(phraseMidis).toEqual(expectedSteps);

      // compare exists and has 12 events
      expect(q.compare?.events).toHaveLength(12);
    }

    expect(answersSeen).toEqual(new Set(['minorPenta', 'majorPenta']));
    expect(keysSeen).toEqual(new Set(['A', 'G', 'E', 'C', 'D']));
  });
});
