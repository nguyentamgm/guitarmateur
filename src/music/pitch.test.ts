import { describe, expect, it } from 'vitest';
import { IV, type Interval } from './interval';
import { format, midi, note, pc, pitch, transpose, transposePitch, type NoteName } from './pitch';

describe('pc / format', () => {
  it('computes pitch classes', () => {
    expect(pc(note('C'))).toBe(0);
    expect(pc(note('B', -1))).toBe(10);
    expect(pc(note('C', 1))).toBe(1);
    expect(pc(note('F', -1))).toBe(4); // F♭ == E
    expect(pc(note('B', 1))).toBe(0); // B♯ == C
  });
  it('formats with unicode accidentals', () => {
    expect(format(note('B', -1))).toBe('B♭');
    expect(format(note('F', 1))).toBe('F♯');
    expect(format(note('C'))).toBe('C');
  });
});

describe('midi', () => {
  it('anchors C4 = 60, A4 = 69', () => {
    expect(midi(pitch('C', 0, 4))).toBe(60);
    expect(midi(pitch('A', 0, 4))).toBe(69);
    expect(midi(pitch('E', 0, 2))).toBe(40); // open low E
    expect(midi(pitch('A', 0, 2))).toBe(45); // open A
  });
});

describe('transpose — spelling table', () => {
  // Expectations taken from a reference, not derived by the code under test.
  const cases: { from: NoteName; iv: Interval; expect: NoteName }[] = [
    { from: note('F'), iv: IV.m3, expect: note('A', -1) }, // A♭ not G♯
    { from: note('E'), iv: IV.M3, expect: note('G', 1) }, // G♯
    { from: note('C', 1), iv: IV.m3, expect: note('E') }, // E
    { from: note('B', -1), iv: IV.d5, expect: note('F', -1) }, // F♭
    { from: note('F', 1), iv: IV.P5, expect: note('C', 1) }, // C♯
    { from: note('C'), iv: IV.P1, expect: note('C') },
    { from: note('C'), iv: IV.M2, expect: note('D') },
    { from: note('C'), iv: IV.P4, expect: note('F') },
    { from: note('C'), iv: IV.P5, expect: note('G') },
    { from: note('A'), iv: IV.m7, expect: note('G') },
    { from: note('A'), iv: IV.M6, expect: note('F', 1) },
    { from: note('B', -1), iv: IV.m3, expect: note('D', -1) }, // D♭
    { from: note('E', -1), iv: IV.M3, expect: note('G') },
    { from: note('G'), iv: IV.m6, expect: note('E', -1) }, // E♭
    { from: note('D'), iv: IV.m2, expect: note('E', -1) }, // E♭
    { from: note('F'), iv: IV.M7, expect: note('E') },
    { from: note('B'), iv: IV.P4, expect: note('E') },
    { from: note('C'), iv: IV.P8, expect: note('C') },
  ];
  it.each(cases)('$from.letter$from.alter + iv -> spelled', ({ from, iv, expect: exp }) => {
    expect(transpose(from, iv)).toEqual(exp);
  });
});

describe('transposePitch', () => {
  it('carries octaves correctly', () => {
    expect(transposePitch(pitch('C', 0, 4), IV.P5)).toEqual(pitch('G', 0, 4));
    expect(transposePitch(pitch('A', 0, 2), IV.P4)).toEqual(pitch('D', 0, 3)); // A2 -> D3
    expect(transposePitch(pitch('C', 0, 4), IV.P8)).toEqual(pitch('C', 0, 5));
    expect(midi(transposePitch(pitch('E', 0, 2), IV.m3))).toBe(midi(pitch('E', 0, 2)) + 3);
  });
});
