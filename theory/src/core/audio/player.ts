/**
 * Plays plucked notes through Web Audio. The AudioContext is created lazily on the first
 * `pluck()`, which callers must invoke from a user gesture (a click), because browsers block
 * audio that starts on its own. Nothing is created at import time.
 */
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
  /** Output level, 0..1. The prototype used 0.32. */
  readonly gain?: number;
}

export interface Player {
  /** Play a MIDI note now, or `delaySec` from now. Silently does nothing when disabled or unsupported. */
  pluck(midi: number, delaySec?: number): void;
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
  const cache = new Map<number, AudioBuffer>();

  const bufferFor = (c: MiniAudioContext, midi: number): AudioBuffer => {
    let buf = cache.get(midi);
    if (!buf) {
      const samples = pluckSamples({ midi, sampleRate: c.sampleRate });
      buf = c.createBuffer(1, samples.length, c.sampleRate);
      buf.getChannelData(0).set(samples);
      cache.set(midi, buf);
    }
    return buf;
  };

  return {
    get enabled() {
      return enabled;
    },
    setEnabled(on) {
      enabled = on;
    },
    pluck(midi, delaySec = 0) {
      if (!enabled) return;
      try {
        if (!ctx) {
          if (!opts.createContext && !isAudioSupported()) return;
          ctx = make();
        }
        if (ctx.state === 'suspended') void ctx.resume();
        const src = ctx.createBufferSource();
        src.buffer = bufferFor(ctx, midi);
        const g = ctx.createGain();
        g.gain.value = gainLevel;
        src.connect(g);
        g.connect(ctx.destination);
        src.start(ctx.currentTime + delaySec);
      } catch {
        // Audio is a nicety: a failure here must never break a lesson.
      }
    },
  };
}
