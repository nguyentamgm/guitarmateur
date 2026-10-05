import type { Lesson } from '../types';
import { en } from './copy.en';
import { vi } from './copy.vi';
import type { SceneCopy, StepId } from './model';

export * from './scenes';
export type { SceneCopy, StepId } from './model';

export const majorScale: Lesson<StepId, SceneCopy> = {
  slug: 'major-scale',
  steps: [
    { id: 'formula', concepts: ['K2.1', 'K0.2'] },
    { id: 'spelling', concepts: ['K2.2', 'K0.5'] },
    { id: 'intervals', concepts: ['K2.3'] },
    { id: 'shapes', concepts: ['K2.4', 'K0.4'] },
    { id: 'degrees', concepts: ['K2.1', 'K2.3'] },
  ],
  copy: { en, vi },
};
