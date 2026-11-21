import { octaveOrFifth } from './octaveOrFifth';

it('compares the fifth and octave above the same bass, separately then together', () => {
  const first = octaveOrFifth.next(() => 0);
  const other = octaveOrFifth.next(() => 0, { ...first, run: 2 });
  expect([first.answer, other.answer]).toEqual(['octave', 'fifth']);
  const pitches = (q: typeof first) => q.sound.events.map((e) => e.midis);
  expect(pitches(first)).toEqual([[40], [52], [40, 52]]);
  expect(pitches(other)).toEqual([[40], [47], [40, 47]]);
  expect(first.compare!.events.map((e) => e.midis)).toEqual([...pitches(other), ...pitches(first)]);
});
