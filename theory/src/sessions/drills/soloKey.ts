import { choice } from '@shared/core/rng';
import { EIGHTHS_PER_BAR, backingAt } from '../../core/audio';
import { homeFret, midiAt } from '../../core/fretboard';
import { format } from '../../core/music';
import { BEATS_PER_BAR } from '../../core/rhythm';
import { BACKINGS, backingBars } from '../../lessons/solo';
import { strummed } from '../sound';
import { chordShape, shapeMidis } from '../voicing';
import type { Drill } from './types';

const examples = [
  { id: 'pop', answer: 'major' },
  { id: 'rock', answer: 'minor' },
] as const;

export const soloKey: Drill = {
  answers: examples.map(({ answer }) => answer),
  next(random, previous) {
    const { id, answer } = choice(
      random,
      examples.filter((example) => example.answer !== previous?.answer),
    );
    const { tonic } = BACKINGS[id];
    const bpm = 88;
    const fret = homeFret(tonic);
    // Use the same strum for both forms so the minor third is audible and the groove gives no hint.
    const form = backingBars(id, tonic);
    const events = [...form, form[0]!].flatMap(({ chord }, bar) => {
      const voicing = shapeMidis(chordShape(chord));
      return Array.from({ length: EIGHTHS_PER_BAR }, (_, eighth) =>
        backingAt(chord, 'strum', eighth, voicing).map((hit) =>
          strummed(
            hit.stroke === 'up' ? [...hit.midis].reverse() : hit.midis,
            bar * BEATS_PER_BAR + eighth / 2,
            hit.eighths / 2,
          ),
        ),
      ).flat();
    });
    return {
      answer,
      detail: format(tonic),
      vars: { fret },
      sound: { bpm, events },
      revealSound: { bpm, events: [{ at: 0, midis: [midiAt({ string: 6, fret })] }] },
    };
  },
};
