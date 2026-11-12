import type { Session } from '../types';
import { en } from './copy.en';
import { vi } from './copy.vi';

export const majorOrMinor: Session = {
  slug: 'major-or-minor',
  path: 'accompany',
  stage: 'A',
  concepts: ['K0.1', 'K0.3', 'K4.1', 'K4.5'],
  parts: {
    listen: [{ kind: 'listen', key: 'quality', drill: 'quality' }],
    understand: [
      { kind: 'lesson', key: 'strings', lesson: 'fretboard', step: 'strings' },
      { kind: 'lesson', key: 'open', lesson: 'chords', step: 'open' },
    ],
    play: [
      {
        kind: 'chords',
        key: 'shapes',
        in: { tonic: 'E', mode: 'minor' },
        chords: [1, { root: '1', id: 'major' }],
      },
    ],
    challenge: [{ kind: 'reveal', key: 'echo', drill: 'quality' }],
  },
  checkAnswers: [1, 0, 2],
  copy: { en, vi },
};
