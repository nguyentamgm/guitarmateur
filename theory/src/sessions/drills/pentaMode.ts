import { choice } from '@shared/core/rng';
import { bassMidi } from '../../core/audio';
import { parseNote, type Chord } from '../../core/music';
import { strummed, then, type Sound } from '../sound';
import { chordShape, shapeMidis } from '../voicing';
import type { Drill } from './types';

const answers = ['minorPenta', 'majorPenta'] as const;
type Answer = (typeof answers)[number];

const KEYS = ['A', 'G', 'E', 'C', 'D'] as const;
type KeyName = (typeof KEYS)[number];

const PHRASE_INTERVALS: Readonly<Record<Answer, readonly number[]>> = {
  minorPenta: [0, 3, 5, 7, 12],
  majorPenta: [0, 2, 4, 7, 12],
};

function phraseSound(key: KeyName, answer: Answer): Sound {
  const rootNote = parseNote(key);
  const chord: Chord = { root: rootNote, id: 'major' };
  const chordMidis = shapeMidis(chordShape(chord));
  const root = bassMidi(rootNote);
  const intervals = PHRASE_INTERVALS[answer];

  return {
    bpm: 80,
    events: [
      strummed(chordMidis, 0, 2),
      ...intervals.map((step, i) => ({
        at: 2 + i,
        midis: [root + step],
        length: 1,
      })),
    ],
  };
}

export const pentaMode: Drill = {
  answers,
  next(random, previous) {
    const answer = choice(
      random,
      answers.filter((a) => previous?.run !== 2 || a !== previous.answer),
    );
    const detail = choice(random, KEYS);
    const sound = phraseSound(detail, answer);
    const other = phraseSound(detail, answer === 'minorPenta' ? 'majorPenta' : 'minorPenta');
    const rootNote = parseNote(detail);

    return {
      answer,
      detail,
      chord: { root: rootNote, id: 'major' },
      sound,
      compare: then(other, sound),
      run: previous?.answer === answer ? (previous.run ?? 1) + 1 : 1,
    };
  },
};
