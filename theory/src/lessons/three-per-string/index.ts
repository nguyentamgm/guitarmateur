import type { Lesson } from '../types';
import { en } from './copy.en';
import { vi } from './copy.vi';
import type { SceneCopy, StepId } from './model';

export * from './scenes';
export type { SceneCopy, StepId } from './model';

export const threePerString: Lesson<StepId, SceneCopy> = {
  slug: 'three-per-string',
  steps: [
    { id: 'strings', concepts: ['K2.9', 'K2.1'] },
    { id: 'tile', concepts: ['K2.9'] },
    { id: 'triplets', concepts: ['K2.9', 'K1.5', 'K3.6'] },
    { id: 'keys', concepts: ['K2.9', 'K2.8', 'K3.5'] },
  ],
  copy: { en, vi },
};
