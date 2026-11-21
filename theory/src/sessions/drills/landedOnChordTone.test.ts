import { landedOnChordTone } from './landedOnChordTone';

it('compares a held chord tone with an outside note over the same chord and approach', () => {
  const choices = [0, 0, 0.5, 0]; // Am, ♭3 against 4.
  const question = landedOnChordTone.next(() => choices.shift()!);
  const events = question.sound.events;
  expect(question).toMatchObject({ answer: 'chordTone', detail: 'Am (♭3)' });
  expect(events[0]).toMatchObject({ at: 0, length: 3, strum: true });
  expect(events.slice(1).map((event) => event.at)).toEqual([0.5, 1, 1.5]);
  expect(events[3]).toEqual({ at: 1.5, midis: [72], length: 2 });

  const replay = question.compare!.events;
  expect(replay.slice(0, 3)).toEqual(events.slice(0, 3));
  expect(replay[3]).toEqual({ at: 1.5, midis: [74], length: 2 });
  expect(replay.slice(4).map((event) => event.midis)).toEqual(events.map((event) => event.midis));
});
