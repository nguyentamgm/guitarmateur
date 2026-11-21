import type { Session } from '../types';
import { en } from './copy.en';
import { vi } from './copy.vi';

export const pentatonicKeysAndModes: Session = {
  slug: 'pentatonic-keys-and-modes',
  path: 'lead',
  stage: 'E',
  concepts: ['K3.1', 'K3.3', 'K3.5', 'K3.7'],
  settings: ['strumSpeed'],
  earLevel: 10,
  parts: {
    listen: [{ kind: 'listen', key: 'mode', drill: 'pentaMode' }],
    understand: [
      { kind: 'lesson', key: 'keys', lesson: 'pentatonic-map', step: 'keys' },
      { kind: 'lesson', key: 'home', lesson: 'pentatonic-map', step: 'home' },
      { kind: 'lesson', key: 'major', lesson: 'pentatonic', step: 'major' },
    ],
    play: [
      {
        kind: 'backingTrack',
        key: 'rockTrack',
        in: { tonic: 'E', mode: 'minor' },
        bars: [1, 1, 4, 4],
        style: 'rock',
        bpm: 84,
        scale: 'minorPentatonic',
        keys: ['A', 'E', 'G', 'C'],
      },
      {
        kind: 'backingTrack',
        key: 'strumTrack',
        in: { tonic: 'G', mode: 'major' },
        bars: [1, 5, 6, 4],
        style: 'strum',
        bpm: 84,
        scale: 'majorPentatonic',
        keys: ['G', 'C', 'A', 'D'],
      },
    ],
    challenge: [{ kind: 'lesson', key: 'choose', lesson: 'pentatonic', step: 'choose' }],
  },
  checkAnswers: [1, 1, 0],
  copy: { en, vi },
};
