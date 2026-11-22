import { describe, expect, it } from 'vitest';
import { mergedBox, positions, TUNINGS } from '../fretboard';
import { note, type Pitch } from '../music';
import { lickFingering } from './fingering';
import type { Lick } from './model';

const dummyPitch: Pitch = { letter: 'A', alter: 0, octave: 4 };

describe('lickFingering', () => {
  it('keeps the anchor finger across a bend and its release instead of jumping frets', () => {
    const pos = positions(TUNINGS.standard, { tonic: note('A'), scaleId: 'minorPentatonic' });
    const box1 = mergedBox(pos, [0]); // [5, 8]
    const lick: Lick = {
      lengthBeats: 4,
      difficulty: 3,
      notes: [
        { string: 3, fret: 7, pitch: dummyPitch, startBeat: 0, durationBeats: 1 },
        { string: 3, fret: 9, pitch: dummyPitch, startBeat: 1, durationBeats: 1, technique: 'bendFull' },
        { string: 3, fret: 7, pitch: dummyPitch, startBeat: 2, durationBeats: 2, technique: 'release' },
      ],
    };

    expect(lickFingering(lick, box1)).toEqual([{ finger: 3 }, { finger: 3 }, { finger: 3 }]);
  });

  it('returns null for open strings and computes partnerFinger on double stops', () => {
    const pos = positions(TUNINGS.standard, { tonic: note('E'), scaleId: 'minorPentatonic' });
    const box1 = mergedBox(pos, [0]); // [0, 3]
    const lick: Lick = {
      lengthBeats: 4,
      difficulty: 3,
      notes: [
        { string: 0, fret: 0, pitch: dummyPitch, startBeat: 0, durationBeats: 1 },
        {
          string: 3,
          fret: 2,
          pitch: dummyPitch,
          startBeat: 1,
          durationBeats: 1,
          partner: { string: 4, fret: 3, pitch: dummyPitch },
        },
        {
          string: 1,
          fret: 2,
          pitch: dummyPitch,
          startBeat: 2,
          durationBeats: 1,
          partner: { string: 2, fret: 0, pitch: dummyPitch },
        },
      ],
    };

    expect(lickFingering(lick, box1)).toEqual([
      { finger: null },
      { finger: 2, partnerFinger: 3 },
      { finger: 2, partnerFinger: null },
    ]);
  });

  it('re-anchors a lick staying inside Box 2 [7, 10] when played over a merged Box 1+2 [5, 10]', () => {
    const pos = positions(TUNINGS.standard, { tonic: note('A'), scaleId: 'minorPentatonic' });
    const merged = mergedBox(pos, [0, 1]); // [5, 10]
    const lick: Lick = {
      lengthBeats: 4,
      difficulty: 2,
      notes: [
        { string: 1, fret: 7, pitch: dummyPitch, startBeat: 0, durationBeats: 1 },
        { string: 4, fret: 8, pitch: dummyPitch, startBeat: 1, durationBeats: 1 },
        { string: 3, fret: 9, pitch: dummyPitch, startBeat: 2, durationBeats: 1 },
        { string: 4, fret: 10, pitch: dummyPitch, startBeat: 3, durationBeats: 1 },
      ],
    };

    expect(lickFingering(lick, merged)).toEqual([
      { finger: 1 },
      { finger: 2 },
      { finger: 3 },
      { finger: 4 },
    ]);
  });
});
