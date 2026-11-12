import {
  chordSymbol,
  diatonicChords,
  interval,
  parseNote,
  romanFor,
  transpose,
  type Chord,
} from '../core/music';
import type { ChordSpec, SessionKey } from './types';

export interface SpecChord {
  readonly chord: Chord;
  readonly roman: string;
  readonly symbol: string;
}

export function chordIn(key: SessionKey, spec: ChordSpec): SpecChord {
  if (typeof spec === 'number') {
    const diatonic = diatonicChords({ tonic: parseNote(key.tonic), mode: key.mode })[spec - 1];
    if (!diatonic) throw new RangeError(`Degree ${spec} out of range for key ${key.tonic} ${key.mode}`);
    return {
      chord: diatonic.chord,
      roman: diatonic.roman,
      symbol: chordSymbol(diatonic.chord),
    };
  }

  const tonic = parseNote(key.tonic);
  const rootNote = transpose(tonic, interval(spec.root));
  const chord: Chord = { root: rootNote, id: spec.id };

  const digitMatch = spec.root.match(/\d+/);
  if (!digitMatch) throw new Error(`Invalid root degree in chord spec: ${spec.root}`);
  const n = Number(digitMatch[0]);

  const prefix = spec.root.startsWith('b') ? '♭' : spec.root.startsWith('#') ? '♯' : '';
  const roman = prefix + romanFor(n, spec.id);

  return {
    chord,
    roman,
    symbol: chordSymbol(chord),
  };
}
