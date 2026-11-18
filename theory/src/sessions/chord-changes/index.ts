import type { Session } from '../types';
import { en } from './copy.en';
import { vi } from './copy.vi';

export const chordChanges: Session = {
  slug: 'chord-changes',
  path: 'accompany',
  stage: 'B',
  concepts: ['K8.1', 'K1.4'],
  settings: ['strumSpeed'],
  parts: {
    listen: [
      {
        kind: 'changeTap',
        key: 'slow',
        in: { tonic: 'G', mode: 'major' },
        pool: [1, 4, 5],
        holds: [2],
        bars: 8,
        bpm: 80,
      },
    ],
    understand: [{ kind: 'lesson', key: 'strum', lesson: 'rhythm', step: 'strum' }],
    play: [
      {
        kind: 'strumAlong',
        key: 'pattern',
        in: { tonic: 'G', mode: 'major' },
        bars: [1, 1, 4, 4, 5, 5, 1, 1],
        bpm: 70,
        pattern: 'D-D-D-DU',
      },
    ],
    challenge: [
      {
        kind: 'changeTap',
        key: 'fast',
        in: { tonic: 'G', mode: 'major' },
        pool: [1, 4, 5],
        holds: [1, 2],
        bars: 8,
        bpm: 90,
      },
    ],
  },
  checkAnswers: [0, 0, 1],
  copy: { en, vi },
};
