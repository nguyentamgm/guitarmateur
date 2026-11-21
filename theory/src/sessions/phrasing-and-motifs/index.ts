import { lickNotes } from '../../lessons/blues';
import type { Session } from '../types';
import { en } from './copy.en';
import { vi } from './copy.vi';

export const phrasingAndMotifs: Session = {
  slug: 'phrasing-and-motifs',
  path: 'lead',
  stage: 'H',
  concepts: ['K7.4', 'K7.5', 'K1.2'],
  parts: {
    listen: [{ kind: 'listen', key: 'idea', drill: 'motifOrNoodling' }],
    understand: [{ kind: 'lesson', key: 'phrase', lesson: 'solo', step: 'phrase' }],
    play: [
      {
        kind: 'backingTrack',
        key: 'rock',
        in: { tonic: 'A', mode: 'minor' },
        bars: [1, 7, 6, 7],
        style: 'rock',
        bpm: 88,
        scale: 'minorPentatonic',
        keys: ['A', 'E', 'D'],
      },
    ],
    challenge: [
      {
        kind: 'tabPhrase',
        key: 'model',
        bpm: 88,
        metronome: true,
        notes: lickNotes(
          undefined,
          [0, 1, 3].map((note, beat) => ({ cell: beat * 2, cells: 2, note, technique: 'pick' })),
        ),
      },
      { kind: 'lesson', key: 'ear', lesson: 'solo', step: 'ear' },
    ],
  },
  checkAnswers: [1, 2, 0],
  copy: { en, vi },
};
