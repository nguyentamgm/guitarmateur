import { choice } from '@shared/core/rng';
import { bassMidi } from '../../core/audio';
import { interval, parseNote, type Chord } from '../../core/music';
import { strummed, then, type Sound } from '../sound';
import { chordShape, shapeMidis } from '../voicing';
import type { Drill } from './types';

const answers = ['chordTone', 'outside'] as const;
const chords: readonly Chord[] = [
  { root: parseNote('A'), id: 'minor' },
  { root: parseNote('E'), id: 'minor' },
  ...['G', 'C', 'D'].map((name): Chord => ({ root: parseNote(name), id: 'major' })),
];

export const landedOnChordTone: Drill = {
  answers,
  next(random, previous) {
    const answer = choice(
      random,
      answers.filter((a) => previous?.run !== 2 || a !== previous.answer),
    );
    const chord = choice(random, chords);
    const minor = chord.id === 'minor';
    const chordTone = choice(random, ['1', minor ? 'b3' : '3', '5']);
    const outside = choice(random, ['4', minor ? '2' : '6']);
    const landing = answer === 'chordTone' ? chordTone : outside;
    const alternate = answer === 'chordTone' ? outside : chordTone;
    const shape = chordShape(chord);
    const root = bassMidi(chord.root) + 24;
    const midis = shapeMidis(shape);
    const phrase = (last: string): Sound => ({
      bpm: 80,
      events: [
        strummed(midis, 0, 3),
        ...['1', outside === '2' ? '4' : '2', last].map((degree, i) => ({
          at: (i + 1) / 2,
          midis: [root + interval(degree).semitones],
          length: i === 2 ? 2 : 0.5,
        })),
      ],
    });
    const sound = phrase(landing);
    return {
      answer,
      sound,
      compare: then(phrase(alternate), sound),
      detail: `${shape.symbol} (${landing.replaceAll('b', '♭')})`,
      run: previous?.answer === answer ? (previous.run ?? 1) + 1 : 1,
    };
  },
};
