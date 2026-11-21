import { standardBlues12 } from '../blues';
import type { ChordSpec, Session, SessionKey } from '../types';
import { en } from './copy.en';
import { vi } from './copy.vi';

const bluesKey: SessionKey = { tonic: 'A', mode: 'major' };
const dominant = (root: '1' | '4' | '5'): ChordSpec => ({ root, id: 'dom7' });

export const guideTones: Session = {
  slug: 'guide-tones',
  path: 'lead',
  stage: 'H',
  concepts: ['K7.2', 'K5.4', 'K5.5'],
  settings: ['strumSpeed'],
  parts: {
    listen: [{ kind: 'listen', key: 'third', drill: 'thirdOrRoot' }],
    understand: [
      { kind: 'lesson', key: 'guide', lesson: 'solo', step: 'guide' },
      {
        kind: 'chords',
        key: 'one',
        in: bluesKey,
        chords: [dominant('1')],
        upperDegrees: ['3', 'b7', '1'],
      },
      {
        kind: 'chords',
        key: 'four',
        in: bluesKey,
        chords: [dominant('4')],
        upperDegrees: ['1', '3', 'b7'],
      },
    ],
    play: [
      {
        kind: 'backingTrack',
        key: 'blues',
        in: bluesKey,
        bars: standardBlues12,
        style: 'shuffle',
        bpm: 80,
        scale: 'minorBlues',
        keys: ['A', 'E', 'G'],
        guideTones: true,
      },
    ],
    challenge: [
      {
        kind: 'backingTrack',
        key: 'jazz',
        in: { tonic: 'C', mode: 'major' },
        bars: [2, dominant('5'), 1, 1],
        style: 'comp',
        bpm: 88,
        scale: 'majorPentatonic',
        guideTones: true,
      },
    ],
  },
  checkAnswers: [2, 1, 0],
  copy: { en, vi },
};
