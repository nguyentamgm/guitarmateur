import type { Lesson } from '../types';
import { en } from './copy.en';
import { vi } from './copy.vi';
import type { SceneCopy, StepId } from './model';
import { BLUES_BPM, EXAMPLE_TONIC, bluesForm } from './scenes';

export * from './scenes';
export type { SceneCopy, StepId } from './model';

export const blues: Lesson<StepId, SceneCopy> = {
  slug: 'blues',
  steps: [
    { id: 'blueNote', concepts: ['K6.1', 'K6.2'] },
    { id: 'shuffle', concepts: ['K1.5'] },
    { id: 'twelveBar', concepts: ['K5.4', 'K6.2'] },
    { id: 'bends', concepts: ['K6.3'] },
    { id: 'legato', concepts: ['K6.4'] },
  ],
  copy: { en, vi },
  practice: {
    tonic: EXAMPLE_TONIC,
    scale: 'minorBlues',
    chords: bluesForm(EXAMPLE_TONIC).map((b) => b.chord),
    tempoBpm: BLUES_BPM,
    swing: true,
  },
};
