import { describe, expect, it } from 'vitest';
import { parseNote } from '../music';
import { BACKING_STYLES, EIGHTHS_PER_BAR, backingAt, bassMidi, chordMidis } from './backing';

const n = parseNote;
const a7 = { root: n('A'), id: 'dom7' } as const;
const bar = (chord: Parameters<typeof backingAt>[0], style: Parameters<typeof backingAt>[1]) =>
  Array.from({ length: EIGHTHS_PER_BAR }, (_, e) => backingAt(chord, style, e));

describe('backing patterns (K5.4, K7.1)', () => {
  it('puts the bass root on string 6, frets 0–11', () => {
    expect([bassMidi(n('E')), bassMidi(n('A')), bassMidi(n('D')), bassMidi(n('Eb'))]).toEqual([40, 45, 50, 51]);
  });

  it('voices a chord from its formula over the bass root', () => {
    expect(chordMidis({ root: n('A'), id: 'minor' })).toEqual([45, 57, 60, 64]);
    expect(chordMidis({ root: n('E'), id: 'dom7' })).toEqual([40, 52, 56, 59, 62]);
  });

  it('shuffles a boogie: root with 5 5 6 6 ♭7 ♭7 6 6', () => {
    expect(bar(a7, 'shuffle').map(([h]) => h!.midis[1]! - h!.midis[0]!)).toEqual([7, 7, 9, 9, 10, 10, 9, 9]);
    expect(backingAt(a7, 'shuffle', 9)).toEqual(backingAt(a7, 'shuffle', 1));
  });

  it('strums D . D U . U D U, each stroke ringing until the next', () => {
    const strokes = bar({ root: n('G'), id: 'major' }, 'strum');
    expect(strokes.map((h) => h[0]?.stroke ?? null)).toEqual(['down', null, 'down', 'up', null, 'up', 'down', 'up']);
    expect(strokes.flatMap((h) => h.map((x) => x.eighths)).reduce((a, b) => a + b, 0)).toBe(EIGHTHS_PER_BAR);
  });

  it('chugs a muted power chord on every eighth for rock', () => {
    const hits = bar({ root: n('A'), id: 'minor' }, 'rock');
    expect(hits.every((h) => h.length === 1 && h[0]!.muted)).toBe(true);
    expect(hits[0]![0]!.midis).toEqual([45, 52, 57]);
  });

  it('comps a jazz chord on 1 and the "and" of 2, the bass on 1 and 3, in the bass range', () => {
    const hits = bar({ root: n('D'), id: 'm7' }, 'comp');
    expect(hits.map((h) => h.length)).toEqual([2, 0, 0, 1, 1, 0, 0, 0]);
    expect(hits[0]!.map((h) => h.midis)).toEqual([[50], [62, 65, 69, 72]]);
    for (const root of ['C', 'F#', 'Bb'] as const) {
      const bass = bar({ root: n(root), id: 'dom7' }, 'comp')[4]![0]!.midis[0]!;
      expect(bass).toBeGreaterThanOrEqual(40);
      expect(bass).toBeLessThanOrEqual(51);
    }
  });

  it('sounds the root in every style, and the whole chord, 3rd and 7th included, when strummed or comped', () => {
    const pcs = (style: (typeof BACKING_STYLES)[number]) => new Set(bar(a7, style).flatMap((h) => h.flatMap((x) => x.midis.map((m) => m % 12))));
    for (const style of BACKING_STYLES) expect(pcs(style).has(9), style).toBe(true);
    // A7 = A C♯ E G: pitch classes 9, 1, 4, 7. The shuffle and the rock chug leave the 3rd out on purpose.
    for (const style of ['strum', 'comp'] as const) expect(pcs(style), style).toEqual(new Set([9, 1, 4, 7]));
    expect(pcs('rock')).toEqual(new Set([9, 4]));
  });
});
