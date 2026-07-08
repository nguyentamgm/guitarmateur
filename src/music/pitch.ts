import type { Interval } from './interval';

export type Letter = 'C' | 'D' | 'E' | 'F' | 'G' | 'A' | 'B';
export type Alter = -2 | -1 | 0 | 1 | 2;

/** A spelled note name without octave, e.g. B♭ = { letter: 'B', alter: -1 }. */
export interface NoteName {
  letter: Letter;
  alter: Alter;
}

/** A spelled note with a scientific-pitch octave (A2 = open 5th string, C4 = middle C = MIDI 60). */
export interface Pitch extends NoteName {
  octave: number;
}

/** Pitch class 0..11, C = 0. */
export type PitchClass = number;

const LETTERS: Letter[] = ['C', 'D', 'E', 'F', 'G', 'A', 'B'];
/** Pitch class of each natural letter. */
const LETTER_PC: Record<Letter, number> = { C: 0, D: 2, E: 4, F: 5, G: 7, A: 9, B: 11 };

const mod = (n: number, m: number): number => ((n % m) + m) % m;

/** Convenience constructor. */
export function note(letter: Letter, alter: Alter = 0): NoteName {
  return { letter, alter };
}

/** Convenience constructor for a pitch. */
export function pitch(letter: Letter, alter: Alter, octave: number): Pitch {
  return { letter, alter, octave };
}

/** Pitch class (0..11) of a note name, ignoring octave. */
export function pc(n: NoteName): PitchClass {
  return mod(LETTER_PC[n.letter] + n.alter, 12);
}

/** MIDI number of a pitch (C4 = 60). */
export function midi(p: Pitch): number {
  return 12 * (p.octave + 1) + LETTER_PC[p.letter] + p.alter;
}

/** Human-readable spelling using unicode accidentals: 'B♭', 'F♯', 'C'. */
export function format(n: NoteName): string {
  const acc = n.alter > 0 ? '♯'.repeat(n.alter) : n.alter < 0 ? '♭'.repeat(-n.alter) : '';
  return n.letter + acc;
}

/**
 * Transpose a note name up by an interval, preserving correct spelling. Walk `degrees` letters up,
 * then choose the `alter` so the semitone count matches. m3 above F = A♭; d5 above B♭ = F♭.
 * @throws if the required accidental falls outside double-flat…double-sharp (theoretical keys).
 */
export function transpose(n: NoteName, iv: Interval): NoteName {
  const fromIdx = LETTERS.indexOf(n.letter);
  const toIdx = mod(fromIdx + iv.degrees, 7);
  const octShift = Math.floor((fromIdx + iv.degrees) / 7);
  const newLetter = LETTERS[toIdx]!;

  const startAbs = LETTER_PC[n.letter] + n.alter;
  const targetAbs = startAbs + iv.semitones;
  const newLetterAbs = LETTER_PC[newLetter] + 12 * octShift;
  const alter = targetAbs - newLetterAbs;

  if (alter < -2 || alter > 2) {
    throw new RangeError(
      `transpose(${format(n)}, {${iv.degrees},${iv.semitones}}) requires alter ${alter} (out of range)`,
    );
  }
  return { letter: newLetter, alter: alter as Alter };
}

/** Signed pitch class of a note name (may be <0 or >11 for C♭/B♯), as used by `midi`. */
const rawPc = (n: NoteName): number => LETTER_PC[n.letter] + n.alter;

/** Attach the octave that makes a spelled note name land on `midiValue` (C4 = 60). */
export function pitchAt(name: NoteName, midiValue: number): Pitch {
  return { ...name, octave: (midiValue - rawPc(name)) / 12 - 1 };
}

/** Transpose a pitch up by an interval, preserving spelling and computing the resulting octave. */
export function transposePitch(p: Pitch, iv: Interval): Pitch {
  const name = transpose(p, iv);
  const newMidi = midi(p) + iv.semitones;
  const octave = (newMidi - (LETTER_PC[name.letter] + name.alter)) / 12 - 1;
  return { ...name, octave };
}
