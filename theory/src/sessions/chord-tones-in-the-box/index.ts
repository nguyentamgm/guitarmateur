import type { Session, SessionKey } from '../types';
import { en } from './copy.en';
import { vi } from './copy.vi';

const minorKey: SessionKey = { tonic: 'A', mode: 'minor' };
const minorForm = [1, 7, 6, 7] as const;

export const chordTonesInTheBox: Session = {
  slug: 'chord-tones-in-the-box',
  path: 'lead',
  stage: 'H',
  concepts: ['K7.1', 'K7.2', 'K7.3', 'K2.3'],
  settings: ['strumSpeed'],
  earLevel: 9,
  parts: {
    listen: [{ kind: 'listen', key: 'landing', drill: 'landedOnChordTone' }],
    understand: [
      { kind: 'lesson', key: 'intervals', lesson: 'major-scale', step: 'intervals' },
      { kind: 'lesson', key: 'scale', lesson: 'solo', step: 'scale' },
      { kind: 'lesson', key: 'tones', lesson: 'solo', step: 'tones' },
    ],
    play: [
      {
        kind: 'backingTrack',
        key: 'rock',
        in: minorKey,
        bars: minorForm,
        style: 'rock',
        fullChords: true,
        bpm: 88,
        scale: 'minorPentatonic',
        keys: ['A', 'E', 'D'],
      },
    ],
    challenge: [
      {
        kind: 'backingTrack',
        key: 'pop',
        in: { tonic: 'G', mode: 'major' },
        bars: [1, 5, 6, 4],
        style: 'strum',
        bpm: 84,
        scale: 'majorPentatonic',
        keys: ['G', 'C', 'D', 'A'],
      },
    ],
  },
  checkAnswers: [1, 0, 2],
  practice: { in: minorKey, bars: minorForm, scale: 'minorPentatonic', boxes: [1] },
  copy: { en, vi },
};
