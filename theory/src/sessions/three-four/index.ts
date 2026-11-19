import type { Session } from '../types';
import { en } from './copy.en';
import { vi } from './copy.vi';

export const threeFour: Session = {
  slug: 'three-four',
  path: 'accompany',
  stage: 'C',
  concepts: ['K1.6', 'K1.4'],
  settings: ['strumSpeed'],
  parts: {
    listen: [{ kind: 'listen', key: 'count', drill: 'meter' }],
    understand: [{ kind: 'lesson', key: 'beat', lesson: 'rhythm', step: 'beat' }],
    play: [
      {
        kind: 'strumAlong',
        key: 'waltz',
        in: { tonic: 'G', mode: 'major' },
        bars: [1, 1, 4, 1],
        bpm: 90,
        beatsPerBar: 3,
      },
      {
        kind: 'strumAlong',
        key: 'waltz2',
        in: { tonic: 'G', mode: 'major' },
        bars: [1, 5, 5, 1],
        bpm: 90,
        beatsPerBar: 3,
        pattern: 'D-DUDU',
      },
    ],
    challenge: [
      {
        kind: 'song',
        key: 'first',
        song: 'happy-birthday',
        in: { tonic: 'G', mode: 'major' },
        pool: [1, 4, 5],
        bpm: 100,
        start: 'none',
      },
      {
        kind: 'song',
        key: 'second',
        song: 'amazing-grace',
        in: { tonic: 'G', mode: 'major' },
        pool: [1, 4, 5],
        bpm: 90,
        start: 'none',
      },
    ],
  },
  checkAnswers: [0, 0, 0],
  copy: { en, vi },
};
