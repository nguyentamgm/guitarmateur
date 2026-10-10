/** Chord progressions as forms over scale degrees (K5.3, K5.4, K5.5). The chords come from the key. */
import type { Chord } from './chords';
import { interval, transpose, type DegreeLabel } from './interval';
import { diatonicChords, type DiatonicChord, type Mode } from './keys';
import type { NoteName } from './pitch';

/** The three chords of the blues, by the scale degree of their root. */
export type BluesDegree = 'I' | 'IV' | 'V';

export interface TwelveBarOptions {
  /** Bar 2 goes to IV and back ("quick change"). */
  readonly quickChange?: boolean;
  /** Bar 12 plays V to lead back to the top ("turnaround"). */
  readonly turnaround?: boolean;
}

/** The 12-bar blues: I I I I · IV IV I I · V IV I I, with its two common variants. */
export function twelveBar(opts: TwelveBarOptions = {}): BluesDegree[] {
  const bars: BluesDegree[] = ['I', 'I', 'I', 'I', 'IV', 'IV', 'I', 'I', 'V', 'IV', 'I', 'I'];
  if (opts.quickChange) bars[1] = 'IV';
  if (opts.turnaround) bars[11] = 'V';
  return bars;
}

const DEGREE_INTERVAL: Readonly<Record<BluesDegree, string>> = { I: '1', IV: '4', V: '5' };

/** The dominant 7 chord on a blues degree of a key: in A, I = A7, IV = D7, V = E7. */
export const bluesChord = (tonic: NoteName, degree: BluesDegree): Chord => ({
  root: transpose(tonic, interval(DEGREE_INTERVAL[degree])),
  id: 'dom7',
});

/**
 * The boogie under each eighth of a blues bar: the root stays, the note above rocks 5 5 6 6 ♭7 ♭7
 * 6 6. On guitar it is a power chord whose top finger moves (K4.2, K5.4).
 */
export const BOOGIE: readonly DegreeLabel[] = ['5', '5', '6', '6', 'b7', 'b7', '6', '6'];

// --- Common progressions (K5.3) ---

export type ProgressionId = 'I-IV-V' | 'I-V-vi-IV' | 'vi-IV-I-V' | 'ii-V-I' | 'i-VII-VI-VII';

export interface ProgressionDef {
  readonly mode: Mode;
  /** Scale degree of each bar's chord, 1..7. */
  readonly degrees: readonly number[];
  /** Triads (3) or seventh chords (4). */
  readonly size: 3 | 4;
}

/** The progressions players name by their numerals. ii–V–I is played with seventh chords, as in jazz. */
export const PROGRESSIONS: Readonly<Record<ProgressionId, ProgressionDef>> = {
  'I-IV-V': { mode: 'major', degrees: [1, 4, 5], size: 3 },
  'I-V-vi-IV': { mode: 'major', degrees: [1, 5, 6, 4], size: 3 },
  'vi-IV-I-V': { mode: 'major', degrees: [6, 4, 1, 5], size: 3 },
  'ii-V-I': { mode: 'major', degrees: [2, 5, 1, 1], size: 4 },
  'i-VII-VI-VII': { mode: 'minor', degrees: [1, 7, 6, 7], size: 3 },
};

/** The chords of a progression in the key on `tonic` (major or minor, as the progression says). */
export function progression(tonic: NoteName, id: ProgressionId): DiatonicChord[] {
  const def = PROGRESSIONS[id];
  const chords = diatonicChords({ tonic, mode: def.mode }, def.size);
  return def.degrees.map((d) => chords[d - 1]!);
}

// --- Leading into a chord (K5.5) ---

/** The ii–V of a chord: m7 on its 2nd degree, dominant 7 on its 5th. Into F: Gm7, C7. */
export function twoFive(target: NoteName): [Chord, Chord] {
  return [
    { root: transpose(target, interval('2')), id: 'm7' },
    { root: transpose(target, interval('5')), id: 'dom7' },
  ];
}
