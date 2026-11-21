import { glideEnd, semisAt } from '../../core/audio';
import { pickOrLegato } from './pickOrLegato';

it('compares distinct pick attacks, a pitch jump and a slide between the same two notes', () => {
  const ask = (answer: number, direction: number) => {
    const choices = [answer, 0, direction];
    return pickOrLegato.next(() => choices.shift()!);
  };
  const picked = ask(0, 0);
  const legato = ask(0.5, 0);
  const slide = ask(0.9, 0.9);

  expect(picked.sound.events).toEqual([
    { at: 0, length: 0.7, midis: [50] },
    { at: 0.75, length: 1, midis: [52] },
  ]);
  expect(legato.sound.events.map((e) => e.midis)).toEqual([[50]]);
  const jump = legato.sound.events[0]!.glide!;
  expect(semisAt(jump, 0.39)).toBe(0);
  expect(semisAt(jump, 0.4)).toBe(2);

  expect(slide.sound.events.map((e) => e.midis)).toEqual([[52]]);
  const move = slide.sound.events[0]!.glide!;
  expect(semisAt(move, 0.425)).toBeCloseTo(-1);
  expect(semisAt(move, 0.55)).toBe(-2);
  const slowMove = slide.compare!.events[0]!.glide!;
  expect(slide.compare!.bpm).toBeLessThan(slide.sound.bpm);
  expect(glideEnd(slowMove)).toBeGreaterThan(glideEnd(move));
  expect(semisAt(slowMove, 1)).toBe(-2);
});
