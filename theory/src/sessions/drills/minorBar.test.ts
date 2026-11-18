import { describe, expect, it } from 'vitest';
import { mulberry32 } from '@shared/core/rng';
import { chordSymbol, diatonicChords, parseNote } from '../../core/music';
import { chordShape, shapeMidis } from '../voicing';
import { minorBar } from './minorBar';
import type { DrillQuestion } from './types';

describe('minorBar drill', () => {
  const tonic = parseNote('G');
  const diatonic = diatonicChords({ tonic, mode: 'major' }).map((d) => d.chord);
  const home = diatonic[0]!;
  const iv = diatonic[3]!;
  const v = diatonic[4]!;
  const vi = diatonic[5]!;

  const homeMidis = shapeMidis(chordShape(home));
  const ivMidis = shapeMidis(chordShape(iv));
  const vMidis = shapeMidis(chordShape(v));
  const viMidis = shapeMidis(chordShape(vi));

  const majorMidiSets = [JSON.stringify(homeMidis), JSON.stringify(ivMidis), JSON.stringify(vMidis)];
  const viMidisStr = JSON.stringify(viMidis);

  it('has answers "2", "3", "4"', () => {
    expect(minorBar.answers).toEqual(['2', '3', '4']);
  });

  it('generates 200 questions: exactly one minor chord, in the bar the answer names, never bar 1', () => {
    const rng = mulberry32(1010);
    const questions: DrillQuestion[] = [];
    let prev: DrillQuestion | undefined;

    for (let i = 0; i < 200; i++) {
      const q = minorBar.next(rng, prev);
      questions.push(q);
      prev = q;
    }

    const seenAnswers = new Set<string>();

    questions.forEach((q, i) => {
      seenAnswers.add(q.answer);
      expect(['2', '3', '4']).toContain(q.answer);

      expect(q.sound.bpm).toBe(85);
      expect(q.compare?.bpm).toBe(85);

      // Sound: 16 strums (4 bars × 4 beats)
      expect(q.sound.events).toHaveLength(16);
      for (let s = 0; s < 16; s++) {
        expect(q.sound.events[s]!.at).toBe(s);
        expect(q.sound.events[s]!.length).toBe(1);
        expect(q.sound.events[s]!.strum).toBe(true);
      }

      // Check chord of each bar in sound
      const bar0Midis = JSON.stringify(q.sound.events[0]!.midis);
      const bar1Midis = JSON.stringify(q.sound.events[4]!.midis);
      const bar2Midis = JSON.stringify(q.sound.events[8]!.midis);
      const bar3Midis = JSON.stringify(q.sound.events[12]!.midis);

      const barMidis = [bar0Midis, bar1Midis, bar2Midis, bar3Midis];

      // Bar 1 (index 0) is never minor; it is always I (G)
      expect(bar0Midis).toBe(JSON.stringify(homeMidis));
      expect(bar0Midis).not.toBe(viMidisStr);

      // Exactly one of bars 0..3 is vi (the minor chord)
      const minorBarIndices = barMidis
        .map((m, idx) => (m === viMidisStr ? idx : -1))
        .filter((idx) => idx !== -1);

      expect(minorBarIndices).toHaveLength(1);

      const expectedBarIndex = Number(q.answer) - 1;
      expect(minorBarIndices[0]).toBe(expectedBarIndex);

      // All other bars are major chords from I/IV/V
      barMidis.forEach((m, idx) => {
        if (idx !== expectedBarIndex) {
          expect(majorMidiSets).toContain(m);
        }
      });

      // Compare: vi bar played as one held strum of length 4, others 4 strums
      expect(q.compare).toBeDefined();
      expect(q.compare!.events).toHaveLength(13);

      const viHeldEvent = q.compare!.events.find((e) => e.at === expectedBarIndex * 4);
      expect(viHeldEvent).toBeDefined();
      expect(viHeldEvent!.length).toBe(4);
      expect(JSON.stringify(viHeldEvent!.midis)).toBe(viMidisStr);

      // detail is the vi chord's symbol
      expect(q.detail).toBe(chordSymbol(vi));

      // No 3 same answers in a row
      if (i >= 2) {
        const threeSame =
          questions[i - 2]!.answer === q.answer && questions[i - 1]!.answer === q.answer;
        expect(threeSame, `three '${q.answer}' in a row at question ${i}`).toBe(false);
      }
    });

    expect(seenAnswers).toEqual(new Set(['2', '3', '4']));
  });

  it('breaks a run even when random always picks the same', () => {
    let prev: DrillQuestion | undefined;
    for (let i = 0; i < 50; i++) {
      const q = minorBar.next(() => 0.1, prev);
      if (prev?.run === 2) {
        expect(q.answer).not.toBe(prev.answer);
      }
      prev = q;
    }
  });
});
