import type { Lesson } from '../types';
import { en } from './copy.en';
import { vi } from './copy.vi';
import type { SceneCopy, StepId } from './model';

export * from './scenes';
export type { SceneCopy, StepId } from './model';

export const solo: Lesson<StepId, SceneCopy> = {
  slug: 'solo',
  steps: [
    { id: 'scale', concepts: ['K7.1', 'K7.3'] },
    { id: 'tones', concepts: ['K7.2'] },
    { id: 'guide', concepts: ['K7.2'] },
    { id: 'phrase', concepts: ['K7.4'] },
    { id: 'ear', concepts: ['K7.5'] },
  ],
  copy: { en, vi },
};
