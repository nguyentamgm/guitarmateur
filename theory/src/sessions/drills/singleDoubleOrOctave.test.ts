import { singleDoubleOrOctave } from './singleDoubleOrOctave';

it('keeps the melody the same for single notes, fourths and octaves, including on the slower replay', () => {
  for (const [pick, answer, intervals] of [
    [0, 'single', [0]],
    [0.5, 'doubleStop', [0, 5]],
    [0.9, 'octave', [0, 12]],
  ] as const) {
    const values = [pick, 0]; // Keep the examples in A.
    const question = singleDoubleOrOctave.next(() => values.shift()!);
    expect(question.answer).toBe(answer);
    expect(question.sound.bpm).toBe(88);
    expect(question.sound.events.map((event) => event.midis)).toEqual(
      [45, 48, 50, 52].map((midi) => intervals.map((interval) => midi + interval)),
    );
    expect(question.compare).toEqual({ bpm: 64, events: question.sound.events });
  }
});
