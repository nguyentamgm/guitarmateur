import type { DrillId } from '../types';
import { onBeat } from './onBeat';
import { quality } from './quality';
import type { Drill } from './types';

export * from './types';
export { onBeat } from './onBeat';
export { quality } from './quality';

export const DRILLS: Partial<Record<DrillId, Drill>> = { quality, onBeat };
