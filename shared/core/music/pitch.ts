/**
 * Spelled pitches. A note is a letter plus an accidental, never a bare pitch class, so that
 * F minor shows B♭ (not A♯) and C°7 shows B𝄫 (not A). See docs/theory-knowledge/m2 (K2.2, K2.5).
 */

export type Letter = 'C' | 'D' | 'E' | 'F' | 'G' | 'A' | 'B';
/** −2 = double flat … +2 = double sharp. */
export type Alter = -2 | -1 | 0 | 1 | 2;

export interface NoteName {
  readonly letter: Letter;
  readonly alter: Alter;
}

/** A spelled note with a scientific-pitch octave: E2 = open 6th string, C4 = middle C = MIDI 60. */
export interface Pitch extends NoteName {
  readonly octave: number;
}

export const LETTERS: readonly Letter[] = ['C', 'D', 'E', 'F', 'G', 'A', 'B'];
const LETTER_PC: Record<Letter, number> = { C: 0, D: 2, E: 4, F: 5, G: 7, A: 9, B: 11 };

export const mod = (n: number, m: number): number => ((n % m) + m) % m;

export function note(letter: Letter, alter: Alter = 0): NoteName {
  return { letter, alter };
}

/**
 * Parse 'C', 'Bb', 'F#', 'Ebb', 'Fx', 'B♭', 'F♯', 'B𝄫', 'F𝄪'. Throws on anything else, so a typo
 * in lesson data fails loudly in tests.
 */
export function parseNote(text: string): NoteName {
  const m = /^([A-G])(bb|b|##|#|x|♭♭|♭|♯♯|♯|𝄫|𝄪)?$/u.exec(text.trim());
  if (!m) throw new SyntaxError(`Not a note name: "${text}"`);
  const acc = m[2] ?? '';
  const alterByAcc: Record<string, Alter> = {
    '': 0, b: -1, '♭': -1, bb: -2, '♭♭': -2, '𝄫': -2, '#': 1, '♯': 1, '##': 2, x: 2, '♯♯': 2, '𝄪': 2,
  };
  return { letter: m[1] as Letter, alter: alterByAcc[acc]! };
}

/** A spelled name in plain ASCII, the inverse of `parseNote`: 'A', 'Bb', 'F#', 'Cbb', 'Gx' → 'G##'. */
export function asciiName(n: NoteName): string {
  return n.letter + (n.alter < 0 ? 'b'.repeat(-n.alter) : '#'.repeat(n.alter));
}

/** Pitch class 0..11 (C = 0). */
export function pc(n: NoteName): number {
  return mod(LETTER_PC[n.letter] + n.alter, 12);
}

/** MIDI number (C4 = 60). */
export function midi(p: Pitch): number {
  return 12 * (p.octave + 1) + LETTER_PC[p.letter] + p.alter;
}

/** 'B♭', 'F♯', 'B𝄫', 'C'. */
export function format(n: NoteName): string {
  const acc = { [-2]: '𝄫', [-1]: '♭', 0: '', 1: '♯', 2: '𝄪' }[n.alter];
  return n.letter + acc;
}

export function sameNote(a: NoteName, b: NoteName): boolean {
  return a.letter === b.letter && a.alter === b.alter;
}

/** Give a spelled name the octave that lands it exactly on `midiValue`. */
export function pitchAt(name: NoteName, midiValue: number): Pitch {
  const octave = (midiValue - (LETTER_PC[name.letter] + name.alter)) / 12 - 1;
  if (!Number.isInteger(octave)) {
    throw new RangeError(`${format(name)} cannot sound at MIDI ${midiValue}`);
  }
  return { ...name, octave };
}

/** Index of a letter in C D E F G A B. */
export function letterIndex(l: Letter): number {
  return LETTERS.indexOf(l);
}

/** Semitones of the natural letter above C (C = 0 … B = 11). */
export function letterSemitone(l: Letter): number {
  return LETTER_PC[l];
}

/** Default spelling for a MIDI note outside any scale context: sharps or flats on black keys. */
export function spellMidi(midiValue: number, prefer: 'sharp' | 'flat' = 'sharp'): Pitch {
  const SHARP: NoteName[] = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'].map(parseNote);
  const FLAT: NoteName[] = ['C', 'Db', 'D', 'Eb', 'E', 'F', 'Gb', 'G', 'Ab', 'A', 'Bb', 'B'].map(parseNote);
  const name = (prefer === 'sharp' ? SHARP : FLAT)[mod(midiValue, 12)]!;
  return pitchAt(name, midiValue);
}
