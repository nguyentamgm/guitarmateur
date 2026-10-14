import { describe, expect, it } from 'vitest';
import { parseNote, type Key } from '@shared/core/music';
import { resolution } from '../core/resolution';
import {
  RIGHT_CLICK,
  comparePart,
  contextPart,
  notePart,
  resolutionPart,
  waitPart,
} from './timeline';

const C_MAJOR: Key = { tonic: parseNote('C'), mode: 'major' };
const A_MINOR: Key = { tonic: parseNote('A'), mode: 'minor' };

describe('timeline parts, at 60 BPM (a beat is 1 s)', () => {
  it('context: four strummed chords (guitar), then the tonic as a note; 6 beats in all', () => {
    const p = contextPart(C_MAJOR, 60, 60);
    const chords = p.sounds.filter((s) => s.kind === 'chord');
    const starts = [...new Set(chords.map((s) => Math.floor(s.time)))];
    expect(starts).toEqual([0, 1, 2, 3]);
    expect(p.sounds.at(-1)).toEqual({ kind: 'note', midi: 60, time: 5, length: 1 });
    expect(p.sounds.filter((s) => s.kind === 'note')).toHaveLength(1);
    expect(p.duration).toBe(6);
    expect(contextPart(C_MAJOR, 48, 60, 'short').duration).toBe(5);
    expect(contextPart(C_MAJOR, 48, 60).sounds.at(-1)!.midi).toBe(48);
  });

  it('note: two beats', () => {
    expect(notePart(64, 60)).toEqual({
      sounds: [{ kind: 'note', midi: 64, time: 0, length: 2 }],
      duration: 2,
    });
    expect(notePart(64, 120).duration).toBe(1);
  });

  it('compare: picked for a beat, half a beat of gap, right for a beat, half a beat of rest', () => {
    expect(comparePart(64, 63, 60)).toEqual({
      sounds: [
        { kind: 'note', midi: 64, time: 0, length: 1 },
        { kind: 'note', midi: 63, time: 1.5, length: 1 },
      ],
      duration: 3,
    });
  });

  it('resolution: eighths, the closing tonic a beat (C major 3 → 3 2 1, A minor b5 → b5 4 b3 2 1)', () => {
    expect(resolutionPart(resolution(C_MAJOR, '3', 64), 60)).toEqual({
      sounds: [
        { kind: 'note', midi: 64, time: 0, length: 0.5 },
        { kind: 'note', midi: 62, time: 0.5, length: 0.5 },
        { kind: 'note', midi: 60, time: 1, length: 1 },
      ],
      duration: 2,
    });
    const minor = resolutionPart(resolution(A_MINOR, 'b5', 63), 60);
    expect(minor.sounds.map((s) => [s.midi, s.time])).toEqual([
      [63, 0],
      [62, 0.5],
      [60, 1],
      [59, 1.5],
      [57, 2],
    ]);
    expect(minor.duration).toBe(3);
  });

  it('a tonic alone resolves to itself: one beat', () => {
    expect(resolutionPart(resolution(C_MAJOR, '1', 60), 60)).toEqual({
      sounds: [{ kind: 'note', midi: 60, time: 0, length: 1 }],
      duration: 1,
    });
  });

  it('wait: silence for its beats; the right click: one accented click', () => {
    expect(waitPart(4, 60)).toEqual({ sounds: [], duration: 4 });
    expect(waitPart(2, 120).duration).toBe(1);
    expect(RIGHT_CLICK).toEqual({ sounds: [{ kind: 'click', time: 0 }], duration: 0 });
  });

  it('clamps the tempo as the cadence does (40–200)', () => {
    expect(notePart(60, 10).duration).toBe(notePart(60, 40).duration);
    expect(comparePart(60, 61, 999).duration).toBe(comparePart(60, 61, 200).duration);
  });
});
