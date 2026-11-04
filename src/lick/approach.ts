import { IV, midi, pitchAt, toneRole, transpose, type Chord } from '../music';
import type { Box } from '../fretboard';
import type { Rng } from '@shared/core/rng';
import { isSameFretStringJump } from './path';
import type { LickNote, LickParams } from './model';

/** Chance that an eligible lick gets a chromatic approach into its landing note, by level. */
const APPROACH_PROB: Record<LickParams['level'], number> = {
  1: 0,
  2: 0,
  3: 0.3,
  4: 0.4,
  5: 0.5,
};

/**
 * Swap the note before the landing for a **chromatic approach**: the half step below the target,
 * one fret lower on the landing note's string — G♯ into A, B into C. It is the one note outside the
 * scale a blues or rock line uses all the time, because it leans so hard on the note it resolves
 * to. Spelled as the letter below (the target's leading tone), so A is approached from G♯, not A♭.
 *
 * Only when the half step really is outside the box's scale (otherwise it is just a scale step),
 * the approach is short (an 8th or less, so it passes rather than sits), and the move into it from
 * the note before stays playable. The note is marked `chromatic`.
 */
export function addChromaticApproach(
  notes: readonly LickNote[],
  box: Box,
  chord: Chord,
  level: LickParams['level'],
  rng: Rng,
): LickNote[] {
  const out = notes.map((n) => ({ ...n }));
  const prob = APPROACH_PROB[level];
  if (prob <= 0 || out.length < 3) return out;

  const landing = out[out.length - 1]!;
  const approach = out[out.length - 2]!;
  const before = out[out.length - 3]!;
  if (approach.technique || approach.durationBeats > 0.5 || landing.fret < 2) return out;

  const target = midi(landing.pitch) - 1;
  const scalePcs = new Set(box.notes.map((n) => midi(n.pitch) % 12));
  if (scalePcs.has(target % 12)) return out;

  const cell = { string: landing.string, fret: landing.fret - 1 };
  if (isSameFretStringJump(before, cell)) return out;
  if (rng() >= prob) return out;

  const pitch = pitchAt(transpose(landing.pitch, IV.M7), target);
  out[out.length - 2] = {
    ...approach,
    ...cell,
    pitch,
    role: toneRole(pitch, chord) ?? undefined,
    chromatic: true,
  };
  return out;
}
