/** Chord progressions as forms over scale degrees (K5.4). The chords come from the key. */
import type { Chord } from './chords';
import { interval, transpose, type DegreeLabel } from './interval';
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
