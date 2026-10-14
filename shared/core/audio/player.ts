/**
 * Plays plucked notes, clicks and a sustained voice (held drones, clean tones) through Web Audio.
 * The AudioContext is created lazily on the first sound, which callers must start from a user
 * gesture (a click), because browsers block audio that starts on its own. Nothing is created at
 * import time.
 */
import { clickSamples } from './click';
import { rateOf, type Glide } from './glide';
import { pluckSamples } from './pluck';
import { sustainSamples } from './sustain';

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

export interface HoldOptions {
  /** The held sound's level, 0..1, before the drone level. Default HOLD_LEVEL: well under the notes. */
  readonly level?: number;
  /** Seconds to fade in. Default HOLD_FADE_SEC; never under MIN_FADE_SEC. */
  readonly fadeSec?: number;
}

/** A sound that holds until stopped. */
export interface Held {
  /** Fade out over `fadeSec` (default HOLD_FADE_SEC, never under MIN_FADE_SEC), then stop. Once only. */
  stop(fadeSec?: number): void;
}

/** A held sound's default level: quiet, since a drone is what a listener hears longest. */
export const HOLD_LEVEL = 0.3;
/** A held sound's default fade in and out. */
export const HOLD_FADE_SEC = 1;
/** The shortest fade the player makes: any faster and the cut clicks. */
export const MIN_FADE_SEC = 0.02;
/** A clean tone's default length, about as long as a pluck rings. */
export const TONE_SEC = 1;
/** A clean tone's attack, and how fast its release falls (the time constant). */
export const TONE_ATTACK_SEC = 0.01;
export const TONE_RELEASE_SEC = 0.03;
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
  /**
   * A clean tone: the sustained voice with a short attack, held `lengthSec` (default TONE_SEC),
   * then released. The pitch without the guitar's colour; at the note level. Same rules as `pluck`.
   */
  tone(midi: number, delaySec?: number, lengthSec?: number): void;
  /**
   * Hold MIDI notes in the sustained voice (a drone) from now until `stop()`, fading in and out so
   * it never clicks. At the drone level, which `setLevels` changes as it sounds. Returns a handle
   * that does nothing when there is no audio.
   */
  hold(midis: readonly number[], opts?: HoldOptions): Held;
  /**
   * Stop every note, click and tone that is scheduled or still sounding, with a short fade.
   * Held sounds go on: they stop with their own `stop()`.
   */
  cancel(): void;
  setEnabled(on: boolean): void;
  readonly enabled: boolean;
  /**
   * Seconds on the audio clock: what a sequencer schedules against. Creates the AudioContext if
   * there is none yet (so call it from a user gesture, like `pluck`); null when there is no audio.
   */
  now(): number | null;
  /** Levels, 0..1, for the notes (pluck, mute, tone), the click and held sounds: a mix. All default to 1. */
  setLevels(levels: { readonly note?: number; readonly click?: number; readonly drone?: number }): void;
}

export function isAudioSupported(): boolean {
  return typeof window !== 'undefined' && typeof window.AudioContext === 'function';
}

export function createPlayer(opts: PlayerOptions = {}): Player {
  const gainLevel = opts.gain ?? 0.32;
  const make = opts.createContext ?? (() => new AudioContext() as unknown as MiniAudioContext);
  let ctx: MiniAudioContext | null = null;
  let enabled = true;
  const levels = { note: 1, click: 1, drone: 1 };
  const cache = new Map<string, AudioBuffer>();
  /** Notes, clicks and tones scheduled or sounding, for `cancel()`. */
  const active = new Set<{ readonly src: AudioBufferSourceNode; readonly gain: GainNode }>();
  /** Held sounds, for `setLevels({ drone })`. */
  const holds = new Set<{ readonly gain: GainNode; readonly level: number; readonly fadeEnd: number }>();
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

  const sustainBuffer = (c: MiniAudioContext, midi: number) =>
    bufferFor(c, `s${midi}`, () => sustainSamples({ midi, sampleRate: c.sampleRate }));

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
      if (next.drone !== undefined) {
        levels.drone = clamp(next.drone);
        if (!ctx) return;
        const t = ctx.currentTime;
        // Glide to the new level (finishing a fade-in on time), so a held sound never jumps.
        for (const h of holds) {
          try {
            rampTo(h.gain.gain, gainLevel * levels.drone * h.level, t, Math.max(t + 0.1, h.fadeEnd));
          } catch {
            // ignore: the level applies to the next held sound
          }
        }
      }
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
    tone(midi, delaySec = 0, lengthSec = TONE_SEC) {
      try {
        const c = awake();
        if (!c) return;
        const src = c.createBufferSource();
        src.buffer = sustainBuffer(c, midi);
        src.loop = true;
        const g = c.createGain();
        src.connect(g);
        g.connect(c.destination);
        const at = c.currentTime + Math.max(0, delaySec);
        const end = at + Math.max(TONE_ATTACK_SEC, lengthSec);
        rampTo(g.gain, gainLevel * levels.note, at, at + TONE_ATTACK_SEC, 0);
        g.gain.setTargetAtTime?.(0, end, TONE_RELEASE_SEC);
        track(src, g, at);
        // About 99% faded after five time constants.
        src.stop(end + 5 * TONE_RELEASE_SEC);
      } catch {
        // Audio is a nicety: a failure here must never break a lesson.
      }
    },
    hold(midis, opts = {}) {
      const none: Held = { stop() {} };
      try {
        const c = awake();
        if (!c || midis.length === 0) return none;
        const level = clamp(opts.level ?? HOLD_LEVEL);
        const at = c.currentTime;
        const fadeEnd = at + Math.max(MIN_FADE_SEC, opts.fadeSec ?? HOLD_FADE_SEC);
        const g = c.createGain();
        g.connect(c.destination);
        rampTo(g.gain, gainLevel * levels.drone * level, at, fadeEnd, 0);
        // Notes add up: share the level so two notes are about as loud as one.
        const each = c.createGain();
        each.gain.value = 1 / Math.sqrt(midis.length);
        each.connect(g);
        const srcs = midis.map((midi) => {
          const src = c.createBufferSource();
          src.buffer = sustainBuffer(c, midi);
          src.loop = true;
          src.connect(each);
          src.start(at);
          return src;
        });
        const entry = { gain: g, level, fadeEnd };
        holds.add(entry);
        let stopped = false;
        return {
          stop(fadeSec = HOLD_FADE_SEC) {
            if (stopped) return;
            stopped = true;
            holds.delete(entry);
            try {
              fadeOut(c, g, srcs, Math.max(MIN_FADE_SEC, fadeSec));
            } catch {
              // ignore: nothing more to do for a sound that cannot be stopped
            }
          },
        };
      } catch {
        return none;
      }
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
