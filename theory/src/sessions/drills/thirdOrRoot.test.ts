import { thirdOrRoot } from './thirdOrRoot';

it('puts the third of D7 on beat one of the second bar and compares it with holding A', () => {
  const question = thirdOrRoot.next(() => 0);
  expect(question).toMatchObject({ answer: 'third', detail: 'D7' });
  const events = question.sound.events;
  expect(events[0]).toMatchObject({ strum: true, at: 0, length: 4 });
  expect(events[1]).toEqual({ at: 0, midis: [69], length: 4 });
  expect(events[2]).toMatchObject({ strum: true, at: 4, length: 4 });
  expect(events[3]).toEqual({ at: 4, midis: [66], length: 4 });
  const replay = question.compare!.events;
  expect(replay.slice(0, 3)).toEqual(events.slice(0, 3));
  expect(replay[3]).toEqual({ at: 4, midis: [69], length: 4 });
  expect(replay[7]!.midis).toEqual([66]);
});
