import { choice } from '@shared/core/rng';
import { parseNote } from '../../core/music';
import { BLUES_BPM } from '../../lessons/blues';
import { soloWindow } from '../../lessons/solo';
import { fixedBoxPhrase } from '../boxEcho';
import type { Sound } from '../sound';
import type { Drill } from './types';

const answers = ['response', 'repeat'] as const;

export const callAndResponse: Drill = {
  answers,
  next(random, previous) {
    const answer = choice(
      random,
      answers.filter((a) => previous?.run !== 2 || a !== previous.answer),
    );
    const detail = choice(random, ['A', 'E', 'G', 'D']);
    const box = soloWindow(parseNote(detail), 'minorPentatonic');
    const degrees = choice(random, [
      ['1', 'b3', '4'],
      ['1', '4', '5'],
    ] as const);
    const call = fixedBoxPhrase(box, degrees);
    const response = answer === 'response';
    const reply = response ? [...call].reverse() : call;
    const sound: Sound = {
      bpm: BLUES_BPM,
      events: [
        ...call.map((note, at) => ({ at, midis: [note.midi], length: 1 })),
        ...reply.map((note, i) => ({
          at: 4 + i,
          midis: [note.midi],
          length: response && i === 2 ? 2 : 1,
        })),
      ],
    };
    return {
      answer,
      detail,
      sound,
      compare: sound,
      run: previous?.answer === answer ? (previous.run ?? 1) + 1 : 1,
    };
  },
};
