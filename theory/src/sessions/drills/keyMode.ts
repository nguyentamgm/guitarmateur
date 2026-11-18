import { chordSymbol, diatonicChords, format, parseNote, type Chord, type NoteName } from '../../core/music';
import { chordIn } from '../chordSpec';
import { strummed, then, type Sound, type SoundEvent } from '../sound';
import { chordShape, shapeMidis } from '../voicing';
import type { Drill, DrillQuestion } from './types';

const ANSWERS = ['major', 'minor'] as const;
export type KeyModeAnswer = (typeof ANSWERS)[number];

const TONICS: readonly NoteName[] = [parseNote('A'), parseNote('E'), parseNote('D')];

const pick = <T>(items: readonly T[], random: () => number): T =>
  items[Math.min(items.length - 1, Math.floor(random() * items.length))]!;

function makeModeSound(chords: readonly Chord[]): Sound {
  const events: SoundEvent[] = [
    strummed(shapeMidis(chordShape(chords[0]!)), 0, 2),
    strummed(shapeMidis(chordShape(chords[1]!)), 2, 2),
    strummed(shapeMidis(chordShape(chords[2]!)), 4, 2),
    strummed(shapeMidis(chordShape(chords[3]!)), 6, 4),
  ];
  return { bpm: 80, events };
}

export const keyMode: Drill = {
  answers: ANSWERS,
  next(random: () => number, previous?: DrillQuestion): DrillQuestion {
    const tonic = pick(TONICS, random);

    let answer: KeyModeAnswer;
    let run: number;

    if (previous && previous.run === 2) {
      answer = previous.answer === 'major' ? 'minor' : 'major';
      run = 1;
    } else {
      answer = random() < 0.5 ? 'major' : 'minor';
      run = previous && previous.answer === answer ? (previous.run ?? 1) + 1 : 1;
    }

    const majorDiatonic = diatonicChords({ tonic, mode: 'major' }).map((d) => d.chord);
    const majorChords: readonly Chord[] = [
      majorDiatonic[0]!,
      majorDiatonic[3]!,
      majorDiatonic[4]!,
      majorDiatonic[0]!,
    ];

    const minorDiatonic = diatonicChords({ tonic, mode: 'minor' }).map((d) => d.chord);
    const v7 = chordIn({ tonic: format(tonic), mode: 'minor' }, { root: '5', id: 'dom7' }).chord;
    const minorChords: readonly Chord[] = [
      minorDiatonic[0]!,
      minorDiatonic[3]!,
      v7,
      minorDiatonic[0]!,
    ];

    const chords = answer === 'major' ? majorChords : minorChords;
    const otherChords = answer === 'major' ? minorChords : majorChords;

    const sound = makeModeSound(chords);
    const otherSound = makeModeSound(otherChords);
    const compare = then(otherSound, sound, 1);

    const lastChord = chords[3]!;

    return {
      answer,
      sound,
      compare,
      detail: chordSymbol(lastChord),
      chord: lastChord,
      run,
    };
  },
};
