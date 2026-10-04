import type { Lesson } from '../types';
import { en } from './copy.en';
import { vi } from './copy.vi';
import type { SceneCopy, StepId } from './model';

export * from './scenes';
export type { SceneCopy, StepId } from './model';

export const fretboard: Lesson<StepId, SceneCopy> = {
  slug: 'fretboard',
  steps: [
    { id: 'strings', concepts: ['K0.1'] },
    { id: 'semitones', concepts: ['K0.2'] },
    { id: 'tab', concepts: ['K0.3'] },
    { id: 'octaves', concepts: ['K0.6', 'K0.4'] },
    { id: 'home', concepts: ['K0.7', 'K0.5'] },
  ],
  copy: { en, vi },
};
