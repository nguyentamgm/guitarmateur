import { straightOrShuffle } from './straightOrShuffle';

it('keeps the same pitches and clicks while the offbeat moves in the shuffle', () => {
  const question = straightOrShuffle.next(() => 0);
  const straight = question.sound.events;
  const shuffle = question.compare!.events.slice(0, 8);
  expect(question.answer).toBe('straight');
  expect(question.sound.bpm).toBe(84);
  expect(straight.map((e) => e.midis?.[0])).toEqual([45, 52, 45, 52, 45, 52, 45, 52]);
  expect(shuffle.map((e) => e.midis)).toEqual(straight.map((e) => e.midis));
  for (const events of [straight, shuffle]) {
    expect(events.filter((e) => e.click).map((e) => e.at)).toEqual([0, 1, 2, 3]);
  }
  expect(straight[1]!.at).toBe(0.5);
  expect(shuffle[1]!.at).toBeCloseTo(2 / 3);
  expect(question.compare!.events.slice(8).map((e) => e.at)).toEqual(straight.map((e) => e.at + 5));
});
