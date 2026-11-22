import { sequenceKind } from './sequenceKind';

it('plays the box 1 patterns and repeats the same notes at a slower tempo', () => {
  const cases = [
    [0, 'straight', [45, 48, 50, 52, 55, 57, 60, 62]],
    [0.5, 'threes', [45, 48, 50, 48, 50, 52, 50, 52, 55]],
    [0.9, 'skips', [45, 50, 48, 52, 50, 55, 52, 57]],
  ] as const;
  for (const [pick, answer, midis] of cases) {
    const values = [pick, 0]; // Pick the pattern, then A minor.
    const question = sequenceKind.next(() => values.shift()!);
    expect(question.answer).toBe(answer);
    expect(question.detail).toBe('A');
    expect(question.sound.bpm).toBe(110);
    expect(question.sound.events.map((event) => event.midis?.[0])).toEqual(midis);
    expect(question.compare).toEqual({ bpm: 80, events: question.sound.events });
  }
});

it('asks for a different pattern after two answers of the same kind', () => {
  const first = sequenceKind.next(() => 0);
  const second = sequenceKind.next(() => 0, first);
  const third = sequenceKind.next(() => 0, second);
  expect(second.answer).toBe(first.answer);
  expect(third.answer).not.toBe(first.answer);
});
