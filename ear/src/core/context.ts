/** The key context: a cadence that sets the key, then the tonic; and a drone (docs/ear.md "Music rules"). */
import { chordMidis } from '@shared/core/audio';
import { diatonicChords, romanFor, type Chord, type Key } from '@shared/core/music';
import { beatSeconds, strumDelays } from '@shared/core/rhythm';
import { midiOf } from './degrees';

/** 'full' is I–IV–V7–I (i–iv–V7–i in minor); 'short' is I–V7–I, for when the full one gets tiring. */
export type CadenceForm = 'full' | 'short';

const FORM_DEGREES: Readonly<Record<CadenceForm, readonly number[]>> = { full: [1, 4, 5, 1], short: [1, 5, 1] };

export interface CadenceChord {
  /** 1..7 */
  readonly degree: number;
  readonly chord: Chord;
  /** 'I', 'iv', 'V7' … */
  readonly roman: string;
}

/**
 * The cadence's chords from the key's diatonic triads, with V as the degree-5 root plus dom7:
 * major triads give a plain V and natural minor a minor v, neither of which is a V7.
 */
export function cadenceChords(key: Key, form: CadenceForm = 'full'): CadenceChord[] {
  const triads = diatonicChords(key);
  return FORM_DEGREES[form].map((degree) => {
    const d = triads[degree - 1]!;
    return degree === 5 ? { degree, chord: { root: d.chord.root, id: 'dom7' }, roman: romanFor(5, 'dom7') } : d;
  });
}

/** A note to sound: MIDI number, start and length in seconds from the start of the context. */
export interface ContextNote {
  readonly midi: number;
  readonly time: number;
  readonly duration: number;
}

export interface CadenceStep extends CadenceChord {
  /** Seconds from the start. */
  readonly start: number;
  readonly duration: number;
  /** The strum, low to high: each string rings from its delay to the chord's end. */
  readonly notes: readonly ContextNote[];
}

export interface Cadence {
  readonly chords: readonly CadenceStep[];
  /** The tonic alone, after the last chord. */
  readonly tonic: ContextNote;
  /** Seconds until the tonic ends. */
  readonly duration: number;
}

/** Beats each chord lasts: one, and two for the last. The tonic after it lasts one. */
export const CHORD_BEATS = 1;
export const LAST_CHORD_BEATS = 2;
export const TONIC_BEATS = 1;

/**
 * Octave of the tonic note, until the register is a setting (#217): 4 puts it at MIDI 60–71.
 * The question's own register comes from the same setting.
 */
export const TONIC_OCTAVE = 4;

/** The cadence as a timeline at `bpm`: one down-strummed chord per beat, the last for two, then the tonic. */
export function cadence(key: Key, bpm: number, form: CadenceForm = 'full'): Cadence {
  const beat = beatSeconds(bpm);
  const list = cadenceChords(key, form);
  let start = 0;
  const chords = list.map((c, i): CadenceStep => {
    const duration = (i === list.length - 1 ? LAST_CHORD_BEATS : CHORD_BEATS) * beat;
    const notes = strumDelays(chordMidis(c.chord), 'down').map(({ item, delay }) => ({
      midi: item,
      time: start + delay,
      duration: duration - delay,
    }));
    const step = { ...c, start, duration, notes };
    start += duration;
    return step;
  });
  const tonic = { midi: midiOf(key, '1', TONIC_OCTAVE), time: start, duration: TONIC_BEATS * beat };
  return { chords, tonic, duration: start + tonic.duration };
}
