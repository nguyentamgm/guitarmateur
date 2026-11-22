import { describe, expect, it } from 'vitest';
import { note } from '../music';
import { boxFingerings, fingerForFret } from './fingering';
import { mergedBox } from './merge';
import { positions } from './positions';
import { TUNINGS } from './tuning';

describe('boxFingerings & fingerForFret', () => {
  it('assigns 1..4 by fret offset in a standard 4-fret box (A minor blues Box 1 [5, 8])', () => {
    const pos = positions(TUNINGS.standard, { tonic: note('A'), scaleId: 'blues' });
    const box1 = mergedBox(pos, [0]);
    const map = boxFingerings(box1);

    // Base notes: 5, 7, 8 -> 1, 3, 4; ♭5 decoration on A string fret 6 -> 2
    expect(map.get('0:5')).toBe(1);
    expect(map.get('0:8')).toBe(4);
    expect(map.get('1:5')).toBe(1);
    expect(map.get('1:6')).toBe(2);
    expect(map.get('1:7')).toBe(3);
    expect(fingerForFret(box1, 3, 7)).toBe(3);
  });

  it('returns null and omits open strings in 1st position (E minor pentatonic Box 1 [0, 3])', () => {
    const pos = positions(TUNINGS.standard, { tonic: note('E'), scaleId: 'minorPentatonic' });
    const box1 = mergedBox(pos, [0]);
    const map = boxFingerings(box1);

    for (let s = 0; s < 6; s++) {
      expect(map.has(`${s}:0`)).toBe(false);
      expect(fingerForFret(box1, s, 0)).toBeNull();
    }
    expect(map.get('1:2')).toBe(2);
    expect(map.get('0:3')).toBe(3);
    expect(fingerForFret(box1, 0, 1)).toBe(1);
  });

  it('handles B-string and G-string shifts in a wide pentatonic box (A minor Box 3 [9, 13])', () => {
    const pos = positions(TUNINGS.standard, { tonic: note('A'), scaleId: 'minorPentatonic' });
    const box3 = mergedBox(pos, [2]);
    expect(box3.minFret).toBe(9);
    expect(box3.maxFret).toBe(13);

    const map = boxFingerings(box3);
    // E, A, D, e: (10, 12) -> 1, 3
    for (const s of [0, 1, 2, 5]) {
      expect(map.get(`${s}:10`)).toBe(1);
      expect(map.get(`${s}:12`)).toBe(3);
    }
    // G string shifted down: (9, 12) -> 1, 4
    expect(map.get('3:9')).toBe(1);
    expect(map.get('3:12')).toBe(4);
    // B string shifted up: (10, 13) -> 1, 4
    expect(map.get('4:10')).toBe(1);
    expect(map.get('4:13')).toBe(4);
  });

  it('handles whole-whole stretches on a 7-note scale box (C major Box 1 [7, 12])', () => {
    const pos = positions(TUNINGS.standard, { tonic: note('C'), scaleId: 'major' });
    const cBox1 = mergedBox(pos, [0]);
    expect(cBox1.minFret).toBe(7);
    expect(cBox1.maxFret).toBe(12);

    const map = boxFingerings(cBox1);
    // B string (8, 10, 12) has a ww stretch (no fret 9) -> 1, 2, 4
    expect(map.get('4:8')).toBe(1);
    expect(map.get('4:10')).toBe(2);
    expect(map.get('4:12')).toBe(4);
    // 4-fret strings anchored at 7 -> 7..10 map to 1..4
    expect(map.get('0:7')).toBe(1);
    expect(map.get('0:8')).toBe(2);
    expect(map.get('2:9')).toBe(3);
    expect(map.get('0:10')).toBe(4);
  });

  it('assigns valid 1..4 fingers across merged boxes (A minor Box 1 + Box 2 [5, 10])', () => {
    const pos = positions(TUNINGS.standard, { tonic: note('A'), scaleId: 'minorPentatonic' });
    const merged = mergedBox(pos, [0, 1]);
    expect(merged.minFret).toBe(5);
    expect(merged.maxFret).toBe(10);

    const map = boxFingerings(merged);
    for (const n of merged.notes) {
      const f = map.get(`${n.string}:${n.fret}`);
      expect(f).toBeGreaterThanOrEqual(1);
      expect(f).toBeLessThanOrEqual(4);
    }
    // Lower window anchored at 5
    expect(map.get('0:5')).toBe(1);
    expect(map.get('0:8')).toBe(4);
    expect(map.get('1:7')).toBe(3);
    // Upper extension shifted to [7, 10]
    expect(map.get('0:10')).toBe(4);
    expect(map.get('1:10')).toBe(4);
  });
});
