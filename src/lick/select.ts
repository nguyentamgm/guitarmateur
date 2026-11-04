import { midi, pc, type Chord, type ToneRole } from '../music';
import type { Box } from '../fretboard';
import { weightedChoice, type Rng } from '@shared/core/rng';
import { voiceLeadingWeight } from './contour';
import { countUnplayableMoves } from './path';
import { realizePhrase, type RealizeContext } from './realize';
import { scoreLick } from './score';
import type { LickNote, LickParams } from './model';
import { PHRASES, type Phrase, type PhraseKind, type PhraseNote } from './vocabulary';

/** What the selector knows about the moment a lick is for. */
export interface PhraseContext {
  box: Box;
  chord: Chord;
  targetChord: Chord;
  params: LickParams;
  /** Pitch class of the key's tonic. */
  tonicPc: number;
  prevLastMidi?: number;
  /** Where the solo's arc wants the landing (see `progressionArc`). */
  registerMidi?: number;
}

export interface PhraseLick {
  notes: LickNote[];
  lengthBeats: number;
  difficulty: number;
  /** Which phrase(s) it came from, e.g. 'four-to-five-bend' or 'a+b' for a call and response. */
  source: string;
}

/** The rhythm level a phrase needs: the same duration rules the generated rhythms follow. */
export function rhythmLevel(phrase: Phrase): LickParams['level'] {
  const durs = phrase.notes.map((n) => n.dur);
  if (durs.every((d) => d === 1 || d === 2)) return 1;
  if (durs.every((d) => d === 0.5 || d === 1 || d === 2)) return 2;
  if (durs.every((d) => d % 0.5 === 0)) return 3;
  return 4;
}

/** The level a phrase is written for: its own minimum, or what its rhythm needs. */
export function nativeLevel(phrase: Phrase): LickParams['level'] {
  return Math.max(phrase.minLevel, rhythmLevel(phrase)) as LickParams['level'];
}

/** How much each kind is wanted, by level: plain lines early on, the idioms once techniques are in. */
const KIND_WEIGHT: Record<PhraseKind, number> = {
  run: 1,
  bend: 1.2,
  bendRelease: 0.9,
  doubleStop: 0.8,
  callResponse: 1.2,
  turnaround: 0.15, // only really at the end of the progression — boosted there
  resolution: 1,
  motif: 1.1,
  space: 0.7,
};

/** Phrases that suit this moment, with how much each is wanted. */
export function candidates(ctx: PhraseContext, beats: 4 | 8): { item: Phrase; weight: number }[] {
  const { params, chord } = ctx;
  return PHRASES.filter(
    (p) =>
      p.beats === beats &&
      nativeLevel(p) <= params.level &&
      (!p.qualities || p.qualities.includes(chord.quality)),
  ).map((p) => {
    // Phrases written for this level are wanted most; easier ones still come up, for variety.
    const gap = params.level - nativeLevel(p);
    let weight = KIND_WEIGHT[p.kind] * (gap === 0 ? 1.5 : gap === 1 ? 1 : 0.3);
    // The last chord is where a turnaround belongs: offer it ahead of everything else there.
    if (p.kind === 'turnaround' && params.turnaround) weight = 12;
    if (p.kind === 'space' && params.level >= 4) weight *= 0.4;
    // Do not play the phrase the last chord just had.
    if (params.previousSource?.split('+').includes(p.id)) weight *= 0.15;
    return { item: p, weight };
  });
}

/** Tones a call can hang on: open, unresolved. */
const CALL_ENDS: readonly ToneRole[] = ['5', '7', '3'];

/** Shift a phrase's notes later by `beats` (for the second bar of a call and response). */
const shifted = (notes: readonly PhraseNote[], beats: number): PhraseNote[] => notes.map((n) => ({ ...n, at: n.at + beats }));

/**
 * Call and response from two one-bar phrases: the first ends on an open chord tone instead of the
 * target (the question), the second lands on it (the answer). Often the answer *is* the question
 * again — the most common variation there is: repeat it, and end it differently.
 */
export function callAndResponse(call: Phrase, answer: Phrase, rng: Rng): Phrase {
  const end = CALL_ENDS[Math.floor(rng() * CALL_ENDS.length)]!;
  const callNotes = call.notes.map((n, i) => (i === call.notes.length - 1 ? { ...n, p: { ct: end }, vibrato: n.vibrato } : n));
  return {
    ...call,
    id: `${call.id}+${answer.id}`,
    kind: 'callResponse',
    beats: 8,
    notes: [...callNotes, ...shifted(answer.notes, 4)],
  };
}

/**
 * Rhythmic displacement: the same phrase half a beat later, its last note shortened to still end
 * on the bar line. Only when that last note is long enough to give the half beat up.
 */
export function displaced(phrase: Phrase): Phrase | null {
  const last = phrase.notes[phrase.notes.length - 1]!;
  if (last.dur < 1.5) return null;
  return {
    ...phrase,
    notes: phrase.notes.map((n, i) =>
      i === phrase.notes.length - 1 ? { ...n, at: n.at + 0.5, dur: n.dur - 0.5 } : { ...n, at: n.at + 0.5 },
    ),
  };
}

/**
 * Leave one note out — a rest where it was — for space. Not the first note (the phrase must still
 * start somewhere recognisable), not the landing, and not a note a bend, release, scale step or
 * approach hangs on.
 */
export function withRest(phrase: Phrase, rng: Rng): Phrase | null {
  const ns = phrase.notes;
  const dependsOnPrev = (k: number) => {
    const x = ns[k];
    return x !== undefined && (!x.p || 'step' in x.p);
  };
  const dependsOnNext = (k: number) => {
    const p = ns[k]?.p;
    return p !== undefined && ('above' in p || 'below' in p);
  };
  const options = ns
    .map((_, i) => i)
    .filter((i) => i > 0 && i < ns.length - 1 && !dependsOnPrev(i + 1) && !dependsOnPrev(i) && !dependsOnNext(i) && !dependsOnNext(i - 1));
  if (!options.length) return null;
  const drop = options[Math.floor(rng() * options.length)]!;
  return { ...phrase, notes: ns.filter((_, i) => i !== drop) };
}

/** The MIDI reference notes (key tonic or chord root) in octaves that can reach the box. */
function bases(ctx: PhraseContext, phrase: Phrase): number[] {
  const refPc = phrase.ref === 'key' ? ctx.tonicPc : pc(ctx.chord.tonic);
  const midis = ctx.box.notes.map((n) => midi(n.pitch));
  const lo = Math.min(...midis) - 15;
  const hi = Math.max(...midis);
  const out: number[] = [];
  for (let m = lo; m <= hi; m++) if (((m % 12) + 12) % 12 === refPc) out.push(m);
  return out;
}

/** How many phrases to try before giving up on the vocabulary for this lick. */
const TRIES = 8;

/**
 * A lick from the vocabulary: pick a phrase that suits the chord, the level and where we are in
 * the progression; maybe vary it; fit it to the box in the octave that best continues the solo
 * (voice leading from the last lick, the arc's register). `null` when nothing fits — the caller
 * then generates one.
 */
export function vocabularyLick(ctx: PhraseContext, rng: Rng): PhraseLick | null {
  const { params } = ctx;
  const bars = params.bars ?? 1;
  const lengthBeats = bars * 4;
  const pool1 = candidates(ctx, 4);
  const pool = bars === 2 ? [...candidates(ctx, 8), ...pool1.map((c) => ({ ...c, weight: c.weight * 0.6 }))] : pool1;
  if (!pool.length) return null;

  // Weigh a few phrases that fit rather than taking the first: the one that best continues the
  // solo (voice leading, the arc) wins, with the selection weight as a tie-breaker.
  const fits: { lick: PhraseLick; score: number }[] = [];
  const remaining = [...pool];
  // Mid-solo there is a line to continue, so look at more options for the smoothest join.
  const compare = ctx.prevLastMidi === undefined ? FITS_TO_COMPARE : FITS_TO_COMPARE_MID_SOLO;
  for (let t = 0; t < TRIES && remaining.length && fits.length < compare; t++) {
    const pick = weightedChoice(rng, remaining);
    remaining.splice(remaining.findIndex((r) => r.item === pick), 1);

    let phrase = pick;
    if (bars === 2 && phrase.beats === 4) {
      // Answer with the same phrase (repetition) or another one-bar phrase.
      // The answer must share the call's reference (key or chord) to be read in the same terms.
      const sameRef = pool1.filter((c) => c.item.ref === phrase.ref);
      const answer = rng() < 0.5 || !sameRef.length ? phrase : weightedChoice(rng, sameRef);
      phrase = callAndResponse(phrase, answer, rng);
    }
    // Displacing leaves a dotted last note, which the easy levels' rhythms do not use.
    if (params.level >= 3 && rng() < 0.25) phrase = displaced(phrase) ?? phrase;
    if (rng() < 0.2) phrase = withRest(phrase, rng) ?? phrase;

    const placed = bestPlacement(phrase, ctx);
    if (placed) {
      const { score, ...lick } = placed;
      fits.push({ lick: { ...lick, lengthBeats, source: phrase.id }, score: score + Math.log(pickWeight(pool, pick)) + rng() * 1.5 });
    }
  }
  if (!fits.length) return null;
  return fits.reduce((a, b) => (b.score > a.score ? b : a)).lick;
}

/** How many fitting phrases to compare for one lick (more when a previous lick sets a line). */
const FITS_TO_COMPARE = 3;
const FITS_TO_COMPARE_MID_SOLO = 5;

const pickWeight = (pool: readonly { item: Phrase; weight: number }[], p: Phrase): number =>
  pool.find((c) => c.item === p)?.weight ?? 1;

/** The best-fitting octave for a phrase, or null if it fits none. */
function bestPlacement(phrase: Phrase, ctx: PhraseContext): (Omit<PhraseLick, 'lengthBeats' | 'source'> & { score: number }) | null {
  const { params } = ctx;
  let best: { notes: LickNote[]; difficulty: number; score: number } | null = null;
  for (const baseMidi of bases(ctx, phrase)) {
    const rctx: RealizeContext = {
      box: ctx.box,
      chord: ctx.chord,
      targetChord: ctx.targetChord,
      targetRole: params.targetRole,
      level: params.level,
      baseMidi,
    };
    const notes = realizePhrase(phrase, rctx);
    if (!notes || countUnplayableMoves(notes, params.level) > 0) continue;
    // `scoreLick` saturates on any line of 8ths, so the level the phrase is written for carries
    // most of the weight.
    const measured = scoreLick(
      notes.map((n) => ({ string: n.string, fret: n.fret, startBeat: n.startBeat, technique: n.technique, isDecoration: n.chromatic === true })),
      phrase.beats,
    );
    const difficulty = Math.min(5, Math.max(1, (2 * nativeLevel(phrase) + measured) / 3));
    const first = midi(notes[0]!.pitch);
    const last = midi(notes[notes.length - 1]!.pitch);
    let score = 0;
    if (ctx.prevLastMidi !== undefined) score += 2 * Math.log(voiceLeadingWeight(Math.abs(first - ctx.prevLastMidi)));
    if (ctx.registerMidi !== undefined) score -= Math.abs(last - ctx.registerMidi) / 4;
    // Without an arc, lean on the middle of the neck rather than the bass strings.
    else score += notes.reduce((s, n) => s + n.string, 0) / notes.length / 3;
    if (!best || score > best.score) best = { notes, difficulty, score };
  }
  return best;
}
