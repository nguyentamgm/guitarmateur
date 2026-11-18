import { describe, expect, it } from 'vitest';
import { SONGS } from './index';
import { judgeSong, noteMidi, numeralSpec } from './bench';

describe('bench helpers', () => {
  it('converts Roman numerals to ChordSpec', () => {
    expect(numeralSpec('I')).toBe(1);
    expect(numeralSpec('ii')).toBe(2);
    expect(numeralSpec('iii')).toBe(3);
    expect(numeralSpec('IV')).toBe(4);
    expect(numeralSpec('V')).toBe(5);
    expect(numeralSpec('vi')).toBe(6);
    expect(numeralSpec('vii')).toBe(7);
    expect(numeralSpec('V7')).toEqual({ root: '5', id: 'dom7' });
    expect(() => numeralSpec('bad')).toThrow();
  });

  it('calculates noteMidi which rises with degree and octave', () => {
    const tonic = 'G';
    const notesInOctave0 = [1, 2, 3, 4, 5, 6, 7].map((degree) =>
      noteMidi(tonic, { at: 0, degree, octave: 0, length: 1 }),
    );

    // Strictly rising across scale degrees
    for (let i = 1; i < notesInOctave0.length; i++) {
      expect(notesInOctave0[i]!).toBeGreaterThan(notesInOctave0[i - 1]!);
    }

    // Octaves strictly rise
    const octMinus1 = noteMidi(tonic, { at: 0, degree: 5, octave: -1, length: 1 });
    const oct0 = noteMidi(tonic, { at: 0, degree: 5, octave: 0, length: 1 });
    const octPlus1 = noteMidi(tonic, { at: 0, degree: 5, octave: 1, length: 1 });

    expect(octMinus1).toBeLessThan(oct0);
    expect(oct0).toBeLessThan(octPlus1);
    expect(oct0 - octMinus1).toBe(12);
    expect(octPlus1 - oct0).toBe(12);
  });

  describe('judgeSong', () => {
    const hb = SONGS['happy-birthday'];

    it('marks "-" slots always true', () => {
      // Slot 0 of Happy Birthday is '-'
      expect(hb.chords[0]).toBe('-');
      const resultWithNull = judgeSong(hb, [null]);
      expect(resultWithNull[0]).toBe(true);

      const resultWithArbitrary = judgeSong(hb, ['anything']);
      expect(resultWithArbitrary[0]).toBe(true);
    });

    it('Happy Birthday slot 7 accepts "V" as well as reference "I"', () => {
      // Slot 7 reference is 'I'
      expect(hb.chords[7]).toBe('I');
      expect(hb.accept?.[7]).toContain('V');

      const picksWithRef = hb.chords.map((c) => (c === '-' ? null : c));
      const marksWithRef = judgeSong(hb, picksWithRef);
      expect(marksWithRef[7]).toBe(true);

      const picksWithV = [...picksWithRef];
      picksWithV[7] = 'V';
      const marksWithV = judgeSong(hb, picksWithV);
      expect(marksWithV[7]).toBe(true);

      const picksWithWrong = [...picksWithRef];
      picksWithWrong[7] = 'IV';
      const marksWithWrong = judgeSong(hb, picksWithWrong);
      expect(marksWithWrong[7]).toBe(false);
    });

    it('marks unfilled non-"-" slots false', () => {
      const allNull = Array(hb.chords.length).fill(null);
      const marks = judgeSong(hb, allNull);
      expect(marks[0]).toBe(true); // '-' is true
      for (let i = 1; i < marks.length; i++) {
        expect(marks[i]).toBe(false);
      }
    });
  });
});
