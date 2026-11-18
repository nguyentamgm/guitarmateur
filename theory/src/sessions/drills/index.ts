import type { DrillId } from '../types';
import { chordCount } from './chordCount';
import { finished } from './finished';
import { fourOrFive } from './fourOrFive';
import { minorBar } from './minorBar';
import { moves } from './moves';
import { onBeat } from './onBeat';
import { quality } from './quality';
import { rootNote } from './rootNote';
import type { Drill } from './types';

export * from './types';
export { chordCount } from './chordCount';
export { finished } from './finished';
export { fourOrFive } from './fourOrFive';
export { minorBar } from './minorBar';
export { moves } from './moves';
export { onBeat } from './onBeat';
export { quality } from './quality';
export { rootNote } from './rootNote';

export const DRILLS: Partial<Record<DrillId, Drill>> = {
  quality,
  onBeat,
  finished,
  rootNote,
  moves,
  chordCount,
  fourOrFive,
  minorBar,
};

