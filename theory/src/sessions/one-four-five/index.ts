import type { Session } from '../types';
import { en } from './copy.en';
import { vi } from './copy.vi';

export const oneFourFive: Session = {
  slug: 'one-four-five',
  path: 'accompany',
  stage: 'B',
  concepts: ['K8.2', 'K5.3'],
  settings: ['strumSpeed'],
  parts: {
    listen: [{ kind: 'listen', key: 'which', drill: 'fourOrFive' }],
    understand: [{ kind: 'lesson', key: 'numbers', lesson: 'keys', step: 'numbers' }],
    play: [
      {
        kind: 'strumAlong',
        key: 'a',
        in: { tonic: 'G', mode: 'major' },
        bars: [1, 4, 1, 5],
        bpm: 80,
        pattern: 'D-D-D-DU',
      },
      {
        kind: 'strumAlong',
        key: 'b',
        in: { tonic: 'G', mode: 'major' },
        bars: [1, 5, 4, 1],
        bpm: 80,
        pattern: 'D-D-D-DU',
      },
    ],
    challenge: [
      {
        kind: 'fillBars',
        key: 'fill',
        in: { tonic: 'G', mode: 'major' },
        pool: [1, 4, 5],
        bars: 4,
        bpm: 80,
      },
    ],
  },
  checkAnswers: [0, 1, 0],
  copy: { en, vi },
};
