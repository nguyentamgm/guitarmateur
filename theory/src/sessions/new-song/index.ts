import type { Session } from '../types';
import { en } from './copy.en';
import { vi } from './copy.vi';

export const newSong: Session = {
  slug: 'new-song',
  path: 'accompany',
  stage: 'D',
  concepts: ['K8.6'],
  settings: ['strumSpeed'],
  practice: { in: { tonic: 'G', mode: 'major' }, bars: [1, 5, 6, 4] },
  parts: {
    listen: [],
    understand: [
      {
        kind: 'transpose',
        key: 'keys',
        bars: [1, 5, 6, 4],
        tonics: ['G', 'D', 'A', 'C', 'F'],
        capoShapes: 'G',
      },
    ],
    play: [
      {
        kind: 'strumAlong',
        key: 'review',
        in: { tonic: 'G', mode: 'major' },
        bars: [1, 5, 6, 4],
        bpm: 90,
        pattern: 'D-D-D-DU',
        keys: ['G', 'D', 'A', 'C'],
        numeralsOnly: true,
      },
    ],
    challenge: [
      {
        kind: 'song',
        key: 'one',
        song: 'london-bridge',
        in: { tonic: 'G', mode: 'major' },
        keys: ['G', 'D', 'A'],
        pool: [1, 4, 5, 6],
        bpm: 110,
        start: 'none',
      },
      {
        kind: 'song',
        key: 'two',
        song: 'ode-to-joy',
        in: { tonic: 'G', mode: 'major' },
        keys: ['G', 'D', 'A'],
        pool: [1, 4, 5, 6],
        bpm: 100,
        start: 'none',
      },
      {
        kind: 'song',
        key: 'three',
        song: 'jingle-bells',
        in: { tonic: 'G', mode: 'major' },
        keys: ['G', 'D', 'A'],
        pool: [1, 4, 5, 6],
        bpm: 110,
        start: 'none',
      },
    ],
  },
  checkAnswers: [0, 0, 0],
  copy: { en, vi },
};
