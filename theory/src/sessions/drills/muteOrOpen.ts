import { choice } from '@shared/core/rng';
import { parseNote } from '../../core/music';
import { BEATS_PER_BAR } from '../../core/rhythm';
import { POWER_CHORD_LENGTH, POWER_RIFF_BPM, powerRiff } from '../powerRiff';
import { then, type Sound } from '../sound';
import type { Drill } from './types';

const answers = ['muted', 'open'] as const;
const riff = powerRiff(parseNote('E'));

function riffSound(mute: boolean): Sound {
  return {
    bpm: POWER_RIFF_BPM,
    events: [
      ...riff.map(({ cell, midis }) => ({ at: cell / 2, midis, length: POWER_CHORD_LENGTH, mute })),
      { at: BEATS_PER_BAR - 1, length: 1 }, // Keep the last beat silent in both passes.
    ],
  };
}

export const muteOrOpen: Drill = {
  answers,
  next(random, previous) {
    const answer = choice(
      random,
      answers.filter((a) => previous?.run !== 2 || a !== previous.answer),
    );
    const mute = answer === 'muted';
    const sound = riffSound(mute);
    return {
      answer,
      sound,
      compare: then(riffSound(!mute), sound, 0),
      run: previous?.answer === answer ? (previous.run ?? 1) + 1 : 1,
    };
  },
};
