import { expect, it } from 'vitest';
import { pentatonicOrMajor } from './pentatonicOrMajor';

it('matches register and rhythm and compares the other scale before repeating the question', () => {
  const first = pentatonicOrMajor.next(() => 0);
  const second = pentatonicOrMajor.next(() => 0, { ...first, run: 2 });
  expect([first.answer, second.answer]).toEqual(['pentatonic', 'majorScale']);
  for (const [question, other, intervals] of [
    [first, second, [0, 3, 5, 7, 10, 12]],
    [second, first, [0, 2, 4, 5, 7, 12]],
  ] as const) {
    const events = question.sound.events;
    expect(events.map((e) => e.midis![0]! - events[0]!.midis![0]!)).toEqual(intervals);
    expect(events.map((e) => e.at)).toEqual([0, 1, 2, 3, 4, 5]);
    expect(question.compare!.events.map((e) => e.midis)).toEqual(
      [...other.sound.events, ...events].map((e) => e.midis),
    );
  }
});
