import { choice } from '@shared/core/rng';
import { bassMidi } from '../../core/audio';
import { bluesChord, interval, parseNote } from '../../core/music';
import { BEATS_PER_BAR } from '../../core/rhythm';
import { strummed, then, type Sound } from '../sound';
import { chordShape, shapeMidis } from '../voicing';
import type { Drill } from './types';

const answers = ['third', 'root'] as const;

export const thirdOrRoot: Drill = {
  answers,
  next(random, previous) {
    const answer = choice(
      random,
      answers.filter((a) => previous?.run !== 2 || a !== previous.answer),
    );
    const tonic = parseNote(choice(random, ['A', 'G', 'E', 'D', 'C']));
    const one = shapeMidis(chordShape(bluesChord(tonic, 'I')));
    const four = chordShape(bluesChord(tonic, 'IV'));
    const fourMidis = shapeMidis(four);
    const root = bassMidi(tonic) + 24;
    // The sixth degree of the key is the major third of IV, just below the upper tonic.
    const third = root + interval('6').semitones - 12;
    const change = (landing: number): Sound => ({
      bpm: 80,
      events: [
        strummed(one, 0, BEATS_PER_BAR),
        { at: 0, midis: [root], length: BEATS_PER_BAR },
        strummed(fourMidis, BEATS_PER_BAR, BEATS_PER_BAR),
        { at: BEATS_PER_BAR, midis: [landing], length: BEATS_PER_BAR },
      ],
    });
    const sound = change(answer === 'third' ? third : root);
    return {
      answer,
      sound,
      compare: then(change(answer === 'third' ? root : third), sound),
      detail: four.symbol,
      run: previous?.answer === answer ? (previous.run ?? 1) + 1 : 1,
    };
  },
};
