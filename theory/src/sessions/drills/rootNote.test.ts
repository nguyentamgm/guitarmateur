import { describe, expect, it } from 'vitest';
import { mulberry32 } from '@shared/core/rng';
import { diatonicChords, parseNote } from '../../core/music';
import { chordShape, shapeMidis } from '../voicing';
import { rootNote, rootNoteQuestion } from './rootNote';
import type { DrillQuestion } from './types';

describe('rootNote drill', () => {
  it('has no answer buttons', () => {
    expect(rootNote.answers).toEqual([]);
  });

  it.each([
    ['G', '3', 3],
    ['A', '5', 5],
    ['E', '0', 0],
    ['C', '8', 8],
    ['D', '10', 10],
  ])('in %s the root is on fret %s of string 6', (tonic, fret, fretNum) => {
    const q = rootNoteQuestion(parseNote(tonic));
    expect(q.answer).toBe(fret);
    expect(q.detail).toBe(tonic);
    expect(q.pos).toEqual({ string: 6, fret: fretNum });
    expect(q.chord).toBeUndefined();
  });

  it('plays I, IV, V, I for 2 beats each at 80 BPM, then holds the I chord for 4 beats', () => {
    const tonic = parseNote('G');
    const q = rootNoteQuestion(tonic);
    const triads = diatonicChords({ tonic, mode: 'major' });
    const chords = [1, 2, 3, 4, 5].map((d) => (d === 1 || d === 4 || d === 5 ? shapeMidis(chordShape(triads[d - 1]!.chord)) : []));
    expect(q.sound.bpm).toBe(80);
    expect(q.sound.events.map((e) => [e.at, e.length, e.midis])).toEqual([
      [0, 2, chords[0]],
      [2, 2, chords[3]],
      [4, 2, chords[4]],
      [6, 2, chords[0]],
      [8, 4, chords[0]],
    ]);
  });

  it('picks from G, A, D, C, E and never the same key twice in a row', () => {
    const rng = mulberry32(3);
    let prev: DrillQuestion | undefined;
    for (let i = 0; i < 100; i++) {
      const q = rootNote.next(rng, prev);
      expect(['G', 'A', 'D', 'C', 'E']).toContain(q.detail);
      expect(q.pos?.string).toBe(6);
      if (prev) expect(q.detail).not.toBe(prev.detail);
      prev = q;
    }
  });
});
