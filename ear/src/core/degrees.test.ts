import { describe, expect, it } from 'vitest';
import {
  MAJOR_KEY_TONICS,
  MINOR_KEY_TONICS,
  format,
  interval,
  parseNote,
  pc,
  transpose,
  type Key,
} from '@shared/core/music';
import {
  DEGREES,
  MIN_DEGREES,
  PRESET_IDS,
  degreeId,
  diatonicDegrees,
  midiOf,
  noteOf,
  presetDegrees,
  presetsFor,
  toggleDegree,
} from './degrees';

const KEYS: Key[] = [
  ...MAJOR_KEY_TONICS.map((tonic) => ({ tonic, mode: 'major' as const })),
  ...MINOR_KEY_TONICS.map((tonic) => ({ tonic, mode: 'minor' as const })),
];
const keyName = (k: Key) => `${format(k.tonic)} ${k.mode}`;
const labels = DEGREES.map((d) => d.label);

describe('DEGREES', () => {
  it('lists the 12 degrees in chromatic order with their semitones', () => {
    expect(labels).toEqual(['1', 'b2', '2', 'b3', '3', '4', '#4', '5', 'b6', '6', 'b7', '7']);
    expect(DEGREES.map((d) => d.semitones)).toEqual([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11]);
  });

  it('gives #4 / b5 one id, and folds other spellings onto the 12', () => {
    expect(degreeId('#4')).toBe('#4');
    expect(degreeId('b5')).toBe('#4');
    expect(degreeId('#5')).toBe('b6');
    expect(degreeId('8')).toBe('1');
    expect(degreeId('b1')).toBe('7');
  });
});

describe('diatonicDegrees', () => {
  it('is 1–7 in major and 1 2 b3 4 5 b6 b7 in natural minor', () => {
    expect(diatonicDegrees('major')).toEqual(['1', '2', '3', '4', '5', '6', '7']);
    expect(diatonicDegrees('minor')).toEqual(['1', '2', 'b3', '4', '5', 'b6', 'b7']);
  });
});

describe('noteOf', () => {
  it('spells every degree in all 24 keys with at most one accidental, on the right pitch class', () => {
    expect(KEYS).toHaveLength(24);
    for (const key of KEYS) {
      for (const { label, semitones } of DEGREES) {
        const n = noteOf(key, label);
        expect(Math.abs(n.alter), `${keyName(key)} ${label}`).toBeLessThan(2);
        expect(pc(n), `${keyName(key)} ${label}`).toBe((pc(key.tonic) + semitones) % 12);
      }
    }
  });

  it('respells exactly the cases in the docs/ear.md table, keeping the degree label', () => {
    const respelled: string[] = [];
    for (const key of KEYS) {
      for (const { label } of DEGREES) {
        const spelled = key.mode === 'minor' && label === '#4' ? 'b5' : label;
        const raw = transpose(key.tonic, interval(spelled));
        const n = noteOf(key, label);
        if (n.letter !== raw.letter || n.alter !== raw.alter) {
          respelled.push(`${keyName(key)} ${spelled}: ${format(raw)} → ${format(n)}`);
        }
      }
    }
    expect(respelled.sort()).toEqual(
      [
        'D♭ major b2: E𝄫 → D',
        'D♭ major b6: B𝄫 → A',
        'A♭ major b2: B𝄫 → A',
        'E♭ minor b5: B𝄫 → A',
        'G♯ minor 7: F𝄪 → G',
      ].sort(),
    );
  });

  it('spells from the key: E♭ not D♯ in C, F in A minor', () => {
    expect(noteOf({ tonic: parseNote('C'), mode: 'major' }, 'b3')).toEqual(parseNote('Eb'));
    expect(noteOf({ tonic: parseNote('A'), mode: 'minor' }, 'b6')).toEqual(parseNote('F'));
  });

  it('spells the tritone #4 in major and b5 in minor, from either label', () => {
    const cMajor: Key = { tonic: parseNote('C'), mode: 'major' };
    const aMinor: Key = { tonic: parseNote('A'), mode: 'minor' };
    expect(noteOf(cMajor, '#4')).toEqual(parseNote('F#'));
    expect(noteOf(cMajor, 'b5')).toEqual(parseNote('F#'));
    expect(noteOf(aMinor, '#4')).toEqual(parseNote('Eb'));
    expect(noteOf(aMinor, 'b5')).toEqual(parseNote('Eb'));
  });
});

describe('midiOf', () => {
  it('is the tonic in the given octave plus the degree', () => {
    const aMinor: Key = { tonic: parseNote('A'), mode: 'minor' };
    expect(midiOf(aMinor, '1', 3)).toBe(57);
    expect(midiOf(aMinor, 'b3', 3)).toBe(60);
    expect(midiOf(aMinor, '7', 3)).toBe(68);
    expect(midiOf(aMinor, '8', 3)).toBe(69);
    expect(midiOf({ tonic: parseNote('C'), mode: 'major' }, 'b5', 4)).toBe(66);
  });
});

describe('presets', () => {
  // The #212 table; '#4' is the one id of #4 / b5.
  const TABLE = {
    triad: { major: ['1', '3', '5'], minor: ['1', 'b3', '5'] },
    majorPentatonic: { major: ['1', '2', '3', '5', '6'], minor: null },
    minorPentatonic: { major: null, minor: ['1', 'b3', '4', '5', 'b7'] },
    blues: { major: ['1', 'b3', '4', '#4', '5', 'b7'], minor: ['1', 'b3', '4', '#4', '5', 'b7'] },
    scale: { major: ['1', '2', '3', '4', '5', '6', '7'], minor: ['1', '2', 'b3', '4', '5', 'b6', 'b7'] },
    chromatic: { major: labels, minor: labels },
  };

  it('match the table in both modes', () => {
    expect(PRESET_IDS).toEqual(Object.keys(TABLE));
    for (const id of PRESET_IDS) {
      expect(presetDegrees(id, 'major'), `${id} major`).toEqual(TABLE[id].major);
      expect(presetDegrees(id, 'minor'), `${id} minor`).toEqual(TABLE[id].minor);
    }
  });

  it('offer each mode its own pentatonic', () => {
    expect(presetsFor('major')).toEqual(['triad', 'majorPentatonic', 'blues', 'scale', 'chromatic']);
    expect(presetsFor('minor')).toEqual(['triad', 'minorPentatonic', 'blues', 'scale', 'chromatic']);
  });

  it('are made of the 12 degree ids, never fewer than the minimum', () => {
    for (const mode of ['major', 'minor'] as const) {
      for (const id of presetsFor(mode)) {
        const degrees = presetDegrees(id, mode)!;
        expect(degrees.every((d) => labels.includes(d)), `${id} ${mode}`).toBe(true);
        expect(degrees.length, `${id} ${mode}`).toBeGreaterThanOrEqual(MIN_DEGREES);
      }
    }
  });
});

describe('toggleDegree', () => {
  it('adds and removes, keeping chromatic order', () => {
    expect(toggleDegree(['1', '5'], 'b3')).toEqual(['1', 'b3', '5']);
    expect(toggleDegree(['1', 'b3', '5'], 'b3')).toEqual(['1', '5']);
    expect(toggleDegree(['1', '5'], 'b5')).toEqual(['1', '#4', '5']);
  });

  it('keeps at least two degrees on', () => {
    expect(MIN_DEGREES).toBe(2);
    expect(toggleDegree(['1', '5'], '5')).toEqual(['1', '5']);
    expect(toggleDegree(['5', 'b5'], '5')).toEqual(['#4', '5']);
    expect(toggleDegree(['1', '5', '1'], '1')).toEqual(['1', '5']);
  });
});
