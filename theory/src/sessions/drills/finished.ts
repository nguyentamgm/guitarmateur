import { MAJOR_KEY_TONICS, chordSymbol, diatonicChords, type Chord, type NoteName } from '../../core/music';
import { strummed, then, type Sound } from '../sound';
import { chordShape, shapeMidis } from '../voicing';
import type { Drill, DrillQuestion } from './types';

const KEY_TONICS: readonly NoteName[] = MAJOR_KEY_TONICS.filter(
  (t) => ['G', 'A', 'D', 'C', 'E'].includes(t.letter) && t.alter === 0,
);

const ANSWERS = ['finished', 'notFinished'] as const;

/** Degrees of the four chords: finished comes home, the others stop away from home. */
const FINISHED: readonly number[] = [1, 4, 5, 1];
const NOT_FINISHED: readonly (readonly number[])[] = [
  [1, 4, 1, 5],
  [1, 5, 1, 4],
];

const pick = <T>(items: readonly T[], random: () => number): T =>
  items[Math.min(items.length - 1, Math.floor(random() * items.length))]!;

/** Chords strummed for `beats` beats each, one after another, at 80 BPM. */
export function strumChords(chords: readonly Chord[], beats = 2): Sound {
  return {
    bpm: 80,
    events: chords.map((c, i) => strummed(shapeMidis(chordShape(c)), i * beats, beats)),
  };
}

export const finished: Drill = {
  answers: ANSWERS,
  next(random: () => number, previous?: DrillQuestion): DrillQuestion {
    const tonic = pick(KEY_TONICS, random);

    let answer: (typeof ANSWERS)[number];
    let run: number;
    if (previous && previous.run === 2) {
      // Never the same answer three times in a row
      answer = previous.answer === 'finished' ? 'notFinished' : 'finished';
      run = 1;
    } else {
      answer = random() < 0.5 ? 'finished' : 'notFinished';
      run = previous && previous.answer === answer ? (previous.run ?? 1) + 1 : 1;
    }

    const chords = diatonicChords({ tonic, mode: 'major' }).map((d) => d.chord);
    const degrees = answer === 'finished' ? FINISHED : pick(NOT_FINISHED, random);
    const home = chords[0]!;
    const sound = strumChords(degrees.map((d) => chords[d - 1]!));
    const compare = then(sound, strumChords([home], 4), 0);

    return { answer, sound, compare, detail: chordSymbol(home), chord: home, run };
  },
};
