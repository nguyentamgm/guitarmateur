import type { Session } from '../types';
import { en } from './copy.en';
import { vi } from './copy.vi';

const V7 = { root: '5', id: 'dom7' } as const;

export const seventhChords: Session = {
  slug: 'seventh-chords',
  path: 'accompany',
  stage: 'C',
  concepts: ['K4.3', 'K5.5'],
  settings: ['strumSpeed'],
  parts: {
    listen: [{ kind: 'listen', key: 'plain', drill: 'seventh' }],
    understand: [
      { kind: 'lesson', key: 'sevenths', lesson: 'chord-table', step: 'sevenths' },
      { kind: 'lesson', key: 'pull', lesson: 'keys', step: 'twoFive' },
    ],
    play: [
      { kind: 'chords', key: 'inG', in: { tonic: 'G', mode: 'major' }, chords: [5, V7] }, // D, D7
      { kind: 'chords', key: 'inD', in: { tonic: 'D', mode: 'major' }, chords: [5, V7] }, // A, A7
      { kind: 'chords', key: 'inA', in: { tonic: 'A', mode: 'major' }, chords: [5, V7] }, // E, E7
      {
        kind: 'strumAlong',
        key: 'loop',
        in: { tonic: 'G', mode: 'major' },
        bars: [1, 4, V7, 1],
        bpm: 85,
        pattern: 'D-D-D-DU',
        keys: ['G', 'D', 'A'],
      },
    ],
    challenge: [
      {
        kind: 'song',
        key: 'with7',
        song: 'twinkle',
        in: { tonic: 'G', mode: 'major' },
        keys: ['G', 'D', 'A'],
        pool: [1, 4, 5, V7],
        bpm: 100,
        start: 'none',
      },
    ],
  },
  checkAnswers: [0, 0, 0],
  copy: { en, vi },
};
