import { describe, expect, it } from 'vitest';
import { format, parseNote, type Key } from '@shared/core/music';
import { midiOf } from './degrees';
import { RESOLUTION_NOTE_BEATS, resolution, resolutionNoteSeconds } from './resolution';

const key = (tonic: string, mode: Key['mode']): Key => ({ tonic: parseNote(tonic), mode });
const names = (k: Key, degree: string, midi: number) =>
  resolution(k, degree, midi).map((s) => `${format(s.pitch)}${s.pitch.octave}`);

describe('resolution', () => {
  it('walks down to the tonic below, or up to the tonic an octave above it', () => {
    const c = key('C', 'major');
    expect(names(c, '4', 65)).toEqual(['F4', 'E4', 'D4', 'C4']);
    expect(names(c, '#4', 66)).toEqual(['F♯4', 'G4', 'A4', 'B4', 'C5']);
    expect(resolution(c, '#4', 66).map((s) => s.midi)).toEqual([66, 67, 69, 71, 72]);
    expect(names(key('A', 'minor'), 'b5', 75)).toEqual(['E♭5', 'D5', 'C5', 'B4', 'A4']);
  });

  it('resolves degree 1 to itself', () => {
    expect(resolution(key('C', 'major'), '1', 60)).toEqual([{ degree: '1', pitch: { letter: 'C', alter: 0, octave: 4 }, midi: 60 }]);
  });

  it('rejects a MIDI note that is not the degree in the key', () => {
    expect(() => resolution(key('C', 'major'), '5', 66)).toThrow(RangeError);
    expect(midiOf(key('C', 'major'), '5', 4)).toBe(67);
  });
});

describe('resolutionNoteSeconds', () => {
  it('is an eighth note at the cadence tempo, clamped like the cadence', () => {
    expect(RESOLUTION_NOTE_BEATS).toBe(0.5);
    expect(resolutionNoteSeconds(120)).toBe(0.25);
    expect(resolutionNoteSeconds(10)).toBe(0.75);
    expect(resolutionNoteSeconds(1000)).toBe(0.15);
  });
});
