import { midiAt } from '../../core/fretboard';
import { echoFrets } from '../echo';
import type { Sound } from '../sound';
import type { Drill, DrillQuestion } from './types';

const ANSWERS = ['stepUp', 'stepDown', 'leapUp', 'leapDown'] as const;
export type MoveAnswer = (typeof ANSWERS)[number];

const G_STRING_3_FRETS = echoFrets('G', 3);

interface DegreePair {
  readonly deg1: number;
  readonly deg2: number;
}

const PAIRS_BY_ANSWER: Readonly<Record<MoveAnswer, readonly DegreePair[]>> = (() => {
  const stepUp: DegreePair[] = [];
  const stepDown: DegreePair[] = [];
  const leapUp: DegreePair[] = [];
  const leapDown: DegreePair[] = [];

  for (let d1 = 1; d1 <= 8; d1++) {
    for (let d2 = 1; d2 <= 8; d2++) {
      const delta = d2 - d1;
      if (delta === 1) stepUp.push({ deg1: d1, deg2: d2 });
      else if (delta === -1) stepDown.push({ deg1: d1, deg2: d2 });
      else if (delta === 3 || delta === 4) leapUp.push({ deg1: d1, deg2: d2 });
      else if (delta === -3 || delta === -4) leapDown.push({ deg1: d1, deg2: d2 });
    }
  }

  return { stepUp, stepDown, leapUp, leapDown };
})();

function makeTwoNoteSound(deg1: number, deg2: number, bpm: number): Sound {
  const m1 = midiAt({ string: 3, fret: G_STRING_3_FRETS[deg1 - 1]! });
  const m2 = midiAt({ string: 3, fret: G_STRING_3_FRETS[deg2 - 1]! });
  return {
    bpm,
    events: [
      { at: 0, midis: [m1], length: 1.5 },
      { at: 1.5, midis: [m2], length: 1.5 },
    ],
  };
}

export const moves: Drill = {
  answers: ANSWERS,
  next(random: () => number, previous?: DrillQuestion): DrillQuestion {
    const availableAnswers =
      previous && previous.run === 2
        ? ANSWERS.filter((a) => a !== previous.answer)
        : ANSWERS;

    const answer =
      availableAnswers[
        Math.min(availableAnswers.length - 1, Math.floor(random() * availableAnswers.length))
      ] as MoveAnswer;
    const run = previous && previous.answer === answer ? (previous.run ?? 1) + 1 : 1;

    const pairs = PAIRS_BY_ANSWER[answer];
    const pair = pairs[Math.min(pairs.length - 1, Math.floor(random() * pairs.length))]!;

    const sound = makeTwoNoteSound(pair.deg1, pair.deg2, 70);
    const compare = makeTwoNoteSound(pair.deg1, pair.deg2, 50);

    return {
      answer,
      sound,
      compare,
      run,
    };
  },
};
