import { choice } from '@shared/core/rng';
import { homeFret, midiAt, octaveUp } from '../../core/fretboard';
import { LETTERS, note } from '../../core/music';
import type { Drill } from './types';

export const rootAcrossStrings: Drill = {
  answers: [],
  next(random, previous) {
    const name = choice(
      random,
      LETTERS.filter((letter) => letter !== previous?.detail),
    );
    const root = { string: 6, fret: homeFret(note(name)) } as const;
    const middle = octaveUp(root)!;
    const high = octaveUp(middle)!;
    return {
      answer: name,
      detail: name,
      vars: { start: root.fret, middle: middle.fret, high: high.fret },
      sound: { bpm: 80, events: [{ at: 0, midis: [midiAt(root)] }] },
      revealSound: {
        bpm: 80,
        events: [root, middle, high].map((pos, at) => ({ at, midis: [midiAt(pos)] })),
      },
    };
  },
};
