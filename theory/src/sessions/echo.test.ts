import { describe, expect, it } from 'vitest';
import { mulberry32 } from '@shared/core/rng';
import { echoFrets, judgeTap, phraseSound, randomPhrase } from './echo';

describe('echoFrets', () => {
  it('returns [0, 2, 4, 5, 7, 9, 11, 12] for G on string 3', () => {
    expect(echoFrets('G', 3)).toEqual([0, 2, 4, 5, 7, 9, 11, 12]);
  });
});

describe('randomPhrase', () => {
  it('always starts with 1, stays in degrees 1–5, moves by 1–2 scale steps, and has requested length', () => {
    const rng = mulberry32(12345);
    for (const notes of [3, 4] as const) {
      for (let i = 0; i < 100; i++) {
        const phrase = randomPhrase(rng, notes);
        expect(phrase.length).toBe(notes);
        expect(phrase[0]).toBe(1);
        for (const deg of phrase) {
          expect(deg).toBeGreaterThanOrEqual(1);
          expect(deg).toBeLessThanOrEqual(5);
        }
        for (let j = 1; j < phrase.length; j++) {
          const step = Math.abs(phrase[j]! - phrase[j - 1]!);
          expect(step === 1 || step === 2).toBe(true);
        }
      }
    }
  });

  it('differs from the previous phrase', () => {
    const rng = mulberry32(54321);
    let prev: number[] | undefined;
    for (let i = 0; i < 100; i++) {
      const phrase = randomPhrase(rng, 3, prev);
      if (prev) {
        const isIdentical =
          phrase.length === prev.length && phrase.every((deg, idx) => deg === prev![idx]);
        expect(isIdentical).toBe(false);
      }
      prev = phrase;
    }
  });
});

describe('judgeTap', () => {
  it('returns "higher" when the wanted note is higher than the tap', () => {
    expect(judgeTap(3, 2)).toBe('higher');
  });

  it('returns "lower" when the wanted note is lower than the tap', () => {
    expect(judgeTap(3, 5)).toBe('lower');
  });

  it('returns "right" when the tap matches the wanted note', () => {
    expect(judgeTap(3, 3)).toBe('right');
  });
});

describe('phraseSound', () => {
  it('creates one note per beat at the specified bpm', () => {
    const sound = phraseSound('G', 3, [1, 2, 3], 70);
    expect(sound.bpm).toBe(70);
    expect(sound.events.length).toBe(3);
    expect(sound.events[0]).toEqual({
      at: 0,
      midis: [55], // G3 is MIDI 55 (open string 3)
      length: 1,
    });
    expect(sound.events[1]).toEqual({
      at: 1,
      midis: [57], // A3 is MIDI 57 (fret 2 of string 3)
      length: 1,
    });
    expect(sound.events[2]).toEqual({
      at: 2,
      midis: [59], // B3 is MIDI 59 (fret 4 of string 3)
      length: 1,
    });
  });
});
