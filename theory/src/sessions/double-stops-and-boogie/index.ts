import { standardBlues12 } from '../blues';
import type { Session } from '../types';
import { en } from './copy.en';
import { vi } from './copy.vi';

export const doubleStopsAndBoogie: Session = {
  slug: 'double-stops-and-boogie',
  path: 'lead',
  stage: 'G',
  concepts: ['K2.4', 'K6.6', 'K6.7', 'K0.6', 'K5.4'],
  parts: {
    listen: [{ kind: 'listen', key: 'texture', drill: 'singleDoubleOrOctave' }],
    understand: [
      { kind: 'lesson', key: 'shapes', lesson: 'major-scale', step: 'shapes' },
      { kind: 'lesson', key: 'pair', lesson: 'electric', step: 'doubleStops' },
    ],
    play: [{ kind: 'lesson', key: 'boogie', lesson: 'electric', step: 'boogie' }],
    challenge: [
      {
        kind: 'backingTrack',
        key: 'backing',
        in: { tonic: 'A', mode: 'major' },
        bars: standardBlues12,
        style: 'shuffle',
        bpm: 88,
        scale: 'minorPentatonic',
        keys: ['A', 'E', 'G'],
      },
      { kind: 'lesson', key: 'octaves', lesson: 'electric', step: 'octaves' },
    ],
  },
  checkAnswers: [2, 0, 1],
  copy: { en, vi },
};
