import { EXAMPLE_TONIC, lickNotes, type LickEvent } from '../../lessons/blues';
import type { Session } from '../types';
import { en } from './copy.en';
import { vi } from './copy.vi';

// The last two notes in box 1 are the root and minor third on string 1.
const root = 10;
const minorThird = 11;
const phrase: readonly LickEvent[] = [
  { cell: 0, cells: 2, note: root, technique: 'pick' },
  { cell: 2, cells: 2, note: minorThird, technique: 'hammer' },
  { cell: 4, cells: 2, note: minorThird, technique: 'pick' },
  { cell: 6, cells: 2, note: root, technique: 'pull' },
  { cell: 8, cells: 2, note: root, technique: 'pick' },
  { cell: 10, cells: 6, note: minorThird, technique: 'slide', vibrato: true },
];

export const legatoAndSlides: Session = {
  slug: 'legato-and-slides',
  path: 'lead',
  stage: 'F',
  concepts: ['K6.4', 'K0.3'],
  parts: {
    listen: [{ kind: 'listen', key: 'articulation', drill: 'pickOrLegato' }],
    understand: [{ kind: 'lesson', key: 'techniques', lesson: 'blues', step: 'legato' }],
    play: [
      {
        kind: 'backingTrack',
        key: 'backing',
        in: { tonic: 'A', mode: 'minor' },
        bars: [1, 1, 4, 4],
        style: 'rock',
        bpm: 80,
        scale: 'minorPentatonic',
        keys: ['A', 'E', 'D'],
      },
    ],
    challenge: [
      { kind: 'tabPhrase', key: 'tab', notes: lickNotes(EXAMPLE_TONIC, phrase), bpm: 72 },
      { kind: 'boxEcho', key: 'echo', tonic: 'A', notes: 3 },
    ],
  },
  checkAnswers: [1, 2, 0],
  copy: { en, vi },
};
