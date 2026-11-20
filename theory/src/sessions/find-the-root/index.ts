import type { Session } from '../types';
import { en } from './copy.en';
import { vi } from './copy.vi';

export const findTheRoot: Session = {
  slug: 'find-the-root',
  path: 'accompany',
  stage: 'A',
  concepts: ['K5.1', 'K0.2', 'K0.7'],
  earLevel: 7,
  settings: ['strumSpeed'],
  parts: {
    listen: [{ kind: 'listen', key: 'finished', drill: 'finished' }],
    understand: [
      { kind: 'lesson', key: 'semitones', lesson: 'fretboard', step: 'semitones' },
      { kind: 'lesson', key: 'home', lesson: 'fretboard', step: 'home' },
    ],
    play: [{ kind: 'strumAlong', key: 'hum', in: { tonic: 'G', mode: 'major' }, bars: [1, 1, 1, 1], bpm: 70 }],
    challenge: [{ kind: 'reveal', key: 'root', drill: 'rootNote' }],
  },
  checkAnswers: [1, 0, 2],
  copy: { en, vi },
};
