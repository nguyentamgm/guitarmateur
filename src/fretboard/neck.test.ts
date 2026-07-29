import { describe, expect, it } from 'vitest';
import { note, pc, scalePcs, type Key } from '../music';
import { TUNINGS } from './tuning';
import { scaleSpelling, decorationPcs, scaleNotesOnNeck } from './neck';

const A_MINOR: Key = { tonic: note('A'), scaleId: 'minorPentatonic' };
const A_BLUES: Key = { tonic: note('A'), scaleId: 'blues' };
const C_MAJOR_BLUES: Key = { tonic: note('C'), scaleId: 'major-blues' };
const E_BLUES: Key = { tonic: note('E'), scaleId: 'blues' };

describe('scaleSpelling', () => {
  it('A minor pentatonic maps all 5 pitch classes with correct spelling and degree', () => {
    const map = scaleSpelling(A_MINOR); // tonic A pc=9
    // Degree is 1-based index into the scale's interval list, not music-theoretic degree number
    expect(map.get(9)).toEqual({ name: note('A'), degree: 1 });
    expect(map.get(0)).toEqual({ name: note('C'), degree: 2 }); // m3 interval = index 1
    expect(map.get(2)).toEqual({ name: note('D'), degree: 3 }); // P4 = index 2
    expect(map.get(4)).toEqual({ name: note('E'), degree: 4 }); // P5 = index 3
    expect(map.get(7)).toEqual({ name: note('G'), degree: 5 }); // m7 = index 4
    expect(map.size).toBe(5);
  });

  it('E blues maps all 6 pitch classes with correct spelling', () => {
    const map = scaleSpelling(E_BLUES); // tonic E pc=4
    // blues = P1, m3, P4, d5, P5, m7 → 6 intervals → degrees 1..6
    expect(map.get(4)).toEqual({ name: note('E'), degree: 1 });
    expect(map.get(7)).toEqual({ name: note('G'), degree: 2 });
    expect(map.get(9)).toEqual({ name: note('A'), degree: 3 });
    expect(map.get(10)).toEqual({ name: note('B', -1), degree: 4 }); // B♭ = d5
    expect(map.get(11)).toEqual({ name: note('B'), degree: 5 }); // B = P5
    expect(map.get(2)).toEqual({ name: note('D'), degree: 6 }); // m7
    expect(map.size).toBe(6);
  });

  it('major scale has all 7 degrees', () => {
    const cMajor: Key = { tonic: note('C'), scaleId: 'major' };
    const map = scaleSpelling(cMajor);
    expect(map.size).toBe(7);
    expect(map.get(0)).toEqual({ name: note('C'), degree: 1 });
    expect(map.get(2)).toEqual({ name: note('D'), degree: 2 });
    expect(map.get(4)).toEqual({ name: note('E'), degree: 3 });
    expect(map.get(5)).toEqual({ name: note('F'), degree: 4 });
    expect(map.get(7)).toEqual({ name: note('G'), degree: 5 });
    expect(map.get(9)).toEqual({ name: note('A'), degree: 6 });
    expect(map.get(11)).toEqual({ name: note('B'), degree: 7 });
  });
});

describe('decorationPcs', () => {
  it('minor pentatonic has no decoration tones', () => {
    expect(decorationPcs(A_MINOR)).toEqual(new Set());
  });

  it('A blues includes ♭5 pc (E♭ = pc 3)', () => {
    const pcs = decorationPcs(A_BLUES);
    expect(pcs.has(3)).toBe(true); // E♭ = pc 3 (A tonic 9 + 6 semitones)
    expect(pcs.size).toBe(1);
  });

  it('C major-blues includes ♭3 pc (E♭ = pc 3)', () => {
    const pcs = decorationPcs(C_MAJOR_BLUES);
    expect(pcs.has(3)).toBe(true); // E♭ = pc 3 (C tonic 0 + 3 semitones)
    expect(pcs.size).toBe(1);
  });
});

describe('scaleNotesOnNeck', () => {
  it('returns correct note count for A minor pentatonic, standard, maxFret=12', () => {
    const notes = scaleNotesOnNeck(TUNINGS.standard, A_MINOR, 12);
    // 6 strings × 5 scale notes — exact count depends on open-string overlap
    expect(notes.length).toBeGreaterThanOrEqual(24);
    expect(notes.length).toBeLessThanOrEqual(40);
    notes.forEach((n) => {
      expect(n.string).toBeGreaterThanOrEqual(0);
      expect(n.string).toBeLessThan(6);
      expect(n.fret).toBeGreaterThanOrEqual(0);
      expect(n.fret).toBeLessThanOrEqual(12);
    });
  });

  it('all tonic notes are marked in A minor pentatonic', () => {
    const notes = scaleNotesOnNeck(TUNINGS.standard, A_MINOR, 12);
    const tonicNotes = notes.filter((n) => n.pitch.letter === 'A' && n.pitch.alter === 0);
    expect(tonicNotes.length).toBeGreaterThan(0);
    tonicNotes.forEach((n) => expect(n.isTonic).toBe(true));
    // Non-tonic notes should not be marked as tonic
    const nonTonic = notes.filter((n) => !(n.pitch.letter === 'A' && n.pitch.alter === 0));
    nonTonic.forEach((n) => expect(n.isTonic).toBe(false));
  });

  it('no non-scale notes appear', () => {
    const scalePcSet = scalePcs(A_MINOR);
    const notes = scaleNotesOnNeck(TUNINGS.standard, A_MINOR, 12);
    notes.forEach((n) => {
      expect(scalePcSet.has(pc(n.pitch))).toBe(true);
    });
  });

  it('blues scale marks decoration notes correctly', () => {
    const notes = scaleNotesOnNeck(TUNINGS.standard, A_BLUES, 12);
    const decNotes = notes.filter((n) => n.isDecoration);
    expect(decNotes.length).toBeGreaterThan(0);
    // Decoration notes should all be E♭ (the blues ♭5 = d5 above A = 6 semitones = E♭)
    decNotes.forEach((n) => {
      expect(n.pitch.letter).toBe('E');
      expect(n.pitch.alter).toBe(-1);
    });
  });

  it('drop D tuning produces different open-string notes on string 0', () => {
    const standard = scaleNotesOnNeck(TUNINGS.standard, A_MINOR, 5);
    const dropD = scaleNotesOnNeck(TUNINGS.dropD, A_MINOR, 5);
    // String 0 open note changes: E (standard) vs D (drop D)
    const stdOpen0 = standard.filter((n) => n.string === 0 && n.fret === 0);
    const dropOpen0 = dropD.filter((n) => n.string === 0 && n.fret === 0);
    expect(stdOpen0).toHaveLength(1);
    expect(dropOpen0).toHaveLength(1);
    expect(stdOpen0[0]!.pitch.letter).toBe('E');
    expect(dropOpen0[0]!.pitch.letter).toBe('D');
  });

  it('spelling is correct at high fret positions', () => {
    // E blues: high E string (string 5) fret 6 = B♭ (the blues 5th)
    const notes = scaleNotesOnNeck(TUNINGS.standard, E_BLUES, 22);
    const highEStringFret6 = notes.find((n) => n.string === 5 && n.fret === 6);
    expect(highEStringFret6).toBeDefined();
    expect(highEStringFret6!.pitch.letter).toBe('B');
    expect(highEStringFret6!.pitch.alter).toBe(-1);

    // B string (string 4) fret 0 = B (major 3rd of G? no — in E blues, B is the P5)
    const bStringOpen = notes.find((n) => n.string === 4 && n.fret === 0);
    expect(bStringOpen).toBeDefined();
    expect(bStringOpen!.pitch.letter).toBe('B');
    expect(bStringOpen!.pitch.alter).toBe(0);

    // High E string fret 12 = E (octave, tonic)
    const eStringFret12 = notes.find((n) => n.string === 5 && n.fret === 12);
    expect(eStringFret12).toBeDefined();
    expect(eStringFret12!.pitch.letter).toBe('E');
    expect(eStringFret12!.pitch.alter).toBe(0);
  });
});
