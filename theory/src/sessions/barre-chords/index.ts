import type { Session } from '../types';
import { en } from './copy.en';
import { vi } from './copy.vi';

export const barreChords: Session = {
  slug: 'barre-chords',
  path: 'accompany',
  stage: 'D',
  concepts: ['K4.6', 'K0.7'],
  settings: ['strumSpeed'],
  parts: {
    listen: [{ kind: 'listen', key: 'same', drill: 'sameChord' }],
    understand: [
      { kind: 'lesson', key: 'slide', lesson: 'barre', step: 'slide' },
      { kind: 'lesson', key: 'eShape', lesson: 'barre', step: 'eShape' },
      { kind: 'lesson', key: 'aShape', lesson: 'barre', step: 'aShape' },
    ],
    play: [
      { kind: 'chords', key: 'inF', in: { tonic: 'F', mode: 'major' }, chords: [1, 4, 5] },
      { kind: 'chords', key: 'bm', in: { tonic: 'D', mode: 'major' }, chords: [6] },
      { kind: 'strumAlong', key: 'loop', in: { tonic: 'F', mode: 'major' }, bars: [1, 4, 5, 1], bpm: 70, keys: ['F', 'Bb'] },
    ],
    challenge: [
      {
        kind: 'strumAlong',
        key: 'anyKey',
        in: { tonic: 'F', mode: 'major' },
        bars: [1, 5, 6, 4],
        bpm: 75,
        keys: ['F', 'Bb', 'Eb'],
        numeralsOnly: true,
        pattern: 'D-D-D-DU',
      },
    ],
  },
  checkAnswers: [0, 0, 0],
  copy: { en, vi },
};
