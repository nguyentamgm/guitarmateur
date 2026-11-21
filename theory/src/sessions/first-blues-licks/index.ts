import { BLUES_BPM, EXAMPLE_TONIC, lickNotes, type LickEvent } from '../../lessons/blues';
import { standardBlues12 } from '../blues';
import type { Session, SessionKey } from '../types';
import { en } from './copy.en';
import { vi } from './copy.vi';

const key: SessionKey = { tonic: 'A', mode: 'major' };

// The lowest three notes of box 1 (A–C–D) stay the same in all three rhythms.
const rhythms = [
  [
    { cell: 0, cells: 2 },
    { cell: 2, cells: 2 },
    { cell: 4, cells: 2 },
  ],
  [
    { cell: 9, cells: 2 },
    { cell: 11, cells: 2 },
    { cell: 13, cells: 2 },
  ],
  [
    { cell: 16, cells: 2 },
    { cell: 18, cells: 2 },
    { cell: 22, cells: 4 },
  ],
] as const;
const rhythmLick = rhythms.flatMap((rhythm) =>
  rhythm.map((timing, note): LickEvent => ({ ...timing, note, technique: 'pick' })),
);

// The middle register of the minor blues box: root, ♭3, 4, ♭5, 5.
const [root, third, fourth, blueNote, fifth] = [6, 7, 8, 9, 10] as const;
const call: readonly LickEvent[] = [
  { cell: 0, cells: 1, note: root, technique: 'pick' },
  { cell: 1, cells: 1, note: third, technique: 'pick' },
  { cell: 2, cells: 2, note: fourth, technique: 'hammer' },
  { cell: 4, cells: 1, note: blueNote, technique: 'pick' },
  { cell: 5, cells: 1, note: fifth, technique: 'pick' },
  { cell: 8, cells: 2, note: third, technique: 'pick' },
  { cell: 10, cells: 4, note: fourth, technique: 'bend', bend: 2 },
];

export const firstBluesLicks: Session = {
  slug: 'first-blues-licks',
  path: 'lead',
  stage: 'F',
  concepts: ['K1.2', 'K6.4', 'K7.4', 'K5.4'],
  earLevel: 14,
  parts: {
    listen: [{ kind: 'listen', key: 'ending', drill: 'callAndResponse' }],
    understand: [
      { kind: 'lesson', key: 'lengths', lesson: 'rhythm', step: 'lengths' },
      { kind: 'lesson', key: 'legato', lesson: 'blues', step: 'legato' },
    ],
    play: [
      {
        kind: 'tabPhrase',
        key: 'rhythms',
        notes: lickNotes(EXAMPLE_TONIC, rhythmLick),
        bpm: BLUES_BPM,
        metronome: true,
      },
      {
        kind: 'backingTrack',
        key: 'backing',
        in: key,
        bars: standardBlues12,
        style: 'shuffle',
        bpm: BLUES_BPM,
        scale: 'minorBlues',
        keys: ['A', 'E', 'G', 'D'],
      },
    ],
    challenge: [
      {
        kind: 'backingTrack',
        key: 'exchange',
        in: key,
        bars: standardBlues12,
        style: 'shuffle',
        bpm: BLUES_BPM,
        scale: 'minorBlues',
        call,
      },
    ],
  },
  checkAnswers: [2, 0, 1],
  practice: { in: key, bars: standardBlues12, scale: 'minorBlues', boxes: [1], swing: true },
  copy: { en, vi },
};
