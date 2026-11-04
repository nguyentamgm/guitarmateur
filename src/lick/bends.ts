import { midi, toneRole, type Chord } from '../music';
import type { Rng } from '@shared/core/rng';
import { isSameFretStringJump } from './path';
import type { LickNote, LickParams } from './model';

/** Chance that an eligible step becomes a bend, by level. Levels 1–2 play every note plainly. */
const BEND_PROB: Record<LickParams['level'], number> = {
  1: 0,
  2: 0,
  3: 0.5,
  4: 0.6,
  5: 0.7,
};

/**
 * Turn idiomatic steps into bends. A bend is the blues guitarist's voice, but it only sounds right
 * aimed at a strong note: 4 bent up to 5, ♭7 bent up to the root, 2 up to 3 in major — a step of a
 * half or whole tone *into* a chord tone of the moment, or into the key's root or 5th. Bending
 * whatever pair happens to sit on one string (as the old decoration did) is what made bends sound
 * random.
 *
 * Written as standard tab writes it: the note before is picked, and the bend note keeps that
 * string and sounds the target pitch at `fret + semitones` — "7 b9". That fret can lie just past
 * the box, as real bends do (the finger stays where it is; the string is pushed). Constraints:
 *
 * - never the first or the landing note (the landing has to be fretted on its box dot);
 * - the note bent from is fretted and on one of the three highest strings, where bends live;
 * - the bent note lasts at least an 8th, so the bend is heard;
 * - at most one bend per bar, and never two in a row;
 * - the move on to the next note stays playable from the bend's cell.
 */
export function applyBends(
  notes: readonly LickNote[],
  chord: Chord,
  tonicPc: number | null,
  /** Index of the instrument's highest string (bends live on the top three). */
  topString: number,
  level: LickParams['level'],
  rng: Rng,
): LickNote[] {
  const prob = BEND_PROB[level];
  const out = notes.map((n) => ({ ...n }));
  if (prob <= 0 || out.length < 3) return out;

  const bentBars = new Set<number>();

  for (let i = 1; i < out.length - 1; i++) {
    const prev = out[i - 1]!;
    const cur = out[i]!;
    const next = out[i + 1]!;
    const semis = midi(cur.pitch) - midi(prev.pitch);
    if (semis !== 1 && semis !== 2) continue;
    if (prev.fret <= 0 || prev.string < topString - 2) continue;
    if (prev.technique === 'bendHalf' || prev.technique === 'bendFull') continue;
    if (cur.durationBeats < 0.5) continue;
    const bar = Math.floor(cur.startBeat / 4);
    if (bentBars.has(bar)) continue;

    const role = toneRole(cur.pitch, chord);
    const keyInterval = tonicPc === null ? null : (((midi(cur.pitch) - tonicPc) % 12) + 12) % 12;
    const strong = (role !== null && role !== '7') || keyInterval === 0 || keyInterval === 7;
    if (!strong) continue;

    const cell = { string: prev.string, fret: prev.fret + semis };
    if (isSameFretStringJump(cell, next)) continue;
    if (rng() >= prob) continue;

    out[i] = { ...cur, ...cell, technique: semis === 2 ? 'bendFull' : 'bendHalf' };
    bentBars.add(bar);
  }
  return out;
}

/** Whether `note` is a bend sounded from the note before it (its cell is `prev`'s, pushed up). */
export function isBendFrom(note: LickNote, prev: LickNote | undefined): boolean {
  if ((note.technique !== 'bendHalf' && note.technique !== 'bendFull') || !prev) return false;
  const semis = note.technique === 'bendFull' ? 2 : 1;
  return note.string === prev.string && note.fret === prev.fret + semis;
}
