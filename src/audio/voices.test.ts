import { describe, expect, it } from 'vitest';
import { delayTimeForMidi, midiToFrequency } from './voices';

describe('voice pitch math', () => {
  it('midiToFrequency: A4 (69) = 440 Hz, one octave up doubles', () => {
    expect(midiToFrequency(69)).toBeCloseTo(440);
    expect(midiToFrequency(81)).toBeCloseTo(880);
    expect(midiToFrequency(57)).toBeCloseTo(220);
  });

  it('Karplus-Strong delay time equals one period (1 / frequency)', () => {
    for (const m of [40, 45, 52, 60, 69, 76, 88]) {
      expect(delayTimeForMidi(m)).toBeCloseTo(1 / midiToFrequency(m));
    }
    expect(delayTimeForMidi(69)).toBeCloseTo(1 / 440);
  });
});
