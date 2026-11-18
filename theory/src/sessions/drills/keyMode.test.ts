import { describe, expect, it } from 'vitest';
import { mulberry32 } from '@shared/core/rng';
import { chordSymbol, diatonicChords, format, parseNote, type Chord } from '../../core/music';
import { chordIn } from '../chordSpec';
import { chordShape, shapeMidis } from '../voicing';
import { keyMode } from './keyMode';
import type { DrillQuestion } from './types';

describe('keyMode drill', () => {
  const tonics = [parseNote('A'), parseNote('E'), parseNote('D')];

  const chordsByTonic = new Map<string, { major: Chord[]; minor: Chord[] }>();
  for (const t of tonics) {
    const majTriads = diatonicChords({ tonic: t, mode: 'major' }).map((d) => d.chord);
    const minTriads = diatonicChords({ tonic: t, mode: 'minor' }).map((d) => d.chord);
    const v7 = chordIn({ tonic: format(t), mode: 'minor' }, { root: '5', id: 'dom7' }).chord;
    chordsByTonic.set(format(t), {
      major: [majTriads[0]!, majTriads[3]!, majTriads[4]!, majTriads[0]!],
      minor: [minTriads[0]!, minTriads[3]!, v7, minTriads[0]!],
    });
  }

  it('has answers "major" and "minor"', () => {
    expect(keyMode.answers).toEqual(['major', 'minor']);
  });

  it('generates 200 questions: first and last chords major for major, minor for minor; third chord is a dominant 7 in minor', () => {
    const rng = mulberry32(1111);
    const questions: DrillQuestion[] = [];
    let prev: DrillQuestion | undefined;

    for (let i = 0; i < 200; i++) {
      const q = keyMode.next(rng, prev);
      questions.push(q);
      prev = q;
    }

    const seenAnswers = new Set<string>();

    questions.forEach((q, i) => {
      seenAnswers.add(q.answer);
      expect(['major', 'minor']).toContain(q.answer);

      expect(q.sound.bpm).toBe(80);
      expect(q.sound.events).toHaveLength(4);
      expect(q.sound.events.map((e) => [e.at, e.length, e.strum])).toEqual([
        [0, 2, true],
        [2, 2, true],
        [4, 2, true],
        [6, 4, true],
      ]);

      // Compare: other mode (4 events, 10 beats), gap 1 beat, then question (4 events) shifted by 11 beats
      expect(q.compare).toBeDefined();
      expect(q.compare!.bpm).toBe(80);
      expect(q.compare!.events).toHaveLength(8);
      expect(q.compare!.events.map((e) => [e.at, e.length, e.strum])).toEqual([
        [0, 2, true],
        [2, 2, true],
        [4, 2, true],
        [6, 4, true],
        [11, 2, true],
        [13, 2, true],
        [15, 2, true],
        [17, 4, true],
      ]);

      // Identify tonic from the last chord's root
      const lastChord = q.chord!;
      const tonicKey = format(lastChord.root);
      expect(['A', 'E', 'D']).toContain(tonicKey);

      const expected = chordsByTonic.get(tonicKey)!;
      const expectedChords = q.answer === 'major' ? expected.major : expected.minor;
      const otherChords = q.answer === 'major' ? expected.minor : expected.major;

      // Verify chords
      if (q.answer === 'major') {
        expect(expectedChords[0]!.id).toBe('major');
        expect(expectedChords[3]!.id).toBe('major');
      } else {
        expect(expectedChords[0]!.id).toBe('minor');
        expect(expectedChords[3]!.id).toBe('minor');
        expect(expectedChords[2]!.id).toBe('dom7');
      }

      // Check midis match
      expectedChords.forEach((chord, idx) => {
        const expectedMidis = shapeMidis(chordShape(chord));
        expect(q.sound.events[idx]!.midis).toEqual(expectedMidis);
        expect(q.compare!.events[idx + 4]!.midis).toEqual(expectedMidis);
      });

      otherChords.forEach((chord, idx) => {
        const otherMidis = shapeMidis(chordShape(chord));
        expect(q.compare!.events[idx]!.midis).toEqual(otherMidis);
      });

      // detail is the last chord's symbol
      expect(q.detail).toBe(chordSymbol(expectedChords[3]!));

      // No 3 same answers in a row
      if (i >= 2) {
        const threeSame =
          questions[i - 2]!.answer === q.answer && questions[i - 1]!.answer === q.answer;
        expect(threeSame, `three '${q.answer}' in a row at question ${i}`).toBe(false);
      }
    });

    expect(seenAnswers).toEqual(new Set(['major', 'minor']));
  });

  it('breaks a run even when random always picks the same', () => {
    let prev: DrillQuestion | undefined;
    for (let i = 0; i < 50; i++) {
      const q = keyMode.next(() => 0.1, prev);
      if (prev?.run === 2) {
        expect(q.answer).not.toBe(prev.answer);
      }
      prev = q;
    }
  });
});
