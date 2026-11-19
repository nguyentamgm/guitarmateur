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

const SEVENTH_ROOTS: readonly NoteName[] = MAJOR_KEY_TONICS.filter(
  (t) => ['E', 'A', 'D', 'G'].includes(t.letter) && t.alter === 0,
);

const ANSWERS = ['plain', 'seventh'] as const;

export const seventh: Drill = {
  answers: ANSWERS,
  next(random: () => number, previous?: DrillQuestion): DrillQuestion {
    const rootIndex = Math.min(SEVENTH_ROOTS.length - 1, Math.floor(random() * SEVENTH_ROOTS.length));
    const root = SEVENTH_ROOTS[rootIndex]!;

    let answer: (typeof ANSWERS)[number];
    let run: number;

    if (previous && previous.run === 2) {
      // Never the same answer three times in a row
      answer = previous.answer === 'plain' ? 'seventh' : 'plain';
      run = 1;
    } else {
      answer = random() < 0.5 ? 'plain' : 'seventh';
      run = previous && previous.answer === answer ? (previous.run ?? 1) + 1 : 1;
    }

    const chordId: ChordId = answer === 'plain' ? 'major' : 'dom7';
    const otherId: ChordId = answer === 'plain' ? 'dom7' : 'major';
    const chord: Chord = { root, id: chordId };
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
