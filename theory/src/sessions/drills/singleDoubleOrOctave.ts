import { choice } from '@shared/core/rng';
import { midiAt, octaveUp, shapeAt } from '../../core/fretboard';
import { parseNote } from '../../core/music';
import { soloWindow } from '../../lessons/solo';
import { fixedBoxPhrase } from '../boxEcho';
import type { Sound } from '../sound';
import type { Drill } from './types';

const answers = ['single', 'doubleStop', 'octave'] as const;

export const singleDoubleOrOctave: Drill = {
  answers,
  next(random, previous) {
    const answer = choice(
      random,
      answers.filter((a) => previous?.run !== 2 || a !== previous.answer),
    );
    const tonic = parseNote(choice(random, ['A', 'G', 'E']));
    const box = soloWindow(tonic, 'minorPentatonic');
    const phrase = fixedBoxPhrase(box, ['1', 'b3', '4', '5']);
    const events = phrase.map((note, at) => {
      const upper =
        answer === 'single'
          ? null
          : answer === 'doubleStop'
            ? shapeAt(note, '4', 1)
            : octaveUp(note);
      return { at, midis: upper ? [note.midi, midiAt(upper)] : [note.midi], length: 1 };
    });
    const sound: Sound = { bpm: 88, events };
    return {
      answer,
      sound,
      compare: { bpm: 64, events },
      run: previous?.answer === answer ? (previous.run ?? 1) + 1 : 1,
    };
  },
};
