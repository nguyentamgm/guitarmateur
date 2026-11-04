import { describe, expect, it } from 'vitest';
import { mulberry32 } from '@shared/core/rng';
import { TONICS, midi, note, pitchAt, type NoteName } from '../music';
import { TUNINGS, positions, mergedBox } from '../fretboard';
import { addChromaticApproach } from './approach';
import { buildLadder, scoreLine } from './phrase';
import { generateLick } from './index';
import type { LickNote } from './model';

const A = TONICS.find((t) => t.letter === 'A' && t.alter === 0)!;
const am = { tonic: A, quality: 'm' as const };
const pos = positions(TUNINGS.standard, { tonic: A, scaleId: 'minorPentatonic' });
const box = mergedBox(pos, [pos.find((p) => p.minFret === 5)!.index]);

function at(s: number, fret: number, name: NoteName, startBeat: number, durationBeats = 0.5): LickNote {
  const open = [40, 45, 50, 55, 59, 64][s]!;
  return { string: s, fret, pitch: pitchAt(name, open + fret), startBeat, durationBeats };
}

/** C (G string 5) → D (G string 7) → landing A on the D string, fret 7. */
const toA = [at(3, 5, note('C'), 2), at(3, 7, note('D'), 2.5), at(2, 7, note('A'), 3, 1)];

describe('addChromaticApproach', () => {
  it('approaches the landing note from the half step below, one fret lower, spelled as its leading tone', () => {
    const results = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9].map((seed) => addChromaticApproach(toA, box, am, 5, mulberry32(seed)));
    const hit = results.find((r) => r[1]!.chromatic);
    expect(hit).toBeDefined();
    expect(hit![1]).toMatchObject({ string: 2, fret: 6, chromatic: true, startBeat: 2.5 });
    expect(hit![1]!.pitch).toMatchObject({ letter: 'G', alter: 1 }); // G♯, never A♭
    expect(midi(hit![1]!.pitch)).toBe(midi(toA[2]!.pitch) - 1);
  });

  it('leaves levels 1-2 alone, and skips a half step that is already in the scale', () => {
    // The same box with G♯ added to its scale: G♯ → A is then a scale step, not a chromatic one.
    const withLeadingTone = { ...box, notes: [...box.notes, { ...box.notes[0]!, pitch: pitchAt(note('G', 1), 56) }] };
    for (let seed = 0; seed < 30; seed++) {
      for (const level of [1, 2] as const) {
        expect(addChromaticApproach(toA, box, am, level, mulberry32(seed))[1]!.chromatic).toBeUndefined();
      }
      expect(addChromaticApproach(toA, withLeadingTone, am, 5, mulberry32(seed))[1]!.chromatic).toBeUndefined();
    }
  });

  it('shows up in generated licks from level 3', () => {
    let count = 0;
    for (let seed = 0; seed < 100; seed++) {
      const notes = generateLick(box, am, null, { level: 4, targetRole: 'R', resolveToNext: false, seed }).notes;
      if (notes.some((n) => n.chromatic)) count++;
    }
    expect(count).toBeGreaterThan(5);
  });
});

describe('scoreLine — chord tones are not all equal', () => {
  const ladder = buildLadder(box, 3);
  const rung = (name: string, octave: number) =>
    ladder.findIndex((r) => r.notes[0]!.pitch.letter === name && r.notes[0]!.pitch.octave === octave);
  // Two notes, a rest, two notes: index 1 ends a segment, on a strong-ish held beat.
  const slots = [
    { startBeat: 0, durationBeats: 0.5 },
    { startBeat: 0.5, durationBeats: 0.5 },
    { startBeat: 2, durationBeats: 1 },
    { startBeat: 3, durationBeats: 1 },
  ];
  const line = (segmentEnd: number) => [rung('E', 4), segmentEnd, rung('C', 4), rung('A', 3)];

  it('a segment that comes to rest on the root beats one that stops on the 4th', () => {
    expect(scoreLine(line(rung('A', 3)), ladder, slots, am)).toBeGreaterThan(scoreLine(line(rung('D', 4)), ladder, slots, am));
  });

  it('on a strong beat a chord tone beats a non-chord tone a step away', () => {
    const slots2 = [{ startBeat: 2, durationBeats: 1 }, { startBeat: 3, durationBeats: 1 }];
    const strong = (r: number) => scoreLine([r, rung('A', 3)], ladder, slots2, am);
    expect(strong(rung('C', 4))).toBeGreaterThan(strong(rung('G', 3))); // ♭3 above vs ♭7 below A
  });
});
