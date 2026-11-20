import type { Session } from '../types';
import { en } from './copy.en';
import { vi } from './copy.vi';

export const chordFamily: Session = {
  slug: 'chord-family',
  path: 'accompany',
  stage: 'B',
  concepts: ['K5.2', 'K5.3', 'K4.5'],
  earLevel: 6,
  settings: ['strumSpeed'],
  parts: {
    listen: [{ kind: 'listen', key: 'count', drill: 'chordCount' }],
    understand: [{ kind: 'lesson', key: 'family', lesson: 'keys', step: 'family' }],
    play: [
      { kind: 'chords', key: 'shapes', in: { tonic: 'G', mode: 'major' }, chords: [1, 4, 5] },
      { kind: 'strumAlong', key: 'loop', in: { tonic: 'G', mode: 'major' }, bars: [1, 4, 5, 1], bpm: 70 },
    ],
    challenge: [
      {
        kind: 'strumAlong',
        key: 'numbers',
        in: { tonic: 'G', mode: 'major' },
        bars: [1, 4, 5, 1],
        bpm: 80,
        numeralsOnly: true,
      },
    ],
  },
  checkAnswers: [1, 0, 2],
  copy: { en, vi },
};
