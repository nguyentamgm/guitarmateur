import { choice } from '@shared/core/rng';
import { EIGHTHS_PER_BAR, backingAt } from '../../core/audio';
import { parseNote } from '../../core/music';
import { BEATS_PER_BAR } from '../../core/rhythm';
import { backingBars, soloWindow, toneIn } from '../../lessons/solo';
import { fixedBoxPhrase } from '../boxEcho';
import type { SoundEvent } from '../sound';
import type { Drill } from './types';

const answers = ['motif', 'noodling'] as const;
// Three bars of eighths in the same four-note register, with no recurring three-note figure.
const run = [0, 1, 2, 3, 2, 0, 3, 1, 3, 0, 2, 1, 0, 2, 3, 0, 1, 3, 2, 1, 3, 1, 0, 3] as const;

export const motifOrNoodling: Drill = {
  answers,
  next(random, previous) {
    const answer = choice(
      random,
      answers.filter((a) => previous?.run !== 2 || a !== previous.answer),
    );
    const detail = choice(random, ['A', 'E', 'G', 'D']);
    const tonic = parseNote(detail);
    const bars = backingBars('rock', tonic).slice(0, 3);
    const notes = fixedBoxPhrase(soloWindow(tonic, 'minorPentatonic'), ['1', 'b3', '4', '5']);
    const [first, second, , ending] = notes;
    const newEnding = notes.find(
      (note) => note !== ending && note !== second && toneIn(note, bars[2]!.chord),
    )!;
    const backing = bars.flatMap(({ chord }, bar) =>
      Array.from({ length: EIGHTHS_PER_BAR }, (_, eighth): SoundEvent => {
        const hit = backingAt(chord, 'rock', eighth)[0]!;
        return {
          at: bar * BEATS_PER_BAR + eighth / 2,
          midis: hit.midis,
          length: hit.eighths / 2,
          mute: hit.muted,
        };
      }),
    );
    const lead =
      answer === 'motif'
        ? [ending!, ending!, newEnding].flatMap((last, bar) =>
            [first!, second!, last].map((note, beat): SoundEvent => ({
              at: bar * BEATS_PER_BAR + beat,
              midis: [note.midi],
              length: bar === 2 && beat === 2 ? 2 : 1,
            })),
          )
        : run.map((index, eighth): SoundEvent => ({
            at: eighth / 2,
            midis: [notes[index]!.midi],
            length: 0.5,
          }));
    const sound = { bpm: 88, events: [...backing, ...lead].sort((a, b) => a.at - b.at) };
    return {
      answer,
      detail,
      sound,
      compare: sound,
      run: previous?.answer === answer ? (previous.run ?? 1) + 1 : 1,
    };
  },
};
