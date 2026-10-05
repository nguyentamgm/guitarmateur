import type { Lesson } from '../types';
import { en } from './copy.en';
import { vi } from './copy.vi';
import type { SceneCopy, StepId } from './model';

export * from './scenes';
export type { SceneCopy, StepId } from './model';

export const pentatonic: Lesson<StepId, SceneCopy> = {
  slug: 'pentatonic',
  steps: [
    { id: 'boxes', concepts: ['K3.4', 'K0.4'] },
    { id: 'connect', concepts: ['K3.5'] },
    { id: 'sequences', concepts: ['K3.6', 'K1.1'] },
    { id: 'major', concepts: ['K3.3', 'K3.1'] },
    { id: 'choose', concepts: ['K3.7'] },
  ],
  copy: { en, vi },
};
