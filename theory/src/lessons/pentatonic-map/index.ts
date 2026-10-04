import type { Lesson } from '../types';
import { en } from './copy.en';
import { vi } from './copy.vi';
import type { SceneCopy, StepId } from './model';

export * from './scenes';
export type { SceneCopy, StepId } from './model';

export const pentatonicMap: Lesson<StepId, SceneCopy> = {
  slug: 'pentatonic-map',
  steps: [
    { id: 'grid', concepts: ['K0.2', 'K0.4'] },
    { id: 'formula', concepts: ['K3.2'] },
    { id: 'boxes', concepts: ['K3.4'] },
    { id: 'keys', concepts: ['K0.7', 'K3.5'] },
    { id: 'home', concepts: ['K3.1', 'K3.3'] },
  ],
  copy: { en, vi },
};
