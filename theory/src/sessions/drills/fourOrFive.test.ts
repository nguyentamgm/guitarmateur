import { describe, expect, it } from 'vitest';
import { mulberry32 } from '@shared/core/rng';
import { chordSymbol, diatonicChords } from '../../core/music';
import { chordShape, shapeMidis } from '../voicing';
import { fourOrFive } from './fourOrFive';
import type { DrillQuestion } from './types';

describe('fourOrFive drill', () => {
  it('has answers "IV" and "V"', () => {
    expect(fourOrFive.answers).toEqual(['IV', 'V']);
  });

  it('generates questions where the middle chord is degree 4 or 5 as answered', () => {
    const rng = mulberry32(404);
    const questions: DrillQuestion[] = [];
    let prev: DrillQuestion | undefined;

    for (let i = 0; i < 200; i++) {
      const q = fourOrFive.next(rng, prev);
      questions.push(q);
      prev = q;
    }

    const seenAnswers = new Set<string>();

    questions.forEach((q, i) => {
      seenAnswers.add(q.answer);
      expect(['IV', 'V']).toContain(q.answer);

      const tonic = q.chord!.root;
      expect(['G', 'D', 'A', 'C']).toContain(tonic.letter);
      expect(tonic.alter).toBe(0);

      const diatonic = diatonicChords({ tonic, mode: 'major' }).map((d) => d.chord);
      const home = diatonic[0]!;
      const iv = diatonic[3]!;
      const v = diatonic[4]!;

      const expectedMiddle = q.answer === 'IV' ? iv : v;
      const expectedOther = q.answer === 'IV' ? v : iv;

      const homeMidis = shapeMidis(chordShape(home));
      const middleMidis = shapeMidis(chordShape(expectedMiddle));
      const otherMidis = shapeMidis(chordShape(expectedOther));

      expect(q.sound.bpm).toBe(80);
      expect(q.sound.events).toHaveLength(3);
      expect(q.sound.events.map((e) => [e.at, e.length, e.strum])).toEqual([
        [0, 2, true],
        [2, 2, true],
        [4, 2, true],
      ]);
      expect(q.sound.events[0]!.midis).toEqual(homeMidis);
      expect(q.sound.events[1]!.midis).toEqual(middleMidis);
      expect(q.sound.events[2]!.midis).toEqual(homeMidis);

      expect(q.detail).toBe([home, expectedMiddle, home].map(chordSymbol).join(' – '));

      // Compare: other chord at 0, 2, 4, then silence 1 beat, then question at 7, 9, 11
      const cmp = q.compare;
      expect(cmp).toBeDefined();
      expect(cmp!.bpm).toBe(80);
      expect(cmp!.events).toHaveLength(6);
      expect(cmp!.events.map((e) => [e.at, e.length, e.strum])).toEqual([
        [0, 2, true],
        [2, 2, true],
        [4, 2, true],
        [7, 2, true],
        [9, 2, true],
        [11, 2, true],
      ]);
      expect(cmp!.events[1]!.midis).toEqual(otherMidis);
      expect(cmp!.events[4]!.midis).toEqual(middleMidis);

      if (i >= 2) {
        const threeSame =
          questions[i - 2]!.answer === q.answer && questions[i - 1]!.answer === q.answer;
        expect(threeSame, `three '${q.answer}' in a row at question ${i}`).toBe(false);
      }
    });

    expect(seenAnswers).toEqual(new Set(['IV', 'V']));
  });

  it('breaks a run even when random always says the same', () => {
    let prev: DrillQuestion | undefined;
    for (let i = 0; i < 50; i++) {
      const q = fourOrFive.next(() => 0.1, prev);
      if (prev?.run === 2) {
        expect(q.answer).not.toBe(prev.answer);
      }
      prev = q;
    }
  });
});
