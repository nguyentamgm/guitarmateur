import { callAndResponse } from './callAndResponse';

it('leaves beat four empty and holds the root only in a resolving response', () => {
  const response = callAndResponse.next(() => 0);
  const values = [0.9, 0, 0]; // Repeat the same A minor example.
  const repeat = callAndResponse.next(() => values.shift()!);
  const events = (question: typeof response) =>
    question.sound.events.map(({ at, length, midis }) => [at, length, midis?.[0]] as const);

  expect(response).toMatchObject({ answer: 'response', detail: 'A' });
  expect(events(response)).toEqual([
    [0, 1, 45],
    [1, 1, 48],
    [2, 1, 50],
    [4, 1, 50],
    [5, 1, 48],
    [6, 2, 45],
  ]);
  expect(repeat.answer).toBe('repeat');
  expect(events(repeat).slice(3)).toEqual(
    events(response)
      .slice(0, 3)
      .map(([at, length, midi]) => [at + 4, length, midi]),
  );
  expect(response.compare).toEqual(response.sound);
  expect(repeat.compare).toEqual(repeat.sound);
});
