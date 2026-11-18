import { chordSymbol, diatonicChords, parseNote } from '../../core/music';
import { strummed, type Sound } from '../sound';
import { chordShape, shapeMidis } from '../voicing';
import type { Drill, DrillQuestion } from './types';

const ANSWERS = ['two', 'three'] as const;

const TWO_PATTERNS: readonly (readonly number[])[] = [
  [1, 4, 1, 4],
  [1, 5, 1, 5],
];

const THREE_PATTERNS: readonly (readonly number[])[] = [
  [1, 4, 5, 1],
  [1, 5, 4, 1],
];

const CHORDS = diatonicChords({ tonic: parseNote('G'), mode: 'major' }).map((d) => d.chord);

const pick = <T>(items: readonly T[], random: () => number): T =>
  items[Math.min(items.length - 1, Math.floor(random() * items.length))]!;

export const chordCount: Drill = {
  answers: ANSWERS,
  next(random: () => number, previous?: DrillQuestion): DrillQuestion {
    let answer: (typeof ANSWERS)[number];
    let run: number;

    if (previous && previous.run === 2) {
      // Never the same answer three times in a row
      answer = previous.answer === 'two' ? 'three' : 'two';
      run = 1;
    } else {
      answer = random() < 0.5 ? 'two' : 'three';
      run = previous && previous.answer === answer ? (previous.run ?? 1) + 1 : 1;
    }

    const degrees = pick(answer === 'two' ? TWO_PATTERNS : THREE_PATTERNS, random);
    const barsChords = degrees.map((d) => CHORDS[d - 1]!);

    const events = barsChords.flatMap((chord, barIdx) => {
      const midis = shapeMidis(chordShape(chord));
      return [
        strummed(midis, barIdx * 4, 2),
        strummed(midis, barIdx * 4 + 2, 2),
      ];
    });

    const sound: Sound = {
      bpm: 90,
      events,
    };

    const compare: Sound = {
      bpm: 70,
      events,
    };

    const detail = barsChords.map(chordSymbol).join(' – ');

    return {
      answer,
      sound,
      compare,
      detail,
      chord: barsChords[0],
      run,
    };
  },
};
