/**
 * What each of the session's and the beginner levels' sounds is, note by note, in seconds from its
 * start (docs/ear.md "Sound"). Pure: the driver hands these to the player with their exact delays.
 */
import { chordMidis } from '@shared/core/audio';
import type { Chord, Key } from '@shared/core/music';
import { STRINGS } from '@shared/core/neck';
import { beatSeconds, clampBpm, strumDelays } from '@shared/core/rhythm';
import { cadence, type CadenceForm } from '../core/context';
import { OPEN_MIDI } from '../core/position';
import { resolutionNoteSeconds, type ResolutionStep } from '../core/resolution';

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

// The beginner levels' sounds (docs/ear-levels.md), all in the guitar voice. Starting values, to
// be judged by ear on real devices (#265): a beginner may need them slower.

/** Two notes (levels 1, 2, 4): each rings TWO_NOTE_BEATS, with TWO_NOTE_GAP_BEATS of silence between. */
export const TWO_NOTE_BEATS = 1;
export const TWO_NOTE_GAP_BEATS = 0.5;
/** A tune (levels 3, 15): a note every TUNE_NOTE_BEATS, each ringing until the next; the last TUNE_LAST_BEATS. */
export const TUNE_NOTE_BEATS = 1;
export const TUNE_LAST_BEATS = 2;
/** One chord (level 5) rings this long from its first note, strummed or arpeggiated. */
export const CHORD_RING_BEATS = 3;
/** Seconds between the strings of a strum: slower than the cadence's, so it is heard as a strum. */
export const STRUM_SPREAD_SEC = 0.02;
/** An arpeggio: a note every ARPEGGIO_NOTE_BEATS, each stopped by the next, so they sound one by one. */
export const ARPEGGIO_NOTE_BEATS = 0.5;
/** A progression (level 6): a strum every PROGRESSION_CHORD_BEATS; the last rings PROGRESSION_LAST_BEATS. */
export const PROGRESSION_CHORD_BEATS = 2;
export const PROGRESSION_LAST_BEATS = 3;
/** After a wrong answer: the pause between what was picked and what it was. */
export const ANSWER_GAP_BEATS = 1;
/** A level's intro: the pause between its examples. */
export const DEMO_GAP_BEATS = 2;
/** The tuning notes (level 15): an open string every TUNING_NOTE_SEC, whatever the tempo. */
export const TUNING_NOTE_SEC = 2.5;

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

/** Two single notes, one after the other. */
export function twoNotesPart(a: number, b: number, bpm: number): Part {
  const length = TWO_NOTE_BEATS * beat(bpm);
  const second = length + TWO_NOTE_GAP_BEATS * beat(bpm);
  return {
    sounds: [
      { kind: 'note', midi: a, time: 0, length },
      { kind: 'note', midi: b, time: second, length },
    ],
    duration: second + length,
  };
}

/** A few notes in a row, the last held. */
export function tunePart(midis: readonly number[], bpm: number): Part {
  const step = TUNE_NOTE_BEATS * beat(bpm);
  const last = TUNE_LAST_BEATS * beat(bpm);
  const sounds = midis.map((midi, i): TimedSound => ({
    kind: 'note',
    midi,
    time: i * step,
    length: i === midis.length - 1 ? last : step,
  }));
  return { sounds, duration: midis.length === 0 ? 0 : (midis.length - 1) * step + last };
}

/** A chord's strings struck together in one down strum, or its notes one by one, low to high. */
export type ChordStyle = 'strum' | 'arpeggio';

/** One down strum from `start`, each string ringing from its pick to `end`. */
const strum = (voicing: readonly number[], start: number, end: number): TimedSound[] =>
  strumDelays(voicing, 'down', STRUM_SPREAD_SEC).map(({ item, delay }) => ({
    kind: 'chord',
    midi: item,
    time: start + delay,
    length: end - start - delay,
  }));

/**
 * One chord, CHORD_RING_BEATS long. `voicing` (MIDI, low to high) is what sounds, so a level can
 * move a chord up the neck; by default `chordMidis(chord)`.
 */
export function chordPart(
  chord: Chord,
  style: ChordStyle,
  bpm: number,
  voicing: readonly number[] = chordMidis(chord),
): Part {
  const ring = CHORD_RING_BEATS * beat(bpm);
  if (style === 'strum') return { sounds: strum(voicing, 0, ring), duration: ring };
  // The last note rings to the end of the chord, or one step if the notes run past it.
  const step = ARPEGGIO_NOTE_BEATS * beat(bpm);
  const lastStart = (voicing.length - 1) * step;
  const end = Math.max(ring, lastStart + step);
  const sounds = voicing.map((midi, i): TimedSound => ({
    kind: 'chord',
    midi,
    time: i * step,
    length: i === voicing.length - 1 ? end - lastStart : step,
  }));
  return { sounds, duration: end };
}

/** Chords strummed one after the other, the last held. */
export function progressionPart(chords: readonly Chord[], bpm: number): Part {
  const step = PROGRESSION_CHORD_BEATS * beat(bpm);
  const last = PROGRESSION_LAST_BEATS * beat(bpm);
  const sounds = chords.flatMap((c, i) => {
    const start = i * step;
    return strum(chordMidis(c), start, start + (i === chords.length - 1 ? last : step));
  });
  return { sounds, duration: chords.length === 0 ? 0 : (chords.length - 1) * step + last };
}

/** Parts played one after the other, and when each starts, so a screen can follow along. */
export interface Sequence extends Part {
  /** Seconds from the start, one per part. */
  readonly starts: readonly number[];
}

/** `parts` one after the other, `gap` seconds of silence between each and the next. */
function sequence(parts: readonly Part[], gap: number): Sequence {
  const starts: number[] = [];
  const sounds: TimedSound[] = [];
  let t = 0;
  parts.forEach((p, i) => {
    if (i > 0) t += gap;
    starts.push(t);
    for (const s of p.sounds) sounds.push({ ...s, time: t + s.time });
    t += p.duration;
  });
  return { sounds, duration: t, starts };
}

/** `parts` one after the other, with no gap (a `waitPart` makes one). */
export const joinParts = (parts: readonly Part[]): Sequence => sequence(parts, 0);

/**
 * A wrong answer, for any kind of question: what the learner picked, a pause, then what it was
 * (two notes, a tune, a chord…). `comparePart` is the old trainer's, for single notes.
 */
export function answerComparePart(picked: Part, right: Part, bpm: number): Sequence {
  return sequence([picked, right], ANSWER_GAP_BEATS * beat(bpm));
}

/** A level's intro: its examples one by one, with a pause between. */
export function demoPart(examples: readonly Part[], bpm: number): Sequence {
  return sequence(examples, DEMO_GAP_BEATS * beat(bpm));
}

/** The six open strings, E A D G B E, slowly and low to high, to tune by ear. */
export function tuningPart(): Part {
  const sounds = STRINGS.map((string, i): TimedSound => ({
    kind: 'note',
    midi: OPEN_MIDI[string],
    time: i * TUNING_NOTE_SEC,
    length: TUNING_NOTE_SEC,
  }));
  return { sounds, duration: STRINGS.length * TUNING_NOTE_SEC };
}

/** Nothing for `beats`. */
export function waitPart(beats: number, bpm: number): Part {
  return { sounds: [], duration: beats * beat(bpm) };
}
