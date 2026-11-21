import { BLUES_BPM } from '../../lessons/blues';
import { bluesChordPool, standardBlues12 } from '../blues';
import type { Session, SessionKey } from '../types';
import { en } from './copy.en';
import { vi } from './copy.vi';

const key: SessionKey = { tonic: 'A', mode: 'major' };

export const shuffleAndTwelveBar: Session = {
  slug: 'shuffle-and-twelve-bar',
  path: 'lead',
  stage: 'F',
  concepts: ['K1.5', 'K5.4', 'K4.3', 'K4.5'],
  settings: ['strumSpeed'],
  parts: {
    listen: [{ kind: 'listen', key: 'feel', drill: 'straightOrShuffle' }],
    understand: [
      { kind: 'lesson', key: 'shuffle', lesson: 'blues', step: 'shuffle' },
      { kind: 'lesson', key: 'form', lesson: 'blues', step: 'twelveBar' },
      { kind: 'lesson', key: 'open', lesson: 'chord-table', step: 'openSevenths' },
    ],
    play: [
      {
        kind: 'backingTrack',
        key: 'backing',
        in: key,
        bars: standardBlues12,
        style: 'shuffle',
        bpm: BLUES_BPM,
        keys: ['A', 'E', 'G', 'D'],
      },
    ],
    challenge: [
      {
        kind: 'fillBars',
        key: 'chorus',
        in: key,
        pool: bluesChordPool,
        bars: { plan: standardBlues12, blanks: [5, 9, 10] },
        bpm: BLUES_BPM,
      },
    ],
  },
  checkAnswers: [1, 0, 2],
  practice: { in: key, bars: standardBlues12, scale: 'minorBlues', swing: true },
  copy: { en, vi },
};
