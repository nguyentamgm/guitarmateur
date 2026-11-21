import { choice } from '@shared/core/rng';
import { homeFret, midiAt } from '../../core/fretboard';
import { interval, parseNote } from '../../core/music';
import { swingLength, swingOnset } from '../../core/rhythm';
import { BLUES_BPM } from '../../lessons/blues';
import { then, type Sound } from '../sound';
import type { Drill } from './types';

const answers = ['straight', 'shuffle'] as const;

function riff(rootFret: number, upperFret: number, swing: 0 | 1): Sound {
  return {
    bpm: BLUES_BPM,
    events: Array.from({ length: 8 }, (_, eighth) => ({
      at: swingOnset(eighth, swing),
      midis: [midiAt({ string: 6, fret: eighth % 2 === 0 ? rootFret : upperFret })],
      length: swingLength(eighth, swing),
      click: eighth === 0 ? 'accent' : eighth % 2 === 0 ? 'plain' : undefined,
    })),
  };
}

export const straightOrShuffle: Drill = {
  answers,
  next(random, previous) {
    const answer = choice(
      random,
      answers.filter((a) => previous?.run !== 2 || a !== previous.answer),
    );
    const rootFret = homeFret(parseNote(choice(random, ['A', 'E'])));
    const upperFret = rootFret + interval(choice(random, ['5', '6'])).semitones;
    const swing = answer === 'shuffle' ? 1 : 0;
    const sound = riff(rootFret, upperFret, swing);
    return {
      answer,
      sound,
      compare: then(riff(rootFret, upperFret, swing === 1 ? 0 : 1), sound),
      run: previous?.answer === answer ? (previous.run ?? 1) + 1 : 1,
    };
  },
};
