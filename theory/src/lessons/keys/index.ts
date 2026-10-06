import type { Lesson } from '../types';
import { en } from './copy.en';
import { vi } from './copy.vi';
import type { SceneCopy, StepId } from './model';

export * from './scenes';
export type { SceneCopy, StepId } from './model';

export const keys: Lesson<StepId, SceneCopy> = {
  slug: 'keys',
  steps: [
    { id: 'family', concepts: ['K5.2'] },
    { id: 'numbers', concepts: ['K5.3', 'K4.6'] },
    { id: 'home', concepts: ['K5.1'] },
    { id: 'twoFive', concepts: ['K5.5'] },
    { id: 'relative', concepts: ['K5.6', 'K2.8', 'K3.7'] },
  ],
  copy: { en, vi },
};
