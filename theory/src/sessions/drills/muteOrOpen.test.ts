import { soundBeats } from '../sound';
import { muteOrOpen } from './muteOrOpen';

it('compares the same power-chord riff over two complete bars with a silent beat four in each', () => {
  const question = muteOrOpen.next(() => 0);
  expect(question.answer).toBe('muted');
  expect(question.sound.bpm).toBe(96);
  expect(soundBeats(question.sound)).toBe(4);
  const hits = question.sound.events.filter((event) => event.midis);
  expect(hits.map((event) => event.at)).toEqual([0, 0.5, 1, 1.5, 2, 2.5]);
  expect(hits.map((event) => event.midis)).toEqual([
    [40, 47],
    [40, 47],
    [43, 50],
    [43, 50],
    [45, 52],
    [45, 52],
  ]);
  const compare = question.compare!;
  expect(soundBeats(compare)).toBe(8);
  expect(compare.events.filter((event) => event.midis)).toEqual([
    ...hits.map((event) => ({ ...event, mute: false, length: 0.45 })),
    ...hits.map((event) => ({ ...event, at: event.at + 4, mute: true })),
  ]);
});
