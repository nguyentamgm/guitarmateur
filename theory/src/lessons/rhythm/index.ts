import type { Lesson } from '../types';
import { en } from './copy.en';
import { vi } from './copy.vi';
import type { SceneCopy, StepId } from './model';

export * from './scenes';
export type { SceneCopy, StepId } from './model';

export const rhythm: Lesson<StepId, SceneCopy> = {
  slug: 'rhythm',
  steps: [
    { id: 'beat', concepts: ['K1.1'] },
    { id: 'lengths', concepts: ['K1.2'] },
    { id: 'counting', concepts: ['K1.3'] },
    { id: 'strum', concepts: ['K1.4'] },
    { id: 'fingers', concepts: ['K0.8', 'K1.1'] },
  ],
  copy: { en, vi },
};
