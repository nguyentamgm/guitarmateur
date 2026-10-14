/**
 * A sustained voice: a soft tone (a sine with a few low harmonics) for sounds that must hold, such
 * as a drone, or that want the pitch without the guitar's colour (a "clean tone"). Rendered as a
 * whole number of cycles, so the buffer loops forever without a seam. Pure, like pluck.ts.
 */
import { midiToFrequency } from './pluck';

/** Harmonic amplitudes, the fundamental first: soft, a little warmer than a bare sine. */
export const SUSTAIN_HARMONICS: readonly number[] = [1, 0.3, 0.12, 0.05];
/**
 * Peak of the rendered samples. Its RMS (about 0.17) matches a mid-range pluck's first 0.3 s
 * (0.09–0.22 from E2 to E5), so a clean tone is as loud as the guitar note it replaces.
 */
export const SUSTAIN_PEAK = 0.25;
/** The loop is between these lengths, in seconds; within them, the one closest in pitch. */
export const LOOP_MIN_SEC = 0.5;
export const LOOP_MAX_SEC = 1;

/**
 * The loop's length in samples and the whole cycles it holds: of every length from LOOP_MIN_SEC to
 * LOOP_MAX_SEC, the one whose nearest whole number of cycles sounds closest to the note.
 */
export function sustainLoop(midi: number, sampleRate: number): { length: number; cycles: number } {
  const hz = midiToFrequency(midi);
  let best = { length: 0, cycles: 0, error: Infinity };
  for (
    let length = Math.round(sampleRate * LOOP_MIN_SEC);
    length <= Math.round(sampleRate * LOOP_MAX_SEC);
    length++
  ) {
    const cycles = Math.max(1, Math.round((hz * length) / sampleRate));
    const error = Math.abs((cycles * sampleRate) / length - hz);
    if (error < best.error) best = { length, cycles, error };
  }
  return { length: best.length, cycles: best.cycles };
}

export interface SustainOptions {
  readonly midi: number;
  readonly sampleRate: number;
}

/** One loop of the sustained voice, in −SUSTAIN_PEAK…SUSTAIN_PEAK: its end runs straight into its start. */
export function sustainSamples({ midi, sampleRate }: SustainOptions): Float32Array {
  const { length, cycles } = sustainLoop(midi, sampleRate);
  const out = new Float32Array(length);
  const nyquist = sampleRate / 2;
  const hz = (cycles * sampleRate) / length;
  // Harmonics at or above Nyquist would fold back as noise: leave them out.
  const partials = SUSTAIN_HARMONICS.map((amp, i) => ({ amp, h: i + 1 })).filter(
    (p) => p.h * hz < nyquist,
  );
  let peak = 0;
  for (let i = 0; i < length; i++) {
    const phase = (2 * Math.PI * cycles * i) / length;
    let x = 0;
    for (const { amp, h } of partials) x += amp * Math.sin(h * phase);
    out[i] = x;
    peak = Math.max(peak, Math.abs(x));
  }
  const scale = peak > 0 ? SUSTAIN_PEAK / peak : 0;
  for (let i = 0; i < length; i++) out[i]! *= scale;
  return out;
}
