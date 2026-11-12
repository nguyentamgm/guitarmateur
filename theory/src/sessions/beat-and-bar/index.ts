import type { Session } from '../types';
import { en } from './copy.en';
import { vi } from './copy.vi';

export const beatAndBar: Session = {
  slug: 'beat-and-bar',
  path: 'accompany',
  stage: 'A',
  concepts: ['K1.1', 'K1.3', 'K1.4', 'K4.5'],
  parts: {
    listen: [{ kind: 'listen', key: 'onBeat', drill: 'onBeat' }],
    understand: [
      { kind: 'lesson', key: 'beat', lesson: 'rhythm', step: 'beat' },
      { kind: 'lesson', key: 'counting', lesson: 'rhythm', step: 'counting' },
    ],
    play: [
      { kind: 'chords', key: 'shapes', in: { tonic: 'E', mode: 'minor' }, chords: [1, 4] },
      { kind: 'strumAlong', key: 'slow', in: { tonic: 'E', mode: 'minor' }, bars: [1, 1, 4, 4], bpm: 60 },
    ],
    challenge: [{ kind: 'strumAlong', key: 'changes', in: { tonic: 'E', mode: 'minor' }, bars: [1, 4, 1, 4], bpm: 80 }],
  },
  checkAnswers: [1, 0, 2],
  copy: { en, vi },
};
