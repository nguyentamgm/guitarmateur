import { chordIn } from '../chordSpec';
import { strummed, type Sound, type SoundEvent } from '../sound';
import { chordShape, shapeMidis } from '../voicing';
import type { Drill, DrillQuestion } from './types';

const ANSWERS = ['on', 'off'] as const;

const EM_CHORD = chordIn({ tonic: 'E', mode: 'minor' }, 1).chord;
const EM_MIDIS = shapeMidis(chordShape(EM_CHORD));

function makeEvents(on: boolean): SoundEvent[] {
  const events: SoundEvent[] = [];
  for (let b = 0; b < 4; b++) {
    events.push({
      at: b,
      click: b === 0 ? 'accent' : 'plain',
    });
    events.push(strummed(EM_MIDIS, on ? b : b + 0.5, 0.5));
  }
  return events.sort((a, b) => a.at - b.at);
}

const ON_SOUND: Sound = {
  bpm: 80,
  events: makeEvents(true),
};

const OFF_SOUND: Sound = {
  bpm: 80,
  events: makeEvents(false),
};

export const onBeat: Drill = {
  answers: ANSWERS,
  next(random: () => number, previous?: DrillQuestion): DrillQuestion {
    let answer: (typeof ANSWERS)[number];
    let run: number;

    if (previous && previous.run === 2) {
      // Never the same answer three times in a row
      answer = previous.answer === 'on' ? 'off' : 'on';
      run = 1;
    } else {
      answer = random() < 0.5 ? 'on' : 'off';
      run = previous && previous.answer === answer ? (previous.run ?? 1) + 1 : 1;
    }

    const sound = answer === 'on' ? ON_SOUND : OFF_SOUND;
    const compare = answer === 'on' ? OFF_SOUND : ON_SOUND;

    return {
      answer,
      sound,
      compare,
      run,
    };
  },
};
