import type { SessionCopy } from '../types';

export const en: SessionCopy = {
  title: 'Change the key',
  summary:
    'Move songs to other keys: keep the Roman numerals and start from a new root, or use a capo to raise open shapes.',
  goal: 'After this session you can move a I–IV–V song to the keys of G, D and A, and use a capo to reach other keys.',
  needs: 'A guitar in tune. About 15 minutes.',
  recap: [
    'I, IV and V and what each does: I is home, V pulls home, IV moves away.',
    'In the key of G they are G, C and D.',
    'You found the chords of two tunes using them.',
  ],
  parts: {
    listen: {
      title: 'Listen',
      body: [
        'Play both rows. It is the same progression: one is just higher.',
        'What stayed the same? The numbers.',
      ],
    },
    understand: {
      title: 'Understand',
      body: [
        'To change key (to transpose), keep the numbers and start from another root.',
        'The table gives I, IV, V in four keys. C needs the F chord, which is a barre chord: session 14.',
        'A capo is a clamp across one fret; it raises every open chord by that many semitones. Play the shapes of G with a capo on fret 2 and the song sounds in A.',
      ],
    },
    play: {
      title: 'Play',
      body: [
        'Two new shapes, A and E (you met E in session 1); D you know.',
        'Then the same loop in G, D and A: switch key with the chips.',
      ],
    },
    challenge: {
      title: 'Challenge',
      body: [
        'The tune from the last session, now in D, then in A.',
        'Fill the slots from the numbers you remember, not by trial.',
      ],
    },
  },
  blocks: {
    same: {
      intro: 'Listen to the same progression in two different keys. Compare how both rows sound.',
      caption:
        'Play both rows. It is the same progression: one is just higher. What stayed the same? The numbers.',
    },
    table: {
      intro:
        'To change key (to transpose), keep the numbers and start from another root. The table gives I, IV, V in four keys.',
      caption: 'Play the shapes of G with a capo on fret 2 and the song sounds in A.',
    },
    shapes: {
      intro:
        'Two new shapes to learn: A and E. Together with D, they form the I, IV and V chords of A major.',
    },
    keys: {
      intro: 'Play the same loop in G, D and A. Switch key with the chips and keep the rhythm steady.',
    },
    moved: {
      intro:
        'Twinkle Twinkle Little Star in D, then A. Fill the slots from the numbers you remember, not by trial.',
      ask: 'Pick a chord for each slot',
      result: '{right} of {total} slots right.',
      allRight: 'All right: the tune works in D and in A using the same numbers!',
    },
  },
  check: [
    {
      question: 'When a song changes key, what stays the same?',
      options: ['The Roman numerals', 'The chord names', 'The fretboard positions'],
      why: 'The relationships between chords (I, IV, V) stay the same; only the root and chord symbols change.',
    },
    {
      question: 'I–IV–V in the key of A is…',
      options: ['A, D, E', 'G, C, D', 'D, G, A'],
      why: 'In A major, degree 1 is A, degree 4 is D, and degree 5 is E.',
    },
    {
      question: 'G shapes with a capo on fret 2 sound in the key of…',
      options: ['A', 'B', 'A♭'],
      why: 'A capo on fret 2 raises every pitch by two semitones: G raised two semitones is A.',
    },
  ],
  canDo: [
    'I can play I–IV–V–I in G, D and A.',
    'I moved the tune to D and A without looking anything up.',
    'I can say what a capo on fret 2 does.',
  ],
};
