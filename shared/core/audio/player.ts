/**
 * Plays plucked notes and clicks through Web Audio.
 * The AudioContext is created lazily on the first sound, which callers must start from a user
 * gesture (a click), because browsers block audio that starts on its own. Nothing is created at
 * import time.
 */
import { clickSamples } from './click';
import { rateOf, type Glide } from './glide';
import { pluckSamples } from './pluck';

/** The slice of the Web Audio API the player uses; lets tests pass a fake. */
export interface MiniAudioContext {
  readonly sampleRate: number;
  readonly currentTime: number;
  readonly state: string;
  readonly destination: AudioNode;
  resume(): Promise<void>;
  createBuffer(channels: number, length: number, sampleRate: number): AudioBuffer;
  createBufferSource(): AudioBufferSourceNode;
  createGain(): GainNode;
}

export interface PlayerOptions {
  /** Defaults to `new AudioContext()`. */
  readonly createContext?: () => MiniAudioContext;
  /** Output level, 0..1. Default 0.32. */
  readonly gain?: number;
}

/** How fast `cancel()` fades out what is sounding. */
export const CANCEL_FADE_SEC = 0.03;

export interface Player {
  /**
   * Play a MIDI note now, or `delaySec` from now; with `lengthSec`, damp it after that long (a
   * note's length, K1.2). A `glide` bends, slides or hammers the same sound without a new pick
   * (K6.3, K6.4). Silently does nothing when disabled or unsupported.
   */
  pluck(midi: number, delaySec?: number, lengthSec?: number, glide?: Glide): void;
  /** A palm-muted note (K6.5): darker and much shorter than `pluck`. Same rules. */
  mute(midi: number, delaySec?: number): void;
  /** A metronome click, `delaySec` from now; `accent` for beat 1. Same rules as `pluck`. */
  click(accent?: boolean, delaySec?: number): void;
  /** Stop every note and click that is scheduled or still sounding, with a short fade. */
  cancel(): void;
  setEnabled(on: boolean): void;
  readonly enabled: boolean;
  /**
   * Seconds on the audio clock: what a sequencer schedules against. Creates the AudioContext if
   * there is none yet (so call it from a user gesture, like `pluck`); null when there is no audio.
   */
  now(): number | null;
  /** Levels, 0..1, for the notes (pluck, mute) and the click: a mix. Both default to 1. */
  setLevels(levels: { readonly note?: number; readonly click?: number }): void;
}

export function isAudioSupported(): boolean {
  return typeof window !== 'undefined' && typeof window.AudioContext === 'function';
}

export function createPlayer(opts: PlayerOptions = {}): Player {
  const gainLevel = opts.gain ?? 0.32;
  const make = opts.createContext ?? (() => new AudioContext() as unknown as MiniAudioContext);
  let ctx: MiniAudioContext | null = null;
  let enabled = true;
  const levels = { note: 1, click: 1 };
  const cache = new Map<string, AudioBuffer>();
  /** Notes and clicks scheduled or sounding, for `cancel()`. */
  const active = new Set<{ readonly src: AudioBufferSourceNode; readonly gain: GainNode }>();
  const clamp = (v: number) => Math.min(1, Math.max(0, v));

  const bufferFor = (c: MiniAudioContext, key: string, render: () => Float32Array): AudioBuffer => {
    let buf = cache.get(key);
    if (!buf) {
      const samples = render();
      buf = c.createBuffer(1, samples.length, c.sampleRate);
      buf.getChannelData(0).set(samples);
      cache.set(key, buf);
    }
    return buf;
  };

  const context = (): MiniAudioContext | null => {
    if (!ctx) {
      if (!opts.createContext && !isAudioSupported()) return null;
      ctx = make();
    }
    return ctx;
  };

  /** The context, woken if suspended, or null when sound is off or there is no audio. */
  const awake = (): MiniAudioContext | null => {
    if (!enabled) return null;
    const c = context();
    if (c && c.state === 'suspended') void c.resume();
    return c;
  };

  /** From `at`, move `param` in a straight line to `value` by `end`; just set it when it cannot ramp (a fake). */
  const rampTo = (param: AudioParam, value: number, at: number, end: number, from = param.value) => {
    if (typeof param.linearRampToValueAtTime !== 'function') {
      param.value = value;
      return;
    }
    param.cancelScheduledValues?.(at);
    param.setValueAtTime(from, at);
    param.linearRampToValueAtTime(value, end);
  };

  /** Fade a sound out over `fadeSec` from now and stop its sources just after. */
  const fadeOut = (c: MiniAudioContext, gain: GainNode, srcs: readonly AudioBufferSourceNode[], fadeSec: number) => {
    const t = c.currentTime;
    rampTo(gain.gain, 0, t, t + fadeSec);
    for (const src of srcs) src.stop(t + fadeSec + 0.01);
  };

  /** Start `src` through `g` at `at`, tracked until it ends so `cancel()` can stop it. */
  const track = (src: AudioBufferSourceNode, g: GainNode, at: number) => {
    const entry = { src, gain: g };
    active.add(entry);
    src.onended = () => active.delete(entry);
    src.start(at);
  };

  const play = (
    key: string,
    render: (sampleRate: number) => Float32Array,
    delaySec: number,
    lengthSec?: number,
    glide?: Glide,
    level = 1,
  ) => {
    try {
      const c = awake();
      if (!c) return;
      const src = c.createBufferSource();
      src.buffer = bufferFor(c, key, () => render(c.sampleRate));
      const g = c.createGain();
      g.gain.value = gainLevel * level;
      src.connect(g);
      g.connect(c.destination);
      const at = c.currentTime + Math.max(0, delaySec);
      if (lengthSec !== undefined && typeof g.gain.setTargetAtTime === 'function') {
        // A quick fade, not a cut, so the end of a note does not click.
        g.gain.setTargetAtTime(0, at + lengthSec, 0.015);
      }
      const rate = src.playbackRate;
      if (glide && rate && typeof rate.setValueAtTime === 'function') {
        rate.setValueAtTime(1, at);
        for (const p of glide) {
          if (p.ramp === 'linear') rate.linearRampToValueAtTime(rateOf(p.semis), at + p.t);
          else rate.setValueAtTime(rateOf(p.semis), at + p.t);
        }
      }
      track(src, g, at);
    } catch {
      // Audio is a nicety: a failure here must never break a lesson.
    }
  };

  return {
    get enabled() {
      return enabled;
    },
    setEnabled(on) {
      enabled = on;
    },
    now() {
      try {
        const c = context();
        // A suspended context's clock stands still: wake it, or nothing scheduled on it would play.
        if (c && c.state === 'suspended') void c.resume();
        return c?.currentTime ?? null;
      } catch {
        return null;
      }
    },
    setLevels(next) {
      if (next.note !== undefined) levels.note = clamp(next.note);
      if (next.click !== undefined) levels.click = clamp(next.click);
    },
    pluck(midi, delaySec = 0, lengthSec, glide) {
      play(`p${midi}`, (sampleRate) => pluckSamples({ midi, sampleRate }), delaySec, lengthSec, glide, levels.note);
    },
    mute(midi, delaySec = 0) {
      play(`m${midi}`, (sampleRate) => pluckSamples({ midi, sampleRate, muted: true }), delaySec, undefined, undefined, levels.note);
    },
    click(accent = false, delaySec = 0) {
      play(accent ? 'cA' : 'c', (sampleRate) => clickSamples({ sampleRate, accent }), delaySec, undefined, undefined, levels.click);
    },
    cancel() {
      if (!ctx) return;
      const c = ctx;
      for (const { src, gain } of active) {
        try {
          fadeOut(c, gain, [src], CANCEL_FADE_SEC);
        } catch {
          // ignore: a source that cannot be stopped ends on its own
        }
      }
      active.clear();
    },
  };
}
