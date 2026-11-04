import { describe, expect, it } from 'vitest';
import { TONICS, midi, toneRole } from '../music';
import { TUNINGS, positions, mergedBox } from '../fretboard';
import { buildLadder, buildLine, fingerLine, groupStarts } from './phrase';
import { countUnplayableMoves } from './path';
import { generateLick } from './index';

const A = TONICS.find((t) => t.letter === 'A' && t.alter === 0)!;
const pos = positions(TUNINGS.standard, { tonic: A, scaleId: 'minorPentatonic' });
/** The classic A minor pentatonic box at the 5th fret. */
const box = mergedBox(pos, [pos.find((p) => p.minFret === 5)!.index]);
const a7 = { tonic: A, quality: 'dom7' as const };

describe('groupStarts', () => {
  it('starts a new group after a rest and at a bar line, not between joined notes', () => {
    const slots = [
      { startBeat: 0, durationBeats: 0.5 },
      { startBeat: 0.5, durationBeats: 0.5 },
      { startBeat: 2, durationBeats: 1 }, // after a rest
      { startBeat: 3, durationBeats: 1 },
      { startBeat: 4, durationBeats: 4 }, // bar 2
    ];
    expect([...groupStarts(slots)]).toEqual([2, 4]);
  });
});

describe('buildLine', () => {
  it('restates the motif at each group start and steps into the target', () => {
    // 8 notes, a new group at index 4; motif "down, down" from rung 6, landing on rung 2 from above.
    const line = buildLine(8, new Set([4]), 6, 2, 12, [-1, -1], 'repeat', 1);
    expect(line).toEqual([6, 5, 4, 6, 6, 5, 3, 2]);
    // index 3 restarts because the 2-move motif is spent; index 4 because a group starts there.
  });

  it('sequence mode moves each restatement one step toward the target', () => {
    const line = buildLine(9, new Set(), 8, 1, 12, [-1, -1], 'sequence', 1);
    expect(line.slice(0, 7)).toEqual([8, 7, 6, 7, 6, 5, 6]);
    expect(line.slice(-2)).toEqual([2, 1]);
  });

  it('stays on the ladder', () => {
    const line = buildLine(10, new Set(), 0, 1, 4, [-1, -1, -1], 'chain', -1);
    for (const r of line) {
      expect(r).toBeGreaterThanOrEqual(0);
      expect(r).toBeLessThan(4);
    }
  });
});

describe('fingerLine', () => {
  it('never returns a fingering the level forbids', () => {
    const ladder = buildLadder(box, 1);
    for (let start = 0; start < ladder.length; start++) {
      const line = [start, Math.max(0, start - 1), Math.min(ladder.length - 1, start + 2), start];
      const path = fingerLine(line, ladder, 1);
      if (path) {
        expect(countUnplayableMoves(path, 1)).toBe(0);
        expect(path.map((p) => midi(p.pitch))).toEqual(line.map((r) => ladder[r]!.midi));
      }
    }
  });
});

describe('generateLick — phrasing', () => {
  it('approaches the landing note by step from the scale note above or below', () => {
    const ladder = buildLadder(box, 5);
    const rungOf = (m: number) => ladder.findIndex((r) => r.midi === m);
    let stepwise = 0;
    let total = 0;
    for (const level of [2, 3, 4, 5] as const) {
      for (let seed = 0; seed < 50; seed++) {
        const notes = generateLick(box, a7, null, { level, targetRole: 'R', resolveToNext: false, seed }).notes;
        if (notes.length < 3) continue;
        total++;
        const d = rungOf(midi(notes.at(-1)!.pitch)) - rungOf(midi(notes.at(-2)!.pitch));
        if (Math.abs(d) === 1) stepwise++;
      }
    }
    expect(stepwise / total).toBeGreaterThan(0.85);
  });

  it('puts chord tones on most strong beats', () => {
    let strong = 0;
    let chordTones = 0;
    for (const level of [1, 2, 3, 4, 5] as const) {
      for (let seed = 0; seed < 50; seed++) {
        const notes = generateLick(box, a7, null, { level, targetRole: 'R', resolveToNext: false, seed }).notes;
        for (const n of notes.slice(0, -1)) {
          if (n.startBeat % 2 !== 0) continue;
          strong++;
          if (toneRole(n.pitch, a7) !== null) chordTones++;
        }
      }
    }
    expect(chordTones / strong).toBeGreaterThan(0.8);
  });

  it('neighbouring seeds give different licks', () => {
    const licks = Array.from({ length: 10 }, (_, seed) =>
      JSON.stringify(generateLick(box, a7, null, { level: 3, targetRole: 'R', resolveToNext: false, seed }).notes),
    );
    expect(new Set(licks).size).toBeGreaterThanOrEqual(8);
  });
});
