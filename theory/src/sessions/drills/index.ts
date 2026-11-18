import type { DrillId } from '../types';
import { finished } from './finished';
import { onBeat } from './onBeat';
import { quality } from './quality';
import { rootNote } from './rootNote';
import type { Drill } from './types';

export * from './types';
export { finished } from './finished';
export { onBeat } from './onBeat';
export { quality } from './quality';
export { rootNote } from './rootNote';

export const DRILLS: Partial<Record<DrillId, Drill>> = { quality, onBeat, finished, rootNote };
