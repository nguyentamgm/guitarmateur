import { describe, expect, it } from 'vitest';
import { format, interval, parseNote, pc, scaleNotes, type ScaleId } from '../music';
import {
  allPositions,
  fretsOf,
  gapToNextString,
  homeFret,
  keyShift,
  MAX_FRET,
  midiAt,
  octaveUp,
  pitchAtPos,
  positions,
  sequence,
  powerChord,
  doubleStops,
  SEQUENCE_IDS,
  shapeAt,
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

  describe('interval shapes (K2.4)', () => {
    // Fret offsets from the knowledge base, before the B-string shift.
    const K24: [string, number, number][] = [
      ['b3', 1, -2], ['3', 1, -1], ['4', 1, 0], ['#4', 1, 1], ['5', 1, 2],
      ['b6', 2, -2], ['6', 2, -1], ['b7', 2, 0], ['7', 2, 1], ['8', 2, 2],
    ];
    const crossesB = (from: number, up: number) => from >= 3 && from - up <= 2;

    it.each(K24)('%s, %i string(s) up: offset %i, +1 across G→B, on every string pair', (label, up, offset) => {
      for (const s of STRINGS.filter((x) => x - up >= 1)) {
        const from = { string: s, fret: 5 };
        const to = shapeAt(from, label, up)!;
        expect(to.string).toBe(s - up);
        expect(to.fret - 5, `string ${s}`).toBe(offset + (crossesB(s, up) ? 1 : 0));
        expect(midiAt(to) - midiAt(from)).toBe(interval(label).semitones);
      }
    });

    it('shifts the two-string jumps 4→2 and 3→1', () => {
      expect(shapeAt({ string: 4, fret: 5 }, '8', 2)).toEqual({ string: 2, fret: 8 });
      expect(shapeAt({ string: 3, fret: 5 }, '8', 2)).toEqual({ string: 1, fret: 8 });
      expect(shapeAt({ string: 5, fret: 5 }, '8', 2)).toEqual({ string: 3, fret: 7 });
    });

    it('backs octaveUp, which is the octave shape', () => {
      expect(octaveUp({ string: 6, fret: MAX_FRET - 1 })).toBeNull();
      expect(octaveUp({ string: 6, fret: MAX_FRET - 2 })).toEqual({ string: 4, fret: MAX_FRET });
    });

    it('returns null off the neck', () => {
      expect(shapeAt({ string: 6, fret: 0 }, 'b3', 1)).toBeNull();
      expect(shapeAt({ string: 6, fret: MAX_FRET }, '5', 1)).toBeNull();
      expect(shapeAt({ string: 2, fret: 5 }, '8', 2)).toBeNull();
      expect(shapeAt({ string: 5, fret: 3 }, '3', 0)).toEqual({ string: 5, fret: 7 });
    });
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

describe('sequences (K3.6)', () => {
  it('builds groups of 3 and 4 that climb one note at a time', () => {
    expect(sequence(5, 'threes', 'up')).toEqual([0, 1, 2, 1, 2, 3, 2, 3, 4]);
    expect(sequence(5, 'fours', 'up')).toEqual([0, 1, 2, 3, 1, 2, 3, 4]);
    expect(sequence(5, 'skip', 'up')).toEqual([0, 2, 1, 3, 2, 4]);
    expect(sequence(4, 'straight', 'up')).toEqual([0, 1, 2, 3]);
  });

  it('mirrors from the top going down', () => {
    expect(sequence(5, 'threes', 'down')).toEqual([4, 3, 2, 3, 2, 1, 2, 1, 0]);
    expect(sequence(4, 'straight', 'down')).toEqual([3, 2, 1, 0]);
  });

  it.each(SEQUENCE_IDS.map((id) => [id] as const))('%s over a 12-note box: starts low, ends on the top note, stays in range', (id) => {
    const up = sequence(12, id, 'up');
    expect(up[0]).toBe(0);
    expect(up.at(-1)).toBe(11);
    expect(Math.min(...up)).toBe(0);
    expect(Math.max(...up)).toBe(11);
    const down = sequence(12, id, 'down');
    expect(down[0]).toBe(11);
    expect(down.at(-1)).toBe(0);
  });

  it('gives the expected lengths on a box: 12, 30, 36, 20', () => {
    expect(SEQUENCE_IDS.map((id) => sequence(12, id, 'up').length)).toEqual([12, 30, 36, 20]);
  });

  it('gives nothing when the run is shorter than a group', () => {
    expect(sequence(2, 'threes', 'up')).toEqual([]);
    expect(sequence(0, 'straight', 'up')).toEqual([]);
  });
});

describe('power chords and double stops (K4.2, K6.6)', () => {
  it('stamps root, +2 frets on the next string, +2 on the one after', () => {
    expect(powerChord({ string: 6, fret: 5 })).toEqual([
      { string: 6, fret: 5 },
      { string: 5, fret: 7 },
      { string: 4, fret: 7 },
    ]);
    expect(powerChord({ string: 5, fret: 3 }, false)).toEqual([
      { string: 5, fret: 3 },
      { string: 4, fret: 5 },
    ]);
    // Rooted on string 4 the octave crosses G→B: +3.
    expect(powerChord({ string: 4, fret: 5 })![2]).toEqual({ string: 2, fret: 8 });
    expect(powerChord({ string: 2, fret: 5 })).toBeNull();
  });

  it('sounds root, 5th (7 semitones) and octave (12)', () => {
    for (const s of [6, 5] as const) {
      const [r, f, o] = powerChord({ string: s, fret: 3 })!.map(midiAt);
      expect([f! - r!, o! - r!]).toEqual([7, 12]);
    }
  });

  it('finds the same-fret pairs of A minor box 1: 4ths, and a major 3rd on G–B', () => {
    const box = positions({ tonic: n('A'), scale: 'minorPentatonic', notesPerString: 2 })[0]!;
    const stops = doubleStops(box.notes);
    expect(stops.map((d) => `${d.low.string}${d.high.string}@${d.low.fret}:${d.semitones}`)).toEqual([
      '65@5:5',
      '54@5:5',
      '54@7:5',
      '43@5:5',
      '43@7:5',
      '32@5:4',
      '21@5:5',
      '21@8:5',
    ]);
  });
});
