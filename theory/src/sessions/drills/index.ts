import type { DrillId } from '../types';
import { quality } from './quality';
import type { Drill } from './types';

export * from './types';
export { quality } from './quality';

export const DRILLS: Partial<Record<DrillId, Drill>> = { quality };
