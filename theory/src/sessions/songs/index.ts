import { parseSong, type Song, type SongDef } from './parse';

export * from './parse';

export type SongId =
  | 'frere-jacques'
  | 'mary-lamb'
  | 'twinkle'
  | 'ode-to-joy'
  | 'london-bridge'
  | 'jingle-bells'
  | 'happy-birthday'
  | 'amazing-grace';

const DEFS: readonly (SongDef & { readonly id: SongId })[] = [
  {
    id: 'frere-jacques',
    title: 'Frère Jacques',
    beatsPerBar: 4,
    melody:
      '1 2 3 1 | 1 2 3 1 | 3 4 5:2 | 3 4 5:2 | 5:.5 6:.5 5:.5 4:.5 3 1 | 5:.5 6:.5 5:.5 4:.5 3 1 | 1 5, 1:2 | 1 5, 1:2',
    chords: 'I I | I I | I I | I I | I I | I I | I I | I I',
  },
  {
    id: 'mary-lamb',
    title: 'Mary Had a Little Lamb',
    beatsPerBar: 4,
    melody: '3 2 1 2 | 3 3 3:2 | 2 2 2:2 | 3 5 5:2 | 3 2 1 2 | 3 3 3 3 | 2 2 3 2 | 1:4',
    chords: 'I I | I I | V V | I I | I I | I I | V V | I I',
  },
  {
    id: 'twinkle',
    title: 'Twinkle Twinkle Little Star',
    beatsPerBar: 4,
    melody:
      '1 1 5 5 | 6 6 5:2 | 4 4 3 3 | 2 2 1:2 | 5 5 4 4 | 3 3 2:2 | 5 5 4 4 | 3 3 2:2 | 1 1 5 5 | 6 6 5:2 | 4 4 3 3 | 2 2 1:2',
    chords:
      'I I | IV I | IV I | V I | I IV | I V | I IV | I V | I I | IV I | IV I | V I',
  },
  {
    id: 'ode-to-joy',
    title: 'Ode to Joy',
    beatsPerBar: 4,
    melody:
      '3 3 4 5 | 5 4 3 2 | 1 1 2 3 | 3:1.5 2:.5 2:2 | 3 3 4 5 | 5 4 3 2 | 1 1 2 3 | 2:1.5 1:.5 1:2',
    chords: 'I I | V V | I I | I V | I I | V V | I I | V I',
  },
  {
    id: 'london-bridge',
    title: 'London Bridge',
    beatsPerBar: 4,
    melody:
      '5:1.5 6:.5 5 4 | 3 4 5:2 | 2 3 4:2 | 3 4 5:2 | 5:1.5 6:.5 5 4 | 3 4 5:2 | 2:2 5:2 | 3 1:3',
    chords: 'I I | I I | V V | I I | I I | I I | V V | I I',
  },
  {
    id: 'jingle-bells',
    title: 'Jingle Bells',
    beatsPerBar: 4,
    melody:
      '3 3 3:2 | 3 3 3:2 | 3 5 1:1.5 2:.5 | 3:4 | 4 4 4:1.5 4:.5 | 4 3 3 3:.5 3:.5 | 3 2 2 3 | 2:2 5:2',
    chords: 'I I | I I | I I | I I | IV IV | IV I | V V | V V',
  },
  {
    id: 'happy-birthday',
    title: 'Happy Birthday',
    beatsPerBar: 3,
    melody:
      '_:2 5,:.5 5,:.5 | 6, 5, 1 | 7,:2 5,:.5 5,:.5 | 6, 5, 2 | 1:2 5,:.5 5,:.5 | 5 3 1 | 7, 6, 4:.5 4:.5 | 3 1 2 | 1:3',
    chords: '- | I | V | V | I | I | IV | I | I',
    accept: { 7: ['V'] },
  },
  {
    id: 'amazing-grace',
    title: 'Amazing Grace',
    beatsPerBar: 3,
    melody:
      '_:2 5, | 1:2 3:.5 1:.5 | 3:2 2 | 1:2 6, | 5,:2 5, | 1:2 3:.5 1:.5 | 3:2 2 | 5:3 | 5:3',
    chords: '- | I | I | IV | I | I | I | V | V',
  },
];

export const SONGS: Readonly<Record<SongId, Song>> = Object.freeze(
  Object.fromEntries(DEFS.map((def) => [def.id, parseSong(def)])) as Record<SongId, Song>,
);
