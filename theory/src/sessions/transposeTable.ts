import { chordIn, type SpecChord } from './chordSpec';
import type { ChordSpec } from './types';
import { majorKeyTonic, parseNote, pc, type NoteName } from '../core/music';

export interface KeyRow {
  readonly tonic: NoteName;
  readonly chords: readonly SpecChord[];
}

/** The same bars in each major key. */
export function keyRows(bars: readonly ChordSpec[], tonics: readonly string[]): KeyRow[] {
  return tonics.map((t) => {
    const tonic = parseNote(t);
    const chords = bars.map((spec) => chordIn({ tonic: t, mode: 'major' }, spec));
    return { tonic, chords };
  });
}

export interface CapoRow {
  readonly fret: number;
  readonly sounds: NoteName;
}

/** With the shapes of `shapesTonic` major and a capo on fret 0..maxFret, the key that sounds (majorKeyTonic of the pitch class). */
export function capoRows(shapesTonic: string, maxFret = 5): CapoRow[] {
  const root = parseNote(shapesTonic);
  const rootPc = pc(root);
  const rows: CapoRow[] = [];
  for (let fret = 0; fret <= maxFret; fret++) {
    rows.push({
      fret,
      sounds: majorKeyTonic(rootPc + fret),
    });
  }
  return rows;
}
