import type { LickEvent } from '../../lessons/blues';
import type { Session, SessionKey } from '../types';
import { en } from './copy.en';
import { vi } from './copy.vi';

const key: SessionKey = { tonic: 'A', mode: 'minor' };
// A–C–E, then add the B between A and C in the first three-notes-per-string position.
const call: readonly LickEvent[] = [
  { cell: 0, cells: 2, note: 0, technique: 'pick' },
  { cell: 2, cells: 2, note: 2, technique: 'pick' },
  { cell: 4, cells: 2, note: 4, technique: 'pick' },
  { cell: 8, cells: 1, note: 0, technique: 'pick' },
  { cell: 9, cells: 1, note: 1, technique: 'pick' },
  { cell: 10, cells: 2, note: 2, technique: 'pick' },
  { cell: 12, cells: 2, note: 4, technique: 'pick' },
];

export const threeNotesPerString: Session = {
  slug: 'three-notes-per-string',
  path: 'lead',
  stage: 'H',
  concepts: ['K2.9', 'K2.2', 'K2.7', 'K1.5'],
  parts: {
    listen: [
      { kind: 'listen', key: 'pulse', drill: 'dupleOrTripletRun' },
      {
        kind: 'backingTrack',
        key: 'passing',
        in: key,
        bars: [1, 1, 1, 1],
        style: 'rock',
        bpm: 88,
        scale: 'naturalMinor',
        notesPerString: 3,
        call,
      },
    ],
    understand: [
      { kind: 'lesson', key: 'spelling', lesson: 'major-scale', step: 'spelling' },
      { kind: 'lesson', key: 'strings', lesson: 'three-per-string', step: 'strings' },
      { kind: 'lesson', key: 'tile', lesson: 'three-per-string', step: 'tile' },
    ],
    play: [
      { kind: 'lesson', key: 'triplets', lesson: 'three-per-string', step: 'triplets' },
      { kind: 'lesson', key: 'keys', lesson: 'three-per-string', step: 'keys' },
    ],
    challenge: [
      {
        kind: 'backingTrack',
        key: 'rock',
        in: key,
        bars: [1, 7, 6, 7],
        style: 'rock',
        bpm: 88,
        scale: 'naturalMinor',
        notesPerString: 3,
        keys: ['A', 'E', 'D'],
      },
    ],
  },
  checkAnswers: [0, 2, 1],
  copy: { en, vi },
};
