import { describe, expect, it } from 'vitest';
import { parseSong, slotBeats, slotsPerBar } from './parse';

describe('parseSong', () => {
  it('computes slotsPerBar and slotBeats for 4/4 and 3/4', () => {
    expect(slotsPerBar(4)).toBe(2);
    expect(slotsPerBar(3)).toBe(1);
    expect(slotBeats(4)).toBe(2);
    expect(slotBeats(3)).toBe(3);
  });

  it('parses a 2-bar example and records correct `at` values', () => {
    const song = parseSong({
      id: 'two-bars',
      title: 'Two Bars',
      beatsPerBar: 4,
      melody: '1 2 3 4 | 5 6 7 1',
      chords: 'I I | IV V',
    });

    expect(song.bars).toBe(2);
    expect(song.notes).toHaveLength(8);
    expect(song.notes.map((n) => n.at)).toEqual([0, 1, 2, 3, 4, 5, 6, 7]);
    expect(song.notes.map((n) => n.degree)).toEqual([1, 2, 3, 4, 5, 6, 7, 1]);
    expect(song.notes.map((n) => n.octave)).toEqual([0, 0, 0, 0, 0, 0, 0, 0]);
    expect(song.notes.map((n) => n.length)).toEqual([1, 1, 1, 1, 1, 1, 1, 1]);
    expect(song.chords).toEqual(['I', 'I', 'IV', 'V']);
  });

  it('parses octave modifiers: 5, -> octave -1 and 1\' -> octave 1', () => {
    const song = parseSong({
      id: 'octaves',
      title: 'Octaves',
      beatsPerBar: 4,
      melody: '5, 1 3 1\'',
      chords: 'I I',
    });

    expect(song.notes[0]?.degree).toBe(5);
    expect(song.notes[0]?.octave).toBe(-1);
    expect(song.notes[3]?.degree).toBe(1);
    expect(song.notes[3]?.octave).toBe(1);
  });

  it('advances time on a rest without creating a note', () => {
    const song = parseSong({
      id: 'rest-pickup',
      title: 'Rest Pickup',
      beatsPerBar: 3,
      melody: '_:2 5,:.5 5,:.5 | 1:3',
      chords: '- | I',
    });

    expect(song.bars).toBe(2);
    expect(song.notes).toHaveLength(3);
    expect(song.notes[0]?.at).toBe(2);
    expect(song.notes[0]?.length).toBe(0.5);
    expect(song.notes[1]?.at).toBe(2.5);
    expect(song.notes[1]?.length).toBe(0.5);
    expect(song.notes[2]?.at).toBe(3);
    expect(song.notes[2]?.length).toBe(3);
    expect(song.chords).toEqual(['-', 'I']);
  });

  it('throws when a bar length does not add up to beatsPerBar', () => {
    expect(() =>
      parseSong({
        id: 'bad-duration',
        title: 'Bad Duration',
        beatsPerBar: 4,
        melody: '1 2 3 | 1 2 3 4',
        chords: 'I I | I I',
      }),
    ).toThrow(/duration 3 does not equal beatsPerBar 4/i);
  });

  it('throws on an unknown melody token', () => {
    expect(() =>
      parseSong({
        id: 'bad-note',
        title: 'Bad Note',
        beatsPerBar: 4,
        melody: '1 2 X 4',
        chords: 'I I',
      }),
    ).toThrow(/unknown melody token "X"/i);
  });

  it('throws on an unknown chord token', () => {
    expect(() =>
      parseSong({
        id: 'bad-chord',
        title: 'Bad Chord',
        beatsPerBar: 4,
        melody: '1 2 3 4',
        chords: 'I XYZ',
      }),
    ).toThrow(/unknown chord token "XYZ"/i);
  });

  it('throws when chord-token count does not match bars × slotsPerBar', () => {
    expect(() =>
      parseSong({
        id: 'missing-chord',
        title: 'Missing Chord',
        beatsPerBar: 4,
        melody: '1 2 3 4 | 5 6 7 1',
        chords: 'I I | I', // 3 tokens instead of 4
      }),
    ).toThrow(/chord-token count 3 ≠ bars × slotsPerBar/i);
  });
});
