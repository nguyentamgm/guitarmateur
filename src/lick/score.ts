import type { Technique } from './model';

/** Minimal shape `scoreLick` needs — generation scores an internal draft before it's finalized. */
export interface ScorableNote {
  string: number;
  fret: number;
  startBeat: number;
  technique?: Technique;
  isDecoration: boolean;
}

const clamp01 = (x: number): number => Math.max(0, Math.min(1, x));
const clampScore = (x: number): number => Math.max(1, Math.min(5, x));

/**
 * Difficulty score, 1..5: weighted sum of note density, rhythmic complexity (off-beat ratio),
 * physical cost (fret span, string crossings), technique count, and decoration usage.
 */
export function scoreLick(notes: ScorableNote[], lengthBeats: number): number {
  if (notes.length === 0) return 1;

  const density = notes.length / lengthBeats;
  const offBeatRatio = notes.filter((n) => n.startBeat % 1 !== 0).length / notes.length;

  const frets = notes.map((n) => n.fret);
  const span = Math.max(...frets) - Math.min(...frets);

  let crossings = 0;
  for (let i = 1; i < notes.length; i++) if (notes[i]!.string !== notes[i - 1]!.string) crossings++;
  const crossingRatio = notes.length > 1 ? crossings / (notes.length - 1) : 0;

  const techniqueRatio = notes.filter((n) => n.technique).length / notes.length;
  const decorationRatio = notes.filter((n) => n.isDecoration).length / notes.length;

  const raw =
    0.55 * clamp01((density - 0.75) / 1.25) +
    1.1 * offBeatRatio +
    0.6 * clamp01(span / 8) +
    0.5 * crossingRatio +
    0.5 * techniqueRatio +
    0.35 * decorationRatio;

  return clampScore(1 + raw * 4);
}
