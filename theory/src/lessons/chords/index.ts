import type { Lesson } from '../types';
import { en } from './copy.en';
import { vi } from './copy.vi';
import type { SceneCopy, StepId } from './model';

export * from './scenes';
export type { SceneCopy, StepId } from './model';

export const chords: Lesson<StepId, SceneCopy> = {
  slug: 'chords',
  steps: [
    { id: 'stack', concepts: ['K4.1', 'K2.3'] },
    { id: 'qualities', concepts: ['K4.1', 'K2.5'] },
    { id: 'sus', concepts: ['K4.1'] },
    { id: 'open', concepts: ['K4.5'] },
    { id: 'build', concepts: ['K4.1', 'K2.4'] },
  ],
  copy: { en, vi },
};
