import { EIGHTHS_PER_BAR } from '../../core/audio';
import { parseNote } from '../../core/music';
import { lickNotesFrom, type LickEvent } from '../../lessons/blues';
import { soloWindow } from '../../lessons/solo';
import { fixedBoxPhrase } from '../boxEcho';
import type { Session, SessionKey } from '../types';
import { en } from './copy.en';
import { vi } from './copy.vi';

const key: SessionKey = { tonic: 'A', mode: 'minor' };
const scale = 'naturalMinor';
const modelNotes = fixedBoxPhrase(soloWindow(parseNote(key.tonic), scale), ['1', 'b3', '5', 'b6']);
// The first two bars end on E. Bar 3 changes the ending to F.
const model = [2, 2, 3].flatMap((ending, bar) =>
  [0, 1, ending].map((note, beat): LickEvent => ({
    cell: bar * EIGHTHS_PER_BAR + beat * 2,
    cells: 2,
    note,
    technique: 'pick',
  })),
);

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
        in: key,
        bars: [1, 7, 6, 7],
        style: 'rock',
        bpm: 88,
        scale,
        keys: ['A', 'E', 'D'],
      },
    ],
    challenge: [
      {
        kind: 'tabPhrase',
        key: 'model',
        bpm: 88,
        metronome: true,
        bars: 4,
        notes: lickNotesFrom(modelNotes, model),
      },
      { kind: 'lesson', key: 'ear', lesson: 'solo', step: 'ear' },
    ],
  },
  checkAnswers: [1, 2, 0],
  copy: { en, vi },
};
