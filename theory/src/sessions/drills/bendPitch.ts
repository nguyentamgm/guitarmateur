import { choice } from '@shared/core/rng';
import { bend } from '../../core/audio';
import { parseNote } from '../../core/music';
import { bendView, FULL_BENDS, type BendView } from '../../lessons/blues';
import type { Sound } from '../sound';
import type { Drill } from './types';

const answers = ['flat', 'inTune', 'sharp'] as const;
const semitones = { flat: 1.35, inTune: 2, sharp: 2.55 } as const;
const keys = ['A', 'G', 'E', 'D', 'C'] as const;

function referenceAndBend(view: BendView, semis: number): Sound {
  return {
    bpm: 60,
    events: [
      { at: 0, length: 0.8, midis: [view.targetMidi] },
      { at: 1, length: 1.2, midis: [view.at.midi], glide: bend(semis, 0.15, 0.2) },
    ],
  };
}

export const bendPitch: Drill = {
  answers,
  next(random, previous) {
    const answer = choice(
      random,
      answers.filter((a) => previous?.run !== 2 || a !== previous.answer),
    );
    const view = bendView(choice(random, FULL_BENDS), parseNote(choice(random, keys)));
    const detail = `${view.def.from} → ${view.def.to}`.replaceAll('b', '♭');
    return {
      answer,
      detail,
      sound: referenceAndBend(view, semitones[answer]),
      compare: referenceAndBend(view, semitones.inTune),
      run: previous?.answer === answer ? (previous.run ?? 1) + 1 : 1,
    };
  },
};
