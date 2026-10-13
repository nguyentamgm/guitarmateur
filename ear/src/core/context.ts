/** The key context: a cadence that sets the key, then the tonic; and a drone (docs/ear.md "Music rules"). */
import { diatonicChords, romanFor, type Chord, type Key } from '@shared/core/music';

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
