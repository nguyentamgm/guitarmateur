import { chordIn } from '../chordSpec';
import { strummed, type Sound, type SoundEvent } from '../sound';
import { chordShape, shapeMidis } from '../voicing';
import type { Drill, DrillQuestion } from './types';

const ANSWERS = ['three', 'four'] as const;

const G_CHORD = chordIn({ tonic: 'G', mode: 'major' }, 1).chord;
const G_MIDIS = shapeMidis(chordShape(G_CHORD));

function makeMeterEvents(beatsPerBar: 3 | 4): SoundEvent[] {
  const events: SoundEvent[] = [];
  const bars = beatsPerBar === 3 ? 3 : 2;
  // 3 bars of 3 beats (or 2 bars of 4 beats), plus the first beat of the next bar, so both end on a strong beat
  const totalBeats = bars * beatsPerBar + 1;

  for (let b = 0; b < totalBeats; b++) {
    const isAccent = b % beatsPerBar === 0;
    events.push({
      at: b,
      click: isAccent ? 'accent' : 'plain',
    });
    events.push(strummed(G_MIDIS, b, 1));
  }

  return events.sort((a, b) => a.at - b.at);
}

const THREE_SOUND: Sound = {
  bpm: 100,
  events: makeMeterEvents(3),
};

const FOUR_SOUND: Sound = {
  bpm: 100,
  events: makeMeterEvents(4),
};

export const meter: Drill = {
  answers: ANSWERS,
  next(random: () => number, previous?: DrillQuestion): DrillQuestion {
    let answer: (typeof ANSWERS)[number];
    let run: number;

    if (previous && previous.run === 2) {
      // Never the same answer three times in a row
      answer = previous.answer === 'three' ? 'four' : 'three';
      run = 1;
    } else {
      answer = random() < 0.5 ? 'three' : 'four';
      run = previous && previous.answer === answer ? (previous.run ?? 1) + 1 : 1;
    }

    const sound = answer === 'three' ? THREE_SOUND : FOUR_SOUND;
    const compare = answer === 'three' ? FOUR_SOUND : THREE_SOUND;

    return {
      answer,
      sound,
      compare,
      run,
    };
  },
};
