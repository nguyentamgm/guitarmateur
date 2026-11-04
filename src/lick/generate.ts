import { midi, toneRole, type Chord } from '../music';
import type { Box } from '../fretboard';
import { mulberry32 } from '@shared/core/rng';
import { activeSlots, buildRhythm, patternLengthBeats } from './rhythm';
import { pickChordTone, pickContour, pickFirstNote } from './contour';
import { countUnplayableMoves, fillPath } from './path';
import { scoreLick, type ScorableNote } from './score';
import { decorateTechniques } from './techniques';
import { applyBends } from './bends';
import { buildPhrase } from './phrase';
import type { Lick, LickNote, LickParams } from './model';

/** Deterministic (attempt i draws from `attemptSeed(seed, i)`) — bounds worst-case work and guarantees output. */
const MAX_ATTEMPTS = 12;
/**
 * The seed for attempt `i`. Mixed rather than `seed + i`: with plain addition, seed 0's second
 * attempt *is* seed 1's first, so neighbouring seeds (what "new lick" steps through) kept handing
 * back the same lick whenever an early attempt was rejected.
 */
function attemptSeed(seed: number, attempt: number): number {
  return (Math.imul(seed, 0x9e3779b1) ^ Math.imul(attempt + 1, 0x85ebca6b)) >>> 0;
}

/** Accept the first attempt whose score lands within this tolerance of the requested level. */
const SCORE_TOLERANCE = 0.75;

/**
 * Generate a practice lick over `chord` (landing on `next` when `params.resolveToNext`), built
 * from `box`'s notes (a bend may sound a fret or two past the box, as bends do). The melody is a
 * motif-built phrase (phrase.ts) over a rhythm that breathes (rhythm.ts); bends go where the scale
 * degree calls for them (bends.ts), then legato techniques. Pure and deterministic: same inputs ⇒
 * identical lick.
 */
export function generateLick(box: Box, chord: Chord, next: Chord | null, params: LickParams, prevLastMidi?: number): Lick {
  const targetChord = params.resolveToNext && next ? next : chord;
  const bars = params.bars ?? 1;
  const tonic = box.notes.find((n) => n.isTonic);
  const tonicPc = tonic ? midi(tonic.pitch) % 12 : null;
  const topString = Math.max(...box.notes.map((n) => n.string));
  // The solo's arc picks the landing note's register: low early, highest near the climax.
  const boxMidis = box.notes.map((n) => midi(n.pitch));
  const lowMidi = Math.min(...boxMidis);
  const registerMidi =
    params.arc === undefined ? undefined : lowMidi + (0.2 + 0.65 * params.arc) * (Math.max(...boxMidis) - lowMidi);

  let best: { notes: LickNote[]; lengthBeats: number; score: number; badMoves: number } | null = null;

  for (let attempt = 0; attempt < MAX_ATTEMPTS; attempt++) {
    const rng = mulberry32(attemptSeed(params.seed, attempt));

    const pattern = buildRhythm(params.level, bars, rng);
    const slots = activeSlots(pattern);
    const lengthBeats = patternLengthBeats(pattern);
    const contour = pickContour(params.level, rng);

    const last = pickChordTone(box, targetChord, params.targetRole, rng, registerMidi);
    const first = pickFirstNote(box, chord, last, contour, rng, prevLastMidi);
    // A motif-built phrase when one fits the box; the plain contour walk only as a safety net.
    const path =
      buildPhrase(box, first, last, slots, chord, params.level, rng) ??
      fillPath(box, first, last, slots.length, contour, params.level, rng);

    const rawNotes: LickNote[] = path.map((fretNote, i) => ({
      string: fretNote.string,
      fret: fretNote.fret,
      pitch: fretNote.pitch,
      startBeat: slots[i]!.startBeat,
      durationBeats: slots[i]!.durationBeats,
      role: toneRole(fretNote.pitch, i === path.length - 1 ? targetChord : chord) ?? undefined,
    }));

    const techRng = mulberry32(attemptSeed(params.seed, attempt) ^ 0x5bd1e995);
    const bent = applyBends(rawNotes, chord, tonicPc, topString, params.level, techRng);
    const notes = decorateTechniques(bent, params.level, techRng);

    const scorable: ScorableNote[] = path.map((fretNote, i) => ({
      string: notes[i]!.string,
      fret: notes[i]!.fret,
      startBeat: slots[i]!.startBeat,
      technique: notes[i]!.technique,
      isDecoration: fretNote.isDecoration,
    }));
    const score = scoreLick(scorable, lengthBeats);
    // `fillPath` steers away from same-fret string jumps and (for levels that forbid it) string
    // skips, but `first` and `last` are chosen before it runs, so a short lick can still be handed
    // a transition it never got to vote on. Re-seeding is the only fix left at that point — and an
    // unplayable lick is worse than an off-target one, so it outranks the score both here and in
    // the fallback.
    const badMoves = countUnplayableMoves(notes, params.level);

    if (badMoves === 0 && Math.abs(score - params.level) <= SCORE_TOLERANCE) {
      return { notes, lengthBeats, difficulty: score };
    }
    const better =
      !best ||
      badMoves < best.badMoves ||
      (badMoves === best.badMoves &&
        Math.abs(score - params.level) < Math.abs(best.score - params.level));
    if (better) {
      best = { notes, lengthBeats, score, badMoves };
    }
  }

  return { notes: best!.notes, lengthBeats: best!.lengthBeats, difficulty: best!.score };
}
