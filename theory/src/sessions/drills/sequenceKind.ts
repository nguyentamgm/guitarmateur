import { choice } from '@shared/core/rng';
import { midiAt, positions, sequence } from '../../core/fretboard';
import { parseNote } from '../../core/music';
import type { Drill } from './types';

const answers = ['straight', 'threes', 'skips'] as const;
const KEYS = ['A', 'G', 'E', 'D'] as const;

export const sequenceKind: Drill = {
  answers,
  next(random, previous) {
    const answer = choice(
      random,
      answers.filter((a) => previous?.run !== 2 || a !== previous.answer),
    );
    const detail = choice(random, KEYS);
    const tonic = parseNote(detail);
    const box = positions({ tonic, scale: 'minorPentatonic', notesPerString: 2 })[0]!;
    const notes = box.notes.slice(0, 8);
    const kind = answer === 'skips' ? 'skip' : answer;
    // End after a complete group, with an eighth note between attacks as in the lesson.
    const events = sequence(notes.length, kind, 'up')
      .slice(0, kind === 'threes' ? 9 : 8)
      .map((note, i) => ({ at: i / 2, midis: [midiAt(notes[note]!)], length: 0.5 }));

    return {
      answer,
      detail,
      sound: { bpm: 110, events },
      compare: { bpm: 80, events },
      run: previous?.answer === answer ? (previous.run ?? 1) + 1 : 1,
    };
  },
};
