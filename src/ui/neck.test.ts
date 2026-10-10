import { describe, expect, it } from 'vitest';
import { note, type Chord } from '../music';
import { mergedBox, positions, TUNINGS } from '../fretboard';
import { boxDots, stringNumber, tuningNames } from './neck';

const key = { tonic: note('A'), scaleId: 'minorPentatonic' as const };
const pos = positions(TUNINGS.standard, key);
// The box at frets 5–8 (A minor pentatonic "box 1").
const box5 = pos.find((p) => p.minFret === 5)!;
const box = mergedBox(pos, [box5.index]);

describe('Practice notes on the shared neck', () => {
  it('numbers strings as tab does: index 0 (low E) is string 6', () => {
    expect(stringNumber(0)).toBe(6);
    expect(stringNumber(5)).toBe(1);
  });

  it('names the strings per tuning: Drop D', () => {
    expect(tuningNames(TUNINGS.standard)).toEqual({ 1: 'e', 2: 'B', 3: 'G', 4: 'D', 5: 'A', 6: 'E' });
    expect(tuningNames(TUNINGS.dropD)[6]).toBe('D');
  });

  it('gives each note its degree and name; the root is home', () => {
    const dots = boxDots(box, key);
    const low = dots.find((d) => d.string === 6 && d.fret === 5)!;
    expect(low).toMatchObject({ degree: '1', name: 'A', tone: 'home', midi: 45 });
    expect(dots.find((d) => d.string === 6 && d.fret === 8)).toMatchObject({ degree: '♭3', name: 'C', tone: 'plain' });
  });

  it("marks a chord's tones by role, the target filled, and the landing halo", () => {
    const chord: Chord = { tonic: note('A'), quality: 'm' };
    const dots = boxDots(box, key, { highlight: { chord, targetRole: '5' }, landing: { string: 1, fret: 7 } });
    const e = dots.find((d) => d.string === 5 && d.fret === 7)!;
    expect(e).toMatchObject({ tone: 'target', mark: '5', halo: true });
    const c = dots.find((d) => d.string === 6 && d.fret === 8)!;
    expect(c).toMatchObject({ tone: 'chord', mark: '3', halo: false });
    const d = dots.find((x) => x.string === 5 && x.fret === 5)!;
    expect(d).toMatchObject({ tone: 'plain', mark: undefined });
  });

  it('keeps only the frets a window of the neck shows', () => {
    const open = mergedBox(pos, [pos.find((p) => p.minFret === 0)!.index]);
    expect(boxDots(open, key, { from: 0 }).some((d) => d.fret === 0)).toBe(true);
    expect(boxDots(box, key, { from: 4 }).every((d) => d.fret > 4)).toBe(true);
  });
});
