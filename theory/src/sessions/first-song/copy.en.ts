import type { SessionCopy } from '../types';

export const en: SessionCopy = {
  title: 'Your first song by ear',
  summary:
    'Match chords to a melody: try I, then V, then IV, using chord tones on the strong beats to find the right chord.',
  goal: 'After this session you can find the chords for a melody by ear using I, IV and V.',
  needs: 'A guitar in tune. About 15 minutes.',
  recap: [
    'I, IV, V are the main chords of a major key (G, C, D in the key of G).',
    'The I chord is home, V pulls home, and IV moves away.',
    'Chords usually change on beat 1 or beat 3 of a bar.',
  ],
  parts: {
    listen: {
      title: 'Listen',
      body: [
        'Some songs need only one chord for the whole tune.',
        'Listen to Frère Jacques: the entire melody sits comfortably over the I chord (G).',
        'Press Play to hear the tune over the I chord. Notice how every note fits.',
      ],
    },
    understand: {
      title: 'Understand',
      body: [
        'When a melody note lands on a strong beat (beat 1 or 3), it is usually a chord tone: degree 1, 3, or 5 of the chord playing underneath.',
        'In the key of G: the G chord (I) contains G, B, D (degrees 1, 3, 5).',
        'The C chord (IV) contains C, E, G (degrees 4, 6, 1).',
        'The D chord (V) contains D, F#, A (degrees 5, 7, 2).',
        'When finding chords for a melody, try I first. If that clashes, try V (the tension chord), then IV (moving away).',
      ],
    },
    play: {
      title: 'Play',
      body: [
        'Practise changing between I and V with this eight-bar progression.',
        'This is the progression of a famous nursery rhyme: six bars of I and two bars of V.',
        'Strum along with D-D-D-DU at 80 BPM until the changes feel automatic.',
      ],
    },
    challenge: {
      title: 'Challenge',
      body: [
        'Now work out the chords for two melodies by ear.',
        'Listen to each tune, pick a chord for each slot, then check your answers.',
        'Try I first: if it clashes with the melody on beat 1, try V or IV.',
      ],
    },
  },
  blocks: {
    listenSong: {
      intro: 'Listen to how one chord (I) supports the entire melody from start to finish.',
      ask: 'Press Play to hear the tune with the I chord, then Check.',
      result: '{right} of {total} slots right.',
      allRight: 'Every slot fits the I chord!',
    },
    chords: {
      intro: 'Review the three chords in G major and the scale degrees that make up each chord.',
    },
    playMary: {
      intro: 'Play along with the eight-bar progression: I and V. Notice where the changes happen.',
    },
    challengeMary: {
      intro: 'Listen to the melody alone first. Fill in each chord slot using I, IV and V, then press Check.',
      ask: 'Pick a chord for each slot',
      result: '{right} of {total} slots right.',
      allRight: 'All right: Mary Had a Little Lamb uses only I and V!',
    },
    challengeTwinkle: {
      intro:
        'This 12-bar melody moves between I, IV and V. Listen carefully to where the chord changes on the changes in melody.',
      ask: 'Pick a chord for each slot',
      result: '{right} of {total} slots right.',
      allRight: 'All right: Twinkle Twinkle Little Star with I, IV and V!',
    },
  },
  check: [
    {
      question: 'When a melody note lands on beat 1, it is usually…',
      options: ['a chord tone of the chord playing.', 'the 7th degree of the scale.', 'any random note.'],
      why: 'Strong beats carry chord tones (degrees 1, 3, or 5 of the underlying chord) so the melody sounds grounded.',
    },
    {
      question: 'When searching for chords by ear, which chord should you try first?',
      options: ['IV', 'I', 'V'],
      why: 'Start with I because it is the home chord. If it clashes, try V, then IV.',
    },
    {
      question: 'In the key of G, the notes of the IV chord (C) are…',
      options: ['G, B, D', 'D, F#, A', 'C, E, G'],
      why: 'The IV chord built on degree 4 (C) is C major, containing C (root), E (3rd), and G (5th).',
    },
  ],
  canDo: [
    'I can find the I chord for a tune and hear that it feels like home.',
    'I can identify when a melody note on beat 1 is a chord tone.',
    'I can work out the chords for a simple tune using I, IV and V by ear.',
  ],
};
