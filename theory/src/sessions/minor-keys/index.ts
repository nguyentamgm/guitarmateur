import type { Session } from '../types';
import { en } from './copy.en';
import { vi } from './copy.vi';

export const minorKeys: Session = {
  slug: 'minor-keys',
  path: 'accompany',
  stage: 'C',
  concepts: ['K5.6', 'K2.8', 'K5.1'],
  settings: ['strumSpeed'],
  parts: {
    listen: [{ kind: 'listen', key: 'mode', drill: 'keyMode' }],
    understand: [{ kind: 'lesson', key: 'relative', lesson: 'keys', step: 'relative' }],
    play: [
      {
        kind: 'chords',
        key: 'shapes',
        in: { tonic: 'A', mode: 'minor' },
        chords: [1, 4, { root: '5', id: 'major' }],
      },
      {
        kind: 'strumAlong',
        key: 'loopA',
        in: { tonic: 'A', mode: 'minor' },
        bars: [1, 4, { root: '5', id: 'major' }, 1],
        bpm: 80,
        pattern: 'D-D-D-DU',
      },
      {
        kind: 'strumAlong',
        key: 'loopB',
        in: { tonic: 'A', mode: 'minor' },
        bars: [1, 6, 7, 1],
        bpm: 80,
        pattern: 'D-D-D-DU',
      },
    ],
    challenge: [
      {
        kind: 'fillBars',
        key: 'fill',
        in: { tonic: 'A', mode: 'minor' },
        keys: ['A', 'E'],
        pool: [1, 4, { root: '5', id: 'major' }, 6, 7],
        bars: 4,
        bpm: 80,
      },
    ],
  },
  checkAnswers: [0, 0, 0],
  copy: { en, vi },
};
