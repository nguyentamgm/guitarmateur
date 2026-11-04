import type { Rng } from '@shared/core/rng';
import type { LickNote, LickParams } from './model';

/**
 * For generated (not vocabulary) licks: shake some of the held notes, as a player would — often the
 * landing note, sometimes another note held a beat or more. Not every one: vibrato everywhere is
 * just another formula. From level 3, like the other techniques; never on a chromatic note.
 */
export function addVibrato(notes: readonly LickNote[], level: LickParams['level'], rng: Rng): LickNote[] {
  if (level < 3) return notes.map((n) => ({ ...n }));
  return notes.map((n, i) => {
    const chance = i === notes.length - 1 ? 0.6 : 0.3;
    const held = n.durationBeats >= 1;
    return held && !n.chromatic && rng() < chance ? { ...n, vibrato: true } : { ...n };
  });
}
