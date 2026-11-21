import { describe, expect, it } from 'vitest';
import { TONICS, defaultProgression, toneRole, type Chord, type Key, type ScaleId, type ToneRole } from '../music';
import { TUNINGS, positions, mergedBox, type Box } from '../fretboard';
import { generateLick, type Lick, type LickParams } from './index';
import { countUnplayableMoves } from './path';
import { isBendFrom } from './bends';

/**
 * Named situations a learner meets in the UI, each built the way the UI builds it (boxes from
 * `positions`, chords from the key's default progression) and run over a few seeds. Every lick
 * must be playable in the chosen box and land on the asked chord tone; see `check` below.
 */

/** Chase order `pickChordTone` (contour.ts) uses when the requested role has no box candidates. */
const ROLE_FALLBACK: ToneRole[] = ['3', '5', 'R'];

/** First role in that chain with at least one matching note in the box: what the landing note must be. */
function landingRole(box: Box, chord: Chord, role: ToneRole): ToneRole {
  for (const r of [role, ...ROLE_FALLBACK.filter((x) => x !== role)]) {
    if (box.notes.some((n) => toneRole(n.pitch, chord) === r)) return r;
  }
  throw new Error('fallback chain exhausted: no R/3/5/7 chord tone present in box');
}

const tonic = (letter: string, alter = 0) => TONICS.find((t) => t.letter === letter && t.alter === alter)!;

interface Situation {
  /** The user situation or music rule it guards. */
  name: string;
  scale: ScaleId;
  tonic: ReturnType<typeof tonic>;
  /** Selected box indices, as the box picker sends them. */
  boxes: number[];
  levels: LickParams['level'][];
  role: ToneRole;
  resolveToNext?: boolean;
  bars?: 1 | 2;
}

const SITUATIONS: Situation[] = [
  {
    name: 'a beginner in one box: A minor pentatonic box 1, levels 1–2, steps to the next string only',
    scale: 'minorPentatonic', tonic: tonic('A'), boxes: [0], levels: [1, 2], role: 'R',
  },
  {
    name: 'two adjacent boxes joined: C major pentatonic boxes 1+2, level 3',
    scale: 'majorPentatonic', tonic: tonic('C'), boxes: [0, 1], levels: [3], role: '3',
  },
  {
    name: 'the asked 7th is not in the box: A minor pentatonic over Am lands on the fallback tone',
    scale: 'minorPentatonic', tonic: tonic('A'), boxes: [0], levels: [2, 4], role: '7',
  },
  {
    name: 'lands on the next chord at the change: F♯ minor pentatonic box 2, resolve to next',
    scale: 'minorPentatonic', tonic: tonic('F', 1), boxes: [1], levels: [2, 4], role: 'R', resolveToNext: true,
  },
  {
    name: 'a two-bar lick fills both bars: E♭ major, box 3, level 4',
    scale: 'major', tonic: tonic('E', -1), boxes: [2], levels: [4], role: '5', bars: 2,
  },
  {
    name: 'blues at level 5, with bends and passing notes: A blues box 1',
    scale: 'blues', tonic: tonic('A'), boxes: [0], levels: [5], role: 'R',
  },
];

const SEEDS = Array.from({ length: 12 }, (_, i) => i);

/** Everything wrong with one lick, as readable messages (empty when it is fine). */
function check(lick: Lick, box: Box, chord: Chord, target: Chord, role: ToneRole, level: LickParams['level'], bars: number): string[] {
  const problems: string[] = [];
  const fail = (ok: boolean, msg: string) => ok || problems.push(msg);
  const cells = new Set(box.notes.map((n) => `${n.string}:${n.fret}`));
  const notes = lick.notes;

  fail(notes.length > 0, 'empty lick');
  fail(lick.lengthBeats === bars * 4, `lengthBeats ${lick.lengthBeats}`);
  fail(lick.difficulty >= 1 && lick.difficulty <= 5, `difficulty ${lick.difficulty}`);
  let prevEnd = -Infinity;
  notes.forEach((n, i) => {
    const prev = notes[i - 1];
    // Playable: a note of the box, a bend from the note before, or a chromatic approach note.
    fail(cells.has(`${n.string}:${n.fret}`) || isBendFrom(n, prev) || n.chromatic === true, `note ${i} outside the box (${n.string}:${n.fret})`);
    fail(n.durationBeats > 0 && n.startBeat >= prevEnd - 1e-9, `note ${i} overlaps the one before`);
    prevEnd = n.startBeat + n.durationBeats;
    const expected = toneRole(n.pitch, i === notes.length - 1 ? target : chord) ?? null;
    fail((n.role ?? null) === expected, `note ${i} role ${String(n.role)}, expected ${String(expected)}`);
    if (!prev) return;
    const dString = Math.abs(n.string - prev.string);
    // Hardcoded independently of path.ts's level caps, so relaxing those caps is caught here.
    fail(!(n.fret === prev.fret && n.fret > 0 && dString >= 2), `note ${i} is a same-fret string jump`);
    if (level <= 2) fail(dString <= 1, `note ${i} skips a string at level ${level}`);
  });
  const last = notes.at(-1);
  if (last) {
    fail(Math.abs(last.startBeat + last.durationBeats - lick.lengthBeats) < 0.001, 'the last note does not sustain to the end');
    fail(last.role === landingRole(box, target, role), `lands on ${String(last.role)}, expected ${landingRole(box, target, role)}`);
  }
  fail(countUnplayableMoves(notes, level) === 0, 'unplayable moves');
  return problems;
}

describe('generateLick in named situations', () => {
  it.each(SITUATIONS.map((s) => [s.name, s] as const))('%s', (_, s) => {
    const key: Key = { tonic: s.tonic, scaleId: s.scale };
    const box = mergedBox(positions(TUNINGS.standard, key), s.boxes);
    const [chord, next] = defaultProgression(key) as [Chord, Chord];
    const target = s.resolveToNext ? next : chord;
    const bars = s.bars ?? 1;
    const problems: string[] = [];
    const licks: Lick[] = [];
    for (const level of s.levels) {
      for (const seed of SEEDS) {
        const params: LickParams = { level, targetRole: s.role, resolveToNext: s.resolveToNext ?? false, seed, bars };
        const lick = generateLick(box, chord, next, params);
        licks.push(lick);
        for (const p of check(lick, box, chord, target, s.role, level, bars)) problems.push(`level ${level} seed ${seed}: ${p}`);
      }
    }
    expect(problems.slice(0, 10)).toEqual([]);
    if (s.scale === 'blues') {
      const all = licks.flatMap((l) => l.notes.map((n, i) => ({ n, prev: l.notes[i - 1] })));
      expect(all.some(({ n, prev }) => isBendFrom(n, prev)), 'a bend').toBe(true);
      expect(all.some(({ n }) => n.chromatic === true || box.notes.some((b) => b.isDecoration && b.string === n.string && b.fret === n.fret)), 'a passing note').toBe(true);
    }
  });
});
