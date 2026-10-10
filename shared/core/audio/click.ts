/**
 * Metronome click: a short sine blip with a fast exponential decay. The accented click (beat 1)
 * is higher and louder, so the bar's start is heard as well as seen (K1.1). Pure, like pluck.ts.
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
  const level = accent ? 1 : 0.6;
  const out = new Float32Array(Math.floor(sampleRate * durationSec));
  // About 60 dB of decay over the click's length.
  const tau = durationSec / 7;
  for (let i = 0; i < out.length; i++) {
    const t = i / sampleRate;
    out[i] = level * Math.sin(2 * Math.PI * hz * t) * Math.exp(-t / tau);
  }
  return out;
}
