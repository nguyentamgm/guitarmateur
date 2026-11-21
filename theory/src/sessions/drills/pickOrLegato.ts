import { choice } from '@shared/core/rng';
import { legato, slide } from '../../core/audio';
import { lickBox } from '../../lessons/blues';
import type { Sound } from '../sound';
import type { Drill } from './types';

const answers = ['picked', 'legato', 'slide'] as const;
type Answer = (typeof answers)[number];
const BPM = 80;

// Box 1 has two notes on each string, ordered by pitch. Keep the whole-step pairs.
const pairs = lickBox().notes.flatMap((low, index, notes) => {
  const high = notes[index + 1];
  return high?.string === low.string && high.fret === low.fret + 2
    ? [[low.midi, high.midi] as const]
    : [];
});

function pairSound(answer: Answer, first: number, second: number, bpm: number): Sound {
  if (answer === 'picked') {
    return {
      bpm,
      events: [
        { at: 0, length: 0.7, midis: [first] },
        { at: 0.75, length: 1, midis: [second] },
      ],
    };
  }

  // Sound events use beats. Stretch the glide's seconds as well for a slower comparison.
  const stretch = BPM / bpm;
  const semis = second - first;
  const glide =
    answer === 'legato'
      ? legato(semis, 0.4 * stretch)
      : slide(semis, 0.3 * stretch, 0.25 * stretch);
  return { bpm, events: [{ at: 0, length: 1.75, midis: [first], glide }] };
}

export const pickOrLegato: Drill = {
  answers,
  next(random, previous) {
    const answer = choice(
      random,
      answers.filter((a) => previous?.run !== 2 || a !== previous.answer),
    );
    const [low, high] = choice(random, pairs);
    const [first, second] = random() < 0.5 ? [low, high] : [high, low];
    return {
      answer,
      sound: pairSound(answer, first, second, BPM),
      compare: pairSound(answer, first, second, 60),
      run: previous?.answer === answer ? (previous.run ?? 1) + 1 : 1,
    };
  },
};
