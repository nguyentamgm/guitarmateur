/**
 * Plays plucked notes through Web Audio. The AudioContext is created lazily on the first
 * `pluck()`, which callers must invoke from a user gesture (a click), because browsers block
 * audio that starts on its own. Nothing is created at import time.
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
  setEnabled(on: boolean): void;
  readonly enabled: boolean;
}

export function isAudioSupported(): boolean {
  return typeof window !== 'undefined' && typeof window.AudioContext === 'function';
}

export function createPlayer(opts: PlayerOptions = {}): Player {
  const gainLevel = opts.gain ?? 0.32;
  const make = opts.createContext ?? (() => new AudioContext() as unknown as MiniAudioContext);
  let ctx: MiniAudioContext | null = null;
  let enabled = true;
  const cache = new Map<string, AudioBuffer>();

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

  const play = (key: string, render: (sampleRate: number) => Float32Array, delaySec: number, lengthSec?: number, glide?: Glide) => {
    if (!enabled) return;
    try {
      if (!ctx) {
        if (!opts.createContext && !isAudioSupported()) return;
        ctx = make();
      }
      const c = ctx;
      if (c.state === 'suspended') void c.resume();
      const src = c.createBufferSource();
      src.buffer = bufferFor(c, key, () => render(c.sampleRate));
      const g = c.createGain();
      g.gain.value = gainLevel;
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
      src.start(at);
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
    pluck(midi, delaySec = 0, lengthSec, glide) {
      play(`p${midi}`, (sampleRate) => pluckSamples({ midi, sampleRate }), delaySec, lengthSec, glide);
    },
    mute(midi, delaySec = 0) {
      play(`m${midi}`, (sampleRate) => pluckSamples({ midi, sampleRate, muted: true }), delaySec);
    },
    click(accent = false, delaySec = 0) {
      play(accent ? 'cA' : 'c', (sampleRate) => clickSamples({ sampleRate, accent }), delaySec);
    },
  };
}
