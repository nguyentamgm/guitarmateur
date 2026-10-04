import { describe, expect, it } from 'vitest';
import { format, parseNote, pc, scaleNotes, type ScaleId } from '../music';
import {
  allPositions,
  fretsOf,
  gapToNextString,
  homeFret,
  keyShift,
  midiAt,
  octaveUp,
  pitchAtPos,
  positions,
  STRINGS,
  type Position,
} from './index';

const n = parseNote;
const KEYS = ['C', 'Db', 'D', 'Eb', 'E', 'F', 'F#', 'G', 'Ab', 'A', 'Bb', 'B'];
const range = (p: Position) => [p.minFret, p.maxFret];

describe('neck (M0)', () => {
  it('tunes E A D G B E with the G→B gap of 4 (K0.4)', () => {
    expect(STRINGS.map((s) => gapToNextString(s))).toEqual([5, 5, 5, 4, 5, null]);
    expect(midiAt({ string: 6, fret: 0 })).toBe(40);
    expect(midiAt({ string: 1, fret: 0 })).toBe(64);
    expect(midiAt({ string: 6, fret: 5 })).toBe(midiAt({ string: 5, fret: 0 }));
    expect(midiAt({ string: 3, fret: 4 })).toBe(midiAt({ string: 2, fret: 0 }));
  });

  it('knows home frets on strings 6 and 5 (K0.7)', () => {
    const six = { E: 0, F: 1, G: 3, A: 5, B: 7, C: 8, D: 10 };
    const five = { A: 0, B: 2, C: 3, D: 5, E: 7, F: 8, G: 10 };
    for (const [k, f] of Object.entries(six)) expect(homeFret(n(k), 6), k).toBe(f);
    for (const [k, f] of Object.entries(five)) expect(homeFret(n(k), 5), k).toBe(f);
  });

  it('finds octaves two strings up: +2, or +3 across G→B (K0.6)', () => {
    expect(octaveUp({ string: 6, fret: 5 })).toEqual({ string: 4, fret: 7 });
    expect(octaveUp({ string: 5, fret: 3 })).toEqual({ string: 3, fret: 5 });
    expect(octaveUp({ string: 4, fret: 7 })).toEqual({ string: 2, fret: 10 });
    expect(octaveUp({ string: 3, fret: 5 })).toEqual({ string: 1, fret: 8 });
    expect(octaveUp({ string: 2, fret: 5 })).toBeNull();
    for (const s of STRINGS) {
      const up = octaveUp({ string: s, fret: 3 });
      if (up) expect(midiAt(up) - midiAt({ string: s, fret: 3 })).toBe(12);
    }
  });

  it('lists every position of a note', () => {
    expect(fretsOf(n('A'), 6, 24)).toEqual([5, 17]);
    expect(allPositions(n('A')).every((p) => pc(pitchAtPos(p)) === pc(n('A')))).toBe(true);
  });

  it('spells by scale context: F minor shows B♭ (K2.2)', () => {
    const ctx = scaleNotes(n('F'), 'naturalMinor');
    expect(format(pitchAtPos({ string: 5, fret: 1 }, ctx))).toBe('B♭');
    expect(format(pitchAtPos({ string: 5, fret: 1 }))).toBe('A♯');
  });
});

describe('pentatonic boxes (K3.4)', () => {
  it('places the five A minor boxes where the knowledge base says', () => {
    const boxes = positions({ tonic: n('A'), scale: 'minorPentatonic', notesPerString: 2 });
    expect(boxes.map(range)).toEqual([[5, 8], [7, 10], [9, 13], [12, 15], [2, 5]]);
    expect(boxes[0]!.notes[0]).toMatchObject({ string: 6, fret: 5, degree: '1', isTonic: true });
  });

  it('gives C major pentatonic the same boxes as A minor (K3.3)', () => {
    const am = positions({ tonic: n('A'), scale: 'minorPentatonic', notesPerString: 2 });
    const c = positions({ tonic: n('C'), scale: 'majorPentatonic', notesPerString: 2 });
    expect(c.map(range)).toEqual(am.map(range));
    expect(c[0]!.notes.filter((x) => x.isTonic).map((x) => format(x.pitch))).toContain('C');
  });

  for (const scale of ['minorPentatonic', 'majorPentatonic'] as ScaleId[]) {
    it(`${scale}: 2 notes per string, all in scale, tiled, in every key`, () => {
      for (const k of KEYS) {
        const boxes = positions({ tonic: n(k), scale, notesPerString: 2 });
        expect(boxes).toHaveLength(5);
        const pcs = new Set(scaleNotes(n(k), scale).map(pc));
        for (const b of boxes) {
          expect(b.notes).toHaveLength(12);
          for (const s of STRINGS) expect(b.notes.filter((x) => x.string === s), `${k} ${b.index} s${s}`).toHaveLength(2);
          expect(b.notes.every((x) => pcs.has(pc(x.pitch)))).toBe(true);
          expect(b.maxFret - b.minFret, `${k} box ${b.index} span`).toBeLessThanOrEqual(4);
          expect(b.minFret).toBeGreaterThanOrEqual(0);
        }
      }
    });
  }

  it('adds the blues ♭5 inside the boxes without widening them (K6.1)', () => {
    const plain = positions({ tonic: n('A'), scale: 'minorPentatonic', notesPerString: 2 });
    const blues = positions({ tonic: n('A'), scale: 'minorBlues', notesPerString: 2 });
    expect(blues.map(range)).toEqual(plain.map(range));
    const deco = blues[0]!.notes.filter((x) => x.isDecoration);
    expect(deco.length).toBeGreaterThan(0);
    expect(deco.every((x) => x.degree === 'b5' && format(x.pitch) === 'E♭')).toBe(true);
  });
});

describe('three notes per string (K2.9)', () => {
  it('builds seven positions of 18 notes for every major key', () => {
    for (const k of KEYS) {
      const pos = positions({ tonic: n(k), scale: 'major', notesPerString: 3 });
      expect(pos).toHaveLength(7);
      for (const p of pos) {
        for (const s of STRINGS) expect(p.notes.filter((x) => x.string === s)).toHaveLength(3);
        expect(p.maxFret - p.minFret, `${k} pos ${p.index}`).toBeLessThanOrEqual(6);
      }
    }
  });
});

describe('key shift (K3.5)', () => {
  it('slides the shortest way', () => {
    expect(keyShift(n('A'), n('C'))).toBe(3);
    expect(keyShift(n('A'), n('E'))).toBe(-5);
    expect(keyShift(n('A'), n('D'))).toBe(5);
    expect(keyShift(n('E'), n('Bb'))).toBe(-6);
  });
});
