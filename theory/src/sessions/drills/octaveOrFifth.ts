import { choice, int } from '@shared/core/rng';
import { midiAt, pitchAtPos, powerChord } from '../../core/fretboard';
import { format } from '../../core/music';
import { then, type Sound } from '../sound';
import type { Drill } from './types';

const answers = ['octave', 'fifth'] as const;

function hearPair(low: number, high: number): Sound {
  return {
    bpm: 80,
    events: [
      { at: 0, midis: [low] },
      { at: 1, midis: [high] },
      { at: 2, midis: [low, high], length: 2 },
    ],
  };
}

export const octaveOrFifth: Drill = {
  answers,
  next(random, previous) {
    const answer = choice(
      random,
      answers.filter((a) => previous?.run !== 2 || a !== previous.answer),
    );
    const root = { string: choice(random, [6, 5] as const), fret: int(random, 0, 7) };
    const [low, fifth, octave] = powerChord(root)!.map(midiAt);
    const fifthSound = hearPair(low!, fifth!);
    const octaveSound = hearPair(low!, octave!);
    const sound = answer === 'octave' ? octaveSound : fifthSound;
    const other = answer === 'octave' ? fifthSound : octaveSound;
    return {
      answer,
      sound,
      compare: then(other, sound),
      detail: format(pitchAtPos(root)),
      run: previous?.answer === answer ? (previous.run ?? 1) + 1 : 1,
    };
  },
};
