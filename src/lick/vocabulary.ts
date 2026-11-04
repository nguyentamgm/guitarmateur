import type { QualityId, ToneRole } from '../music';
import type { LickParams, Technique } from './model';

/*
 * The lick vocabulary: phrases guitar players actually use, written down once as data and then
 * fitted to the moment — key, chord, box, level — by `realize.ts`, instead of generating every
 * lick note by note from rules.
 *
 * A phrase is written in *musical* terms, never as frets, so the same phrase plays in any key, on
 * any box, in any octave (the fretboard rule "no hardcoded shape tables" holds: the fingering is
 * still worked out algorithmically). Each note's pitch is one of:
 *
 * - `{ s }`       semitones above the phrase's reference: the key's tonic (`ref: 'key'`, for blues
 *                 vocabulary that is played over the whole progression) or the chord's root
 *                 (`ref: 'chord'`, for lines that outline the chord)
 * - `{ ct }`      a chord tone of the current chord, the one nearest the note before
 * - `{ step }`    so many notes up (+) or down (−) the box's scale from the note before
 * - `{ above }`   the scale note just above the next note (the top of an enclosure)
 * - `{ below }`   the half step below the next note: a chromatic approach
 * - `{ target }`  the landing: the chord tone the player asked to target, nearest the note before
 *
 * …or is implied by the technique: a bend sounds a half or whole step above the note before it,
 * a release returns to the pitch the bend started from.
 *
 * Techniques, double stops and vibrato are part of a phrase only where they are part of the idiom.
 * Most phrases have none: a lick does not need a bend to be a lick.
 */

export type PitchSpec =
  | { readonly s: number }
  | { readonly ct: ToneRole }
  | { readonly step: number }
  | { readonly above: true }
  | { readonly below: true }
  | { readonly target: true };

export interface PhraseNote {
  /** Start, in beats from the phrase's start. */
  readonly at: number;
  readonly dur: number;
  /** Omitted for a bend or release, whose pitch follows from the note before. */
  readonly p?: PitchSpec;
  readonly tech?: Technique;
  /** Outside the scale on purpose (a passing or approach note). Must move by half step. */
  readonly chromatic?: boolean;
  readonly vibrato?: boolean;
  /** Double stop: a second note this many semitones above, on the next string up. */
  readonly partner?: number;
}

export type PhraseKind =
  | 'run'
  | 'bend'
  | 'bendRelease'
  | 'doubleStop'
  | 'callResponse'
  | 'turnaround'
  | 'resolution'
  | 'motif'
  | 'space';

export interface Phrase {
  readonly id: string;
  readonly kind: PhraseKind;
  readonly ref: 'key' | 'chord';
  /** 4 or 8 beats. Every phrase ends exactly there, on its landing note. */
  readonly beats: 4 | 8;
  /** Lowest level it is offered at (techniques are dropped below level 3 either way). */
  readonly minLevel: LickParams['level'];
  /** Chord qualities it suits; omitted = any. */
  readonly qualities?: readonly QualityId[];
  readonly notes: readonly PhraseNote[];
}

// Small builders keep the table readable: n(start, duration, pitch, extras).
type Extra = Omit<PhraseNote, 'at' | 'dur' | 'p'>;
const n = (at: number, dur: number, p: PitchSpec | number | undefined, extra: Extra = {}): PhraseNote => ({
  at,
  dur,
  ...(p === undefined ? {} : { p: typeof p === 'number' ? { s: p } : p }),
  ...extra,
});
const T: PitchSpec = { target: true };
const ct = (role: ToneRole): PitchSpec => ({ ct: role });
const step = (k: number): PitchSpec => ({ step: k });
const ABOVE: PitchSpec = { above: true };
const BELOW: PitchSpec = { below: true };

const DOMINANT_OR_MAJOR: readonly QualityId[] = ['dom7', 'M', 'M7'];
const MINOR: readonly QualityId[] = ['m', 'm7'];

/*
 * Semitones in the key-relative phrases, for A minor: 0 = A (root), 3 = C (♭3), 5 = D (4),
 * 6 = E♭ (♭5), 7 = E (5), 10 = G (♭7), 12 = A an octave up, −2 = G below the root.
 */
export const PHRASES: readonly Phrase[] = [
  // ── Runs ────────────────────────────────────────────────────────────────────────────────────
  {
    id: 'minor-descent',
    kind: 'run',
    ref: 'key',
    beats: 4,
    minLevel: 2,
    notes: [n(0, 0.5, 15), n(0.5, 0.5, 12), n(1, 0.5, 10), n(1.5, 0.5, 7), n(2, 0.5, 5), n(2.5, 0.5, 3), n(3, 1, T)],
  },
  {
    id: 'rock-climb',
    kind: 'run',
    ref: 'key',
    beats: 4,
    minLevel: 2,
    notes: [n(0, 0.5, 0), n(0.5, 0.5, 3), n(1, 0.5, 5), n(1.5, 0.5, 7), n(2, 0.5, 10), n(2.5, 0.5, 12), n(3, 1, T)],
  },
  {
    // Groups of four, each starting one note higher — the classic rock sequence.
    id: 'rock-sixteenth-climb',
    kind: 'run',
    ref: 'key',
    beats: 4,
    minLevel: 4,
    notes: [
      n(0, 0.25, 0), n(0.25, 0.25, 3), n(0.5, 0.25, 5), n(0.75, 0.25, 7),
      n(1, 0.25, 3), n(1.25, 0.25, 5), n(1.5, 0.25, 7), n(1.75, 0.25, 10),
      n(2, 0.5, 7), n(2.5, 0.5, 10), n(3, 1, T, { vibrato: true }),
    ],
  },
  {
    // Pedal tone: the high root keeps coming back between a falling line.
    id: 'pedal-root',
    kind: 'run',
    ref: 'key',
    beats: 4,
    minLevel: 3,
    notes: [n(0, 0.5, 12), n(0.5, 0.5, 10), n(1, 0.5, 12), n(1.5, 0.5, 7), n(2, 0.5, 12), n(2.5, 0.5, 5), n(3, 1, T)],
  },

  {
    // Six-note rolls in 16ths: the same three notes cycled, then down to the landing.
    id: 'sixteenth-roll',
    kind: 'run',
    ref: 'key',
    beats: 4,
    minLevel: 5,
    notes: [
      n(0, 0.25, 12), n(0.25, 0.25, 10), n(0.5, 0.25, 7), n(0.75, 0.25, 12),
      n(1, 0.25, 10), n(1.25, 0.25, 7), n(1.5, 0.25, 12), n(1.75, 0.25, 10),
      n(2, 0.5, 7), n(2.5, 0.5, 5), n(3, 1, T),
    ],
  },
  {
    id: 'pickup-run',
    kind: 'run',
    ref: 'key',
    beats: 4,
    minLevel: 2,
    notes: [n(0.5, 0.5, 3), n(1, 0.5, 5), n(1.5, 0.5, 7), n(2, 2, T)],
  },
  {
    id: 'climb-home',
    kind: 'run',
    ref: 'key',
    beats: 4,
    minLevel: 1,
    notes: [n(0, 1, 3), n(1, 1, 5), n(2, 1, 7), n(3, 1, T)],
  },

  // ── Bends ───────────────────────────────────────────────────────────────────────────────────
  {
    // Bend the 4th up to the 5th and shake it, then walk down home.
    id: 'four-to-five-bend',
    kind: 'bend',
    ref: 'key',
    beats: 4,
    minLevel: 3,
    notes: [n(0.5, 0.5, 5), n(1, 1, undefined, { tech: 'bendFull', vibrato: true }), n(2, 0.5, 3), n(2.5, 0.5, 0), n(3, 1, T)],
  },
  {
    // ♭7 bent up to the root — the other bend every blues player knows.
    id: 'seven-to-root-bend',
    kind: 'bend',
    ref: 'key',
    beats: 4,
    minLevel: 3,
    notes: [n(0.5, 0.5, 10), n(1, 1, undefined, { tech: 'bendFull', vibrato: true }), n(2, 0.5, 10), n(2.5, 0.5, 7), n(3, 1, T)],
  },
  {
    // The "curl": the chord's minor 3rd bent a little toward its major 3rd, over a major or 7th
    // chord. Chord-relative: over a IV or ♭VI chord the key's ♭3 would clash.
    id: 'minor-third-curl',
    kind: 'bend',
    ref: 'chord',
    beats: 4,
    minLevel: 3,
    qualities: DOMINANT_OR_MAJOR,
    notes: [n(0, 0.5, 0), n(0.5, 0.5, 3), n(1, 1, undefined, { tech: 'bendHalf' }), n(2, 0.5, undefined, { tech: 'release' }), n(2.5, 0.5, 0), n(3, 1, T)],
  },
  {
    // A fast run down into the 4th, bent up to the 5th at the end of the burst.
    id: 'sixteenth-run-to-bend',
    kind: 'bend',
    ref: 'key',
    beats: 4,
    minLevel: 5,
    notes: [
      n(0, 0.25, 15), n(0.25, 0.25, 12), n(0.5, 0.25, 10), n(0.75, 0.25, 12),
      n(1, 0.25, 10), n(1.25, 0.25, 7), n(1.5, 0.25, 10), n(1.75, 0.25, 7),
      n(2, 0.5, 5), n(2.5, 0.5, undefined, { tech: 'bendFull', vibrato: true }), n(3, 1, T),
    ],
  },
  {
    // The bend lands off the beat and is held across it: a pushed, vocal phrase.
    id: 'pushed-bend',
    kind: 'bend',
    ref: 'key',
    beats: 4,
    minLevel: 4,
    notes: [n(0.5, 0.5, 5), n(1, 1.5, undefined, { tech: 'bendFull', vibrato: true }), n(2.5, 0.5, 3), n(3, 1, T)],
  },
  {
    id: 'fast-bend-release',
    kind: 'bendRelease',
    ref: 'key',
    beats: 4,
    minLevel: 5,
    notes: [
      n(0, 0.25, 7), n(0.25, 0.25, 10), n(0.5, 0.5, 12), n(1, 0.5, 10),
      n(1.5, 0.5, undefined, { tech: 'bendFull' }), n(2, 0.5, undefined, { tech: 'release' }), n(2.5, 0.5, 7), n(3, 1, T),
    ],
  },
  {
    id: 'bend-release-descent',
    kind: 'bendRelease',
    ref: 'key',
    beats: 4,
    minLevel: 3,
    notes: [
      n(0, 0.5, 5), n(0.5, 1, undefined, { tech: 'bendFull' }), n(1.5, 0.5, undefined, { tech: 'release' }),
      n(2, 0.5, 3), n(2.5, 0.5, 0), n(3, 1, T, { vibrato: true }),
    ],
  },
  {
    id: 'high-bend-release',
    kind: 'bendRelease',
    ref: 'key',
    beats: 4,
    minLevel: 3,
    notes: [
      n(0, 1, 10), n(1, 0.5, undefined, { tech: 'bendFull' }), n(1.5, 0.5, undefined, { tech: 'release' }),
      n(2, 0.5, 7), n(2.5, 0.5, 5), n(3, 1, T),
    ],
  },

  // ── Double stops ────────────────────────────────────────────────────────────────────────────
  {
    // ♭3 + 5 struck three times, then root + ♭3: the shuffle-rhythm double stop.
    id: 'double-stop-shuffle',
    kind: 'doubleStop',
    ref: 'key',
    beats: 4,
    minLevel: 3,
    notes: [
      n(0, 0.5, 3, { partner: 4 }), n(0.5, 0.5, 3, { partner: 4 }), n(1, 0.5, 3, { partner: 4 }),
      n(1.5, 0.5, 0, { partner: 3 }), n(2, 1, -2), n(3, 1, T),
    ],
  },
  {
    // ♭7 + root (a 2nd apart on neighbouring strings) sliding down into 5 + ♭7.
    id: 'double-stop-descent',
    kind: 'doubleStop',
    ref: 'key',
    beats: 4,
    minLevel: 3,
    notes: [n(0.5, 0.5, 10, { partner: 5 }), n(1, 1, 7, { partner: 5, vibrato: true }), n(2, 0.5, 5), n(2.5, 0.5, 3), n(3, 1, T)],
  },

  // ── Call and response ───────────────────────────────────────────────────────────────────────
  {
    id: 'short-call-answer',
    kind: 'callResponse',
    ref: 'key',
    beats: 4,
    minLevel: 2,
    notes: [n(0, 0.5, 7), n(0.5, 0.5, 10), n(1, 1, 7), n(2.5, 0.5, 5), n(3, 1, T)],
  },
  {
    id: 'two-note-call',
    kind: 'callResponse',
    ref: 'key',
    beats: 4,
    minLevel: 2,
    notes: [n(0, 0.5, 7), n(0.5, 0.5, 5), n(1, 1, 7), n(3, 1, T)],
  },
  {
    // The question climbs and hangs on ♭7; the answer starts the same way and comes home.
    id: 'two-bar-call-answer',
    kind: 'callResponse',
    ref: 'key',
    beats: 8,
    minLevel: 2,
    notes: [
      n(0.5, 0.5, 7), n(1, 0.5, 10), n(1.5, 0.5, 12), n(2, 2, 10),
      n(4.5, 0.5, 7), n(5, 0.5, 10), n(5.5, 0.5, 12), n(6, 0.5, 10), n(6.5, 0.5, 7), n(7, 1, T),
    ],
  },

  // ── Turnarounds (end of the progression) ────────────────────────────────────────────────────
  {
    // Chromatic walk down from the octave to the 5th.
    id: 'chromatic-turnaround',
    kind: 'turnaround',
    ref: 'key',
    beats: 4,
    minLevel: 3,
    notes: [
      n(0, 1, 12), n(1, 0.5, 11, { chromatic: true }), n(1.5, 0.5, 10),
      n(2, 0.5, 9, { chromatic: true }), n(2.5, 0.5, 8, { chromatic: true }), n(3, 1, T),
    ],
  },
  {
    // Down the blues scale through the ♭5 (a chromatic passing note where the scale lacks it).
    id: 'blues-scale-turnaround',
    kind: 'turnaround',
    ref: 'key',
    beats: 4,
    minLevel: 3,
    notes: [n(0, 0.5, 12), n(0.5, 0.5, 10), n(1, 0.5, 7), n(1.5, 0.5, 6, { chromatic: true }), n(2, 0.5, 5), n(2.5, 0.5, 3), n(3, 1, T)],
  },

  // ── Chord-tone resolution ───────────────────────────────────────────────────────────────────
  {
    id: 'arpeggio-landing',
    kind: 'resolution',
    ref: 'chord',
    beats: 4,
    minLevel: 1,
    notes: [n(0, 1, ct('R')), n(1, 1, ct('3')), n(2, 2, T)],
  },
  {
    id: 'arpeggio-turn',
    kind: 'resolution',
    ref: 'chord',
    beats: 4,
    minLevel: 2,
    notes: [n(0, 0.5, ct('R')), n(0.5, 0.5, ct('3')), n(1, 0.5, ct('5')), n(1.5, 0.5, ct('3')), n(2, 2, T)],
  },
  {
    // Enclosure: the scale note above the target, the half step below it, then the target.
    id: 'enclosure',
    kind: 'resolution',
    ref: 'chord',
    beats: 4,
    minLevel: 3,
    notes: [n(0, 0.5, ct('5')), n(0.5, 0.5, ct('3')), n(1, 1, ct('R')), n(2, 0.5, ABOVE), n(2.5, 0.5, BELOW, { chromatic: true }), n(3, 1, T, { vibrato: true })],
  },
  {
    id: 'minor-chord-colour',
    kind: 'resolution',
    ref: 'chord',
    beats: 4,
    minLevel: 2,
    qualities: MINOR,
    notes: [n(0, 0.5, 7), n(0.5, 0.5, 3), n(1, 1, 0), n(2, 0.5, 3), n(2.5, 0.5, 5), n(3, 1, T)],
  },
  {
    // Major-pentatonic hammer from the 2nd to the 3rd over a major chord: country and southern rock.
    id: 'major-hammer-run',
    kind: 'resolution',
    ref: 'chord',
    beats: 4,
    minLevel: 3,
    qualities: DOMINANT_OR_MAJOR,
    notes: [n(0, 0.5, 0), n(0.5, 0.5, 2), n(1, 0.5, 4, { tech: 'hammer' }), n(1.5, 0.5, 7), n(2, 0.5, 9), n(2.5, 0.5, 7), n(3, 1, T)],
  },
  {
    // ♭3 hammered onto the major 3rd — the bluesy way into a major chord.
    id: 'blue-third-hammer',
    kind: 'resolution',
    ref: 'chord',
    beats: 4,
    minLevel: 3,
    qualities: DOMINANT_OR_MAJOR,
    notes: [n(0, 0.5, 3, { chromatic: true }), n(0.5, 0.5, 4, { tech: 'hammer' }), n(1, 1, 0), n(2, 0.5, -3), n(2.5, 0.5, -5), n(3, 1, T)],
  },
  {
    id: 'slide-to-fifth',
    kind: 'resolution',
    ref: 'key',
    beats: 4,
    minLevel: 3,
    notes: [n(0, 0.5, 0), n(0.5, 0.5, 3), n(1, 0.5, 5), n(1.5, 1, 7, { tech: 'slide', vibrato: true }), n(2.5, 0.5, 5), n(3, 1, T)],
  },

  // ── Motifs: repetition and variation ────────────────────────────────────────────────────────
  {
    // A three-note cell, then the same cell a step lower, then home.
    id: 'motif-sequence',
    kind: 'motif',
    ref: 'key',
    beats: 4,
    minLevel: 2,
    notes: [n(0, 0.5, 7), n(0.5, 0.5, step(1)), n(1, 1, step(-1)), n(2, 0.5, step(-1)), n(2.5, 0.5, step(1)), n(3, 1, T)],
  },
  {
    // The same four-note fall stated twice, the second time carried on to the landing.
    id: 'motif-twice',
    kind: 'motif',
    ref: 'key',
    beats: 8,
    minLevel: 3,
    notes: [
      n(0.5, 0.5, 10), n(1, 0.5, step(-1)), n(1.5, 0.5, step(-1)), n(2, 2, step(-1)),
      n(4.5, 0.5, 10), n(5, 0.5, step(-1)), n(5.5, 0.5, step(-1)), n(6, 0.5, step(-1)), n(6.5, 0.5, step(-1)), n(7, 1, T),
    ],
  },
  {
    id: 'neighbour-hook',
    kind: 'motif',
    ref: 'key',
    beats: 4,
    minLevel: 2,
    notes: [n(0, 0.5, 7), n(0.5, 0.5, 10), n(1, 0.5, 7), n(1.5, 0.5, 5), n(2, 2, T)],
  },
  {
    id: 'three-step-home',
    kind: 'motif',
    ref: 'key',
    beats: 4,
    minLevel: 1,
    notes: [n(0, 1, 7), n(1, 1, 5), n(2, 2, T)],
  },
  {
    id: 'repeated-note-hook',
    kind: 'motif',
    ref: 'key',
    beats: 4,
    minLevel: 1,
    notes: [n(0, 1, 7), n(1, 1, 7), n(2, 2, T)],
  },

  // ── Space ───────────────────────────────────────────────────────────────────────────────────
  {
    // Two quarter notes after a beat of silence: leaving room is part of the vocabulary.
    id: 'sparse-sigh',
    kind: 'space',
    ref: 'key',
    beats: 4,
    minLevel: 1,
    notes: [n(1, 1, 10), n(2, 1, 7), n(3, 1, T)],
  },
  {
    id: 'flat-seven-call',
    kind: 'space',
    ref: 'key',
    beats: 4,
    minLevel: 1,
    notes: [n(1, 1, 10), n(2, 2, T)],
  },
  {
    id: 'long-tone',
    kind: 'space',
    ref: 'chord',
    beats: 4,
    minLevel: 1,
    notes: [n(0, 2, ct('5')), n(2, 2, T, { vibrato: true })],
  },
];
