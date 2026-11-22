import { MAJOR_KEY_TONICS, diatonicChords, format, type NoteName } from '../../core/music';
import { homeFret } from '../../core/fretboard';
import { then } from '../sound';
import { strumChords } from './finished';
import type { Drill, DrillQuestion } from './types';

/** The five natural keys of the path's early sessions (the same keys as `finished`). */
const TONICS: readonly NoteName[] = MAJOR_KEY_TONICS.filter(
  (t) => ['G', 'A', 'D', 'C', 'E'].includes(t.letter) && t.alter === 0,
);

/** One question for a key: I, IV, V, I strummed 2 beats each, then the I chord held for 4 beats. */
export function rootNoteQuestion(tonic: NoteName): DrillQuestion {
  const chords = diatonicChords({ tonic, mode: 'major' }).map((d) => d.chord);
  const home = chords[0]!;
  const sound = then(strumChords([1, 4, 5, 1].map((d) => chords[d - 1]!)), strumChords([home], 4), 0);
  return {
    answer: String(homeFret(tonic, 6)),
    sound,
    detail: format(tonic),
    pos: { string: 6, fret: homeFret(tonic, 6) },
  };
}

export const rootNote: Drill = {
  answers: [],
  next(random: () => number, previous?: DrillQuestion): DrillQuestion {
    // A new key each time, so the reveal never repeats the last one.
    const choices = TONICS.filter((t) => previous === undefined || format(t) !== previous.detail);
    const tonic = choices[Math.min(choices.length - 1, Math.floor(random() * choices.length))]!;
    return rootNoteQuestion(tonic);
  },
};
