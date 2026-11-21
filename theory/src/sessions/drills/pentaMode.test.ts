import { expect, it } from 'vitest';
import { bassMidi } from '../../core/audio';
import { parseNote } from '../../core/music';
import { chordShape, shapeMidis } from '../voicing';
import { pentaMode } from './pentaMode';

/** A random source that returns these values in turn. */
const values = (...xs: number[]) => {
  let i = 0;
  return () => xs[i++ % xs.length]!;
};

it('strums the major I chord, then plays the asked pentatonic phrase from its root, and compares the other', () => {
  const minor = pentaMode.next(() => 0);
  // The last of the keys (D), and after two minor phrases in a row, the other answer.
  const major = pentaMode.next(values(0, 0.99), { ...minor, run: 2 });
  expect([minor.answer, minor.detail, major.answer, major.detail]).toEqual(['minorPenta', 'A', 'majorPenta', 'D']);
  for (const [q, intervals] of [
    [minor, [0, 3, 5, 7, 12]],
    [major, [0, 2, 4, 7, 12]],
  ] as const) {
    const root = parseNote(q.detail!);
    const [chord, ...phrase] = q.sound.events;
    expect(chord).toEqual({ at: 0, midis: shapeMidis(chordShape({ root, id: 'major' })), strum: true, length: 2 });
    expect(phrase.map((e) => e.midis![0]! - bassMidi(root))).toEqual(intervals);
    expect(phrase.map((e) => e.at)).toEqual([2, 3, 4, 5, 6]);
    // The other scale first, then the question again after a beat's gap.
    expect(q.compare!.events.slice(6)).toEqual(q.sound.events.map((e) => ({ ...e, at: e.at + 8 })));
  }
});
