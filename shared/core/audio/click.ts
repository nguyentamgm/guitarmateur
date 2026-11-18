/**
 * Metronome click: a punchy woodblock-style click with an attack transient and harmonic overtones,
 * cutting cleanly through strummed guitar chords. The accented click (beat 1) is higher and louder,
 * so the bar's start is heard as well as seen (K1.1). Pure, like pluck.ts.
 */

export interface ClickOptions {
  readonly sampleRate: number;
  readonly accent?: boolean;
  readonly durationSec?: number;
}

export const CLICK_HZ = { accent: 1760, plain: 1175 } as const;

export function clickSamples(opts: ClickOptions): Float32Array {
  const { sampleRate, accent = false, durationSec = 0.05 } = opts;
  const hz = accent ? CLICK_HZ.accent : CLICK_HZ.plain;
  const level = accent ? 1 : 0.82;
  const out = new Float32Array(Math.floor(sampleRate * durationSec));
  // Decay fast enough to be silent by the end of durationSec (< 0.01 amplitude),
  // but with enough body to carry acoustic punch.
  const tau = durationSec / 4.8;
  for (let i = 0; i < out.length; i++) {
    const t = i / sampleRate;
    // Transient click attack: fast pitch envelope in the first 2 ms gives a crisp woodblock snap
    const pitchEnv = 1 + 1.2 * Math.exp(-t / 0.0015);
    const phase = 2 * Math.PI * hz * pitchEnv * t;
    // Fundamental + 2nd harmonic overtone for presence above guitar chord frequencies
    const body = (Math.sin(phase) + 0.35 * Math.sin(2 * phase)) / 1.18;
    out[i] = level * body * Math.exp(-t / tau);
  }
  return out;
}
