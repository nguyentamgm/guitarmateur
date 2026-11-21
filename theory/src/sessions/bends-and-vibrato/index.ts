import { standardBlues12 } from '../blues';
import type { Session } from '../types';
import { en } from './copy.en';
import { vi } from './copy.vi';

export const bendsAndVibrato: Session = {
  slug: 'bends-and-vibrato',
  path: 'lead',
  stage: 'F',
  concepts: ['K6.3'],
  parts: {
    listen: [{ kind: 'listen', key: 'pitch', drill: 'bendPitch' }],
    understand: [{ kind: 'lesson', key: 'bends', lesson: 'blues', step: 'bends' }],
    play: [
      {
        kind: 'backingTrack',
        key: 'backing',
        in: { tonic: 'A', mode: 'major' },
        bars: standardBlues12,
        style: 'shuffle',
        bpm: 72,
        scale: 'minorBlues',
        keys: ['A', 'E', 'G'],
      },
    ],
    challenge: [{ kind: 'listen', key: 'match', drill: 'bendPitch' }],
  },
  checkAnswers: [1, 0, 2],
  copy: { en, vi },
};
