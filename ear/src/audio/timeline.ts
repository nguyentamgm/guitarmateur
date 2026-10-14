/**
 * What each of the session's sounds is, note by note, in seconds from its start (docs/ear.md
 * "Sound"). Pure: the driver hands these to the player with their exact delays.
 */
import type { Key } from '@shared/core/music';
import { beatSeconds, clampBpm } from '@shared/core/rhythm';
import { cadence, type CadenceForm } from '../core/context';
import { resolutionNoteSeconds, type ResolutionStep } from '../core/resolution';

/** The voice of single notes (the question, the comparison, the walk home, the tonic): the cadence's chords are always guitar. */
export type Voice = 'guitar' | 'clean';

export interface TimedSound {
  readonly kind: 'chord' | 'note' | 'click';
  /** MIDI; none for a click. */
  readonly midi?: number;
  /** Seconds from the part's start. */
  readonly time: number;
  /** How long it rings; none for a click. */
  readonly length?: number;
}

/** A stretch of sound: its notes, and how long until the next part may start. */
export interface Part {
  readonly sounds: readonly TimedSound[];
  readonly duration: number;
}

/** Beats the question note (and a replay of it, or of the tonic) rings. */
export const NOTE_BEATS = 2;
/** The comparison: the note picked for a beat, a half-beat gap, the right note for a beat, a half-beat rest. */
export const COMPARE_NOTE_BEATS = 1;
export const COMPARE_GAP_BEATS = 0.5;
/** The walk home's last note, the tonic, rings this many beats; the others are eighths. */
export const RESOLUTION_LAST_BEATS = 1;

const beat = (bpm: number) => beatSeconds(clampBpm(bpm));

/** The cadence, strummed on the guitar, then its tonic at `tonic` in the note voice. */
export function contextPart(
  key: Key,
  tonic: number,
  bpm: number,
  form: CadenceForm = 'full',
): Part {
  const c = cadence(key, bpm, form, tonic);
  const chords = c.chords.flatMap((step) =>
    step.notes.map((n): TimedSound => ({
      kind: 'chord',
      midi: n.midi,
      time: n.time,
      length: n.duration,
    })),
  );
  return {
    sounds: [
      ...chords,
      { kind: 'note', midi: c.tonic.midi, time: c.tonic.time, length: c.tonic.duration },
    ],
    duration: c.duration,
  };
}

/** One note, NOTE_BEATS long. */
export function notePart(midi: number, bpm: number): Part {
  const length = NOTE_BEATS * beat(bpm);
  return { sounds: [{ kind: 'note', midi, time: 0, length }], duration: length };
}

/** A wrong answer: the note picked, a gap, the right note, a rest. */
export function comparePart(answer: number, right: number, bpm: number): Part {
  const b = beat(bpm);
  const length = COMPARE_NOTE_BEATS * b;
  const second = length + COMPARE_GAP_BEATS * b;
  return {
    sounds: [
      { kind: 'note', midi: answer, time: 0, length },
      { kind: 'note', midi: right, time: second, length },
    ],
    duration: second + length + COMPARE_GAP_BEATS * b,
  };
}

/** The walk home: an eighth each, the closing tonic RESOLUTION_LAST_BEATS. */
export function resolutionPart(steps: readonly ResolutionStep[], bpm: number): Part {
  const eighth = resolutionNoteSeconds(bpm);
  const last = RESOLUTION_LAST_BEATS * beat(bpm);
  const sounds = steps.map((s, i): TimedSound => ({
    kind: 'note',
    midi: s.midi,
    time: i * eighth,
    length: i === steps.length - 1 ? last : eighth,
  }));
  return { sounds, duration: Math.max(0, steps.length - 1) * eighth + last };
}

/** Nothing for `beats`. */
export function waitPart(beats: number, bpm: number): Part {
  return { sounds: [], duration: beats * beat(bpm) };
}

/** A right answer when there is no walk home: one soft accented click. */
export const RIGHT_CLICK: Part = { sounds: [{ kind: 'click', time: 0 }], duration: 0 };
