import { expect, it } from 'vitest';
import { parseNote } from '../core/music';
import { soloWindow } from '../lessons/solo';
import { boxEchoQuestion, boxEchoSound, judgeBoxTap } from './boxEcho';

it('plays neighbouring box pitches on successive beats and gives directed pitch feedback', () => {
  const box = soloWindow(parseNote('A'), 'minorPentatonic');
  const phrase = boxEchoQuestion(box, 4, () => 0);
  const sound = boxEchoSound(phrase);
  expect(sound.bpm).toBe(70);
  expect(sound.events).toEqual(phrase.map((n, at) => ({ at, length: 1, midis: [n.midi] })));
  expect(phrase).toHaveLength(4);
  for (const [i, n] of phrase.entries()) {
    expect(box.notes).toContain(n);
    if (i)
      expect(
        Math.abs(box.notes.indexOf(n) - box.notes.indexOf(phrase[i - 1]!)),
      ).toBeLessThanOrEqual(2);
  }
  const target = phrase[1]!.midi;
  expect([target - 1, target, target + 1].map((m) => judgeBoxTap(phrase, 1, m))).toEqual([
    'higher',
    'right',
    'lower',
  ]);
  expect(boxEchoQuestion(box, 4, () => 0, phrase).map((n) => n.midi)).not.toEqual(
    phrase.map((n) => n.midi),
  );
});
