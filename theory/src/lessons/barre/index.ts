import type { Lesson } from '../types';
import { en } from './copy.en';
import { vi } from './copy.vi';
import type { SceneCopy, StepId } from './model';

export * from './scenes';
export type { SceneCopy, StepId } from './model';

export const barre: Lesson<StepId, SceneCopy> = {
  slug: 'barre',
  steps: [
    { id: 'slide', concepts: ['K4.6', 'K0.7'] },
    { id: 'eShape', concepts: ['K4.6', 'K4.3'] },
    { id: 'aShape', concepts: ['K4.6', 'K4.3'] },
    { id: 'find', concepts: ['K0.7', 'K4.6'] },
    { id: 'changes', concepts: ['K4.6'] },
  ],
  copy: { en, vi },
};
