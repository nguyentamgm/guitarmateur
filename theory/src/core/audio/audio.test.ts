import { describe, expect, it, vi } from 'vitest';
import { createPlayer, decayFactor, midiToFrequency, pluckSamples, seededRandom, type MiniAudioContext } from './index';

const rms = (xs: Float32Array, from: number, to: number) => {
  let s = 0;
  for (let i = from; i < to; i++) s += xs[i]! ** 2;
  return Math.sqrt(s / (to - from));
};

describe('pluck synthesis', () => {
  it('tunes A4 to 440 Hz and an octave to double', () => {
    expect(midiToFrequency(69)).toBe(440);
    expect(midiToFrequency(57)).toBeCloseTo(220, 6);
  });

  it('renders the requested length, within −1…1', () => {
    const x = pluckSamples({ midi: 45, sampleRate: 48000, durationSec: 1 });
    expect(x.length).toBe(48000);
    expect(Math.max(...x.map(Math.abs))).toBeLessThanOrEqual(1);
  });

  it('is deterministic for a seed and differs across seeds', () => {
    const a = pluckSamples({ midi: 60, sampleRate: 44100, durationSec: 0.2, seed: 7 });
    const b = pluckSamples({ midi: 60, sampleRate: 44100, durationSec: 0.2, seed: 7 });
    const c = pluckSamples({ midi: 60, sampleRate: 44100, durationSec: 0.2, seed: 8 });
    expect(a).toEqual(b);
    expect(a).not.toEqual(c);
  });

  it('decays, and low strings ring longer', () => {
    const sr = 44100;
    const x = pluckSamples({ midi: 64, sampleRate: sr, durationSec: 1.5 });
    expect(rms(x, sr, sr * 1.5)).toBeLessThan(rms(x, 0, sr * 0.1) / 4);
    expect(decayFactor(40)).toBeGreaterThan(decayFactor(64));
  });

  it('repeats with the string period (pitch)', () => {
    const sr = 44100;
    const x = pluckSamples({ midi: 57, sampleRate: sr, durationSec: 0.5 });
    const period = Math.round(sr / 220);
    let best = 0;
    let bestLag = 0;
    for (let lag = 50; lag < 400; lag++) {
      let s = 0;
      for (let i = 2000; i < 6000; i++) s += x[i]! * x[i + lag]!;
      if (s > best) [best, bestLag] = [s, lag];
    }
    expect(Math.abs(bestLag - period)).toBeLessThanOrEqual(1);
  });

  it('produces uniform noise in [0, 1)', () => {
    const r = seededRandom(1);
    const xs = Array.from({ length: 1000 }, r);
    expect(Math.min(...xs)).toBeGreaterThanOrEqual(0);
    expect(Math.max(...xs)).toBeLessThan(1);
  });
});

function fakeContext() {
  const started: number[] = [];
  const buffers: number[] = [];
  const node = () => ({ connect: vi.fn() });
  const ctx: MiniAudioContext = {
    sampleRate: 8000,
    currentTime: 1,
    state: 'suspended',
    destination: {} as AudioNode,
    resume: vi.fn(() => Promise.resolve()),
    createBuffer: (_c: number, length: number) => {
      buffers.push(length);
      return { getChannelData: () => new Float32Array(length) } as unknown as AudioBuffer;
    },
    createBufferSource: () =>
      ({ ...node(), buffer: null, start: (t: number) => started.push(t) }) as unknown as AudioBufferSourceNode,
    createGain: () => ({ ...node(), gain: { value: 0 } }) as unknown as GainNode,
  };
  return { ctx, started, buffers };
}

describe('player', () => {
  it('creates no audio context until the first pluck (autoplay rule)', () => {
    const make = vi.fn(() => fakeContext().ctx);
    const p = createPlayer({ createContext: make });
    expect(make).not.toHaveBeenCalled();
    p.pluck(60);
    expect(make).toHaveBeenCalledTimes(1);
    p.pluck(62);
    expect(make).toHaveBeenCalledTimes(1);
  });

  it('resumes a suspended context, schedules notes and caches buffers', () => {
    const f = fakeContext();
    const p = createPlayer({ createContext: () => f.ctx });
    p.pluck(60);
    p.pluck(60, 0.5);
    expect(f.ctx.resume).toHaveBeenCalled();
    expect(f.started).toEqual([1, 1.5]);
    expect(f.buffers).toHaveLength(1);
  });

  it('stays silent when disabled', () => {
    const f = fakeContext();
    const p = createPlayer({ createContext: () => f.ctx });
    p.setEnabled(false);
    p.pluck(60);
    expect(f.started).toEqual([]);
    expect(p.enabled).toBe(false);
  });
});
