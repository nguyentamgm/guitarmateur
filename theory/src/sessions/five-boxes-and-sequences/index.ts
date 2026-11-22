import type { Session } from '../types';
import { en } from './copy.en';
import { vi } from './copy.vi';

export const fiveBoxesAndSequences: Session = {
  slug: 'five-boxes-and-sequences',
  path: 'lead',
  stage: 'E',
  concepts: ['K3.4', 'K3.5', 'K3.6', 'K1.1'],
  parts: {
    listen: [{ kind: 'listen', key: 'phrase', drill: 'sequenceKind' }],
    understand: [
      { kind: 'lesson', key: 'join', lesson: 'pentatonic', step: 'connect' },
      { kind: 'lesson', key: 'map', lesson: 'pentatonic', step: 'boxes' },
    ],
    play: [{ kind: 'lesson', key: 'patterns', lesson: 'pentatonic', step: 'sequences' }],
    challenge: [{ kind: 'lesson', key: 'cross', lesson: 'pentatonic', step: 'connect' }],
  },
  checkAnswers: [1, 2, 0],
  practice: {
    in: { tonic: 'A', mode: 'minor' },
    bars: [1, 4],
    scale: 'minorPentatonic',
    boxes: [1, 2],
  },
  copy: { en, vi },
};
