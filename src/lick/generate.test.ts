import { describe, expect, it } from 'vitest';
import { TONICS, midi } from '../music';
import { TUNINGS, positions, mergedBox } from '../fretboard';
import type { Box } from '../fretboard';
import { generateLick, type LickParams, type Lick } from './index';

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
  return lick.notes.every((n) => noteSet.has(`${n.string}-${n.fret}`));
}

function notesSortedByBeat(lick: Lick): boolean {
  for (let i = 1; i < lick.notes.length; i++) {
    if (lick.notes[i]!.startBeat < lick.notes[i - 1]!.startBeat) return false;
  }
  return true;
}

function notesNoOverlap(lick: Lick): boolean {
  for (let i = 1; i < lick.notes.length; i++) {
    const prev = lick.notes[i - 1]!;
    const cur = lick.notes[i]!;
    if (cur.startBeat < prev.startBeat + prev.durationBeats - 0.001) return false;
  }
  return true;
}

function lastNoteSustainsToBar(lick: Lick): boolean {
  if (lick.notes.length === 0) return true;
  const last = lick.notes[lick.notes.length - 1]!;
  return Math.abs((last.startBeat + last.durationBeats) - lick.lengthBeats) < 0.001;
}

describe('generateLick — integration', () => {
  const levels: LickParams['level'][] = [1, 2, 3, 4, 5];
  const roles: LickParams['targetRole'][] = ['R', '3', '5'];

  it('is deterministic: same inputs => identical lick', () => {
    const params: LickParams = { level: 2, targetRole: 'R', resolveToNext: false, seed: 42 };
    const a = generateLick(box, chord, null, params);
    const b = generateLick(box, chord, null, params);
    expect(b).toEqual(a);
  });

  it('different seeds => (almost always) different licks', () => {
    const a = generateLick(box, chord, null, { level: 2, targetRole: 'R', resolveToNext: false, seed: 1 });
    const b = generateLick(box, chord, null, { level: 2, targetRole: 'R', resolveToNext: false, seed: 2 });
    expect(a.notes).not.toEqual(b.notes);
  });

  it('bars sets lengthBeats = bars * 4 and keeps notes within the span (M5)', () => {
    for (const bars of [1, 2] as const) {
      for (let seed = 0; seed < 30; seed++) {
        const lick = generateLick(box, chord, null, { level: 3, targetRole: 'R', resolveToNext: false, seed, bars });
        expect(lick.lengthBeats).toBe(bars * 4);
        expect(allNotesInBox(lick, box)).toBe(true);
        expect(notesSortedByBeat(lick)).toBe(true);
        expect(notesNoOverlap(lick)).toBe(true);
        expect(lastNoteSustainsToBar(lick)).toBe(true);
        for (const n of lick.notes) {
          expect(n.startBeat).toBeGreaterThanOrEqual(0);
          expect(n.startBeat).toBeLessThan(bars * 4);
        }
      }
    }
  });

  it('omitting bars defaults to a single bar', () => {
    const withDefault = generateLick(box, chord, null, { level: 2, targetRole: 'R', resolveToNext: false, seed: 7 });
    const explicitOne = generateLick(box, chord, null, { level: 2, targetRole: 'R', resolveToNext: false, seed: 7, bars: 1 });
    expect(withDefault.lengthBeats).toBe(4);
    expect(withDefault).toEqual(explicitOne);
  });

  it('invariant loop: 50 seeded runs x levels 1-5', () => {
    for (const level of levels) {
      for (const role of roles) {
        for (let seed = 0; seed < 50; seed++) {
          const params: LickParams = { level, targetRole: role, resolveToNext: false, seed };
          const lick = generateLick(box, chord, null, params);

          expect(allNotesInBox(lick, box)).toBe(true);
          expect(notesSortedByBeat(lick)).toBe(true);
          expect(notesNoOverlap(lick)).toBe(true);
          expect(lastNoteSustainsToBar(lick)).toBe(true);
          expect(lick.notes.length).toBeGreaterThan(0);
          expect(lick.difficulty).toBeGreaterThanOrEqual(1);
          expect(lick.difficulty).toBeLessThanOrEqual(5);
        }
      }
    }
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

  it('levels 1-3: no 16th notes', () => {
    for (const level of [1, 2, 3] as const) {
      for (let seed = 0; seed < 50; seed++) {
        const lick = generateLick(box, chord, null, { level, targetRole: 'R', resolveToNext: false, seed });
        for (const note of lick.notes) {
          expect(note.durationBeats).not.toBe(0.25);
        }
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

  it('produces a lick for any valid combination', () => {
    for (const level of levels) {
      for (const role of roles) {
        const lick = generateLick(box, chord, null, { level, targetRole: role, resolveToNext: false, seed: 0 });
        expect(lick.notes.length).toBeGreaterThan(0);
        expect(lick.lengthBeats).toBe(4);
      }
    }
  });

  it('resolveToNext: landing pc comes from the next chord', () => {
    const lick = generateLick(box, chord, nextChord, { level: 2, targetRole: 'R', resolveToNext: true, seed: 42 });
    const last = lick.notes[lick.notes.length - 1]!;
    const pc = midi(last.pitch) % 12;
    // G major: G=7, B=11, D=2
    expect([7, 11, 2]).toContain(pc);
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
});
