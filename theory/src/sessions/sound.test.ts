import { describe, expect, it } from 'vitest';
import { soundBeats, soundSeconds, strummed, then, type Sound } from './sound';

describe('sessions sound data', () => {
  it('computes soundBeats as the end of the last event', () => {
    const empty: Sound = { bpm: 120, events: [] };
    expect(soundBeats(empty)).toBe(0);
    expect(soundSeconds(empty)).toBe(0);

    const s: Sound = {
      bpm: 120,
      events: [
        { at: 0, length: 2 },
        { at: 3 }, // default length 1 -> ends at 4
        { at: 1, length: 1.5 },
      ],
    };
    expect(soundBeats(s)).toBe(4);
    // 4 beats at 120 BPM = 2 seconds
    expect(soundSeconds(s)).toBe(2);
  });

  it('creates strummed events with defaults', () => {
    const ev = strummed([40, 47, 52], 2, 3);
    expect(ev).toEqual({
      at: 2,
      midis: [40, 47, 52],
      strum: true,
      length: 3,
    });

    const def = strummed([40, 47], 0);
    expect(def).toEqual({
      at: 0,
      midis: [40, 47],
      strum: true,
      length: 1,
    });
  });

  it('shifts the second sound events by soundBeats(a) + gap', () => {
    const a: Sound = {
      bpm: 80,
      events: [strummed([40, 47, 52, 55, 59, 64], 0, 2)],
    };
    expect(soundBeats(a)).toBe(2);

    const b: Sound = {
      bpm: 100, // bpm of b is overridden by a.bpm per spec
      events: [
        strummed([40, 47, 52, 56, 59, 64], 0, 2),
        { at: 3, click: 'accent', length: 0.5 },
      ],
    };

    const combined = then(a, b, 1);
    expect(combined.bpm).toBe(80);
    expect(combined.events).toHaveLength(3);
    expect(combined.events[0]).toEqual(a.events[0]);
    // soundBeats(a) + gap = 2 + 1 = 3
    expect(combined.events[1]).toEqual({
      at: 3,
      midis: [40, 47, 52, 56, 59, 64],
      strum: true,
      length: 2,
    });
    expect(combined.events[2]).toEqual({
      at: 6,
      click: 'accent',
      length: 0.5,
    });
    // soundBeats(combined) = max(2, 5, 6.5) = 6.5
    expect(soundBeats(combined)).toBe(6.5);
  });
});
