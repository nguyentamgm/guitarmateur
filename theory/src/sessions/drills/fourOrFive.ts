import {
  MAJOR_KEY_TONICS,
  chordSymbol,
  diatonicChords,
  type Chord,
  type NoteName,
} from '../../core/music';
import { strummed, then, type Sound, type SoundEvent } from '../sound';
import { chordShape, shapeMidis } from '../voicing';
import type { Drill, DrillQuestion } from './types';

const KEY_TONICS: readonly NoteName[] = MAJOR_KEY_TONICS.filter(
  (t) => ['G', 'D', 'A', 'C'].includes(t.letter) && t.alter === 0,
);

const ANSWERS = ['IV', 'V'] as const;

const pick = <T>(items: readonly T[], random: () => number): T =>
  items[Math.min(items.length - 1, Math.floor(random() * items.length))]!;

function strumEvents(chords: readonly Chord[], beats = 2): readonly SoundEvent[] {
  return chords.map((c, i) => strummed(shapeMidis(chordShape(c)), i * beats, beats));
}

export const fourOrFive: Drill = {
  answers: ANSWERS,
  next(random: () => number, previous?: DrillQuestion): DrillQuestion {
    const tonic = pick(KEY_TONICS, random);

    let answer: (typeof ANSWERS)[number];
    let run: number;
    if (previous && previous.run === 2) {
      // Never the same answer three times in a row
      answer = previous.answer === 'IV' ? 'V' : 'IV';
      run = 1;
    } else {
      answer = random() < 0.5 ? 'IV' : 'V';
      run = previous && previous.answer === answer ? (previous.run ?? 1) + 1 : 1;
    }

    const diatonic = diatonicChords({ tonic, mode: 'major' }).map((d) => d.chord);
    const home = diatonic[0]!;
    const iv = diatonic[3]!;
    const v = diatonic[4]!;

    const middle = answer === 'IV' ? iv : v;
    const other = answer === 'IV' ? v : iv;

    const questionChords = [home, middle, home];
    const sound: Sound = {
      bpm: 80,
      events: strumEvents(questionChords, 2),
    };

    const otherSound: Sound = {
      bpm: 80,
      events: strumEvents([home, other, home], 2),
    };

    const compare = then(otherSound, sound, 1);
    const detail = questionChords.map(chordSymbol).join(' – ');

    return {
      answer,
      sound,
      compare,
      detail,
      chord: home,
      run,
    };
  },
};
