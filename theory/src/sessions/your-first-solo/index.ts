import { standardBlues12 } from '../blues';
import type { Session } from '../types';
import { en } from './copy.en';
import { vi } from './copy.vi';

export const yourFirstSolo: Session = {
  slug: 'your-first-solo',
  path: 'lead',
  stage: 'H',
  concepts: ['K7.1', 'K7.2', 'K7.4', 'K7.6'],
  settings: ['strumSpeed'],
  practice: {
    in: { tonic: 'A', mode: 'major' },
    bars: standardBlues12,
    scale: 'minorBlues',
    boxes: [1],
    swing: true,
  },
  parts: {
    listen: [{ kind: 'reveal', key: 'key', drill: 'soloKey' }],
    understand: [{ kind: 'lesson', key: 'scale', lesson: 'solo', step: 'scale' }],
    play: [
      { kind: 'lesson', key: 'guide', lesson: 'solo', step: 'guide' },
      {
        kind: 'backingTrack',
        key: 'pop',
        in: { tonic: 'G', mode: 'major' },
        bars: [1, 5, 6, 4],
        style: 'strum',
        bpm: 88,
        scale: 'majorPentatonic',
        keys: ['G', 'C', 'D', 'A'],
      },
    ],
    challenge: [{ kind: 'lesson', key: 'record', lesson: 'solo', step: 'record' }],
  },
  checkAnswers: [0, 2, 1],
  copy: { en, vi },
};
