import { fretsOf, midiAt, type StringNumber } from '../core/fretboard';
import { parseNote, scaleSemitones, type NoteName } from '../core/music';
import type { Sound, SoundEvent } from './sound';

export const ECHO_BPM = 70;

/** Fret of each major-scale degree 1..8 on `string`, counted up from the tonic's lowest fret on that string. */
export function echoFrets(tonic: NoteName | string, string: StringNumber): number[] {
  const note = typeof tonic === 'string' ? parseNote(tonic) : tonic;
  const base = fretsOf(note, string)[0]!;
  const semitones = scaleSemitones('major');
  return [...semitones.map((s) => base + s), base + 12];
}

const VALID_DELTAS = [-2, -1, 1, 2] as const;

/** A phrase that starts on degree 1 and moves by 1 or 2 scale steps, staying within degrees 1–5. */
export function randomPhrase(
  random: () => number,
  notes: 3 | 4,
  previous?: readonly number[],
): number[] {
  const sameAsPrevious = (phrase: readonly number[]) =>
    previous !== undefined &&
    phrase.length === previous.length &&
    phrase.every((deg, i) => deg === previous[i]);

  const generate = (): number[] => {
    const phrase = [1];
    for (let i = 1; i < notes; i++) {
      const current = phrase[i - 1]!;
      const candidates = VALID_DELTAS.map((delta) => current + delta).filter(
        (next) => next >= 1 && next <= 5,
      );
      const chosen =
        candidates[Math.min(candidates.length - 1, Math.floor(random() * candidates.length))]!;
      phrase.push(chosen);
    }
    return phrase;
  };

  for (let tries = 0; tries < 50; tries++) {
    const phrase = generate();
    if (!sameAsPrevious(phrase)) return phrase;
  }
  return generate();
}

export type TapResult = 'right' | 'higher' | 'lower'; // 'higher' = the wanted note is higher than the tap

export function judgeTap(wantedDegree: number, tappedDegree: number): TapResult {
  if (wantedDegree === tappedDegree) return 'right';
  return wantedDegree > tappedDegree ? 'higher' : 'lower';
}

export function phraseSound(
  tonic: NoteName | string,
  string: StringNumber,
  phrase: readonly number[],
  bpm: number,
): Sound {
  const frets = echoFrets(tonic, string);
  const events: SoundEvent[] = phrase.map((deg, i) => ({
    at: i,
    midis: [midiAt({ string, fret: frets[deg - 1]! })],
    length: 1,
  }));
  return { bpm, events };
}
