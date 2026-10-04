import { describe, expect, it } from 'vitest';
import {
  CHORDS,
  CHORD_IDS,
  chordNotes,
  chordSymbol,
  chordToneDegree,
  degreeOf,
  diatonicChords,
  format,
  interval,
  keySignature,
  midi,
  parseNote,
  pitchAt,
  relativeKey,
  scaleNotes,
  scaleSteps,
  decorationDegrees,
  transpose,
  type ChordId,
} from './index';

const n = parseNote;
const names = (xs: { letter: string; alter: number }[]) => xs.map((x) => format(x as never));

/** All 15 major key spellings (K2.2). */
const MAJOR_KEYS = ['C', 'G', 'D', 'A', 'E', 'B', 'F#', 'C#', 'F', 'Bb', 'Eb', 'Ab', 'Db', 'Gb', 'Cb'];

describe('pitch', () => {
  it('parses and formats spellings', () => {
    expect(format(n('Bb'))).toBe('B♭');
    expect(format(n('F#'))).toBe('F♯');
    expect(format(n('Bbb'))).toBe('B𝄫');
    expect(format(n('Fx'))).toBe('F𝄪');
    expect(() => n('H')).toThrow();
  });

  it('maps open strings to MIDI', () => {
    expect(midi({ ...n('E'), octave: 2 })).toBe(40);
    expect(midi({ ...n('C'), octave: 4 })).toBe(60);
    expect(midi({ ...n('Cb'), octave: 4 })).toBe(59);
    expect(pitchAt(n('B#'), 60).octave).toBe(3);
  });
});

describe('intervals (K2.3, K2.6)', () => {
  it('converts degree labels to semitones', () => {
    const table: [string, number][] = [
      ['1', 0], ['b2', 1], ['2', 2], ['b3', 3], ['3', 4], ['4', 5], ['#4', 6], ['b5', 6],
      ['5', 7], ['#5', 8], ['b6', 8], ['6', 9], ['bb7', 9], ['b7', 10], ['7', 11], ['8', 12],
      ['9', 14], ['11', 17], ['13', 21],
    ];
    for (const [label, semis] of table) expect(interval(label).semitones, label).toBe(semis);
  });

  it('spells by letter distance, not by pitch class (K2.5)', () => {
    expect(format(transpose(n('Gb'), interval('b3')))).toBe('B𝄫');
    expect(format(transpose(n('F'), interval('b3')))).toBe('A♭');
    expect(format(transpose(n('E'), interval('#2')))).toBe('F𝄪');
  });

  it('reads the degree of a note over a root', () => {
    expect(degreeOf(n('C'), n('Eb'))).toBe('b3');
    expect(degreeOf(n('A'), n('Eb'))).toBe('b5');
    expect(degreeOf(n('C'), n('Bbb'))).toBe('bb7');
  });
});

describe('scales', () => {
  it('uses each letter exactly once in every major key (K2.2)', () => {
    for (const k of MAJOR_KEYS) {
      const letters = scaleNotes(n(k), 'major').map((x) => x.letter);
      expect(new Set(letters).size, k).toBe(7);
    }
  });

  it('spells F minor with B♭, never A♯', () => {
    expect(names(scaleNotes(n('F'), 'naturalMinor'))).toEqual(['F', 'G', 'A♭', 'B♭', 'C', 'D♭', 'E♭']);
  });

  it('builds pentatonic and blues scales (K3.1, K3.2, K6.1)', () => {
    expect(names(scaleNotes(n('A'), 'minorPentatonic'))).toEqual(['A', 'C', 'D', 'E', 'G']);
    expect(names(scaleNotes(n('C'), 'majorPentatonic'))).toEqual(['C', 'D', 'E', 'G', 'A']);
    expect(names(scaleNotes(n('A'), 'minorBlues'))).toEqual(['A', 'C', 'D', 'E♭', 'E', 'G']);
    expect(names(scaleNotes(n('C'), 'majorBlues'))).toEqual(['C', 'D', 'E♭', 'E', 'G', 'A']);
    expect(decorationDegrees('minorBlues')).toEqual(['b5']);
    expect(decorationDegrees('majorBlues')).toEqual(['b3']);
  });

  it('exposes the fret steps the lessons animate', () => {
    expect(scaleSteps('major')).toEqual([2, 2, 1, 2, 2, 2, 1]);
    expect(scaleSteps('naturalMinor')).toEqual([2, 1, 2, 2, 1, 2, 2]);
    expect(scaleSteps('minorPentatonic')).toEqual([3, 2, 2, 3, 2]);
    expect(scaleSteps('majorPentatonic')).toEqual([2, 2, 3, 2, 3]);
    expect(scaleSteps('minorBlues')).toEqual([3, 2, 1, 1, 3, 2]);
  });
});

describe('key signatures (K2.2)', () => {
  const expected: Record<string, string[]> = {
    C: [],
    G: ['F♯'],
    D: ['F♯', 'C♯'],
    A: ['F♯', 'C♯', 'G♯'],
    E: ['F♯', 'C♯', 'G♯', 'D♯'],
    B: ['F♯', 'C♯', 'G♯', 'D♯', 'A♯'],
    'F#': ['F♯', 'C♯', 'G♯', 'D♯', 'A♯', 'E♯'],
    'C#': ['F♯', 'C♯', 'G♯', 'D♯', 'A♯', 'E♯', 'B♯'],
    F: ['B♭'],
    Bb: ['B♭', 'E♭'],
    Eb: ['B♭', 'E♭', 'A♭'],
    Ab: ['B♭', 'E♭', 'A♭', 'D♭'],
    Db: ['B♭', 'E♭', 'A♭', 'D♭', 'G♭'],
    Gb: ['B♭', 'E♭', 'A♭', 'D♭', 'G♭', 'C♭'],
    Cb: ['B♭', 'E♭', 'A♭', 'D♭', 'G♭', 'C♭', 'F♭'],
  };
  for (const [k, sig] of Object.entries(expected)) {
    it(`${k} major`, () => expect(names(keySignature(n(k)))).toEqual(sig));
  }
});

describe('relative keys (K2.8)', () => {
  it('pairs major and minor homes', () => {
    expect(format(relativeKey({ tonic: n('C'), mode: 'major' }).tonic)).toBe('A');
    expect(format(relativeKey({ tonic: n('A'), mode: 'minor' }).tonic)).toBe('C');
    expect(format(relativeKey({ tonic: n('Eb'), mode: 'major' }).tonic)).toBe('C');
    expect(format(relativeKey({ tonic: n('F#'), mode: 'minor' }).tonic)).toBe('A');
  });
});

describe('chords (K4.1–K4.4, errata applied)', () => {
  const onC: Record<ChordId, string[]> = {
    major: ['C', 'E', 'G'],
    minor: ['C', 'E♭', 'G'],
    aug: ['C', 'E', 'G♯'],
    dim: ['C', 'E♭', 'G♭'],
    sus4: ['C', 'F', 'G'],
    sus2: ['C', 'D', 'G'],
    power: ['C', 'G'],
    maj7: ['C', 'E', 'G', 'B'],
    m7: ['C', 'E♭', 'G', 'B♭'],
    dom7: ['C', 'E', 'G', 'B♭'],
    aug7: ['C', 'E', 'G♯', 'B♭'],
    m7b5: ['C', 'E♭', 'G♭', 'B♭'],
    dim7: ['C', 'E♭', 'G♭', 'B𝄫'],
    maj9: ['C', 'E', 'G', 'B', 'D'],
    m9: ['C', 'E♭', 'G', 'B♭', 'D'],
    dom9: ['C', 'E', 'G', 'B♭', 'D'],
    m11: ['C', 'E♭', 'G', 'B♭', 'D', 'F'],
    dom11: ['C', 'E', 'G', 'B♭', 'D', 'F'],
    add2: ['C', 'D', 'E', 'G'],
  };
  it('covers every registered chord', () => expect(Object.keys(onC).sort()).toEqual([...CHORD_IDS].sort()));
  for (const id of CHORD_IDS) {
    it(`C ${id}`, () => expect(names(chordNotes({ root: n('C'), id }))).toEqual(onC[id]));
  }

  it('makes symbols', () => {
    expect(chordSymbol({ root: n('C'), id: 'dom7' })).toBe('C7');
    expect(chordSymbol({ root: n('C'), id: 'maj7' })).toBe('Cmaj7');
    expect(chordSymbol({ root: n('F#'), id: 'm7b5' })).toBe('F♯m7♭5');
  });

  it('finds chord-tone roles', () => {
    const a7 = { root: n('A'), id: 'dom7' as const };
    expect(chordToneDegree(a7, n('C#'))).toBe('3');
    expect(chordToneDegree(a7, n('Db'))).toBe('3');
    expect(chordToneDegree(a7, n('D'))).toBeNull();
  });

  it('keeps every formula starting on the root', () => {
    for (const id of CHORD_IDS) expect(CHORDS[id].formula[0]).toBe('1');
  });
});

describe('diatonic chords and roman numerals (K5.2, K5.3)', () => {
  it('builds triads in C major', () => {
    const triads = diatonicChords({ tonic: n('C'), mode: 'major' });
    expect(triads.map((d) => chordSymbol(d.chord))).toEqual(['C', 'Dm', 'Em', 'F', 'G', 'Am', 'B°']);
    expect(triads.map((d) => d.roman)).toEqual(['I', 'ii', 'iii', 'IV', 'V', 'vi', 'vii°']);
  });

  it('builds seventh chords in C major', () => {
    const sevenths = diatonicChords({ tonic: n('C'), mode: 'major' }, 4);
    expect(sevenths.map((d) => chordSymbol(d.chord))).toEqual(['Cmaj7', 'Dm7', 'Em7', 'Fmaj7', 'G7', 'Am7', 'Bm7♭5']);
    expect(sevenths.map((d) => d.roman)).toEqual(['Imaj7', 'ii7', 'iii7', 'IVmaj7', 'V7', 'vi7', 'viiø7']);
  });

  it('keeps the same pattern in every major key', () => {
    for (const k of MAJOR_KEYS) {
      expect(diatonicChords({ tonic: n(k), mode: 'major' }).map((d) => d.roman), k).toEqual([
        'I', 'ii', 'iii', 'IV', 'V', 'vi', 'vii°',
      ]);
    }
  });

  it('builds natural minor triads', () => {
    const triads = diatonicChords({ tonic: n('A'), mode: 'minor' });
    expect(triads.map((d) => d.roman)).toEqual(['i', 'ii°', 'III', 'iv', 'v', 'VI', 'VII']);
    expect(triads.map((d) => chordSymbol(d.chord))).toEqual(['Am', 'B°', 'C', 'Dm', 'Em', 'F', 'G']);
  });
});
