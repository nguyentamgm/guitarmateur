/**
 * Plucked-string synthesis (Karplus-Strong). Pure functions: no AudioContext here, so the sound
 * can be unit-tested and tuned without a browser.
 */

export const midiToFrequency = (m: number): number => 440 * Math.pow(2, (m - 69) / 12);

/** Deterministic noise (mulberry32) so the same note always renders the same samples. */
export function seededRandom(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Feedback per period: low strings ring longer. */
export const decayFactor = (m: number): number => (m < 52 ? 0.997 : 0.995);

export interface PluckOptions {
  readonly midi: number;
  readonly sampleRate: number;
  /** Rendered length in seconds. */
  readonly durationSec?: number;
  readonly seed?: number;
  /**
   * Smoothing of the initial noise burst (0..1). Higher = darker, rounder attack. Default 0.45
   * (0.8 muted).
   */
  readonly softness?: number;
  /**
   * Palm mute (K6.5): the hand on the bridge damps the string at once. A darker pick (more
   * smoothing) and a fast fade, so the note is a short, thick chug.
   */
  readonly muted?: boolean;
}

/** Seconds for a palm-muted note to fade to about a third. */
export const MUTE_FADE_SEC = 0.09;

/** Render one plucked note into a mono buffer of samples in −1…1. */
export function pluckSamples(opts: PluckOptions): Float32Array {
  const { midi, sampleRate, muted = false, durationSec = muted ? 0.6 : 1.8, seed = midi, softness = muted ? 0.8 : 0.45 } = opts;
  const period = Math.max(2, Math.round(sampleRate / midiToFrequency(midi)));
  const length = Math.floor(sampleRate * durationSec);
  const out = new Float32Array(length);
  const rand = seededRandom(seed);

  // Excitation: one period of low-passed noise (the pick hitting the string).
  let prev = 0;
  for (let i = 0; i < Math.min(period, length); i++) {
    prev = prev * softness + (rand() * 2 - 1) * (1 - softness);
    out[i] = prev;
  }

  // Delay line with an averaging filter: the string's high partials fade first.
  const k = decayFactor(midi) * 0.5;
  for (let i = period; i < length; i++) {
    out[i] = k * (out[i - period]! + out[i - period + 1]!);
  }
  if (muted) {
    // Fade after the loop so the string model still rings at its pitch, only shorter.
    for (let i = 0; i < length; i++) out[i]! *= Math.exp(-i / (sampleRate * MUTE_FADE_SEC));
  }
  return out;
}
