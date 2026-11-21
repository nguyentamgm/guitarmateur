import { choice } from '@shared/core/rng';
import { parseNote } from '../../core/music';
import { soloWindow } from '../../lessons/solo';
import { boxEchoSound, fixedBoxPhrase } from '../boxEcho';
import { then } from '../sound';
import type { Drill } from './types';

const answers = ['withBlue', 'plain'] as const;
const degrees = {
  withBlue: ['1', 'b3', '4', 'b5', '5'],
  plain: ['1', 'b3', '4', '5', 'b7'],
} as const;

export const hasBlueNote: Drill = {
  answers,
  next(random, previous) {
    const answer = choice(
      random,
      answers.filter((a) => previous?.run !== 2 || a !== previous.answer),
    );
    const detail = choice(random, ['A', 'E', 'G', 'D', 'C']);
    const box = soloWindow(parseNote(detail), 'minorBlues');
    const descending = random() < 0.5;
    const phrase = (id: (typeof answers)[number]) => {
      const notes = fixedBoxPhrase(box, degrees[id]);
      return boxEchoSound(descending ? notes.reverse() : notes);
    };
    const sound = phrase(answer);
    return {
      answer,
      detail,
      sound,
      compare: then(phrase(answer === 'withBlue' ? 'plain' : 'withBlue'), sound),
      run: previous?.answer === answer ? (previous.run ?? 1) + 1 : 1,
    };
  },
};
