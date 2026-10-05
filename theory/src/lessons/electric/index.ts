import type { Lesson } from '../types';
import { en } from './copy.en';
import { vi } from './copy.vi';
import type { SceneCopy, StepId } from './model';

export * from './scenes';
export type { SceneCopy, StepId } from './model';

export const electric: Lesson<StepId, SceneCopy> = {
  slug: 'electric',
  steps: [
    { id: 'power', concepts: ['K4.2', 'K2.4'] },
    { id: 'mute', concepts: ['K6.5', 'K6.6'] },
    { id: 'doubleStops', concepts: ['K6.6'] },
    { id: 'octaves', concepts: ['K6.7', 'K0.6'] },
    { id: 'boogie', concepts: ['K4.2', 'K5.4'] },
  ],
  copy: { en, vi },
};
