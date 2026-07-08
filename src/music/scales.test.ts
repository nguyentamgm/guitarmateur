import { describe, expect, it } from 'vitest';
import { TONICS } from './key';
import { format, type NoteName } from './pitch';
import { SCALE_IDS, SCALES, scaleNoteNames, scalePcs, type ScaleId } from './scales';

const spell = (names: NoteName[]) => names.map(format);

describe('scaleNoteNames — spelled', () => {
  it('F minor pentatonic = F A♭ B♭ C E♭', () => {
    expect(spell(scaleNoteNames({ tonic: { letter: 'F', alter: 0 }, scaleId: 'minorPentatonic' }))).toEqual([
      'F',
      'A♭',
      'B♭',
      'C',
      'E♭',
    ]);
  });
  it('E major pentatonic = E F♯ G♯ B C♯', () => {
    expect(spell(scaleNoteNames({ tonic: { letter: 'E', alter: 0 }, scaleId: 'majorPentatonic' }))).toEqual([
      'E',
      'F♯',
      'G♯',
      'B',
      'C♯',
    ]);
  });
  it('B♭ blues = B♭ D♭ E♭ F♭ F A♭', () => {
    expect(spell(scaleNoteNames({ tonic: { letter: 'B', alter: -1 }, scaleId: 'blues' }))).toEqual([
      'B♭',
      'D♭',
      'E♭',
      'F♭',
      'F',
      'A♭',
    ]);
  });
});

describe('all 12 tonics × 3 scales', () => {
  it('spell without throwing, within valid accidentals (±2)', () => {
    for (const tonic of TONICS) {
      for (const scaleId of SCALE_IDS) {
        const names = scaleNoteNames({ tonic, scaleId });
        expect(names).toHaveLength(SCALES[scaleId].intervals.length);
        for (const n of names) {
          expect(Math.abs(n.alter)).toBeLessThanOrEqual(2);
        }
      }
    }
  });

  it('accepts strict (exotic) blues ♭5 spellings — consistency over prettiness', () => {
    // The ♭5 is spelled as a strict diminished 5th above the tonic, which can be a double-flat.
    expect(spell(scaleNoteNames({ tonic: { letter: 'E', alter: -1 }, scaleId: 'blues' }))).toEqual([
      'E♭',
      'G♭',
      'A♭',
      'B♭♭',
      'B♭',
      'D♭',
    ]);
  });
});

describe('registry invariants', () => {
  it('intervals strictly ascending in semitones, within one octave', () => {
    for (const scaleId of SCALE_IDS) {
      const ivs = SCALES[scaleId].intervals;
      for (let i = 1; i < ivs.length; i++) {
        expect(ivs[i]!.semitones).toBeGreaterThan(ivs[i - 1]!.semitones);
      }
      expect(ivs[0]!.semitones).toBe(0);
      expect(ivs[ivs.length - 1]!.semitones).toBeLessThan(12);
    }
  });

  it('decorated scale intervals = base ∪ added', () => {
    for (const scaleId of SCALE_IDS) {
      const def = SCALES[scaleId];
      if (!def.decoration) continue;
      const base = SCALES[def.decoration.baseScaleId as ScaleId];
      const union = new Set([
        ...base.intervals.map((iv) => iv.semitones),
        ...def.decoration.addedIntervals.map((iv) => iv.semitones),
      ]);
      expect(new Set(def.intervals.map((iv) => iv.semitones))).toEqual(union);
    }
  });

  it('scalePcs = pitch classes of the scale (A minor pentatonic)', () => {
    expect(scalePcs({ tonic: { letter: 'A', alter: 0 }, scaleId: 'minorPentatonic' })).toEqual(
      new Set([9, 0, 2, 4, 7]),
    );
  });
});
