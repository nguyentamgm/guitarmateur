import { bassMidi } from '../../core/audio';
import { parseNote, scaleSemitones } from '../../core/music';
import type { ChordSpec } from '../types';
import type { Song, SongNote } from './parse';

export function numeralSpec(numeral: string): ChordSpec {
  switch (numeral) {
    case 'I':
      return 1;
    case 'ii':
      return 2;
    case 'iii':
      return 3;
    case 'IV':
      return 4;
    case 'V':
      return 5;
    case 'vi':
      return 6;
    case 'vii':
    case 'viio':
      return 7;
    case 'V7':
      return { root: '5', id: 'dom7' };
    default:
      throw new Error(`Unknown numeral "${numeral}" for numeralSpec.`);
  }
}

export function noteMidi(tonic: string, note: SongNote): number {
  const root = parseNote(tonic);
  const base = bassMidi(root);
  const majorSteps = scaleSemitones('major');
  const step = majorSteps[note.degree - 1] ?? 0;
  return base + 24 + step + 12 * note.octave;
}

export function judgeSong(
  song: Song,
  picks: readonly (string | null | undefined)[],
): boolean[] {
  return song.chords.map((ref, i) => {
    if (ref === '-') return true;
    const pick = picks[i];
    if (!pick) return false;
    if (pick === ref) return true;
    if (song.accept?.[i]?.includes(pick)) return true;
    return false;
  });
}
