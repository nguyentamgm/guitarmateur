import {
  MAJOR_KEY_TONICS,
  chordSymbol,
  sameNote,
  type Chord,
  type NoteName,
} from '../../core/music';
import { barreOptions, midiAt, type BarreVoicing } from '../../core/fretboard';
import { strummed, type Sound } from '../sound';
import { chordShape, shapeMidis } from '../voicing';
import type { Drill, DrillQuestion } from './types';

const ANSWERS = ['same', 'different'] as const;
export type SameChordAnswer = (typeof ANSWERS)[number];

const MAJOR_TONICS: readonly NoteName[] = MAJOR_KEY_TONICS.filter(
  (t) => ['G', 'C', 'D', 'A', 'E'].includes(t.letter) && t.alter === 0,
);
const MINOR_TONICS: readonly NoteName[] = MAJOR_KEY_TONICS.filter(
  (t) => ['A', 'E', 'D'].includes(t.letter) && t.alter === 0,
);

const MAJOR_POOL: readonly Chord[] = MAJOR_TONICS.map((root) => ({ root, id: 'major' as const }));
const MINOR_POOL: readonly Chord[] = MINOR_TONICS.map((root) => ({ root, id: 'minor' as const }));
const POOL: readonly Chord[] = [...MAJOR_POOL, ...MINOR_POOL];

const pick = <T>(items: readonly T[], random: () => number): T =>
  items[Math.min(items.length - 1, Math.floor(random() * items.length))]!;

export interface SameChordQuestion extends DrillQuestion {
  readonly barre?: BarreVoicing;
  readonly firstChord?: Chord;
  readonly secondChord?: Chord;
}

export const sameChord: Drill = {
  answers: ANSWERS,
  next(random: () => number, previous?: DrillQuestion): SameChordQuestion {
    let answer: (typeof ANSWERS)[number];
    let run: number;

    if (previous && previous.run === 2) {
      answer = previous.answer === 'same' ? 'different' : 'same';
      run = 1;
    } else {
      answer = random() < 0.5 ? 'same' : 'different';
      run = previous && previous.answer === answer ? (previous.run ?? 1) + 1 : 1;
    }

    const firstChord = pick(POOL, random);
    let secondChord: Chord;

    if (answer === 'same') {
      secondChord = firstChord;
    } else {
      const candidates = (firstChord.id === 'major' ? MAJOR_POOL : MINOR_POOL).filter(
        (c) => !sameNote(c.root, firstChord.root),
      );
      secondChord = pick(candidates, random);
    }

    const openShape = chordShape(firstChord);
    const openMidis = shapeMidis(openShape);

    const barreCandidates = barreOptions(secondChord).filter((v) => v.fret > 0);
    const chosenBarre = pick(barreCandidates, random);
    const barreMidis = chosenBarre.notes.map(midiAt);

    const secondOpenShape = chordShape(secondChord);
    const secondOpenMidis = shapeMidis(secondOpenShape);

    const sound: Sound = {
      bpm: 80,
      events: [
        strummed(openMidis, 0, 2),
        strummed(barreMidis, 3, 2),
      ],
    };

    const compare: Sound = {
      bpm: 80,
      events: [
        strummed(openMidis, 0, 2),
        strummed(barreMidis, 3, 2),
        strummed(secondOpenMidis, 6, 2),
      ],
    };

    const detail = `${chordSymbol(firstChord)}, then ${chordSymbol(secondChord)}`;

    return {
      answer,
      sound,
      compare,
      detail,
      chord: secondChord,
      run,
      barre: chosenBarre,
      firstChord,
      secondChord,
    };
  },
};
