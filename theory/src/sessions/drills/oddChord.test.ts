import { describe, expect, it } from 'vitest';
import { mulberry32 } from '@shared/core/rng';
import { diatonicChords, sameNote, type ChordId, type NoteName } from '../../core/music';
import { oddChord, type OddChordQuestion } from './oddChord';
import type { DrillQuestion } from './types';

describe('oddChord drill', () => {
  it('has answers "2", "3", "4"', () => {
    expect(oddChord.answers).toEqual(['2', '3', '4']);
  });

  it('generates 200 questions: exactly one bar has a chord not in diatonicChords(key), in the bar the answer names', () => {
    const rng = mulberry32(1515);
    const questions: OddChordQuestion[] = [];
    let prev: DrillQuestion | undefined;

    for (let i = 0; i < 200; i++) {
      const q = oddChord.next(rng, prev) as OddChordQuestion;
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

      // Compare: 32 strums (16 strums of sound, 1-beat rest, then 16 strums of diatonic)
      expect(q.compare).toBeDefined();
      expect(q.compare!.events).toHaveLength(32);

      const tonic = q.keyTonic!;
      expect(tonic).toBeDefined();
      const diatonicChordsList = diatonicChords({ tonic, mode: 'major' }).map((d) => d.chord);

      const isDiatonic = (c: { root: NoteName; id: ChordId }) =>
        diatonicChordsList.some((d) => sameNote(d.root, c.root) && d.id === c.id);

      const bars = q.barsChords!;
      expect(bars).toHaveLength(4);

      // Bar 1 (index 0) is always diatonic (I)
      expect(isDiatonic(bars[0]!)).toBe(true);

      const expectedOutsideBarIdx = Number(q.answer) - 1;

      // Check each bar
      bars.forEach((chord, idx) => {
        if (idx === expectedOutsideBarIdx) {
          expect(isDiatonic(chord), `Bar ${idx + 1} should be outside the key`).toBe(false);
        } else {
          expect(isDiatonic(chord), `Bar ${idx + 1} should be inside the key`).toBe(true);
        }
      });

      // Exactly one bar is outside the key
      const outsideBarIndices = bars
        .map((c, idx) => (!isDiatonic(c) ? idx : -1))
        .filter((idx) => idx !== -1);
      expect(outsideBarIndices).toEqual([expectedOutsideBarIdx]);

      // In comparison, the outside bar is replaced by the diatonic chord
      const diatonicBars = q.diatonicBarsChords!;
      expect(diatonicBars).toHaveLength(4);
      diatonicBars.forEach((chord, idx) => {
        expect(isDiatonic(chord), `Diatonic comparison bar ${idx + 1} must be inside the key`).toBe(true);
      });

      // detail format e.g. "♭VII (F)" or "iv (Cm)" or "III7 (B7)" or "III7 (C♯7)"
      expect(q.detail).toMatch(/^(♭VII|iv|III7) \([A-G][b#♭♯]?m?7?\)$/);

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
      const q = oddChord.next(() => 0.1, prev);
      if (prev?.run === 2) {
        expect(q.answer).not.toBe(prev.answer);
      }
      prev = q;
    }
  });
});
