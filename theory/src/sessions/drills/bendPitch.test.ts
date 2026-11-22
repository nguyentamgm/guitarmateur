import { semisAt } from '../../core/audio';
import { bendPitch } from './bendPitch';

it('sets the flat, matched and sharp landings against a fretted whole-step target', () => {
  for (const [pick, answer, semis] of [
    [0, 'flat', 1.35],
    [0.5, 'inTune', 2],
    [0.9, 'sharp', 2.55],
  ] as const) {
    const choices = [pick, 0, 0]; // 4 → 5 in A minor pentatonic.
    const question = bendPitch.next(() => choices.shift()!);
    expect(question).toMatchObject({ answer, detail: '4 → 5' });
    expect(question.sound.bpm).toBe(60);
    const [reference, bent] = question.sound.events;
    expect(reference).toEqual({ at: 0, length: 0.8, midis: [64] });
    expect(bent).toMatchObject({ at: 1, length: 1.2, midis: [62] });
    expect(semisAt(bent!.glide!, 0.15)).toBe(0);
    expect(semisAt(bent!.glide!, 1)).toBe(semis);

    expect(question.compare!.events[0]).toEqual(reference);
    expect(question.compare!.events[1]!.midis).toEqual(bent!.midis);
    expect(semisAt(question.compare!.events[1]!.glide!, 1)).toBe(2);
  }
});
