import { choice } from '@shared/core/rng';
import { parseNote } from '../../core/music';
import { BEATS_PER_BAR } from '../../core/rhythm';
import { sevenPositions, type NeckNote } from '../../lessons/three-per-string';
import { then, type Sound } from '../sound';
import type { Drill } from './types';

const answers = ['eighths', 'triplets'] as const;

function runAt(notes: readonly NeckNote[], perBeat: 2 | 3): Sound {
  return {
    bpm: 76,
    events: notes.slice(0, BEATS_PER_BAR * perBeat).map((note, i) => ({
      at: i / perBeat,
      midis: [note.midi],
      length: 1 / perBeat,
      click: i === 0 ? 'accent' : i % perBeat === 0 ? 'plain' : undefined,
    })),
  };
}

export const dupleOrTripletRun: Drill = {
  answers,
  next(random, previous) {
    const answer = choice(
      random,
      answers.filter((a) => previous?.run !== 2 || a !== previous.answer),
    );
    const tonic = parseNote(choice(random, ['G', 'A', 'C', 'D']));
    const notes = sevenPositions(tonic)[0]!.notes;
    const perBeat = answer === 'eighths' ? 2 : 3;
    const sound = runAt(notes, perBeat);
    return {
      answer,
      sound,
      compare: then(runAt(notes, perBeat === 2 ? 3 : 2), sound),
      run: previous?.answer === answer ? (previous.run ?? 1) + 1 : 1,
    };
  },
};
