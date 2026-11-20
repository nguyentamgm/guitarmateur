import { describe, expect, it } from 'vitest';
import { mulberry32 } from '@shared/core/rng';
import { chordNotes, pc } from '../../core/music';
import { sameChord, type SameChordQuestion } from './sameChord';
import type { DrillQuestion } from './types';

describe('sameChord drill', () => {
  it('has answers "same", "different"', () => {
    expect(sameChord.answers).toEqual(['same', 'different']);
  });

  it('generates 200 questions: same pitch classes for "same", different for "different", and fretted lowest note in second sound', () => {
    const rng = mulberry32(1414);
    const questions: SameChordQuestion[] = [];
    let prev: DrillQuestion | undefined;

    for (let i = 0; i < 200; i++) {
      const q = sameChord.next(rng, prev) as SameChordQuestion;
      questions.push(q);
      prev = q;
    }

    const seenAnswers = new Set<string>();

    questions.forEach((q, i) => {
      seenAnswers.add(q.answer);
      expect(['same', 'different']).toContain(q.answer);

      expect(q.sound.bpm).toBe(80);
      expect(q.compare?.bpm).toBe(80);

      // Sound has 2 events: first chord at 0 for 2 beats, second chord at 3 for 2 beats
      expect(q.sound.events).toHaveLength(2);
      expect(q.sound.events[0]!.at).toBe(0);
      expect(q.sound.events[0]!.length).toBe(2);
      expect(q.sound.events[0]!.strum).toBe(true);

      expect(q.sound.events[1]!.at).toBe(3);
      expect(q.sound.events[1]!.length).toBe(2);
      expect(q.sound.events[1]!.strum).toBe(true);

      // Compare has 3 events: first chord at 0, barre second chord at 3, open second chord at 6
      expect(q.compare).toBeDefined();
      expect(q.compare!.events).toHaveLength(3);
      expect(q.compare!.events[0]!.at).toBe(0);
      expect(q.compare!.events[1]!.at).toBe(3);
      expect(q.compare!.events[2]!.at).toBe(6);
      expect(q.compare!.events[2]!.length).toBe(2);
      expect(q.compare!.events[2]!.strum).toBe(true);

      // Pitch classes
      const firstMidis = q.sound.events[0]!.midis!;
      const secondMidis = q.sound.events[1]!.midis!;

      const firstPcs = new Set(firstMidis.map((m) => m % 12));
      const secondPcs = new Set(secondMidis.map((m) => m % 12));

      if (q.answer === 'same') {
        expect(secondPcs).toEqual(firstPcs);
      } else {
        expect(secondPcs).not.toEqual(firstPcs);
      }

      // Check against chord models if available
      if (q.firstChord && q.secondChord) {
        const expectedFirstPcs = new Set(chordNotes(q.firstChord).map(pc));
        const expectedSecondPcs = new Set(chordNotes(q.secondChord).map(pc));
        expect(firstPcs).toEqual(expectedFirstPcs);
        expect(secondPcs).toEqual(expectedSecondPcs);
        if (q.answer === 'same') {
          expect(q.firstChord).toEqual(q.secondChord);
        } else {
          expect(q.firstChord.id).toBe(q.secondChord.id);
          expect(q.firstChord).not.toEqual(q.secondChord);
        }
      }

      // The second sound's lowest note is fretted, not an open string
      // In BarreVoicing, fret > 0, meaning all frets >= 1
      expect(q.barre).toBeDefined();
      expect(q.barre!.fret).toBeGreaterThan(0);
      expect(q.barre!.notes[0]!.fret).toBeGreaterThan(0);

      // Also verify via midis: lowest note is on string 6 or 5 with fret >= 1
      // Open string 6 is MIDI 40, open string 5 is MIDI 45
      const lowestMidi = secondMidis[0]!;
      const lowestString = q.barre!.notes[0]!.string;
      if (lowestString === 6) {
        expect(lowestMidi).toBe(40 + q.barre!.notes[0]!.fret);
        expect(lowestMidi).toBeGreaterThan(40);
      } else if (lowestString === 5) {
        expect(lowestMidi).toBe(45 + q.barre!.notes[0]!.fret);
        expect(lowestMidi).toBeGreaterThan(45);
      }

      // detail check
      expect(q.detail).toMatch(/^[A-G][b#]?m?, then [A-G][b#]?m?$/);

      // No 3 same answers in a row
      if (i >= 2) {
        const threeSame =
          questions[i - 2]!.answer === q.answer && questions[i - 1]!.answer === q.answer;
        expect(threeSame, `three '${q.answer}' in a row at question ${i}`).toBe(false);
      }
    });

    expect(seenAnswers).toEqual(new Set(['same', 'different']));
  });

  it('breaks a run even when random always picks the same', () => {
    let prev: DrillQuestion | undefined;
    for (let i = 0; i < 50; i++) {
      const q = sameChord.next(() => 0.1, prev);
      if (prev?.run === 2) {
        expect(q.answer).not.toBe(prev.answer);
      }
      prev = q;
    }
  });
});
