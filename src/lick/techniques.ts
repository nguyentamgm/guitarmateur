import type { Rng } from '@shared/core/rng';
import type { LickNote, Technique, LickParams } from './model';

const LEVEL_PROB: Record<LickParams['level'], number> = {
  1: 0,
  2: 0,
  3: 0.4,
  4: 0.55,
  5: 0.7,
};

/**
 * Decorate eligible adjacent note pairs with legato techniques.
 *
 * - Same-string ascending step (dFret === 1) ⇒ `hammer`
 * - Same-string descending step (dFret === -1) ⇒ `pull`
 * - Same-string |dFret| ≥ 2 ⇒ `slide`, only when the origin note is fretted (there is nothing to
 *   slide from on an open string); hammer-ons and pull-offs stay valid from/to an open string
 *
 * Bends are not placed here: they depend on which scale degree is bent into, not on where two
 * notes happen to sit, so `applyBends` (bends.ts) places them first and this pass leaves any note
 * that already carries a technique alone.
 *
 * Constraints:
 * - ≤ 1 technique per `startBeat`, ≤ 1 slide per bar, never two slides in a row
 * - No technique on the landing (last) note below level 4
 * - Probability per eligible pair: level 3 ~40%, 4 ~55%, 5 ~70%
 * - Levels 1-2 never produce techniques
 */
export function decorateTechniques(
  notes: LickNote[],
  level: LickParams['level'],
  rng: Rng,
): LickNote[] {
  if (notes.length < 2) return notes;

  const prob = LEVEL_PROB[level];
  if (prob <= 0) return notes;

  const result: LickNote[] = [{
    string: notes[0]!.string,
    fret: notes[0]!.fret,
    pitch: notes[0]!.pitch,
    startBeat: notes[0]!.startBeat,
    durationBeats: notes[0]!.durationBeats,
    technique: notes[0]!.technique,
    role: notes[0]!.role,
  }];
  const usedBeats = new Set<number>();
  /** Bars that already have a slide: one per bar reads as a gesture, more as sliding about. */
  const slideBars = new Set<number>();

  for (let i = 1; i < notes.length; i++) {
    const prev = notes[i - 1]!;
    const cur = notes[i]!;
    const isLast = i === notes.length - 1;

    let technique: Technique | undefined;

    if (cur.technique) {
      // Placed by an earlier pass (a bend) — keep it, and let it claim its beat.
      technique = cur.technique;
    } else if (prev.string === cur.string && rng() < prob) {
      const dFret = cur.fret - prev.fret;

      // Landing-note restriction: before level 4, no technique on the last note
      if (isLast && level < 4) {
        // skip — keep technique as undefined
      } else if (usedBeats.has(cur.startBeat)) {
        // skip — already one technique on this beat
      } else if (dFret === 1) {
        technique = 'hammer';
      } else if (dFret === -1) {
        technique = 'pull';
      } else if (Math.abs(dFret) > 1 && prev.fret > 0) {
        const bar = Math.floor(cur.startBeat / 4);
        if (!slideBars.has(bar) && result[i - 1]!.technique !== 'slide') {
          technique = 'slide';
          slideBars.add(bar);
        }
      }
    }

    result.push({
      string: cur.string,
      fret: cur.fret,
      pitch: cur.pitch,
      startBeat: cur.startBeat,
      durationBeats: cur.durationBeats,
      technique,
      role: cur.role,
      ...(cur.chromatic ? { chromatic: true } : {}),
    });

    if (technique) {
      usedBeats.add(cur.startBeat);
    }
  }

  return result;
}
