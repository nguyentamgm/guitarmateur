import type { Session } from '../types';
import { en } from './copy.en';
import { vi } from './copy.vi';

export const octaveShapes: Session = {
  slug: 'octave-shapes',
  path: 'lead',
  stage: 'E',
  concepts: ['K0.4', 'K0.5', 'K0.6', 'K0.7'],
  parts: {
    listen: [{ kind: 'listen', key: 'pair', drill: 'octaveOrFifth' }],
    understand: [
      { kind: 'lesson', key: 'grid', lesson: 'pentatonic-map', step: 'grid' },
      { kind: 'lesson', key: 'octaves', lesson: 'fretboard', step: 'octaves' },
    ],
    play: [{ kind: 'lesson', key: 'homes', lesson: 'fretboard', step: 'home' }],
    challenge: [{ kind: 'reveal', key: 'roots', drill: 'rootAcrossStrings' }],
  },
  checkAnswers: [1, 2, 0],
  copy: { en, vi },
};
