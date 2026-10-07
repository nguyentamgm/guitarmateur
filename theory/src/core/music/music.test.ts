import { describe, expect, it } from 'vitest';
import {
  CHORDS,
  CHORD_IDS,
  chordNotes,
  chordSymbol,
  simplifyChord,
  chordToneDegree,
  degreeOf,
  diatonicChords,
  format,
  interval,
  intervalName,
  INTERVAL_TABLE,
  keySignature,
  LETTERS,
  majorKeyTonic,
  MAJOR_KEY_TONICS,
  minorKeyTonic,
  MINOR_KEY_TONICS,
  relativeMinorTonic,
  midi,
  mod,
  parseNote,
  pc,
  pitchAt,
  relativeKey,
  scaleNotes,
  scaleSteps,
  decorationDegrees,
  transpose,
  twelveBar,
  progression,
  PROGRESSIONS,
  twoFive,
  motif,
  landOn,
  LICK_EIGHTHS,
  type ProgressionId,
  BOOGIE,
  bluesChord,
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

  it('names #4 and b5 by letter distance (K2.3)', () => {
    expect(degreeOf(n('C'), n('F#'))).toBe('#4');
    expect(degreeOf(n('C'), n('Gb'))).toBe('b5');
  });

  it('names every row of the K2.3 table', () => {
    const k23: [string, number, string, number][] = [
      ['1', 1, 'perfect', 0], ['b2', 2, 'minor', 1], ['2', 2, 'major', 2], ['b3', 3, 'minor', 3],
      ['3', 3, 'major', 4], ['4', 4, 'perfect', 5], ['#4', 4, 'augmented', 6], ['b5', 5, 'diminished', 6],
      ['5', 5, 'perfect', 7], ['#5', 5, 'augmented', 8], ['b6', 6, 'minor', 8], ['6', 6, 'major', 9],
      ['b7', 7, 'minor', 10], ['7', 7, 'major', 11], ['8', 8, 'perfect', 12],
    ];
    expect(INTERVAL_TABLE.map((r) => r.label)).toEqual(k23.map((r) => r[0]));
    INTERVAL_TABLE.forEach((row, i) => {
      const [label, number, quality, semis] = k23[i]!;
      expect(intervalName(row.label), label).toEqual({ number, quality });
      expect(row.semitones, label).toBe(semis);
    });
  });

  it('lowers major to minor then diminished, perfect straight to diminished', () => {
    expect(intervalName('bb7')).toEqual({ number: 7, quality: 'diminished' });
    expect(intervalName('#2')).toEqual({ number: 2, quality: 'augmented' });
    expect(intervalName('11')).toEqual({ number: 11, quality: 'perfect' });
    expect(intervalName('b9')).toEqual({ number: 9, quality: 'minor' });
    expect(() => intervalName('bb5')).toThrow(RangeError);
    expect(() => intervalName('16')).toThrow(RangeError);
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

  it('puts the major half steps at 3→4 and 7→8 in every key (K2.1)', () => {
    for (const k of MAJOR_KEYS) {
      const notes = scaleNotes(n(k), 'major');
      const steps = notes.map((x, i) => mod(pc(notes[(i + 1) % 7]!) - pc(x), 12));
      expect(steps, k).toEqual([2, 2, 1, 2, 2, 2, 1]);
    }
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

describe('major key names (K2.2)', () => {
  const accidentals = (t: { letter: string; alter: number }) =>
    scaleNotes(t as never, 'major').filter((x) => x.alter !== 0).length;
  const doubles = (t: { letter: string; alter: number }) =>
    scaleNotes(t as never, 'major').some((x) => Math.abs(x.alter) > 1);

  it('names the 12 keys around the circle of fifths', () => {
    expect(MAJOR_KEY_TONICS.map(format)).toEqual(['C', 'G', 'D', 'A', 'E', 'B', 'F♯', 'D♭', 'A♭', 'E♭', 'B♭', 'F']);
    expect(format(majorKeyTonic(1))).toBe('D♭');
    expect(format(majorKeyTonic(-1))).toBe('B');
  });

  it.each(MAJOR_KEY_TONICS.map((t) => [format(t), t] as const))(
    '%s: 7 letters, no doubles, at most 6 accidentals, all one kind',
    (_k, t) => {
      const notes = scaleNotes(t, 'major');
      expect(new Set(notes.map((x) => x.letter)).size).toBe(7);
      expect(doubles(t)).toBe(false);
      expect(accidentals(t)).toBeLessThanOrEqual(6);
      const signs = new Set(notes.filter((x) => x.alter !== 0).map((x) => Math.sign(x.alter)));
      expect(signs.size).toBeLessThanOrEqual(1);
    },
  );

  it('rejects every other spelling for more accidentals or a double', () => {
    for (const chosen of MAJOR_KEY_TONICS) {
      for (const letter of LETTERS) {
        for (const alter of [-1, 0, 1] as const) {
          const t = { letter, alter };
          if (pc(t) !== pc(chosen) || (letter === chosen.letter && alter === chosen.alter)) continue;
          const tie = format(chosen) === 'F♯' && format(t) === 'G♭';
          if (!tie) expect(doubles(t) || accidentals(t) > accidentals(chosen), format(t)).toBe(true);
        }
      }
    }
    expect(names(scaleNotes(n('D#'), 'major'))).toContain('F𝄪');
    expect(names(scaleNotes(n('A#'), 'major'))).toEqual(expect.arrayContaining(['C𝄪', 'G𝄪']));
  });

  it('breaks the F♯/G♭ tie (6 each) for F♯', () => {
    expect(accidentals(n('F#'))).toBe(6);
    expect(accidentals(n('Gb'))).toBe(6);
    expect(names(scaleNotes(n('F#'), 'major'))).toContain('E♯');
    expect(names(scaleNotes(n('Gb'), 'major'))).toContain('C♭');
    expect(format(majorKeyTonic(6))).toBe('F♯');
  });
});

describe('minor key names (K2.8)', () => {
  const accidentals = (t: { letter: string; alter: number }) =>
    scaleNotes(t as never, 'naturalMinor').filter((x) => x.alter !== 0).length;

  it('names the 12 minor keys around the circle of fifths', () => {
    expect(MINOR_KEY_TONICS.map(format)).toEqual(['A', 'E', 'B', 'F♯', 'C♯', 'G♯', 'E♭', 'B♭', 'F', 'C', 'G', 'D']);
  });

  it('is the relative minor of the major key with the same signature, except the 6-sign tie', () => {
    for (const t of MINOR_KEY_TONICS) {
      const relMajor = MAJOR_KEY_TONICS.find((m) => pc(m) === mod(pc(t) + 3, 12))!;
      if (format(t) === 'E♭') expect(format(relMajor)).toBe('F♯');
      else expect(format(relativeMinorTonic(relMajor))).toBe(format(t));
    }
  });

  it('breaks the D♯/E♭ tie (6 each) for E♭ and avoids A♯ and A♭', () => {
    expect(accidentals(n('D#'))).toBe(6);
    expect(accidentals(n('Eb'))).toBe(6);
    expect(format(minorKeyTonic(3))).toBe('E♭');
    expect(format(minorKeyTonic(10))).toBe('B♭');
    expect(format(minorKeyTonic(8))).toBe('G♯');
  });
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

describe('12-bar blues (K5.4)', () => {
  it('rocks the boogie 5 5 6 6 ♭7 ♭7 6 6 over one bar of eighths', () => {
    expect(BOOGIE.map((d) => interval(d).semitones)).toEqual([7, 7, 9, 9, 10, 10, 9, 9]);
  });

  it('lays out I I I I · IV IV I I · V IV I I and its variants', () => {
    expect(twelveBar().join(' ')).toBe('I I I I IV IV I I V IV I I');
    expect(twelveBar({ quickChange: true })[1]).toBe('IV');
    expect(twelveBar({ turnaround: true })[11]).toBe('V');
    expect(twelveBar({ quickChange: true, turnaround: true })).toHaveLength(12);
  });

  it('builds dominant 7 chords on I, IV and V, spelled in the key', () => {
    const inA = (['I', 'IV', 'V'] as const).map((d) => chordSymbol(bluesChord(n('A'), d)));
    expect(inA).toEqual(['A7', 'D7', 'E7']);
    const inBb = (['I', 'IV', 'V'] as const).map((d) => chordSymbol(bluesChord(n('Bb'), d)));
    expect(inBb).toEqual(['B♭7', 'E♭7', 'F7']);
  });
});

describe('simplifying chords (K4.8)', () => {
  const ladder = (id: ChordId) => simplifyChord({ root: n('C'), id }).map(chordSymbol).join(' → ');
  it('drops the highest colour note until a triad is left', () => {
    expect(ladder('dom11')).toBe('C11 → C9 → C7 → C');
    expect(ladder('m11')).toBe('Cm11 → Cm9 → Cm7 → Cm');
    expect(ladder('maj9')).toBe('Cmaj9 → Cmaj7 → C');
    expect(ladder('add2')).toBe('Cadd2 → C');
    expect(ladder('m7b5')).toBe('Cm7♭5 → C°');
    expect(ladder('dim7')).toBe('C°7 → C°');
    expect(ladder('aug7')).toBe('C+7 → C+');
  });
  it('leaves triads, sus and power chords alone', () => {
    for (const id of ['major', 'minor', 'sus4', 'sus2', 'power'] as const) expect(simplifyChord({ root: n('C'), id })).toHaveLength(1);
  });
});

describe('common progressions (K5.3) and ii–V (K5.5)', () => {
  const symbols = (tonic: string, id: ProgressionId) => progression(n(tonic), id).map((d) => chordSymbol(d.chord));
  const romans = (id: ProgressionId) => progression(n('C'), id).map((d) => d.roman);

  it('spells each progression from the key', () => {
    expect(symbols('G', 'I-V-vi-IV')).toEqual(['G', 'D', 'Em', 'C']);
    expect(symbols('E', 'I-IV-V')).toEqual(['E', 'A', 'B']);
    expect(symbols('Bb', 'ii-V-I')).toEqual(['Cm7', 'F7', 'B♭maj7', 'B♭maj7']);
    expect(symbols('Db', 'vi-IV-I-V')).toEqual(['B♭m', 'G♭', 'D♭', 'A♭']);
    expect(symbols('A', 'i-VII-VI-VII')).toEqual(['Am', 'G', 'F', 'G']);
  });

  it('keeps the numerals in its id, in every key', () => {
    for (const id of Object.keys(PROGRESSIONS) as ProgressionId[]) {
      expect(romans(id).map((r) => r.replace(/maj7|7/, '')).join('-')).toBe(id.split('-').concat(id === 'ii-V-I' ? ['I'] : []).join('-'));
      for (const k of MAJOR_KEYS) {
        expect(progression(n(k), id).map((d) => d.roman), `${id} in ${k}`).toEqual(romans(id));
      }
    }
  });

  it('builds the ii–V into any chord: into F, Gm7 C7; into B♭, Cm7 F7; into F♯, G♯m7 C♯7', () => {
    expect(twoFive(n('F')).map(chordSymbol)).toEqual(['Gm7', 'C7']);
    expect(twoFive(n('Bb')).map(chordSymbol)).toEqual(['Cm7', 'F7']);
    expect(twoFive(n('F#')).map(chordSymbol)).toEqual(['G♯m7', 'C♯7']);
    for (const k of MAJOR_KEYS) {
      const ii = diatonicChords({ tonic: n(k), mode: 'major' }, 4);
      expect(twoFive(n(k)), k).toEqual([ii[1]!.chord, ii[4]!.chord]);
    }
  });
});

describe('ideas for soloing (K7.4)', () => {
  const seeded = (seed: number) => {
    let s = seed;
    return () => (s = (s * 1103515245 + 12345) % 2147483648) / 2147483648;
  };

  it('starts an idea on a given note when asked, turning back at the edges', () => {
    const random = seeded(9);
    for (let n = 0; n < 200; n++) {
      for (const start of [0, 5, 11]) {
        const lick = motif(12, random, start);
        expect(lick[0]!.index).toBe(start);
        for (const l of lick) expect(l.index >= 0 && l.index < 12).toBe(true);
        lick.slice(1).forEach((l, k) => expect(l.index).not.toBe(lick[k]!.index));
      }
    }
  });

  it('makes ideas of 3–4 neighbouring notes inside one bar, leaving beat 4 mostly free', () => {
    const random = seeded(11);
    for (let t = 0; t < 200; t++) {
      const size = 8 + (t % 9);
      const lick = motif(size, random);
      expect(lick.length).toBeGreaterThanOrEqual(3);
      expect(lick.length).toBeLessThanOrEqual(4);
      expect(lick[0]!.at).toBeLessThanOrEqual(1);
      for (const [i, x] of lick.entries()) {
        expect(x.index).toBeGreaterThanOrEqual(0);
        expect(x.index).toBeLessThan(size);
        expect(x.length).toBeGreaterThan(0);
        expect(x.at + x.length).toBeLessThanOrEqual(LICK_EIGHTHS);
        if (i > 0) {
          expect(x.at).toBe(lick[i - 1]!.at + lick[i - 1]!.length);
          expect(Math.abs(x.index - lick[i - 1]!.index)).toBeGreaterThan(0);
          expect(Math.abs(x.index - lick[i - 1]!.index)).toBeLessThanOrEqual(2);
        }
      }
      expect(lick.at(-1)!.at).toBeLessThanOrEqual(5);
      expect(lick.at(-1)!.length).toBeGreaterThanOrEqual(2);
    }
  });

  it('moves only the last note, to the nearest one that fits, the way the line was going', () => {
    const lick = [
      { index: 3, at: 0, length: 1 },
      { index: 4, at: 1, length: 1 },
      { index: 5, at: 2, length: 4 },
    ];
    const even = (i: number) => i % 2 === 0;
    expect(landOn(lick, 10, even).map((x) => x.index)).toEqual([3, 4, 6]);
    // 4 is nearer, but it is the note just before: the ending never stands still.
    expect(landOn(lick, 10, even, 6).map((x) => x.index)).toEqual([3, 4, 8]);
    expect(landOn(lick, 10, (i) => i === 5).map((x) => x.index)).toEqual([3, 4, 5]);
    expect(landOn(lick, 10, () => false)).toEqual(lick);
    expect(landOn(lick, 10, even)[2]!.at).toBe(2);
  });
});
