import { describe, expect, it } from 'vitest';
import { mulberry32 } from './rng';
import { buildRhythm, pickPattern, activeSlots, patternLengthBeats, LENGTH_BEATS } from './rhythm';

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

describe('buildRhythm', () => {
  it('1 bar spans LENGTH_BEATS beats', () => {
    const rng = mulberry32(0);
    const pattern = buildRhythm(1, 1, rng);
    expect(patternLengthBeats(pattern)).toBe(LENGTH_BEATS);
  });

  it('2 bars span 2 × LENGTH_BEATS beats', () => {
    const rng = mulberry32(0);
    const pattern = buildRhythm(1, 2, rng);
    expect(patternLengthBeats(pattern)).toBe(LENGTH_BEATS * 2);
  });

  it('second bar slots are offset by LENGTH_BEATS', () => {
    const rng = mulberry32(42);
    const pattern = buildRhythm(1, 2, rng);
    const secondBarSlots = pattern.filter((slot) => slot.startBeat >= LENGTH_BEATS);
    expect(secondBarSlots.length).toBeGreaterThan(0);
    for (const slot of secondBarSlots) {
      expect(slot.startBeat).toBeGreaterThanOrEqual(LENGTH_BEATS);
      expect(slot.startBeat).toBeLessThan(LENGTH_BEATS * 2);
    }
  });

  it('is deterministic: same seed produces same multi-bar pattern', () => {
    const a = buildRhythm(3, 2, mulberry32(7));
    const b = buildRhythm(3, 2, mulberry32(7));
    expect(a.map((s) => s.startBeat)).toEqual(b.map((s) => s.startBeat));
    expect(a.map((s) => s.durationBeats)).toEqual(b.map((s) => s.durationBeats));
  });
});
