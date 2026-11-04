import { midi, note, pitchAt, toneRole, type Chord, type Letter, type Alter, type Pitch, type ToneRole } from '../music';
import type { Box, FretNote } from '../fretboard';
import { LEVEL_CAPS, isSameFretStringJump, isStringSkip, type FretCell } from './path';
import { buildLadder, type Rung } from './phrase';
import type { LickNote, LickParams, PartnerNote, Technique } from './model';
import type { Phrase, PhraseNote } from './vocabulary';

/** Everything a phrase needs to know about where it is being played. */
export interface RealizeContext {
  box: Box;
  /** The chord under the phrase. */
  chord: Chord;
  /** The chord its landing note belongs to (the next one, when resolving to it). */
  targetChord: Chord;
  targetRole: ToneRole;
  level: LickParams['level'];
  /** The MIDI note the phrase's `{ s: 0 }` sounds at: the reference pitch, in a chosen octave. */
  baseMidi: number;
}

const BENDS: readonly Technique[] = ['bendHalf', 'bendFull'];
const isBend = (t: Technique | undefined) => t !== undefined && BENDS.includes(t);

/** Fallback chase order for the landing, as `pickChordTone` uses. */
const ROLE_FALLBACK: readonly ToneRole[] = ['3', '5', 'R'];

/**
 * Resolve each note's pitch spec to a MIDI number. `null` when the phrase cannot be placed here:
 * a scale step falls off the box, or a chord tone or target has no candidate. Pitches that do not
 * exist in the box are allowed here and checked by the caller (bends, chromatic notes).
 */
export function resolvePitches(notes: readonly PhraseNote[], ladder: readonly Rung[], ctx: RealizeContext): number[] | null {
  const out: (number | null)[] = notes.map(() => null);
  const rungOf = (m: number) => ladder.findIndex((r) => r.midi === m);
  const lastResolved = (i: number): number | null => {
    for (let j = i - 1; j >= 0; j--) if (out[j] !== null) return out[j]!;
    return null;
  };
  /** Ladder pitch with `role` in `chord` nearest `near`. */
  // The landing may be a decoration tone (major blues' ♭3 is the 7th of the IV chord); other
  // chord-tone notes stay on the scale proper.
  const nearestTone = (roles: readonly ToneRole[], chord: Chord, near: number, withDecorations = false): number | null => {
    for (const role of roles) {
      const cands = ladder
        .filter((r) => (withDecorations || !r.isDecoration) && toneRole(r.notes[0]!.pitch, chord) === role)
        .map((r) => r.midi);
      if (!cands.length) continue;
      // Nearest, but move rather than restrike the same note when another one is close at hand;
      // only an octave or more away, restriking is the better landing.
      const fresh = cands.filter((m) => m !== near && Math.abs(m - near) <= 5);
      const pool = fresh.length ? fresh : cands;
      return pool.reduce((best, m) => (Math.abs(m - near) < Math.abs(best - near) ? m : best));
    }
    return null;
  };

  for (let i = 0; i < notes.length; i++) {
    const nt = notes[i]!;
    const prev = lastResolved(i);
    const near = prev ?? ctx.baseMidi;
    if (isBend(nt.tech)) {
      if (prev === null) return null;
      out[i] = prev + (nt.tech === 'bendFull' ? 2 : 1);
      continue;
    }
    if (nt.tech === 'release') {
      // Back to where the bend started: the note before the bend.
      const origin = i >= 2 ? out[i - 2] : null;
      if (origin === null || origin === undefined || !isBend(notes[i - 1]!.tech)) return null;
      out[i] = origin;
      continue;
    }
    const p = nt.p;
    if (!p) return null;
    if ('s' in p) out[i] = ctx.baseMidi + p.s;
    else if ('ct' in p) out[i] = nearestTone([p.ct], ctx.chord, near);
    else if ('target' in p) {
      const order = [ctx.targetRole, ...ROLE_FALLBACK.filter((r) => r !== ctx.targetRole)];
      out[i] = nearestTone(order, ctx.targetChord, near, true);
    } else if ('step' in p) {
      const r = prev === null ? -1 : rungOf(prev);
      if (r < 0) return null;
      // Steps walk the scale proper; the blue note is not a step of its own.
      const proper = ladder.map((rung, idx) => ({ rung, idx })).filter((x) => !x.rung.isDecoration);
      const at = proper.findIndex((x) => x.idx === r);
      const to = proper[at + p.step];
      if (at < 0 || !to) return null;
      out[i] = to.rung.midi;
    }
    // `above` / `below` depend on the next note: second pass.
    if (out[i] === null && !('above' in p) && !('below' in p)) return null;
  }

  for (let i = notes.length - 1; i >= 0; i--) {
    const p = notes[i]!.p;
    if (!p || !('above' in p || 'below' in p)) continue;
    const next = out[i + 1];
    if (next === null || next === undefined) return null;
    if ('below' in p) out[i] = next - 1;
    else {
      const proper = ladder.filter((r) => !r.isDecoration && r.midi > next);
      if (!proper.length) return null;
      out[i] = proper[0]!.midi;
    }
  }
  return out as number[];
}

/** Open-string MIDI per string, read off the box's own cells. */
function openStrings(box: Box): Map<number, number> {
  const open = new Map<number, number>();
  for (const c of box.notes) open.set(c.string, midi(c.pitch) - c.fret);
  return open;
}

/**
 * Spell a MIDI note that is not one of the box's: with the box's own spelling when its pitch class
 * is in the scale, otherwise on the letter that needs the smallest accidental — sharp when it leads
 * up into `toward`, flat when it leads down.
 */
export function spell(m: number, box: Box, toward?: number): Pitch {
  const own = box.notes.find((c) => ((midi(c.pitch) - m) % 12 + 12) % 12 === 0);
  if (own) return pitchAt(own.pitch, m);
  const LETTERS: readonly [Letter, number][] = [['C', 0], ['D', 2], ['E', 4], ['F', 5], ['G', 7], ['A', 9], ['B', 11]];
  const pc = ((m % 12) + 12) % 12;
  const options = LETTERS.map(([letter, natural]) => {
    let alter = pc - natural;
    if (alter > 6) alter -= 12;
    if (alter < -6) alter += 12;
    return { letter, alter };
  }).filter((o) => Math.abs(o.alter) <= 1);
  const up = toward === undefined || toward > m;
  const best =
    options.find((o) => o.alter === 0) ?? options.find((o) => (up ? o.alter === 1 : o.alter === -1)) ?? options[0]!;
  return pitchAt(note(best.letter, best.alter as Alter), m);
}

interface State {
  cell: FretCell;
  /** The box's own note at this cell, when it is one. */
  fret?: FretNote;
  /** Index into the previous note's states this one is tied to (a bend or release). */
  tied?: number;
}

/** Hand movement between two cells, or Infinity where the level forbids it. */
function moveCost(a: FretCell, b: FretCell, allowSkips: boolean): number {
  if (isSameFretStringJump(a, b)) return Infinity;
  if (!allowSkips && isStringSkip(a, b)) return Infinity;
  return 1.6 * Math.abs(a.string - b.string) + Math.abs(a.fret - b.fret);
}

/**
 * Place a phrase's pitches on the neck: the cheapest fingering (Viterbi) under the level's rules.
 * Bends and releases are tied to the cell of the note before (same string, pushed or let back);
 * chromatic notes may sit one fret outside the box; everything else must be one of its dots.
 * Returns the cells (with the box's note where there is one) or `null` if nothing fits.
 */
export function fingerPhrase(
  notes: readonly PhraseNote[],
  pitches: readonly number[],
  ctx: RealizeContext,
  useTechniques: boolean,
): State[] | null {
  const { allowSkips, maxSpan } = LEVEL_CAPS[ctx.level];
  const open = openStrings(ctx.box);
  const topString = Math.max(...ctx.box.notes.map((c) => c.string));
  const scalePcs = new Set(ctx.box.notes.map((c) => midi(c.pitch) % 12));

  const states: State[][] = [];
  for (let i = 0; i < notes.length; i++) {
    const nt = notes[i]!;
    const m = pitches[i]!;
    if (useTechniques && i > 0 && (isBend(nt.tech) || nt.tech === 'release')) {
      const semis = m - pitches[i - 1]!;
      states.push(
        states[i - 1]!.map((s, j) => ({ cell: { string: s.cell.string, fret: s.cell.fret + semis }, tied: j })),
      );
      continue;
    }
    const own = ctx.box.notes.filter((c) => midi(c.pitch) === m);
    const outside = nt.chromatic && !scalePcs.has(m % 12);
    if (own.length && !outside) {
      states.push(own.map((c) => ({ cell: { string: c.string, fret: c.fret }, fret: c })));
    } else if (outside) {
      const cells: State[] = [];
      for (const [s, o] of open) {
        const f = m - o;
        if (f >= 1 && f >= ctx.box.minFret - 1 && f <= ctx.box.maxFret + 1) cells.push({ cell: { string: s, fret: f } });
      }
      if (!cells.length) return null;
      states.push(cells);
    } else {
      return null;
    }
  }

  // Viterbi.
  let cost = states[0]!.map(() => 0);
  const back: number[][] = [];
  for (let i = 1; i < states.length; i++) {
    const next: number[] = [];
    const from: number[] = [];
    for (const b of states[i]!) {
      if (b.tied !== undefined) {
        const a = states[i - 1]![b.tied]!;
        // A bend lives on the top three strings and needs a fretted note to push.
        const ok = a.cell.fret > 0 && (notes[i]!.tech === 'release' || a.cell.string >= topString - 2);
        next.push(ok ? cost[b.tied]! : Infinity);
        from.push(b.tied);
        continue;
      }
      let best = Infinity;
      let arg = 0;
      states[i - 1]!.forEach((a, j) => {
        const c = cost[j]! + moveCost(a.cell, b.cell, allowSkips);
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
  let end = 0;
  cost.forEach((c, j) => {
    if (c < cost[end]!) end = j;
  });
  if (!Number.isFinite(cost[end]!)) return null;
  const path: State[] = new Array<State>(states.length);
  let j = end;
  for (let i = states.length - 1; i >= 0; i--) {
    path[i] = states[i]![j]!;
    if (i > 0) j = back[i - 1]![j]!;
  }
  // The span is the fretting hand's: bent cells are pushed strings, not frets the hand moves to.
  const fretted = path.filter((_, i) => !(useTechniques && (isBend(notes[i]!.tech) || notes[i]!.tech === 'release')));
  const frets = fretted.map((p) => p.cell.fret);
  if (Math.max(...frets) - Math.min(...frets) > maxSpan) return null;
  return path;
}

/** Whether a template technique still makes sense between these two placed notes. */
function keepTechnique(t: Technique | undefined, a: FretCell, b: FretCell): Technique | undefined {
  if (!t) return undefined;
  if (isBend(t) || t === 'release') return t; // tied to the cell before by construction
  if (a.string !== b.string) return undefined;
  if (t === 'hammer') return b.fret > a.fret && b.fret - a.fret <= 4 ? t : undefined;
  if (t === 'pull') return b.fret < a.fret && a.fret - b.fret <= 4 ? t : undefined;
  if (t === 'slide') return a.fret > 0 && a.fret !== b.fret ? t : undefined;
  return undefined;
}

/** The double-stop partner: `semis` above, on the next string up, within a fret or two. */
function findPartner(box: Box, cell: FretCell, m: number, semis: number): PartnerNote | undefined {
  const want = m + semis;
  const hit = box.notes.find(
    (c) => midi(c.pitch) === want && c.string === cell.string + 1 && Math.abs(c.fret - cell.fret) <= 2,
  );
  return hit ? { string: hit.string, fret: hit.fret, pitch: hit.pitch } : undefined;
}

/**
 * Fit a phrase to the context: resolve its pitches, place them on the neck and build the lick's
 * notes. Below level 3 the phrase is played plain — no bends, slides, double stops or vibrato —
 * which only works when its bent notes exist in the box as fretted notes. `null` when it does not
 * fit here at all.
 */
export function realizePhrase(phrase: Phrase, ctx: RealizeContext): LickNote[] | null {
  const ladder = buildLadder(ctx.box, 5);
  const pitches = resolvePitches(phrase.notes, ladder, ctx);
  if (!pitches) return null;
  const useTechniques = ctx.level >= 3;
  const path = fingerPhrase(phrase.notes, pitches, ctx, useTechniques);
  if (!path) return null;

  const notes: LickNote[] = [];
  phrase.notes.forEach((nt, i) => {
    const m = pitches[i]!;
    const st = path[i]!;
    const isLast = i === phrase.notes.length - 1;
    const toward = pitches[i + 1] ?? pitches[i - 1];
    const pitch = st.fret ? st.fret.pitch : spell(m, ctx.box, toward);
    const technique = useTechniques && i > 0 ? keepTechnique(nt.tech, path[i - 1]!.cell, st.cell) : undefined;
    const partner = useTechniques && nt.partner !== undefined ? findPartner(ctx.box, st.cell, m, nt.partner) : undefined;
    const role = toneRole(pitch, isLast ? ctx.targetChord : ctx.chord) ?? undefined;
    notes.push({
      string: st.cell.string,
      fret: st.cell.fret,
      pitch,
      startBeat: nt.at,
      durationBeats: nt.dur,
      ...(technique && { technique }),
      ...(role && { role }),
      ...(!st.fret && !technique && { chromatic: true }),
      ...(useTechniques && nt.vibrato && { vibrato: true }),
      ...(partner && { partner }),
    });
  });
  return notes;
}
