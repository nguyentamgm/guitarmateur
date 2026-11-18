import type { Session } from '../types';
import { en } from './copy.en';
import { vi } from './copy.vi';

export const firstSong: Session = {
  slug: 'first-song',
  path: 'accompany',
  stage: 'B',
  concepts: ['K8.3', 'K8.2'],
  settings: ['strumSpeed'],
  parts: {
    listen: [
      {
        kind: 'song',
        key: 'listenSong',
        song: 'frere-jacques',
        in: { tonic: 'G', mode: 'major' },
        pool: [1],
        start: 'all',
      },
    ],
    understand: [
      {
        kind: 'chords',
        key: 'chords',
        in: { tonic: 'G', mode: 'major' },
        chords: [1, 4, 5],
      },
    ],
    play: [
      {
        kind: 'strumAlong',
        key: 'playMary',
        in: { tonic: 'G', mode: 'major' },
        bars: [1, 1, 5, 1, 1, 1, 5, 1],
        bpm: 80,
        pattern: 'D-D-D-DU',
      },
    ],
    challenge: [
      {
        kind: 'song',
        key: 'challengeMary',
        song: 'mary-lamb',
        in: { tonic: 'G', mode: 'major' },
        pool: [1, 4, 5],
        start: 'none',
      },
      {
        kind: 'song',
        key: 'challengeTwinkle',
        song: 'twinkle',
        in: { tonic: 'G', mode: 'major' },
        pool: [1, 4, 5],
        start: 'none',
      },
    ],
  },
  checkAnswers: [0, 1, 2],
  copy: { en, vi },
};
