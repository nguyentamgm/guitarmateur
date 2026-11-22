import { soundBeats } from '../sound';
import { motifOrNoodling } from './motifOrNoodling';

it('compares a repeated motif with a continuous line in the same three-bar window', () => {
  const motif = motifOrNoodling.next(() => 0);
  const values = [0.9, 0];
  const line = motifOrNoodling.next(() => values.shift()!);
  expect(motif).toMatchObject({ answer: 'motif', detail: 'A' });
  expect(line.answer).toBe('noodling');
  for (const question of [motif, line]) {
    expect(soundBeats(question.sound)).toBe(12);
    expect(question.sound.bpm).toBe(88);
    expect(question.compare).toEqual(question.sound);
  }
  const lead = (q: typeof motif) => q.sound.events.filter((event) => !event.mute);
  const backing = (q: typeof motif) => q.sound.events.filter((event) => event.mute);
  expect(backing(motif)).toEqual(backing(line));
  expect(lead(motif).map(({ at, midis, length }) => [at, midis?.[0], length])).toEqual([
    [0, 45, 1],
    [1, 48, 1],
    [2, 52, 1],
    [4, 45, 1],
    [5, 48, 1],
    [6, 52, 1],
    [8, 45, 1],
    [9, 48, 1],
    [10, 45, 2],
  ]);
  const run = lead(line);
  expect(run.map((event) => event.at)).toEqual(Array.from({ length: 24 }, (_, i) => i / 2));
  const figures = run.slice(2).map((_, i) =>
    run
      .slice(i, i + 3)
      .map((event) => event.midis?.[0])
      .join(','),
  );
  expect(new Set(figures).size).toBe(figures.length);
});
