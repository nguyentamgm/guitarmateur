import { POWER_RIFF_BPM } from '../powerRiff';
import type { Session } from '../types';
import { en } from './copy.en';
import { vi } from './copy.vi';

export const powerChordsAndPalmMute: Session = {
  slug: 'power-chords-and-palm-mute',
  path: 'lead',
  stage: 'G',
  concepts: ['K4.2', 'K6.5', 'K6.6', 'K2.4'],
  parts: {
    listen: [{ kind: 'listen', key: 'sound', drill: 'muteOrOpen' }],
    understand: [
      { kind: 'lesson', key: 'power', lesson: 'electric', step: 'power' },
      { kind: 'lesson', key: 'mute', lesson: 'electric', step: 'mute' },
    ],
    play: [
      { kind: 'powerRiff', key: 'riff', tonic: 'E', keys: ['E', 'A', 'G'] },
      {
        kind: 'backingTrack',
        key: 'backing',
        in: { tonic: 'E', mode: 'minor' },
        bars: [1, 1, 3, 4],
        style: 'rock',
        bpm: POWER_RIFF_BPM,
        keys: ['E', 'A', 'G', 'D'],
      },
    ],
    challenge: [{ kind: 'listen', key: 'echo', drill: 'muteOrOpen' }],
  },
  checkAnswers: [1, 2, 0],
  copy: { en, vi },
};
