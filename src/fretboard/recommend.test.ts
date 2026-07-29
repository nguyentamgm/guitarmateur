import { describe, expect, it } from 'vitest';
import { note } from '../music';
import type { Key } from '../music';
import { TUNINGS } from './tuning';
import { positions } from './positions';
import { recommendedPosition } from './recommend';

const A_MINOR: Key = { tonic: note('A'), scaleId: 'minorPentatonic' };
const C_MAJOR: Key = { tonic: note('C'), scaleId: 'major' };

describe('recommendedPosition', () => {
  it('returns index 0 (tonic box) for A minor pentatonic, standard tuning', () => {
    const pos = positions(TUNINGS.standard, A_MINOR);
    expect(recommendedPosition(pos)).toBe(0);
  });

  it('returns index 0 (tonic box) for C major, standard tuning', () => {
    const pos = positions(TUNINGS.standard, C_MAJOR);
    expect(recommendedPosition(pos)).toBe(0);
  });

  it('returns index 0 (tonic box) for A minor pentatonic, drop D tuning', () => {
    const pos = positions(TUNINGS.dropD, A_MINOR);
    expect(recommendedPosition(pos)).toBe(0);
  });

  it('always returns 0 regardless of scale length', () => {
    // Every scale's first position starts at the tonic (index 0)
    const pos = positions(TUNINGS.standard, C_MAJOR); // 7 positions for major
    expect(recommendedPosition(pos)).toBe(0);
    expect(pos.length).toBe(7);
  });
});
