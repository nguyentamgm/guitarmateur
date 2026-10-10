/**
 * Practice's notes as dots on the shared neck (shared/ui/Fretboard.tsx). Pure: no React, no DOM.
 * Practice numbers strings from the lowest (index 0); the neck numbers them as tab does (1 = the
 * thinnest), so the two meet here.
 */
import type { FretDot } from '@shared/ui/Fretboard';
import type { StringNames, StringNumber } from '@shared/core/neck';
import { format, midi, SCALES, toneRole, type Chord, type Key, type ToneRole } from '../music';
import type { Box } from '../fretboard';
import type { Tuning } from '../fretboard/tuning';
import { intervalLabel } from './labels';

/** The neck's string number for Practice's string index (0 = lowest-pitched) on a 6-string. */
export const stringNumber = (index: number, strings = 6): StringNumber => (strings - index) as StringNumber;

/** String names of a tuning, as tab labels them: 'e' for the thinnest, capitals elsewhere. */
export function tuningNames(tuning: Tuning): StringNames {
  const n = tuning.strings.length;
  const names = {} as Record<StringNumber, string>;
  tuning.strings.forEach((p, i) => {
    const s = stringNumber(i, n);
    names[s] = s === 1 ? p.letter.toLowerCase() : p.letter;
  });
  return names;
}

export interface DotOptions {
  /** Mark this chord's tones: ringed with their role, the `targetRole` one filled. */
  readonly highlight?: { readonly chord: Chord; readonly targetRole: ToneRole };
  /** Where the lick lands (Practice string index + fret): a dashed halo. */
  readonly landing?: { readonly string: number; readonly fret: number };
  /** Only frets above this are drawn (a window of the neck); fret 0 needs `from` 0. */
  readonly from?: number;
}

/**
 * A box's notes as dots: each carries its degree in the key (1, ♭3, 5…) and its name. The root is
 * `home`, a decorated scale's added tone (the blues ♭5) `blue`; with a chord highlighted, its tones
 * are `chord` with their role as a mark, the target `target`.
 */
export function boxDots(box: Box, key: Key, opts: DotOptions = {}): FretDot[] {
  const intervals = SCALES[key.scaleId].intervals;
  const from = opts.from ?? 0;
  return box.notes
    .filter((n) => n.fret === 0 ? from === 0 : n.fret > from)
    .map((n) => {
      const role = opts.highlight ? toneRole(n.pitch, opts.highlight.chord) : null;
      const tone: FretDot['tone'] = role
        ? role === opts.highlight!.targetRole
          ? 'target'
          : 'chord'
        : n.isTonic
          ? 'home'
          : n.isDecoration
            ? 'blue'
            : 'plain';
      const iv = intervals[n.degree - 1];
      return {
        key: `${n.string}:${n.fret}`,
        string: stringNumber(n.string),
        fret: n.fret,
        midi: midi(n.pitch),
        degree: iv ? intervalLabel(iv) : String(n.degree),
        name: format(n.pitch),
        tone,
        mark: role ?? undefined,
        halo: opts.landing !== undefined && opts.landing.string === n.string && opts.landing.fret === n.fret,
      };
    });
}
