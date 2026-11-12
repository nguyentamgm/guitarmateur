import {
  MAJOR_KEY_TONICS,
  chordSymbol,
  type Chord,
  type ChordId,
  type NoteName,
} from '../../core/music';
import { strummed, then, type Sound } from '../sound';
import { chordShape, shapeMidis } from '../voicing';
import type { Drill, DrillQuestion } from './types';

const QUALITY_ROOTS: readonly NoteName[] = MAJOR_KEY_TONICS.filter(
  (t) => ['E', 'A', 'D'].includes(t.letter) && t.alter === 0,
);

const ANSWERS = ['major', 'minor'] as const;

export const quality: Drill = {
  answers: ANSWERS,
  next(random: () => number, previous?: DrillQuestion): DrillQuestion {
    const rootIndex = Math.min(QUALITY_ROOTS.length - 1, Math.floor(random() * QUALITY_ROOTS.length));
    const root = QUALITY_ROOTS[rootIndex]!;

    let answer: (typeof ANSWERS)[number];
    let run: number;

    if (previous && previous.run === 2) {
      // Never the same answer three times in a row
      answer = previous.answer === 'major' ? 'minor' : 'major';
      run = 1;
    } else {
      answer = random() < 0.5 ? 'major' : 'minor';
      run = previous && previous.answer === answer ? (previous.run ?? 1) + 1 : 1;
    }

    const chord: Chord = { root, id: answer as ChordId };
    const otherId: ChordId = answer === 'major' ? 'minor' : 'major';
    const otherChord: Chord = { root, id: otherId };

    const soundChord: Sound = {
      bpm: 80,
      events: [strummed(shapeMidis(chordShape(chord)), 0, 2)],
    };

    const soundOther: Sound = {
      bpm: 80,
      events: [strummed(shapeMidis(chordShape(otherChord)), 0, 2)],
    };

    const compare = then(soundOther, soundChord);

    return {
      answer,
      sound: soundChord,
      compare,
      detail: chordSymbol(chord),
      chord,
      run,
    };
  },
};
