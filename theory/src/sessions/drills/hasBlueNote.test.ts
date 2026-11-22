import { hasBlueNote } from './hasBlueNote';

it('compares a chromatic blue-note phrase with a pentatonic phrase in the same box and direction', () => {
  const ascending = [0, 0, 0.9]; // With ♭5, A, up.
  const descending = [0.9, 0.4, 0]; // Plain pentatonic, G, down.
  const withBlue = hasBlueNote.next(() => ascending.shift()!);
  const plain = hasBlueNote.next(() => descending.shift()!);

  expect(withBlue).toMatchObject({ answer: 'withBlue', detail: 'A' });
  expect(withBlue.compare!.events.map((e) => e.midis?.[0])).toEqual([
    45, 48, 50, 52, 55, 45, 48, 50, 51, 52,
  ]);
  expect(plain).toMatchObject({ answer: 'plain', detail: 'G' });
  expect(plain.compare!.events.map((e) => e.midis?.[0])).toEqual([
    50, 49, 48, 46, 43, 53, 50, 48, 46, 43,
  ]);
});
