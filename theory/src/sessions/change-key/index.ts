import type { Session } from '../types';
import { en } from './copy.en';
import { vi } from './copy.vi';

export const changeKey: Session = {
  slug: 'change-key',
  path: 'accompany',
  stage: 'B',
  concepts: ['K8.4', 'K5.3'],
  settings: ['strumSpeed'],
  parts: {
    listen: [
      {
        kind: 'transpose',
        key: 'same',
        bars: [1, 4, 5, 1],
        tonics: ['G', 'D'],
      },
    ],
    understand: [
      {
        kind: 'transpose',
        key: 'table',
        bars: [1, 4, 5, 1],
        tonics: ['G', 'D', 'A', 'C'],
        capoShapes: 'G',
      },
    ],
    play: [
      {
        kind: 'chords',
        key: 'shapes',
        in: { tonic: 'A', mode: 'major' },
        chords: [1, 4, 5],
      },
      {
        kind: 'strumAlong',
        key: 'keys',
        in: { tonic: 'G', mode: 'major' },
        bars: [1, 4, 5, 1],
        bpm: 80,
        keys: ['G', 'D', 'A'],
        pattern: 'D-D-D-DU',
      },
    ],
    challenge: [
      {
        kind: 'song',
        key: 'moved',
        song: 'twinkle',
        in: { tonic: 'D', mode: 'major' },
        keys: ['D', 'A'],
        pool: [1, 4, 5],
        bpm: 100,
        start: 'none',
      },
    ],
  },
  checkAnswers: [0, 0, 0],
  copy: { en, vi },
};
