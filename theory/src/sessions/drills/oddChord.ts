import {
  diatonicChords,
  format,
  parseNote,
  type Chord,
  type DegreeLabel,
  type ChordId,
  type NoteName,
} from '../../core/music';
import { chordIn } from '../chordSpec';
import { strummed, then, type Sound, type SoundEvent } from '../sound';
import { chordShape, shapeMidis } from '../voicing';
import type { Drill, DrillQuestion } from './types';

const ANSWERS = ['2', '3', '4'] as const;
export type OddChordAnswer = (typeof ANSWERS)[number];

const KEYS: readonly NoteName[] = [parseNote('G'), parseNote('D'), parseNote('A'), parseNote('C')];

export interface OutsideChordDef {
  readonly spec: { readonly root: DegreeLabel; readonly id: ChordId };
  readonly replaceDeg: number;
}

export const OUTSIDE_CHORDS: readonly OutsideChordDef[] = [
  { spec: { root: 'b7', id: 'major' }, replaceDeg: 5 },
  { spec: { root: '4', id: 'minor' }, replaceDeg: 4 },
  { spec: { root: '3', id: 'dom7' }, replaceDeg: 6 },
];

const OTHER_DEGREES = [1, 4, 5] as const;

const pick = <T>(items: readonly T[], random: () => number): T =>
  items[Math.min(items.length - 1, Math.floor(random() * items.length))]!;

export interface OddChordQuestion extends DrillQuestion {
  readonly keyTonic?: NoteName;
  readonly barsChords?: readonly Chord[];
  readonly diatonicBarsChords?: readonly Chord[];
  readonly outsideChord?: Chord;
}

export const oddChord: Drill = {
  answers: ANSWERS,
  next(random: () => number, previous?: DrillQuestion): OddChordQuestion {
    const availableAnswers =
      previous && previous.run === 2
        ? ANSWERS.filter((a) => a !== previous.answer)
        : ANSWERS;

    const answer = pick(availableAnswers, random);
    const run = previous && previous.answer === answer ? (previous.run ?? 1) + 1 : 1;

    const outsideBarIdx = Number(answer) - 1; // 1, 2, or 3 (0-indexed)

    const tonic = pick(KEYS, random);
    const diatonicList = diatonicChords({ tonic, mode: 'major' }).map((d) => d.chord);
    const home = diatonicList[0]!;

    const outsideDef = pick(OUTSIDE_CHORDS, random);
    const outsideSpec = chordIn({ tonic: format(tonic), mode: 'major' }, outsideDef.spec);
    const outsideChord = outsideSpec.chord;
    const replaceChord = diatonicList[outsideDef.replaceDeg - 1]!;

    const soundBars: Chord[] = [home, home, home, home];
    const diatonicBars: Chord[] = [home, home, home, home];

    for (let i = 1; i < 4; i++) {
      if (i === outsideBarIdx) {
        soundBars[i] = outsideChord;
        diatonicBars[i] = replaceChord;
      } else {
        const deg = pick(OTHER_DEGREES, random);
        const chord = diatonicList[deg - 1]!;
        soundBars[i] = chord;
        diatonicBars[i] = chord;
      }
    }

    const soundEvents: SoundEvent[] = [];
    const diatonicEvents: SoundEvent[] = [];

    for (let barIdx = 0; barIdx < 4; barIdx++) {
      const soundMidis = shapeMidis(chordShape(soundBars[barIdx]!));
      const diatonicMidis = shapeMidis(chordShape(diatonicBars[barIdx]!));

      for (let beat = 0; beat < 4; beat++) {
        soundEvents.push(strummed(soundMidis, barIdx * 4 + beat, 1));
        diatonicEvents.push(strummed(diatonicMidis, barIdx * 4 + beat, 1));
      }
    }

    const sound: Sound = {
      bpm: 85,
      events: soundEvents,
    };

    const diatonicSound: Sound = {
      bpm: 85,
      events: diatonicEvents,
    };

    const compare = then(sound, diatonicSound, 1);
    const detail = `${outsideSpec.roman} (${outsideSpec.symbol})`;

    return {
      answer,
      sound,
      compare,
      detail,
      chord: outsideChord,
      run,
      keyTonic: tonic,
      barsChords: soundBars,
      diatonicBarsChords: diatonicBars,
      outsideChord,
    };
  },
};
