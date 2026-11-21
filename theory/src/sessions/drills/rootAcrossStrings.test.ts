import { rootAcrossStrings } from './rootAcrossStrings';

it('gives only the low A as a cue and reveals two octaves across the G–B shift', () => {
  const q = rootAcrossStrings.next(() => 0.75);
  expect(q.detail).toBe('A');
  expect(q.vars).toEqual({ start: 5, middle: 7, high: 10 });
  expect(q.sound.events.map((e) => e.midis)).toEqual([[45]]);
  expect(q.revealSound!.events.map((e) => e.midis)).toEqual([[45], [57], [69]]);
  expect(rootAcrossStrings.next(() => 0.75, q).detail).not.toBe('A');
});
