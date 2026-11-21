import { soundBeats } from '../sound';
import { dupleOrTripletRun } from './dupleOrTripletRun';

it('keeps four clicks and one scale while changing the number of notes per beat', () => {
  const question = dupleOrTripletRun.next(() => 0);
  const eighths = question.sound.events;
  const triplets = question.compare!.events.slice(0, 12);
  expect(question.sound.bpm).toBe(76);
  expect(soundBeats(question.sound)).toBe(4);
  expect(eighths.map((event) => event.at)).toEqual(Array.from({ length: 8 }, (_, i) => i / 2));
  expect(triplets.map((event) => event.at)).toEqual(Array.from({ length: 12 }, (_, i) => i / 3));
  for (const run of [eighths, triplets]) {
    expect(run.filter((event) => event.click).map(({ at, click }) => [at, click])).toEqual([
      [0, 'accent'],
      [1, 'plain'],
      [2, 'plain'],
      [3, 'plain'],
    ]);
  }
  expect(triplets.slice(0, 8).map((event) => event.midis)).toEqual(
    eighths.map((event) => event.midis),
  );
  expect(question.compare!.events.slice(12).map((event) => event.at)).toEqual(
    eighths.map((event) => event.at + 5),
  );
});
