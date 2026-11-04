import { midi, toneRole, type Chord, type ToneRole } from '../music';
import type { Box, FretNote } from '../fretboard';
import { weightedChoice, type Rng } from '@shared/core/rng';
import type { RhythmSlot } from './rhythm';
import { LEVEL_CAPS, isSameFretStringJump, isStringSkip } from './path';
import type { LickParams } from './model';

/*
 * Phrase-first melody generation.
 *
 * The older walk (`fillPath`) picked each note on its own — nearest fret, roughly following a
 * contour — which plays like running up and down the box. A lick a player would actually play has
 * a *motif*: a small shape that is stated, then repeated or moved, and it walks into its target by
 * step. So this module works in two separate passes:
 *
 * 1. **Pitch** — on the box's "ladder" (its distinct pitches, low to high), build a line from a
 *    motif, restated at every rhythmic group, and approach the target by a step. Several candidate
 *    lines are scored for musical sense (chord tones on strong beats, leaps that recover, the blue
 *    note only as a passing tone) and the best playable one wins.
 * 2. **Fingering** — choose where on the neck each pitch is played with a small dynamic program
 *    over the box's cells, under the same hard ergonomic rules the walk obeys (no same-fret string
 *    jumps; no string skips at levels 1–2).
 */

/** One distinct pitch of the box, with every cell it can be played on. */
export interface Rung {
  midi: number;
  notes: FretNote[];
  isDecoration: boolean;
}

/** The box's distinct pitches, low to high. Decoration tones (the blues ♭5) only from level 2. */
export function buildLadder(box: Box, level: LickParams['level']): Rung[] {
  const byMidi = new Map<number, FretNote[]>();
  for (const n of box.notes) {
    if (n.isDecoration && level < 2) continue;
    const m = midi(n.pitch);
    const cells = byMidi.get(m);
    if (cells) cells.push(n);
    else byMidi.set(m, [n]);
  }
  return [...byMidi.entries()]
    .sort((a, b) => a[0] - b[0])
    .map(([m, notes]) => ({ midi: m, notes, isDecoration: notes[0]!.isDecoration }));
}

/** A motif as moves on the ladder: +1 = next scale note up, 0 = the same note again. */
export interface Motif {
  moves: number[];
  minLevel: LickParams['level'];
  weight: number;
}

/**
 * The motif vocabulary — the shapes blues and rock lead lines are built from. Kept short on
 * purpose: a motif is heard as one only if it comes round again within the bar.
 */
export const MOTIFS: readonly Motif[] = [
  { moves: [0], minLevel: 1, weight: 1 }, // repeated note — the simplest hook there is
  { moves: [-1], minLevel: 1, weight: 1.5 }, // two-note sigh, falling
  { moves: [1], minLevel: 1, weight: 0.8 },
  { moves: [-1, -1], minLevel: 1, weight: 2 }, // three-note fall
  { moves: [1, 1], minLevel: 1, weight: 1 },
  { moves: [1, -1], minLevel: 1, weight: 1.5 }, // upper neighbour
  { moves: [-1, 1], minLevel: 1, weight: 1.2 }, // lower neighbour
  { moves: [0, -1], minLevel: 2, weight: 1.5 }, // repeat then drop
  { moves: [2, -1], minLevel: 2, weight: 1.2 }, // leap up, step back (gap fill)
  { moves: [-2, 1], minLevel: 2, weight: 1 },
  { moves: [1, -1, -1], minLevel: 3, weight: 1.5 }, // turn
  { moves: [-1, -1, 2], minLevel: 3, weight: 1.2 }, // fall and roll back up
  { moves: [0, 1, -1], minLevel: 3, weight: 1 },
  { moves: [-1, -1, -1], minLevel: 3, weight: 1 },
  { moves: [1, 1, -2], minLevel: 4, weight: 1 },
  { moves: [-1, 1, -1, -1], minLevel: 4, weight: 1 },
];

/**
 * How a motif comes back at the next group: `repeat` restates it from the same note (call and
 * call again), `sequence` restates it one scale step nearer the target, `chain` keeps applying its
 * moves from wherever the line has got to (a patterned run).
 */
export type MotifMode = 'repeat' | 'sequence' | 'chain';

const MODE_WEIGHTS: { item: MotifMode; weight: number }[] = [
  { item: 'repeat', weight: 0.4 },
  { item: 'sequence', weight: 0.4 },
  { item: 'chain', weight: 0.2 },
];

/**
 * Indices where a new rhythmic group starts: after a rest, and at each bar line. The motif is
 * restated there, so the repetition lines up with what the ear hears as phrase segments.
 */
export function groupStarts(slots: readonly RhythmSlot[], barBeats = 4): Set<number> {
  const out = new Set<number>();
  for (let i = 1; i < slots.length; i++) {
    const prev = slots[i - 1]!;
    const cur = slots[i]!;
    const gap = cur.startBeat - (prev.startBeat + prev.durationBeats) > 1e-9;
    const newBar = Math.floor(cur.startBeat / barBeats) !== Math.floor(prev.startBeat / barBeats);
    if (gap || newBar) out.add(i);
  }
  return out;
}

/**
 * A line of `n` ladder indices from `first` to `last`: the motif fills the body, restated at each
 * group start, and the second-to-last note steps into `last` from `approachDir` (+1 = from above).
 */
export function buildLine(
  n: number,
  groups: ReadonlySet<number>,
  first: number,
  last: number,
  ladderSize: number,
  motif: readonly number[],
  mode: MotifMode,
  approachDir: 1 | -1,
): number[] {
  if (n <= 1) return [last];
  const clamp = (r: number) => Math.max(0, Math.min(ladderSize - 1, r));
  const line: number[] = new Array<number>(n);
  line[0] = first;
  line[n - 1] = last;
  if (n === 2) return line;

  const above = last + approachDir;
  line[n - 2] = above >= 0 && above < ladderSize ? above : clamp(last - approachDir);

  const towardTarget = Math.sign(last - first) || -1;
  let head = first;
  let cur = first;
  let k = 0;
  for (let i = 1; i <= n - 3; i++) {
    const restart = mode !== 'chain' && (groups.has(i) || k >= motif.length);
    if (restart) {
      if (mode === 'sequence') head = clamp(head + towardTarget);
      cur = head;
      k = 0;
    } else {
      const move = motif[k % motif.length]!;
      k++;
      const next = cur + move;
      cur = next >= 0 && next < ladderSize ? next : clamp(cur - move);
    }
    line[i] = cur;
  }
  return line;
}

/**
 * How much each chord-tone role is worth where the beat is strong. Not all chord tones are equal:
 * the 3rd carries the chord's colour (minor or major), root and 5th are stable, the 7th is a
 * softer colour tone. A non-chord tone there costs.
 */
const STRONG_BEAT_ROLE: Record<ToneRole, number> = { R: 1, '3': 1.2, '5': 1, '7': 0.6 };
const STRONG_BEAT_NON_CHORD = -1;

/**
 * At the end of a phrase segment (the note before a rest or bar line) the ear wants to come to
 * rest: the root most of all, then the 5th, the 3rd a little less; anything else sounds unfinished.
 */
const PHRASE_END_ROLE: Record<ToneRole, number> = { R: 1.2, '5': 0.8, '3': 0.5, '7': 0 };
const PHRASE_END_NON_CHORD = -0.8;

/**
 * Musical sense of a line, higher is better. Not a difficulty measure — it rewards what makes a
 * phrase sound intentional: chord tones where the beat is strong or the note is held (the 3rd most,
 * the 7th least), resolution where a segment ends, non-chord tones (the 4th, the 2nd…) on weak
 * beats as passing or neighbour tension, leaps that turn back by step, the decoration (blue) note
 * only in passing, and a compact range.
 */
export function scoreLine(line: readonly number[], ladder: readonly Rung[], slots: readonly RhythmSlot[], chord: Chord): number {
  const n = line.length;
  const segmentEnds = new Set([...groupStarts(slots)].map((g) => g - 1));
  let score = 0;
  let sameRun = 1;
  for (let i = 0; i < n; i++) {
    const rung = ladder[line[i]!]!;
    const slot = slots[i]!;
    const isLast = i === n - 1;
    const role = toneRole(rung.notes[0]!.pitch, chord);
    const strong = slot.startBeat % 2 === 0 || slot.durationBeats >= 1;
    if (!isLast && strong) {
      score += role !== null ? STRONG_BEAT_ROLE[role] : STRONG_BEAT_NON_CHORD;
    } else if (!isLast && role === null && i > 0) {
      // Tension on a weak beat is good when it moves by step — a passing or neighbour tone.
      const stepIn = Math.abs(line[i]! - line[i - 1]!) === 1;
      const stepOut = Math.abs(line[i + 1]! - line[i]!) === 1;
      score += stepIn && stepOut ? 0.3 : -0.3;
    }
    if (segmentEnds.has(i)) {
      score += role !== null ? PHRASE_END_ROLE[role] : PHRASE_END_NON_CHORD;
    }
    if (rung.isDecoration) {
      const prev = line[i - 1];
      const next = line[i + 1];
      const passing =
        prev !== undefined && next !== undefined && Math.abs(line[i]! - prev) === 1 && next - line[i]! === line[i]! - prev;
      score += passing && slot.durationBeats < 1 ? 0.5 : -2;
    }
    if (i > 0) {
      const d = line[i]! - line[i - 1]!;
      const leap = Math.abs(d);
      if (leap >= 4) score -= 2;
      else if (leap === 3) score -= 0.7;
      if (leap >= 2 && i + 1 < n) {
        const d2 = line[i + 1]! - line[i]!;
        score += Math.sign(d2) === -Math.sign(d) && Math.abs(d2) <= 1 ? 0.5 : -0.5;
      }
      sameRun = d === 0 ? sameRun + 1 : 1;
      if (sameRun > 3) score -= 1;
    }
  }
  const range = Math.max(...line) - Math.min(...line);
  if (range > 7) score -= range - 7;
  return score;
}

/** Cost of moving the fretting hand between two cells; `Infinity` when the level forbids it. */
function moveCost(a: FretNote, b: FretNote, allowSkips: boolean): number {
  if (isSameFretStringJump(a, b)) return Infinity;
  if (!allowSkips && isStringSkip(a, b)) return Infinity;
  return 1.6 * Math.abs(a.string - b.string) + Math.abs(a.fret - b.fret);
}

/**
 * Cheapest playable fingering of a line (Viterbi over each pitch's cells), or `null` if the
 * level's rules leave no way through or the result overruns the level's fret span.
 */
export function fingerLine(line: readonly number[], ladder: readonly Rung[], level: LickParams['level']): FretNote[] | null {
  const { allowSkips, maxSpan } = LEVEL_CAPS[level];
  const cands = line.map((r) => ladder[r]!.notes);
  let cost = cands[0]!.map(() => 0);
  const back: number[][] = [];
  for (let i = 1; i < cands.length; i++) {
    const prevCells = cands[i - 1]!;
    const next: number[] = [];
    const from: number[] = [];
    for (const b of cands[i]!) {
      let best = Infinity;
      let arg = -1;
      prevCells.forEach((a, j) => {
        const c = cost[j]! + moveCost(a, b, allowSkips);
        if (c < best) {
          best = c;
          arg = j;
        }
      });
      next.push(best);
      from.push(arg);
    }
    back.push(from);
    cost = next;
  }
  let end = -1;
  let endCost = Infinity;
  cost.forEach((c, j) => {
    if (c < endCost) {
      endCost = c;
      end = j;
    }
  });
  if (!Number.isFinite(endCost)) return null;

  const path: FretNote[] = new Array<FretNote>(cands.length);
  let j = end;
  for (let i = cands.length - 1; i >= 0; i--) {
    path[i] = cands[i]![j]!;
    if (i > 0) j = back[i - 1]![j]!;
  }
  const frets = path.map((p) => p.fret);
  if (Math.max(...frets) - Math.min(...frets) > maxSpan) return null;
  return path;
}

/** How many candidate lines each attempt weighs before keeping the most musical playable one. */
const CANDIDATES = 10;

/**
 * Build a phrase from `first` to `last` over `slots`, or `null` when neither endpoint is on the
 * ladder or no candidate line can be fingered — the caller then falls back to the plain walk.
 */
export function buildPhrase(
  box: Box,
  first: FretNote,
  last: FretNote,
  slots: readonly RhythmSlot[],
  chord: Chord,
  level: LickParams['level'],
  rng: Rng,
): FretNote[] | null {
  const ladder = buildLadder(box, level);
  const fi = ladder.findIndex((r) => r.midi === midi(first.pitch));
  const ti = ladder.findIndex((r) => r.midi === midi(last.pitch));
  if (fi < 0 || ti < 0) return null;

  const groups = groupStarts(slots);
  const motifs = MOTIFS.filter((m) => m.minLevel <= level).map((m) => ({ item: m.moves, weight: m.weight }));
  let best: { path: FretNote[]; score: number } | null = null;
  for (let c = 0; c < CANDIDATES; c++) {
    const motif = weightedChoice(rng, motifs);
    const mode = weightedChoice(rng, MODE_WEIGHTS);
    // Blues lines mostly resolve downward, so the approach comes from above more often than not.
    const approachDir: 1 | -1 = rng() < 0.6 ? 1 : -1;
    const line = buildLine(slots.length, groups, fi, ti, ladder.length, motif, mode, approachDir);
    const path = fingerLine(line, ladder, level);
    if (!path) continue;
    const score = scoreLine(line, ladder, slots, chord);
    if (!best || score > best.score) best = { path, score };
  }
  return best?.path ?? null;
}
