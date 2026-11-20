import type { Session } from '../types';
import { en } from './copy.en';
import { vi } from './copy.vi';

const bVII = { root: 'b7', id: 'major' } as const;
const iv = { root: '4', id: 'minor' } as const;
const III7 = { root: '3', id: 'dom7' } as const;

export const outsideChords: Session = {
  slug: 'outside-chords',
  path: 'accompany',
  stage: 'D',
  concepts: ['K8.5'],
  settings: ['strumSpeed'],
  parts: {
    listen: [{ kind: 'listen', key: 'odd', drill: 'oddChord' }],
    understand: [{ kind: 'chords', key: 'guests', in: { tonic: 'G', mode: 'major' }, chords: [5, bVII, 4, iv, 6, III7] }],
    play: [
      { kind: 'strumAlong', key: 'flat7', in: { tonic: 'G', mode: 'major' }, bars: [1, bVII, 4, 1], bpm: 85, pattern: 'D-D-D-DU' },
      { kind: 'strumAlong', key: 'minor4', in: { tonic: 'G', mode: 'major' }, bars: [1, 4, iv, 1], bpm: 80, pattern: 'D-D-D-DU' },
      { kind: 'strumAlong', key: 'three7', in: { tonic: 'G', mode: 'major' }, bars: [1, III7, 6, 4], bpm: 85, pattern: 'D-D-D-DU' },
    ],
    challenge: [{ kind: 'fillBars', key: 'fill', in: { tonic: 'G', mode: 'major' }, keys: ['G', 'D'], pool: [1, 4, 5, 6, bVII, iv, III7], bars: 4, bpm: 85 }],
  },
  checkAnswers: [0, 0, 0],
  copy: { en, vi },
};
