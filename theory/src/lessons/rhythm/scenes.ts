/**
 * What each scene of "Rhythm Without Sheet Music" plays, derived from the core: lengths and
 * counts from `core/rhythm`, pitches from `core/fretboard`. No fret or duration is typed by hand.
 */
import { STRINGS, midiAt, openMidi, type FretPos, type StringNumber } from '../../core/fretboard';
import {
  CELLS_PER_BEAT,
  NOTE_CELLS,
  parseStrum,
  type NoteValueId,
  type PerBeat,
  type Slot,
} from '../../core/rhythm';

/** Pitch of the single-note examples: the open A string one octave up (string 3, fret 2). */
export const NOTE_MIDI = midiAt({ string: 3, fret: 2 });

export const DEFAULT_BPM = { beat: 80, lengths: 80, counting: 70, strum: 80, fingers: 60 } as const;

// --- Step 2: lengths (K1.2) ---

/** Note values offered in the lengths scene, longest first. */
export const LENGTH_CHOICES: readonly NoteValueId[] = ['whole', 'dottedHalf', 'half', 'quarter', 'eighth', 'sixteenth'];

/** Index of the slot that starts at each cell, or -1. */
export function slotStarts(slots: readonly Slot[], cells: number): number[] {
  const out = Array.from({ length: cells }, () => -1);
  slots.forEach((s, i) => (out[s.start] = i));
  return out;
}

/** '4', '3', '1½', '½', '¼': beats as a guitarist says them. */
export function beatsText(cells: number): string {
  const whole = Math.floor(cells / CELLS_PER_BEAT);
  const frac = { 0: '', 1: '¼', 2: '½', 3: '¾' }[cells % CELLS_PER_BEAT as 0 | 1 | 2 | 3];
  return whole === 0 ? frac : `${whole}${frac}`;
}

export const noteBeats = (id: NoteValueId): string => beatsText(NOTE_CELLS[id]);

// --- Step 3: counting (K1.3) ---

export type CountLevel = 'beats' | 'eighths' | 'sixteenths';
export const COUNT_LEVELS: readonly CountLevel[] = ['beats', 'eighths', 'sixteenths'];
export const PER_BEAT_OF: Readonly<Record<CountLevel, PerBeat>> = { beats: 1, eighths: 2, sixteenths: 4 };

// --- Step 4: strumming (K1.4) ---

export type StrumPresetId = 'downs' | 'downUp' | 'folk';
export const STRUM_PRESETS: Readonly<Record<StrumPresetId, string>> = {
  downs: 'D-D-D-D-',
  downUp: 'DUDUDUDU',
  folk: 'D-DU-UDU',
};
export const STRUM_PRESET_IDS = Object.keys(STRUM_PRESETS) as StrumPresetId[];
export const presetHits = (id: StrumPresetId): boolean[] => parseStrum(STRUM_PRESETS[id]);

/** Strings a down strum crosses (all six) and an up strum catches (the three thinnest), low first. */
export const DOWN_STRINGS: readonly StringNumber[] = STRINGS;
export const UP_STRINGS: readonly StringNumber[] = STRINGS.filter((s) => s <= 3);
export const openNote = (s: StringNumber): number => openMidi(s);

// --- Step 5: finger drill (K0.8) ---

export interface DrillNote extends FretPos {
  readonly midi: number;
  /** 1 = index … 4 = little finger: one finger per fret. */
  readonly finger: 1 | 2 | 3 | 4;
}

export const DRILL_START_FRETS: readonly number[] = [5, 1];

/** Fingers 1-2-3-4 on four frets from `startFret`, string 6 to string 1. */
export function fingerDrill(startFret: number): DrillNote[] {
  return STRINGS.flatMap((string) =>
    ([1, 2, 3, 4] as const).map((finger) => {
      const pos = { string, fret: startFret + finger - 1 };
      return { ...pos, midi: midiAt(pos), finger };
    }),
  );
}
