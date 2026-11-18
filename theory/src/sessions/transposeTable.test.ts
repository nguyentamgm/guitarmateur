import { describe, expect, it } from 'vitest';
import { format } from '../core/music';
import { capoRows, keyRows } from './transposeTable';

describe('transposeTable', () => {
  it('keyRows([1, 4, 5, 1], [G, D, A]) gives the correct symbols and identical numerals in every row', () => {
    const rows = keyRows([1, 4, 5, 1], ['G', 'D', 'A']);
    expect(rows).toHaveLength(3);

    expect(format(rows[0]!.tonic)).toBe('G');
    expect(rows[0]!.chords.map((c) => c.symbol)).toEqual(['G', 'C', 'D', 'G']);
    expect(rows[0]!.chords.map((c) => c.roman)).toEqual(['I', 'IV', 'V', 'I']);

    expect(format(rows[1]!.tonic)).toBe('D');
    expect(rows[1]!.chords.map((c) => c.symbol)).toEqual(['D', 'G', 'A', 'D']);
    expect(rows[1]!.chords.map((c) => c.roman)).toEqual(['I', 'IV', 'V', 'I']);

    expect(format(rows[2]!.tonic)).toBe('A');
    expect(rows[2]!.chords.map((c) => c.symbol)).toEqual(['A', 'D', 'E', 'A']);
    expect(rows[2]!.chords.map((c) => c.roman)).toEqual(['I', 'IV', 'V', 'I']);
  });

  it('capoRows(G, 5) sounds G, A♭, A, B♭, B, C for frets 0–5', () => {
    const rows = capoRows('G', 5);
    expect(rows).toHaveLength(6);
    expect(rows.map((r) => r.fret)).toEqual([0, 1, 2, 3, 4, 5]);
    expect(rows.map((r) => format(r.sounds))).toEqual(['G', 'A♭', 'A', 'B♭', 'B', 'C']);
  });
});
