import { twelveBar, type BluesDegree } from '../core/music';
import type { ChordSpec } from './types';

const dominantSevenths = {
  I: { root: '1', id: 'dom7' },
  IV: { root: '4', id: 'dom7' },
  V: { root: '5', id: 'dom7' },
} as const satisfies Record<BluesDegree, ChordSpec>;

export const bluesChordPool: readonly ChordSpec[] = Object.values(dominantSevenths);
export const standardBlues12: readonly ChordSpec[] = twelveBar().map(
  (degree) => dominantSevenths[degree],
);
