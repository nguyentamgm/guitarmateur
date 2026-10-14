import { describe, expect, it, vi } from 'vitest';
import {
  CANCEL_FADE_SEC,
  HOLD_FADE_SEC,
  HOLD_LEVEL,
  LOOP_MAX_SEC,
  LOOP_MIN_SEC,
  MIN_FADE_SEC,
  SUSTAIN_PEAK,
  TONE_ATTACK_SEC,
  TONE_RELEASE_SEC,
  TONE_SEC,
  createPlayer,
  midiToFrequency,
  sustainLoop,
  sustainSamples,
  type MiniAudioContext,
} from './index';

const peak = (xs: Float32Array) => xs.reduce((m, x) => Math.max(m, Math.abs(x)), 0);
const cents = (hz: number, ref: number) => 1200 * Math.log2(hz / ref);

describe('sustain synthesis', () => {
  it('is deterministic', () => {
    expect(sustainSamples({ midi: 45, sampleRate: 44100 })).toEqual(
      sustainSamples({ midi: 45, sampleRate: 44100 }),
    );
  });

  it.each([44100, 48000])(
    'loops 0.5–1 s of whole cycles, within 0.05 cent of the note (inaudible), MIDI 28–100 at %i Hz',
    (sr) => {
      for (let midi = 28; midi <= 100; midi++) {
        const { length, cycles } = sustainLoop(midi, sr);
        expect(length, `${midi}`).toBeGreaterThanOrEqual(Math.round(sr * LOOP_MIN_SEC));
        expect(length, `${midi}`).toBeLessThanOrEqual(Math.round(sr * LOOP_MAX_SEC));
        expect(
          Math.abs(cents((cycles * sr) / length, midiToFrequency(midi))),
          `${midi}`,
        ).toBeLessThan(0.05);
        expect(sustainSamples({ midi, sampleRate: sr })).toHaveLength(length);
      }
    },
  );

  it('peaks at SUSTAIN_PEAK', () => {
    for (const midi of [40, 57, 76])
      expect(peak(sustainSamples({ midi, sampleRate: 8000 }))).toBeCloseTo(SUSTAIN_PEAK, 6);
  });

  it('loops without a seam: the last sample runs into the first like any two neighbours', () => {
    for (const midi of [40, 45, 52, 57, 64, 69, 76]) {
      const x = sustainSamples({ midi, sampleRate: 44100 });
      let maxStep = 0;
      for (let i = 1; i < x.length; i++) maxStep = Math.max(maxStep, Math.abs(x[i]! - x[i - 1]!));
      expect(Math.abs(x[0]! - x[x.length - 1]!), `${midi}`).toBeLessThanOrEqual(maxStep);
      // The step across the seam is what the wave's next step would be: start at phase 0, end one sample before it.
      expect(x[0]).toBe(0);
    }
  });

  it('repeats with the note period (pitch)', () => {
    const sr = 44100;
    const x = sustainSamples({ midi: 57, sampleRate: sr });
    let best = -Infinity;
    let bestLag = 0;
    for (let lag = 50; lag < 400; lag++) {
      let s = 0;
      for (let i = 0; i < 4000; i++) s += x[i]! * x[i + lag]!;
      if (s > best) [best, bestLag] = [s, lag];
    }
    expect(Math.abs(bestLag - sr / 220)).toBeLessThanOrEqual(1);
  });

  it('leaves out harmonics at or above Nyquist: a high note at a low rate is a bare sine', () => {
    const sr = 8000;
    const x = sustainSamples({ midi: 100, sampleRate: sr });
    const { length, cycles } = sustainLoop(100, sr);
    for (let i = 0; i < 200; i++) {
      expect(x[i]).toBeCloseTo(SUSTAIN_PEAK * Math.sin((2 * Math.PI * cycles * i) / length), 5);
    }
  });
});

/** A fake context that records what each gain and source is told, in context time. */
function recordingContext() {
  const log: string[] = [];
  let id = 0;
  const gains: { name: string; value: number }[] = [];
  const sources: { name: string; loop: boolean; buffer: unknown; onended: (() => void) | null }[] =
    [];
  const t = (x: number) => +x.toFixed(4);
  const ctx = {
    sampleRate: 8000,
    currentTime: 1,
    state: 'running',
    destination: {} as AudioNode,
    resume: vi.fn(() => Promise.resolve()),
    createBuffer: (_c: number, length: number) => {
      log.push(`buffer ${length}`);
      return { getChannelData: () => new Float32Array(length) } as unknown as AudioBuffer;
    },
    createGain: () => {
      const name = `g${id++}`;
      const gain = {
        value: 0,
        setValueAtTime: (v: number, at: number) => log.push(`${name} set ${t(v)} @${t(at)}`),
        linearRampToValueAtTime: (v: number, at: number) =>
          log.push(`${name} ramp ${t(v)} @${t(at)}`),
        setTargetAtTime: (v: number, at: number, tc: number) =>
          log.push(`${name} target ${t(v)} @${t(at)} ~${tc}`),
        cancelScheduledValues: (at: number) => log.push(`${name} cancel @${t(at)}`),
      };
      const rec = {
        name,
        get value() {
          return gain.value;
        },
      };
      gains.push(rec);
      return { gain, connect: vi.fn() } as unknown as GainNode;
    },
    createBufferSource: () => {
      const name = `s${id++}`;
      const src = {
        name,
        loop: false,
        buffer: null as unknown,
        onended: null as (() => void) | null,
        playbackRate: undefined,
        connect: vi.fn(),
        start: (at: number) => log.push(`${name} start @${t(at)}${src.loop ? ' loop' : ''}`),
        stop: (at: number) => log.push(`${name} stop @${t(at)}`),
      };
      sources.push(src);
      return src as unknown as AudioBufferSourceNode;
    },
  };
  return { ctx: ctx as MiniAudioContext & { currentTime: number }, log, gains, sources };
}

const GAIN = 0.32;
const r4 = (x: number) => +x.toFixed(4);

describe('player.hold (a drone)', () => {
  it('creates no context until it is asked for, then fades in from 0 over HOLD_FADE_SEC', () => {
    const f = recordingContext();
    const make = vi.fn(() => f.ctx);
    const p = createPlayer({ createContext: make });
    expect(make).not.toHaveBeenCalled();
    p.hold([45, 52]);
    expect(make).toHaveBeenCalledTimes(1);
    expect(f.log.filter((l) => l.startsWith('g0'))).toEqual([
      'g0 cancel @1',
      'g0 set 0 @1',
      `g0 ramp ${r4(GAIN * HOLD_LEVEL)} @${1 + HOLD_FADE_SEC}`,
    ]);
    // Two looping notes, now, sharing the level: 1/√2 each.
    expect(f.log.filter((l) => l.includes('start'))).toEqual([
      's2 start @1 loop',
      's3 start @1 loop',
    ]);
    expect(f.gains[1]!.value).toBeCloseTo(1 / Math.sqrt(2));
  });

  it('fades out on stop, then stops its notes; a second stop does nothing', () => {
    const f = recordingContext();
    const held = createPlayer({ createContext: () => f.ctx }).hold([45], {
      level: 0.5,
      fadeSec: 2,
    });
    expect(f.log).toContain(`g0 ramp ${r4(GAIN * 0.5)} @3`);
    f.ctx.currentTime = 10;
    f.log.length = 0;
    held.stop(0.5);
    expect(f.log).toEqual(['g0 cancel @10', 'g0 set 0 @10', 'g0 ramp 0 @10.5', 's2 stop @10.51']);
    held.stop();
    expect(f.log).toHaveLength(4);
  });

  it('never fades faster than MIN_FADE_SEC, in or out', () => {
    const f = recordingContext();
    const held = createPlayer({ createContext: () => f.ctx }).hold([45], { fadeSec: 0 });
    expect(f.log).toContain(`g0 ramp ${r4(GAIN * HOLD_LEVEL)} @${1 + MIN_FADE_SEC}`);
    held.stop(0);
    expect(f.log).toContain(`g0 ramp 0 @${1 + MIN_FADE_SEC}`);
  });

  it('follows the drone level, as it sounds too, without a jump', () => {
    const f = recordingContext();
    const p = createPlayer({ createContext: () => f.ctx });
    p.setLevels({ drone: 0.5 });
    p.hold([45]);
    expect(f.log).toContain(`g0 ramp ${r4(GAIN * HOLD_LEVEL * 0.5)} @2`);
    // Mid fade-in: the new level is reached when the fade-in ends.
    f.ctx.currentTime = 1.5;
    p.setLevels({ drone: 1 });
    expect(f.log.slice(-1)).toEqual([`g0 ramp ${r4(GAIN * HOLD_LEVEL)} @2`]);
    // Later: a 0.1 s glide.
    f.ctx.currentTime = 5;
    p.setLevels({ drone: 0 });
    expect(f.log.slice(-1)).toEqual(['g0 ramp 0 @5.1']);
  });

  it('a stopped hold no longer follows the drone level', () => {
    const f = recordingContext();
    const p = createPlayer({ createContext: () => f.ctx });
    p.hold([45]).stop();
    const n = f.log.length;
    p.setLevels({ drone: 0.2 });
    expect(f.log).toHaveLength(n);
  });

  it('does nothing when disabled or given no notes, and its stop is safe', () => {
    const f = recordingContext();
    const make = vi.fn(() => f.ctx);
    const p = createPlayer({ createContext: make });
    p.setEnabled(false);
    expect(() => p.hold([45]).stop()).not.toThrow();
    expect(make).not.toHaveBeenCalled();
    p.setEnabled(true);
    p.hold([]).stop();
    expect(f.log.filter((l) => l.includes('start'))).toEqual([]);
  });
});

describe('player.tone (a clean tone)', () => {
  it('loops the sustained voice: attack, hold for its length, release, stop', () => {
    const f = recordingContext();
    const p = createPlayer({ createContext: () => f.ctx });
    p.setLevels({ note: 0.5 });
    p.tone(60, 0.5, 2);
    expect(f.log.filter((l) => !l.startsWith('buffer'))).toEqual([
      'g1 cancel @1.5',
      'g1 set 0 @1.5',
      `g1 ramp ${r4(GAIN * 0.5)} @${1.5 + TONE_ATTACK_SEC}`,
      `g1 target 0 @3.5 ~${TONE_RELEASE_SEC}`,
      's0 start @1.5 loop',
      `s0 stop @${r4(3.5 + 5 * TONE_RELEASE_SEC)}`,
    ]);
  });

  it('lasts TONE_SEC by default and shares its buffer with a held note of the same pitch', () => {
    const f = recordingContext();
    const p = createPlayer({ createContext: () => f.ctx });
    p.tone(60);
    p.hold([60]);
    p.tone(62);
    expect(f.log).toContain(`g1 target 0 @${1 + TONE_SEC} ~${TONE_RELEASE_SEC}`);
    expect(f.log.filter((l) => l.startsWith('buffer'))).toHaveLength(2);
  });
});

describe('player.cancel', () => {
  it('fades out and stops every note, click and tone scheduled or sounding, but not a hold', () => {
    const f = recordingContext();
    const p = createPlayer({ createContext: () => f.ctx });
    p.pluck(60);
    p.click(true, 2);
    p.tone(64, 0.5);
    p.hold([45]);
    f.ctx.currentTime = 1.2;
    f.log.length = 0;
    p.cancel();
    const end = r4(1.2 + CANCEL_FADE_SEC);
    const stop = r4(1.2 + CANCEL_FADE_SEC + 0.01);
    // Each fades from where its gain is now (a pluck's or click's 0.32; the fake tone's ramp left 0).
    expect(f.log).toEqual([
      'g1 cancel @1.2',
      'g1 set 0.32 @1.2',
      `g1 ramp 0 @${end}`,
      `s0 stop @${stop}`,
      'g3 cancel @1.2',
      'g3 set 0.32 @1.2',
      `g3 ramp 0 @${end}`,
      `s2 stop @${stop}`,
      'g5 cancel @1.2',
      'g5 set 0 @1.2',
      `g5 ramp 0 @${end}`,
      `s4 stop @${stop}`,
    ]);
    // Once cancelled, they are forgotten: a second cancel has nothing to stop.
    f.log.length = 0;
    p.cancel();
    expect(f.log).toEqual([]);
  });

  it('leaves alone a note that has already ended', () => {
    const f = recordingContext();
    const p = createPlayer({ createContext: () => f.ctx });
    p.pluck(60);
    p.pluck(62);
    f.sources[0]!.onended!();
    f.log.length = 0;
    p.cancel();
    expect(f.log.filter((l) => l.includes('stop'))).toEqual([
      `s2 stop @${r4(1 + CANCEL_FADE_SEC + 0.01)}`,
    ]);
  });

  it('creates no context and does not throw before any sound', () => {
    const make = vi.fn(() => recordingContext().ctx);
    expect(() => createPlayer({ createContext: make }).cancel()).not.toThrow();
    expect(make).not.toHaveBeenCalled();
  });

  it('does not throw on a context whose sources cannot stop', () => {
    const f = recordingContext();
    const ctx = {
      ...f.ctx,
      createBufferSource: () =>
        ({ connect: vi.fn(), buffer: null, start: vi.fn() }) as unknown as AudioBufferSourceNode,
    };
    const p = createPlayer({ createContext: () => ctx });
    p.pluck(60);
    expect(() => p.cancel()).not.toThrow();
  });
});
