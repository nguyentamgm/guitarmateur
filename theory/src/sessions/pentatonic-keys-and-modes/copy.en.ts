import type { SessionCopy } from '../types';

export const en: SessionCopy = {
  title: 'Keys and modes',
  summary: 'Shift box 1 to any key and play major or minor pentatonic.',
  goal: 'Use box 1 in major and minor keys by ear, and shift keys on string 6.',
  needs: 'A guitar in tune and a pick. About 15–20 minutes.',
  recap: [
    'Box 1 starts on string 6 at the root for minor keys, or 3 frets below the root for major keys.',
    'Relative major and minor share the exact same five notes.',
  ],
  parts: {
    listen: {
      title: 'Listen',
      body: [
        'Listen to the chord, then the pentatonic phrase that follows. Compare the bluesy rub of the minor pentatonic with the bright fit of the major pentatonic.',
      ],
    },
    understand: {
      title: 'Understand',
      body: [
        'Box 1 is a fingering pattern. Put your index finger on string 6 at fret 5 (A) to play A minor pentatonic. Slide the whole shape up two frets to fret 7 (B) and play the same phrase in B minor. Every note moves up two frets.',
        'Return to the box at fret 5. The notes A, C, D, E and G belong to both A minor pentatonic and C major pentatonic. Over Am, try ending on A. Over a C major chord, try ending on C. Listen for the note where the phrase feels at rest. That is home, the root.',
        'Now keep A as home. To play A major pentatonic, slide the whole box back from fret 5 to fret 2 (F♯). The box starts on F♯, and A is still at fret 5 on string 6. Try a phrase in the new box and finish on A.',
      ],
    },
    play: {
      title: 'Play',
      body: [
        'Comparison 1 · Same notes, different root: Play the same five notes (A, C, D, E, G) over C major and Am. Finish the phrase on C over C major, then finish on A over Am. Listen for how the new root redefines the phrase.',
        'Comparison 2 · Same root, different mode: Keep A as root and compare A major pentatonic with A minor pentatonic. Hear how the 3rd changes the whole feel from bright and sweet to dark and bluesy.',
        'Solo over the rock backing in E minor, then switch to the strummed backing in G major. Shift between keys on the neck.',
      ],
    },
    challenge: {
      title: 'Challenge',
      body: [
        'Find where box 1 starts on string 6 for minor, major, and blues songs. Watch out for the major key 3-fret shift.',
      ],
    },
  },
  blocks: {
    mode: {
      intro:
        'Listen to the chord, then the five-note phrase. Compare the bluesy rub of the minor pentatonic with the bright fit of the major pentatonic.',
      ask: 'Which pentatonic did you hear?',
      answers: { minorPenta: 'Minor pentatonic', majorPenta: 'Major pentatonic' },
      right: 'Yes. You heard {answer} over {detail}.',
      wrong:
        'You heard {answer} over {detail}. Listen to the other pentatonic first, then this one again.',
    },
    keys: {
      intro: 'Slide box 1 along string 6 to shift keys. The shape stays identical everywhere.',
    },
    home: {
      intro:
        'A minor and C major use the exact same five notes. Changing which note you treat as the root changes the entire musical feel.',
    },
    major: {
      intro:
        'To play in a major key, place box 1 three frets below the major root, on its relative minor.',
    },
    rockTrack: {
      intro:
        'Rock backing in E minor. Use E minor pentatonic in box 1 (starting at fret 0 or fret 12). Land on chord tones when the chords change.',
    },
    strumTrack: {
      intro:
        'Strummed backing in G major. Use G major pentatonic with box 1 placed three frets down at fret 0 (E minor) or fret 12.',
    },
    choose: {
      intro:
        'Find the starting fret on string 6 where box 1 belongs for minor, major, and blues songs.',
    },
  },
  check: [
    {
      question: 'Which minor pentatonic scale uses the exact same notes as C major pentatonic?',
      options: ['E minor pentatonic', 'A minor pentatonic', 'D minor pentatonic'],
      why: 'A is the relative minor of C, 3 frets below C on the fretboard.',
    },
    {
      question: 'How many frets below the major root do you place box 1 to play in a major key?',
      options: ['2 frets', '3 frets', '5 frets'],
      why: 'Box 1 starts on the relative minor root, which is always 3 frets below the major root.',
    },
    {
      question: 'Why can you use minor pentatonic over a blues progression in a major key?',
      options: [
        'Because the minor 3rd rubs against the major chord to create the blues feel',
        'Because minor pentatonic has no root',
        'Because blues songs never use dominant 7th chords',
      ],
      why: 'The clash between the flat 3rd in the scale and the natural 3rd in the chord gives the blues its characteristic grit.',
    },
  ],
  canDo: [
    'I can hear whether a pentatonic phrase sounds bright (major) or bluesy (minor) over a major chord.',
    'I can use box 1 in both minor and major keys by finding the root on string 6.',
    'I can solo over a rock backing track and a strummed major backing track in time.',
  ],
};
