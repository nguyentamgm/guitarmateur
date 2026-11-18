import { chordSymbol, diatonicChords, parseNote } from '../../core/music';
import { strummed, type Sound, type SoundEvent } from '../sound';
import { chordShape, shapeMidis } from '../voicing';
import type { Drill, DrillQuestion } from './types';

const ANSWERS = ['2', '3', '4'] as const;
export type MinorBarAnswer = (typeof ANSWERS)[number];

const TONIC = parseNote('G');
const DIATONIC = diatonicChords({ tonic: TONIC, mode: 'major' }).map((d) => d.chord);
const HOME = DIATONIC[0]!;
const VI_CHORD = DIATONIC[5]!;
const OTHER_DEGREES = [1, 4, 5] as const;

const pick = <T>(items: readonly T[], random: () => number): T =>
  items[Math.min(items.length - 1, Math.floor(random() * items.length))]!;

export const minorBar: Drill = {
  answers: ANSWERS,
  next(random: () => number, previous?: DrillQuestion): DrillQuestion {
    const availableAnswers =
      previous && previous.run === 2
        ? ANSWERS.filter((a) => a !== previous.answer)
        : ANSWERS;

    const answer = pick(availableAnswers, random);
    const run = previous && previous.answer === answer ? (previous.run ?? 1) + 1 : 1;

    const viBarIdx = Number(answer) - 1; // 1, 2, or 3 (0-indexed)

    // Bar 1 (index 0) is always I
    const barsChords = [HOME, HOME, HOME, HOME];
    for (let i = 1; i < 4; i++) {
      if (i === viBarIdx) {
        barsChords[i] = VI_CHORD;
      } else {
        const deg = pick(OTHER_DEGREES, random);
        barsChords[i] = DIATONIC[deg - 1]!;
      }
    }

    const soundEvents: SoundEvent[] = [];
    const compareEvents: SoundEvent[] = [];

    for (let barIdx = 0; barIdx < 4; barIdx++) {
      const chord = barsChords[barIdx]!;
      const midis = shapeMidis(chordShape(chord));

      // Sound: four down strums per bar
      for (let beat = 0; beat < 4; beat++) {
        soundEvents.push(strummed(midis, barIdx * 4 + beat, 1));
      }

      // Compare: same bars with the vi bar played as one held strum
      if (barIdx === viBarIdx) {
        compareEvents.push(strummed(midis, barIdx * 4, 4));
      } else {
        for (let beat = 0; beat < 4; beat++) {
          compareEvents.push(strummed(midis, barIdx * 4 + beat, 1));
        }
      }
    }

    const sound: Sound = {
      bpm: 85,
      events: soundEvents,
    };

    const compare: Sound = {
      bpm: 85,
      events: compareEvents,
    };

    return {
      answer,
      sound,
      compare,
      detail: chordSymbol(VI_CHORD),
      chord: VI_CHORD,
      run,
    };
  },
};
