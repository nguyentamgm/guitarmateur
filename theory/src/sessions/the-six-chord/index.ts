import type { Session } from '../types';
import { en } from './copy.en';
import { vi } from './copy.vi';

export const theSixChord: Session = {
  slug: 'the-six-chord',
  path: 'accompany',
  stage: 'C',
  concepts: ['K5.2', 'K5.3'],
  settings: ['strumSpeed'],
  parts: {
    listen: [{ kind: 'listen', key: 'minor', drill: 'minorBar' }],
    understand: [{ kind: 'lesson', key: 'family', lesson: 'keys', step: 'family' }],
    play: [
      {
        kind: 'chords',
        key: 'shapes',
        in: { tonic: 'G', mode: 'major' },
        chords: [1, 5, 6, 4],
      },
      {
        kind: 'strumAlong',
        key: 'loopA',
        in: { tonic: 'G', mode: 'major' },
        bars: [1, 5, 6, 4],
        bpm: 80,
        keys: ['G', 'D'],
        pattern: 'D-D-D-DU',
      },
      {
        kind: 'strumAlong',
        key: 'loopB',
        in: { tonic: 'G', mode: 'major' },
        bars: [1, 6, 4, 5],
        bpm: 80,
        keys: ['G', 'D'],
        pattern: 'D-D-D-DU',
      },
    ],
    challenge: [
      {
        kind: 'fillBars',
        key: 'fill',
        in: { tonic: 'G', mode: 'major' },
        keys: ['G', 'D'],
        pool: [1, 4, 5, 6],
        bars: 4,
        bpm: 80,
      },
    ],
  },
  checkAnswers: [0, 0, 0],
  copy: { en, vi },
};
