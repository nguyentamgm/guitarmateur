import { choice } from '@shared/core/rng';
import { bassMidi } from '../../core/audio';
import { parseNote, scaleSemitones } from '../../core/music';
import { ECHO_BPM } from '../echo';
import { then, type Sound } from '../sound';
import type { Drill } from './types';

const answers = ['pentatonic', 'majorScale'] as const;
type Answer = (typeof answers)[number];

function example(root: number, answer: Answer): Sound {
  const steps = scaleSemitones(answer === 'pentatonic' ? 'minorPentatonic' : 'major');
  return {
    bpm: ECHO_BPM,
    events: [...steps.slice(0, 5), 12].map((step, at) => ({ at, midis: [root + step], length: 1 })),
  };
}

export const pentatonicOrMajor: Drill = {
  answers,
  next(random, previous) {
    const answer = choice(
      random,
      answers.filter((a) => previous?.run !== 2 || a !== previous.answer),
    );
    const detail = choice(random, ['A', 'G', 'E', 'C', 'D']);
    const root = bassMidi(parseNote(detail));
    const sound = example(root, answer);
    const other = example(root, answer === 'pentatonic' ? 'majorScale' : 'pentatonic');
    return {
      answer,
      detail,
      sound,
      compare: then(other, sound),
      run: previous?.answer === answer ? (previous.run ?? 1) + 1 : 1,
    };
  },
};
