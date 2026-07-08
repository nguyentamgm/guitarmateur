import { note, type NoteName } from './pitch';
import type { ScaleId } from './scales';

export interface Key {
  /** The spelled tonic — store the spelling, never a bare pitch class. */
  tonic: NoteName;
  scaleId: ScaleId;
}

/**
 * The 12 practical tonics offered by the key picker, covering all 12 pitch classes with
 * conventional minor-key spellings. A first, to match the mockup's UI order.
 */
export const TONICS: NoteName[] = [
  note('A'),
  note('B', -1), // B♭
  note('B'),
  note('C'),
  note('C', 1), // C♯
  note('D'),
  note('E', -1), // E♭
  note('E'),
  note('F'),
  note('F', 1), // F♯
  note('G'),
  note('G', 1), // G♯
];
