import { BLUES_BPM } from '../../lessons/blues';
import { standardBlues12 } from '../blues';
import type { Session } from '../types';
import { en } from './copy.en';
import { vi } from './copy.vi';

export const theBlueNote: Session = {
  slug: 'the-blue-note',
  path: 'lead',
  stage: 'F',
  concepts: ['K6.1', 'K6.2'],
  earLevel: 13,
  parts: {
    listen: [{ kind: 'listen', key: 'phrase', drill: 'hasBlueNote' }],
    understand: [{ kind: 'lesson', key: 'blue', lesson: 'blues', step: 'blueNote' }],
    play: [
      {
        kind: 'backingTrack',
        key: 'backing',
        in: { tonic: 'A', mode: 'major' },
        bars: standardBlues12,
        style: 'shuffle',
        bpm: BLUES_BPM,
        scale: 'minorBlues',
        keys: ['A', 'E', 'G'],
      },
    ],
    challenge: [
      {
        kind: 'boxEcho',
        key: 'echo',
        tonic: 'A',
        scale: 'minorBlues',
        notes: 4,
        firstPhrase: ['1', '4', 'b5', '5'],
      },
    ],
  },
  checkAnswers: [0, 2, 1],
  copy: { en, vi },
};
