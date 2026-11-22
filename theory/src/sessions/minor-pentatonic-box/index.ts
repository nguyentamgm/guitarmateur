import type { Session } from '../types';
import { en } from './copy.en';
import { vi } from './copy.vi';

const key = { tonic: 'A', mode: 'minor' } as const;

export const minorPentatonicBox: Session = {
  slug: 'minor-pentatonic-box',
  path: 'lead',
  stage: 'E',
  concepts: ['K0.3', 'K0.8', 'K3.2', 'K3.4'],
  earLevel: 12,
  practice: { in: key, bars: [1, 4], scale: 'minorPentatonic', boxes: [1] },
  parts: {
    listen: [{ kind: 'boxEcho', key: 'call', tonic: 'A', notes: 3 }],
    understand: [
      { kind: 'lesson', key: 'tab', lesson: 'fretboard', step: 'tab' },
      { kind: 'lesson', key: 'formula', lesson: 'pentatonic-map', step: 'formula' },
      { kind: 'lesson', key: 'box', lesson: 'pentatonic-map', step: 'boxes' },
    ],
    play: [
      { kind: 'lesson', key: 'fingers', lesson: 'rhythm', step: 'fingers' },
      {
        kind: 'backingTrack',
        key: 'backing',
        in: key,
        bars: [1, 1, 4, 4],
        style: 'rock',
        bpm: 80,
        scale: 'minorPentatonic',
        keys: ['A', 'E', 'D'],
      },
      { kind: 'listen', key: 'scales', drill: 'pentatonicOrMajor' },
    ],
    challenge: [{ kind: 'boxEcho', key: 'echo', tonic: 'A', notes: 3 }],
  },
  checkAnswers: [1, 2, 0],
  copy: { en, vi },
};
