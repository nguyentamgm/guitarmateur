import type { Lesson } from '../types';
import { en } from './copy.en';
import { vi } from './copy.vi';
import type { SceneCopy, StepId } from './model';

export * from './scenes';
export type { SceneCopy, StepId } from './model';

export const chordTable: Lesson<StepId, SceneCopy> = {
  slug: 'chord-table',
  steps: [
    { id: 'sevenths', concepts: ['K4.3', 'K2.3'] },
    { id: 'table', concepts: ['K4.3', 'K4.4'] },
    { id: 'openSevenths', concepts: ['K4.3', 'K4.5', 'K4.6'] },
    { id: 'inversions', concepts: ['K4.7'] },
    { id: 'simplify', concepts: ['K4.8', 'K4.9'] },
  ],
  copy: { en, vi },
};
