import { describe, expect, it } from 'vitest';
import { MAJOR_KEY_TONICS, MINOR_KEY_TONICS, format, parseNote, type Key } from '@shared/core/music';
import { DEGREES } from './degrees';
import { HIGHEST_MIDI, LOWEST_MIDI, REGISTERS, questionTonic, registerOffsets, type Register } from './questions';

const KEYS: Key[] = [
  ...MAJOR_KEY_TONICS.map((tonic) => ({ tonic, mode: 'major' as const })),
  ...MINOR_KEY_TONICS.map((tonic) => ({ tonic, mode: 'minor' as const })),
];
const key = (tonic: string, mode: Key['mode']): Key => ({ tonic: parseNote(tonic), mode });
const CHROMATIC = DEGREES.map((d) => d.label);
const range = (register: Register, degrees: readonly string[] = CHROMATIC) => ({ degrees, register });

describe('registerOffsets', () => {
  it('above: the octave up; around: the nearer side, 5 to 7 below; twoOctaves: both octaves up', () => {
    expect(registerOffsets('above', '7')).toEqual([11]);
    expect(registerOffsets('around', '#4')).toEqual([6]);
    expect(registerOffsets('around', '5')).toEqual([-5]);
    expect(registerOffsets('around', '7')).toEqual([-1]);
    expect(registerOffsets('twoOctaves', 'b3')).toEqual([3, 15]);
  });
});

describe('questionTonic', () => {
  it('keeps the tonic in octave 4 while the active set fits, an octave down when it does not', () => {
    // A: 69 + 11 (7) = 80 > 76, so 57; the triad's 69 + 7 = 76 fits.
    expect(questionTonic(key('A', 'major'), range('above'))).toBe(57);
    expect(questionTonic(key('A', 'major'), range('above', ['1', '3', '5']))).toBe(69);
    expect(questionTonic(key('C', 'major'), range('above'))).toBe(60);
    // Around: B's tritone 71 + 6 = 77 drops it to 59; without the tritone 71 − 1 … 71 + 5 fits.
    expect(questionTonic(key('B', 'major'), range('around'))).toBe(59);
    expect(questionTonic(key('B', 'major'), range('around', ['1', '3', '5', '7']))).toBe(71);
    // Two octaves: C 60 + 23 drops twice to 48; F♯ 66 + 23 to 42 (F♯2, near the bottom E2).
    expect(questionTonic(key('C', 'major'), range('twoOctaves'))).toBe(48);
    expect(questionTonic(key('F#', 'minor'), range('twoOctaves'))).toBe(42);
  });

  it('puts every degree of every key, in every register, inside E2–E5', () => {
    const outside: string[] = [];
    for (const k of KEYS) {
      for (const register of REGISTERS) {
        const tonic = questionTonic(k, range(register));
        for (const degree of CHROMATIC) {
          for (const midi of registerOffsets(register, degree).map((o) => tonic + o)) {
            if (midi < LOWEST_MIDI || midi > HIGHEST_MIDI) outside.push(`${format(k.tonic)} ${k.mode} ${register} ${degree}: ${midi}`);
          }
        }
      }
    }
    expect(outside).toEqual([]);
  });
});
