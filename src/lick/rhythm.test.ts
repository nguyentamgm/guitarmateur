import { describe, expect, it } from 'vitest';
import { mulberry32 } from './rng';
import { pickPattern, activeSlots, patternLengthBeats, LENGTH_BEATS } from './rhythm';

describe('rhythm patterns', () => {
  it('every pattern sums to LENGTH_BEATS beats', () => {
    for (const level of [1, 2, 3, 4, 5] as const) {
      for (const level2 of [level]) {
        const rng = mulberry32(0);
        for (let i = 0; i < 20; i++) {
          const p = pickPattern(level2, rng);
          expect(patternLengthBeats(p)).toBe(LENGTH_BEATS);
        }
      }
    }
  });

  it('last active slot starts at or after beat 3', () => {
    for (const level of [1, 2, 3] as const) {
      const rng = mulberry32(0);
      for (let i = 0; i < 20; i++) {
        const p = pickPattern(level, rng);
        const act = activeSlots(p);
        const last = act[act.length - 1]!;
        // Levels 1-2: on beat 4 (startBeat 3), Level 3+: can start off-beat after beat 3
        if (level <= 2) {
          expect(last.startBeat).toBe(3);
        } else {
          expect(last.startBeat).toBeGreaterThanOrEqual(3);
        }
      }
    }
  });

  it('activeSlots excludes rests', () => {
    const rng = mulberry32(1);
    for (const level of [1, 2, 3] as const) {
      const p = pickPattern(level, rng);
      const act = activeSlots(p);
      for (const slot of act) {
        expect(slot.rest).toBeFalsy();
      }
    }
  });

  it('pickPattern is deterministic: same rng state => same pattern', () => {
    const a = pickPattern(2, mulberry32(10));
    const b = pickPattern(2, mulberry32(10));
    expect(a.map((s) => s.startBeat)).toEqual(b.map((s) => s.startBeat));
  });
});
