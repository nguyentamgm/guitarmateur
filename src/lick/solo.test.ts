import { describe, expect, it } from 'vitest';
import { TONICS, midi } from '../music';
import { TUNINGS, positions, mergedBox } from '../fretboard';
import { generateLick, progressionArc, type LickParams } from './index';

const tonic = (letter: string) => TONICS.find((t) => t.letter === letter && t.alter === 0)!;
const pos = positions(TUNINGS.standard, { tonic: tonic('A'), scaleId: 'minorPentatonic' });
const box = mergedBox(pos, [pos.find((p) => p.minFret === 5)!.index, pos.find((p) => p.minFret === 7)!.index]);
/** Am → G → F → G, the progression from the user report. */
const progression = [
  { tonic: tonic('A'), quality: 'm' as const },
  { tonic: tonic('G'), quality: 'M' as const },
  { tonic: tonic('F'), quality: 'M' as const },
  { tonic: tonic('G'), quality: 'M' as const },
];

/** Chain licks the way `licksForState` does: arc per entry, previous last note carried forward. */
function solo(seed: number, level: LickParams['level'] = 3) {
  let prev: number | undefined;
  return progression.map((chord, i) => {
    const lick = generateLick(box, chord, null, {
      level, targetRole: 'R', resolveToNext: false, seed: seed * 10 + i, arc: progressionArc(i, progression.length),
    }, prev);
    prev = midi(lick.notes.at(-1)!.pitch);
    return lick;
  });
}

describe('progressionArc', () => {
  it('builds to a climax late in the progression and settles back for the last chord', () => {
    const arc = [0, 1, 2, 3, 4, 5, 6, 7].map((i) => progressionArc(i, 8)!);
    const peak = arc.indexOf(Math.max(...arc));
    expect(peak).toBeGreaterThanOrEqual(4);
    expect(peak).toBeLessThan(7);
    expect(arc[0]).toBe(0);
    expect(arc[7]!).toBeLessThan(arc[peak]!);
    expect(arc[7]!).toBeGreaterThan(arc[0]!);
    expect(progressionArc(0, 1)).toBeUndefined();
  });
});

describe('a solo across Am → G → F → G', () => {
  it('voice-leads each chord change: a common tone or a step from the last note', () => {
    let close = 0;
    let changes = 0;
    for (let seed = 0; seed < 50; seed++) {
      const licks = solo(seed);
      for (let i = 1; i < licks.length; i++) {
        changes++;
        const d = Math.abs(midi(licks[i]!.notes[0]!.pitch) - midi(licks[i - 1]!.notes.at(-1)!.pitch));
        if (d <= 2) close++;
      }
    }
    expect(close / changes).toBeGreaterThan(0.7);
  });

  it('lands higher at the climax than at the start', () => {
    let first = 0;
    let climax = 0;
    for (let seed = 0; seed < 50; seed++) {
      const licks = solo(seed);
      first += midi(licks[0]!.notes.at(-1)!.pitch);
      climax += midi(licks[2]!.notes.at(-1)!.pitch);
    }
    expect(climax / 50).toBeGreaterThan(first / 50 + 3);
  });
});
