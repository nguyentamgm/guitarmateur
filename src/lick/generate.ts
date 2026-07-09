import { toneRole, type Chord } from '../music';
import type { Box } from '../fretboard';
import { mulberry32 } from './rng';
import { activeSlots, patternLengthBeats, pickPattern } from './rhythm';
import { pickChordTone, pickContour, pickFirstNote } from './contour';
import { fillPath } from './path';
import { scoreLick, type ScorableNote } from './score';
import type { Lick, LickNote, LickParams } from './model';

/** Deterministic (attempt i uses `seed + i`) — bounds worst-case work and guarantees output. */
const MAX_ATTEMPTS = 12;
/** Accept the first attempt whose score lands within this tolerance of the requested level. */
const SCORE_TOLERANCE = 0.75;

/**
 * Generate a practice lick over `chord` (landing on `next` when `params.resolveToNext`), built
 * entirely from `box`'s notes. Pure and deterministic: same inputs ⇒ identical lick.
 */
export function generateLick(box: Box, chord: Chord, next: Chord | null, params: LickParams): Lick {
  const targetChord = params.resolveToNext && next ? next : chord;

  let best: { notes: LickNote[]; lengthBeats: number; score: number } | null = null;

  for (let attempt = 0; attempt < MAX_ATTEMPTS; attempt++) {
    const rng = mulberry32(params.seed + attempt);

    const pattern = pickPattern(params.level, rng);
    const slots = activeSlots(pattern);
    const lengthBeats = patternLengthBeats(pattern);
    const contour = pickContour(params.level, rng);

    const last = pickChordTone(box, targetChord, params.targetRole, rng);
    const first = pickFirstNote(box, chord, last, contour, rng);
    const path = fillPath(box, first, last, slots.length, contour, params.level, rng);

    const notes: LickNote[] = path.map((fretNote, i) => ({
      string: fretNote.string,
      fret: fretNote.fret,
      pitch: fretNote.pitch,
      startBeat: slots[i]!.startBeat,
      durationBeats: slots[i]!.durationBeats,
      role: toneRole(fretNote.pitch, chord) ?? undefined,
    }));

    const scorable: ScorableNote[] = path.map((fretNote, i) => ({
      string: fretNote.string,
      fret: fretNote.fret,
      startBeat: slots[i]!.startBeat,
      isDecoration: fretNote.isDecoration,
    }));
    const score = scoreLick(scorable, lengthBeats);

    if (Math.abs(score - params.level) <= SCORE_TOLERANCE) {
      return { notes, lengthBeats, difficulty: score };
    }
    if (!best || Math.abs(score - params.level) < Math.abs(best.score - params.level)) {
      best = { notes, lengthBeats, score };
    }
  }

  return { notes: best!.notes, lengthBeats: best!.lengthBeats, difficulty: best!.score };
}
