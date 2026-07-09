import { pc } from './pitch';
import type { Key } from './key';
import type { Chord } from './chord';

const mod = (n: number, m: number): number => ((n % m) + m) % m;

/** Roman-numeral base (relative to a major-scale-degree grid) + whether the degree is flatted. */
const DEGREES: { roman: string; flat: boolean }[] = [
  { roman: 'I', flat: false },
  { roman: 'II', flat: true },
  { roman: 'II', flat: false },
  { roman: 'III', flat: true },
  { roman: 'III', flat: false },
  { roman: 'IV', flat: false },
  { roman: 'V', flat: true },
  { roman: 'V', flat: false },
  { roman: 'VI', flat: true },
  { roman: 'VI', flat: false },
  { roman: 'VII', flat: true },
  { roman: 'VII', flat: false },
];

const MAJORISH = new Set(['M', 'dom7', 'M7']);
const SEVENTH = new Set(['dom7', 'm7', 'M7']);

/**
 * Roman numeral for a chord relative to a key's tonic, e.g. 'i', 'IV', 'v', '♭VII', 'V7'.
 * Degree comes from the chromatic distance to the tonic (major-scale-degree grid, flatted where
 * the chord's root isn't a natural major-scale step); case comes from the chord's quality.
 */
export function romanNumeral(key: Key, chord: Chord): string {
  const semitones = mod(pc(chord.tonic) - pc(key.tonic), 12);
  const { roman, flat } = DEGREES[semitones]!;
  const numeral = MAJORISH.has(chord.quality) ? roman : roman.toLowerCase();
  const suffix = SEVENTH.has(chord.quality) ? '7' : '';
  return (flat ? '♭' : '') + numeral + suffix;
}
