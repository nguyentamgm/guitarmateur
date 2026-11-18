import { describe, expect, it } from 'vitest';
import { mulberry32 } from '@shared/core/rng';
import { chordSymbol, diatonicChords } from '../../core/music';
import { chordShape, shapeMidis } from '../voicing';
import { finished } from './finished';
import type { DrillQuestion } from './types';

describe('finished drill', () => {
  it('has answers "finished" and "notFinished"', () => {
    expect(finished.answers).toEqual(['finished', 'notFinished']);
  });

  it('generates 200 questions: finished ends on I, notFinished never does', () => {
    const rng = mulberry32(299);
    const questions: DrillQuestion[] = [];
    let prev: DrillQuestion | undefined;
    for (let i = 0; i < 200; i++) {
      const q = finished.next(rng, prev);
      questions.push(q);
      prev = q;
    }

    const seen = new Set<string>();
    questions.forEach((q, i) => {
      seen.add(q.answer);
      const tonic = q.chord!.root;
      expect(['G', 'A', 'D', 'C', 'E']).toContain(tonic.letter);
      expect(tonic.alter).toBe(0);

      const home = diatonicChords({ tonic, mode: 'major' })[0]!.chord;
      const homeMidis = shapeMidis(chordShape(home));
      expect(q.detail).toBe(chordSymbol(home));

      expect(q.sound.bpm).toBe(80);
      expect(q.sound.events.map((e) => [e.at, e.length, e.strum])).toEqual([
        [0, 2, true],
        [2, 2, true],
        [4, 2, true],
        [6, 2, true],
      ]);
      expect(q.sound.events[0]!.midis).toEqual(homeMidis);
      const last = q.sound.events.at(-1)!.midis;
      if (q.answer === 'finished') expect(last).toEqual(homeMidis);
      else expect(last).not.toEqual(homeMidis);

      // compare: the same four chords, then the I chord for 4 beats
      const cmp = q.compare!.events;
      expect(cmp.slice(0, 4)).toEqual(q.sound.events);
      expect(cmp[4]).toMatchObject({ at: 8, length: 4, midis: homeMidis });

      if (i >= 2) {
        const three = questions[i - 2]!.answer === q.answer && questions[i - 1]!.answer === q.answer;
        expect(three, `three '${q.answer}' in a row at ${i}`).toBe(false);
      }
    });
    expect(seen).toEqual(new Set(['finished', 'notFinished']));
  });

  it('breaks a run even when random always says the same', () => {
    let prev: DrillQuestion | undefined;
    for (let i = 0; i < 50; i++) {
      const q = finished.next(() => 0.1, prev);
      if (prev?.run === 2) expect(q.answer).not.toBe(prev.answer);
      prev = q;
    }
  });
});
