import { describe, expect, it } from 'vitest';
import { note } from '../music';
import type { Key } from '../music';
import { romanNumeral } from './roman';

const C_MAJOR: Key = { tonic: note('C'), scaleId: 'major' };
const A_MINOR: Key = { tonic: note('A'), scaleId: 'natural-minor' };
const G_MAJOR: Key = { tonic: note('G'), scaleId: 'major' };

/** Shorthand for building a chord quickly. */
function chord(
  tonicLetter: 'C' | 'D' | 'E' | 'F' | 'G' | 'A' | 'B',
  alter: 0 | 1 | -1,
  quality: 'm' | 'M' | 'dom7' | 'm7' | 'M7',
) {
  return { tonic: note(tonicLetter, alter), quality };
}

describe('romanNumeral — C major', () => {
  it('I — C major', () => expect(romanNumeral(C_MAJOR, chord('C', 0, 'M'))).toBe('I'));
  it('ii — D minor', () => expect(romanNumeral(C_MAJOR, chord('D', 0, 'm'))).toBe('ii'));
  it('iii — E minor', () => expect(romanNumeral(C_MAJOR, chord('E', 0, 'm'))).toBe('iii'));
  it('IV — F major', () => expect(romanNumeral(C_MAJOR, chord('F', 0, 'M'))).toBe('IV'));
  it('V — G major', () => expect(romanNumeral(C_MAJOR, chord('G', 0, 'M'))).toBe('V'));
  it('vi — A minor', () => expect(romanNumeral(C_MAJOR, chord('A', 0, 'm'))).toBe('vi'));
  it('IV° — F diminished (lowercase from MAJORISH check)', () =>
    expect(romanNumeral(C_MAJOR, chord('F', 0, 'm'))).toBe('iv'));
});

describe('romanNumeral — A natural minor', () => {
  it('i — A minor', () => expect(romanNumeral(A_MINOR, chord('A', 0, 'm'))).toBe('i'));
  it('VII — G major (♭VII in minor)', () => expect(romanNumeral(A_MINOR, chord('G', 0, 'M'))).toBe('♭VII'));
  it('VI — F major', () => expect(romanNumeral(A_MINOR, chord('F', 0, 'M'))).toBe('♭VI'));
  it('iv — D minor', () => expect(romanNumeral(A_MINOR, chord('D', 0, 'm'))).toBe('iv'));
  it('III — C major', () => expect(romanNumeral(A_MINOR, chord('C', 0, 'M'))).toBe('♭III'));
});

describe('romanNumeral — G major', () => {
  it('I — G major', () => expect(romanNumeral(G_MAJOR, chord('G', 0, 'M'))).toBe('I'));
  it('V7 — D dominant 7th', () => expect(romanNumeral(G_MAJOR, chord('D', 0, 'dom7'))).toBe('V7'));
  it('ii7 — A minor 7th', () => expect(romanNumeral(G_MAJOR, chord('A', 0, 'm7'))).toBe('ii7'));
  it('IV7 — C Major 7th (suffix is always 7, case indicates major)', () => expect(romanNumeral(G_MAJOR, chord('C', 0, 'M7'))).toBe('IV7'));
  it('♭VII — F major (borrowed chord)', () => expect(romanNumeral(G_MAJOR, chord('F', 0, 'M'))).toBe('♭VII'));
});

describe('romanNumeral — accidental edge cases', () => {
  it('♭II in C major — D♭ major', () => {
    expect(romanNumeral(C_MAJOR, chord('D', -1, 'M'))).toBe('♭II');
  });
  it('♭III in C major — E♭ major', () => {
    expect(romanNumeral(C_MAJOR, chord('E', -1, 'M'))).toBe('♭III');
  });
  it('♭VI in C major — A♭ major', () => {
    expect(romanNumeral(C_MAJOR, chord('A', -1, 'M'))).toBe('♭VI');
  });
  it('♭VII in C major — B♭ major', () => {
    expect(romanNumeral(C_MAJOR, chord('B', -1, 'M'))).toBe('♭VII');
  });
  it('vi7 — A minor 7th in C major', () => {
    expect(romanNumeral(C_MAJOR, chord('A', 0, 'm7'))).toBe('vi7');
  });
  it('V7 — G dominant 7th in C major', () => {
    expect(romanNumeral(C_MAJOR, chord('G', 0, 'dom7'))).toBe('V7');
  });
  it('I7 — C Major 7th in C major (suffix is always 7)', () => {
    expect(romanNumeral(C_MAJOR, chord('C', 0, 'M7'))).toBe('I7');
  });
});
