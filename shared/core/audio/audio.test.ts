import { describe, expect, it, vi } from 'vitest';
import { bend, bendRelease, clickSamples, createPlayer, glideEnd, legato, rateOf, semisAt, slide, vibrato, decayFactor, midiToFrequency, pluckSamples, seededRandom, type MiniAudioContext } from './index';

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

  it('clicks with its own buffers, accent apart, and damps a note after its length', () => {
    const f = fakeContext();
    const targets: number[] = [];
    const ctx = {
      ...f.ctx,
      createGain: () =>
        ({ connect: vi.fn(), gain: { value: 0, setTargetAtTime: (_v: number, t: number) => targets.push(t) } }) as unknown as GainNode,
    };
    const p = createPlayer({ createContext: () => ctx });
    p.click(true);
    p.click(false, 0.25);
    p.click(true, 0.5);
    expect(f.started).toEqual([1, 1.25, 1.5]);
    expect(f.buffers).toHaveLength(2);
    p.pluck(60, 0.5, 0.25);
    expect(targets).toEqual([1.75]);
  });
});

describe('click synthesis', () => {
  it('is short, within −1…1, louder when accented, and fades out', () => {
    const plain = clickSamples({ sampleRate: 8000 });
    const accent = clickSamples({ sampleRate: 8000, accent: true });
    expect(plain).toHaveLength(400);
    const peak = (xs: Float32Array) => Math.max(...xs.map(Math.abs));
    expect(peak(accent)).toBeLessThanOrEqual(1);
    expect(peak(accent)).toBeGreaterThan(peak(plain));
    expect(Math.abs(plain[plain.length - 1]!)).toBeLessThan(0.01);
  });
});

describe('palm mute (K6.5)', () => {
  const sr = 8000;
  const open = pluckSamples({ midi: 40, sampleRate: sr, durationSec: 0.6 });
  const muted = pluckSamples({ midi: 40, sampleRate: sr, muted: true });
  /** Energy of the sample-to-sample change: a rough measure of brightness. */
  const edge = (xs: Float32Array, from: number, to: number) => {
    const d = new Float32Array(to - from);
    for (let i = from; i < to; i++) d[i - from] = xs[i]! - xs[i - 1]!;
    return rms(d, 0, d.length) / rms(xs, from, to);
  };

  it('is short: almost silent by 0.4 s while the open string still rings', () => {
    expect(muted.length).toBe(0.6 * sr);
    expect(rms(muted, 0.4 * sr, 0.5 * sr) / rms(muted, 0, 0.05 * sr)).toBeLessThan(0.05);
    expect(rms(open, 0.4 * sr, 0.5 * sr) / rms(open, 0, 0.05 * sr)).toBeGreaterThan(0.2);
  });

  it('is darker than an open pluck', () => {
    expect(edge(muted, 1, 0.05 * sr)).toBeLessThan(edge(open, 1, 0.05 * sr));
  });

  it('has its own cached buffer in the player', () => {
    const f = fakeContext();
    const p = createPlayer({ createContext: () => f.ctx });
    p.pluck(40);
    p.mute(40);
    p.mute(40, 0.25);
    expect(f.buffers).toHaveLength(2);
    expect(f.started).toEqual([1, 1, 1.25]);
  });
});

describe('glides (K6.3, K6.4)', () => {
  it('turns semitones into playback rates', () => {
    expect(rateOf(0)).toBe(1);
    expect(rateOf(12)).toBeCloseTo(2);
    expect(rateOf(2)).toBeCloseTo(1.1225, 4);
  });

  it('bends up to the target and stays there', () => {
    const g = bend(2, 0.1, 0.2);
    expect(semisAt(g, 0.05)).toBe(0);
    expect(semisAt(g, 0.2)).toBeCloseTo(1);
    expect(semisAt(g, 0.3)).toBeCloseTo(2);
    expect(semisAt(g, 5)).toBe(2);
  });

  it('releases a bend back to the fretted pitch', () => {
    const g = bendRelease(2, 0.1, 0.1, 0.2, 0.1);
    expect(semisAt(g, 0.25)).toBe(2);
    expect(semisAt(g, 0.45)).toBeCloseTo(1);
    expect(semisAt(g, 1)).toBe(0);
    expect(glideEnd(g)).toBeCloseTo(0.5);
  });

  it('jumps on a hammer-on or pull-off, ramps on a slide', () => {
    expect(semisAt(legato(2, 0.2), 0.19)).toBe(0);
    expect(semisAt(legato(2, 0.2), 0.2)).toBe(2);
    expect(semisAt(legato(-2, 0.2), 0.3)).toBe(-2);
    expect(semisAt(slide(-3, 0.2, 0.1), 0.25)).toBeCloseTo(-1.5);
  });

  it('wobbles evenly around the note and stays within its depth', () => {
    const g = vibrato(0.2, 1, 0.4, 5);
    const samples = Array.from({ length: 200 }, (_, i) => semisAt(g, 0.2 + i / 200));
    expect(Math.max(...samples)).toBeLessThanOrEqual(0.4 + 1e-9);
    expect(Math.min(...samples)).toBeGreaterThanOrEqual(-0.4 - 1e-9);
    expect(Math.max(...samples)).toBeGreaterThan(0.35);
    expect(semisAt(g, 0.1)).toBe(0);
  });

  it('schedules the glide on the same source, in context time', () => {
    const f = fakeContext();
    const calls: [string, number, number][] = [];
    const rate = {
      setValueAtTime: (v: number, t: number) => calls.push(['set', v, t]),
      linearRampToValueAtTime: (v: number, t: number) => calls.push(['ramp', v, t]),
    };
    const ctx = { ...f.ctx, createBufferSource: () => ({ connect: vi.fn(), buffer: null, playbackRate: rate, start: vi.fn() }) as unknown as AudioBufferSourceNode };
    createPlayer({ createContext: () => ctx }).pluck(60, 0.5, undefined, bend(2, 0.1, 0.2));
    expect(calls[0]).toEqual(['set', 1, 1.5]);
    expect(calls.at(-1)![0]).toBe('ramp');
    expect(calls.at(-1)![1]).toBeCloseTo(rateOf(2));
    expect(calls.at(-1)![2]).toBeCloseTo(1.8);
  });
});

describe('player: clock and levels (for a sequencer)', () => {
  it('tells the audio time, creating the context on first ask', () => {
    const make = vi.fn(() => fakeContext().ctx);
    const p = createPlayer({ createContext: make });
    expect(p.now()).toBe(1);
    expect(make).toHaveBeenCalledTimes(1);
  });

  it('mixes notes and clicks by their own levels, 1 by default (unchanged sound)', () => {
    const f = fakeContext();
    const gains: { value: number }[] = [];
    const ctx: MiniAudioContext = {
      ...f.ctx,
      createGain: () => {
        const gain = { value: 0 };
        gains.push(gain);
        return { connect: vi.fn(), gain } as unknown as GainNode;
      },
    };
    const p = createPlayer({ createContext: () => ctx, gain: 0.5 });
    p.pluck(60);
    p.setLevels({ note: 0.5, click: 0.2 });
    p.pluck(60);
    p.click();
    p.setLevels({ note: 7 });
    p.mute(60);
    expect(gains.map((g) => g.value)).toEqual([0.5, 0.25, 0.1, 0.5]);
  });
});
