import { describe, expect, it } from 'vitest';
import { TONICS, midi } from '../music';
import { TUNINGS, positions, mergedBox } from '../fretboard';
import type { Box } from '../fretboard';
import { generateLick, type LickParams, type Lick } from './index';
import { countSameFretStringJumps, countUnplayableMoves } from './path';
import { isBendFrom } from './bends';

// Build a known box: A minor pentatonic, standard tuning, position 1 (frets 0-3)
const tonicA = TONICS.find((t) => t.letter === 'A' && t.alter === 0)!;
const key = { tonic: tonicA, scaleId: 'minorPentatonic' as const };
const tuning = TUNINGS.standard;
const pos = positions(tuning, key);
const box = mergedBox(pos, [0]); // Position 1
const chord = { tonic: tonicA, quality: 'm' as const };
const tonicG = TONICS.find((t) => t.letter === 'G' && t.alter === 0)!;
const nextChord = { tonic: tonicG, quality: 'M' as const };

function allNotesInBox(lick: Lick, b: Box): boolean {
  const noteSet = new Set(b.notes.map((n) => `${n.string}-${n.fret}`));
  // A bend is fretted at the note before it and sounds a fret or two higher — past the box is fine.
  // So is a chromatic approach note, which is outside the scale by design.
  return lick.notes.every(
    (n, i) => noteSet.has(`${n.string}-${n.fret}`) || isBendFrom(n, lick.notes[i - 1]) || n.chromatic === true,
  );
}

describe('generateLick — integration', () => {
  const levels: LickParams['level'][] = [1, 2, 3, 4, 5];

  it('is deterministic: same inputs => identical lick', () => {
    const params: LickParams = { level: 2, targetRole: 'R', resolveToNext: false, seed: 42 };
    const a = generateLick(box, chord, null, params);
    const b = generateLick(box, chord, null, params);
    expect(b).toEqual(a);
  });

  it('different seeds => (almost always) different licks', () => {
    const a = generateLick(box, chord, null, { level: 2, targetRole: 'R', resolveToNext: false, seed: 0 });
    const b = generateLick(box, chord, null, { level: 2, targetRole: 'R', resolveToNext: false, seed: 7 });
    expect(a.notes).not.toEqual(b.notes);
  });

  it('omitting bars defaults to a single bar', () => {
    const withDefault = generateLick(box, chord, null, { level: 2, targetRole: 'R', resolveToNext: false, seed: 7 });
    const explicitOne = generateLick(box, chord, null, { level: 2, targetRole: 'R', resolveToNext: false, seed: 7, bars: 1 });
    expect(withDefault.lengthBeats).toBe(4);
    expect(withDefault).toEqual(explicitOne);
  });

  it('level 1: no 16th notes', () => {
    for (let seed = 0; seed < 50; seed++) {
      const lick = generateLick(box, chord, null, { level: 1, targetRole: 'R', resolveToNext: false, seed });
      for (const note of lick.notes) {
        expect([1, 2]).toContain(note.durationBeats);
      }
    }
  });

  it('level 2: quarters + 8ths', () => {
    for (let seed = 0; seed < 50; seed++) {
      const lick = generateLick(box, chord, null, { level: 2, targetRole: 'R', resolveToNext: false, seed });
      for (const note of lick.notes) {
        expect([0.5, 1, 2]).toContain(note.durationBeats);
      }
    }
  });

  it('level 3: still no 16th notes', () => {
    for (let seed = 0; seed < 50; seed++) {
      const lick = generateLick(box, chord, null, { level: 3, targetRole: 'R', resolveToNext: false, seed });
      for (const note of lick.notes) {
        expect(note.durationBeats).not.toBe(0.25);
      }
    }
  });

  it('level 5: include 16th-note durations across seeds', () => {
    const has16th = Array.from({ length: 200 }, (_, seed) => {
      const lick = generateLick(box, chord, null, { level: 5, targetRole: 'R', resolveToNext: false, seed });
      return lick.notes.some((n) => n.durationBeats === 0.25);
    }).some(Boolean);
    expect(has16th).toBe(true);
  });

  it('score monotonicity: mean score increases with level', () => {
    const means: number[] = [];
    for (const level of levels) {
      let sum = 0;
      const count = 100;
      for (let seed = 0; seed < count; seed++) {
        const lick = generateLick(box, chord, null, { level, targetRole: 'R', resolveToNext: false, seed });
        sum += lick.difficulty;
      }
      means.push(sum / count);
    }
    for (let i = 1; i < means.length; i++) {
      expect(means[i]!).toBeGreaterThanOrEqual(means[i - 1]!);
    }
  });

  it('resolveToNext: landing pc comes from the next chord', () => {
    const lick = generateLick(box, chord, nextChord, { level: 2, targetRole: 'R', resolveToNext: true, seed: 42 });
    const last = lick.notes[lick.notes.length - 1]!;
    const pc = midi(last.pitch) % 12;
    // G major: G=7, B=11, D=2
    expect([7, 11, 2]).toContain(pc);
    expect(last.startBeat).toBe(4);
    expect(lick.notes[0]!.startBeat).toBeGreaterThan(0);
  });

  it('level 1-2: no techniques on any note', () => {
    for (const level of [1, 2] as const) {
      for (let seed = 0; seed < 50; seed++) {
        const lick = generateLick(box, chord, null, { level, targetRole: 'R', resolveToNext: false, seed });
        for (const note of lick.notes) {
          expect(note.technique).toBeUndefined();
        }
      }
    }
  });

  it('level 3+: mean technique count > 0 over 50 seeds', () => {
    for (const level of [3, 4, 5] as const) {
      let total = 0;
      for (let seed = 0; seed < 50; seed++) {
        const lick = generateLick(box, chord, null, { level, targetRole: 'R', resolveToNext: false, seed });
        total += lick.notes.filter((n) => n.technique !== undefined).length;
      }
      expect(total / 50).toBeGreaterThan(0);
    }
  });

  it('resolveToNext: landing note role is relative to the NEXT chord, not the current one', () => {
    // Am → C major, target the root: the lick lands on C (root of the next chord),
    // so its stored role must be 'R', not '3' (C is the ♭3 of Am).
    const tonicC = TONICS.find((t) => t.letter === 'C' && t.alter === 0)!;
    for (let seed = 0; seed < 50; seed++) {
      const lick = generateLick(box, chord, { tonic: tonicC, quality: 'M' }, {
        level: 2, targetRole: 'R', resolveToNext: true, seed, bars: 1,
      });
      const last = lick.notes[lick.notes.length - 1]!;
      expect(last.startBeat).toBe(4);
      expect(lick.notes[0]!.startBeat).toBeGreaterThan(0);
      const nextPcs = [0, 4, 7]; // C major: C, E, G
      const pcs = (p: typeof last.pitch) => midi(p) % 12;
      if (nextPcs.includes(pcs(last.pitch)) && pcs(last.pitch) === 0) {
        // Landed on C — the root of the next chord — so role must be R, never 3.
        expect(last.role).toBe('R');
      }
    }
  });

  it('voice leading: second lick first note is biased toward previous lick last note', () => {
    const params: LickParams = { level: 3, targetRole: 'R', resolveToNext: false, seed: 7 };
    const lick1 = generateLick(box, chord, null, params);
    const lick1LastMidi = midi(lick1.notes[lick1.notes.length - 1]!.pitch);

    // Generate many second licks with voice leading and without, measure mean distance
    const seeds = Array.from({ length: 100 }, (_, i) => i);
    let sumWithVL = 0;
    let sumWithout = 0;
    for (const seed of seeds) {
      const p: LickParams = { level: 3, targetRole: 'R', resolveToNext: false, seed };
      const withVL = generateLick(box, chord, null, p, lick1LastMidi);
      const without = generateLick(box, chord, null, p);
      sumWithVL += Math.abs(midi(withVL.notes[0]!.pitch) - lick1LastMidi);
      sumWithout += Math.abs(midi(without.notes[0]!.pitch) - lick1LastMidi);
    }
    // Voice-led first notes should on average be closer to the anchor pitch
    expect(sumWithVL / seeds.length).toBeLessThan(sumWithout / seeds.length);
  });
});

describe('generateLick — fretting-hand ergonomics', () => {
  /** Position 4 puts a note at fret 5 on all six strings, so same-fret pairs are everywhere. */
  const denseBox = mergedBox(pos, [pos.length - 1]);

  it('never places two adjacent notes on the same fret across a skipped string', () => {
    for (const b of [box, denseBox]) {
      for (const level of [1, 2, 3, 4, 5] as LickParams['level'][]) {
        for (let seed = 0; seed < 40; seed++) {
          const lick = generateLick(b, chord, nextChord, { level, targetRole: 'R', resolveToNext: false, seed });
          const jumps = countSameFretStringJumps(lick.notes);
          expect(
            jumps,
            `level ${level} seed ${seed}: ${lick.notes.map((n) => `${n.string}/${n.fret}`).join(' ')}`,
          ).toBe(0);
        }
      }
    }
  });

  it('still generates licks at the requested difficulty — the rule does not starve the walk', () => {
    for (const level of [1, 3, 5] as LickParams['level'][]) {
      for (let seed = 0; seed < 20; seed++) {
        const lick = generateLick(denseBox, chord, nextChord, { level, targetRole: 'R', resolveToNext: false, seed });
        expect(lick.notes.length).toBeGreaterThan(0);
        expect(allNotesInBox(lick, denseBox)).toBe(true);
      }
    }
  });
});

describe('generateLick — levels 1-2 never skip a string', () => {
  /** Position 4 puts a note at fret 5 on all six strings — same dense box as the ergonomics suite. */
  const denseBox = mergedBox(pos, [pos.length - 1]);

  it('never places two adjacent notes on non-adjacent strings, even when first/last land far apart', () => {
    for (const b of [box, denseBox]) {
      for (const level of [1, 2] as LickParams['level'][]) {
        for (let seed = 0; seed < 150; seed++) {
          const lick = generateLick(b, chord, nextChord, { level, targetRole: 'R', resolveToNext: false, seed });
          for (let i = 1; i < lick.notes.length; i++) {
            const dString = Math.abs(lick.notes[i]!.string - lick.notes[i - 1]!.string);
            expect(
              dString,
              `level ${level} seed ${seed}: ${lick.notes.map((n) => `${n.string}/${n.fret}`).join(' ')}`,
            ).toBeLessThanOrEqual(1);
          }
          expect(countUnplayableMoves(lick.notes, level)).toBe(0);
        }
      }
    }
  });

  it('levels 3-5 keep allowing string skips (behavior unchanged)', () => {
    let skips = 0;
    for (const level of [3, 4, 5] as LickParams['level'][]) {
      for (let seed = 0; seed < 40; seed++) {
        const lick = generateLick(denseBox, chord, nextChord, { level, targetRole: 'R', resolveToNext: false, seed });
        for (let i = 1; i < lick.notes.length; i++) {
          if (Math.abs(lick.notes[i]!.string - lick.notes[i - 1]!.string) > 1) skips++;
        }
      }
    }
    expect(skips).toBeGreaterThan(0);
  });
});
