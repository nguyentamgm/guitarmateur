import type { Session } from '../types';
import { en } from './copy.en';
import { vi } from './copy.vi';

export const melodyByEar: Session = {
  slug: 'melody-by-ear',
  path: 'accompany',
  stage: 'A',
  concepts: ['K2.1', 'K7.5'],
  earLevel: 3,
  parts: {
    listen: [{ kind: 'listen', key: 'moves', drill: 'moves' }],
    understand: [{ kind: 'lesson', key: 'formula', lesson: 'major-scale', step: 'formula' }],
    play: [{ kind: 'melodyEcho', key: 'echo', tonic: 'G', string: 3, phrases: null, notes: 3 }],
    challenge: [
      {
        kind: 'melodyEcho',
        key: 'tune',
        tonic: 'G',
        string: 3,
        phrases: [
          [1, 2, 3, 1],
          [3, 4, 5],
          [5, 6, 5, 4, 3, 1],
        ],
      },
    ],
  },
  checkAnswers: [1, 0, 2],
  copy: { en, vi },
};
