import { choice } from '@shared/core/rng';
import type { DegreeLabel } from '../core/music';
import type { SoloNote, SoloWindow } from '../lessons/solo';
import { ECHO_BPM, judgeTap } from './echo';
import type { Sound } from './sound';

/** Use the lowest occurrence of each degree in the box for the model phrase. */
export function fixedBoxPhrase(box: SoloWindow, degrees: readonly DegreeLabel[]): SoloNote[] {
  return degrees.map((degree) => {
    const note = box.notes.find((n) => n.degree === degree);
    if (!note) throw new RangeError(`Degree ${degree} is outside the ${box.scale} box`);
    return note;
  });
}

export function boxEchoQuestion(
  box: SoloWindow,
  count: 3 | 4,
  random: () => number,
  previous?: readonly SoloNote[],
): SoloNote[] {
  const first = choice(
    random,
    box.notes.filter((n) => n.midi !== previous?.[0]?.midi),
  );
  const phrase = [first];
  let index = box.notes.indexOf(first);
  while (phrase.length < count) {
    const neighbours = [-2, -1, 1, 2]
      .map((delta) => index + delta)
      .filter((i) => box.notes[i] && box.notes[i]!.midi !== box.notes[index]!.midi);
    index = choice(random, neighbours);
    phrase.push(box.notes[index]!);
  }
  return phrase;
}

export function boxEchoSound(phrase: readonly SoloNote[], bpm = ECHO_BPM): Sound {
  return { bpm, events: phrase.map((n, at) => ({ at, midis: [n.midi], length: 1 })) };
}

export function judgeBoxTap(phrase: readonly SoloNote[], found: number, midi: number) {
  return judgeTap(phrase[found]!.midi, midi);
}
