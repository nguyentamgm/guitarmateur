import type { SessionCopy } from '../types';

export const en: SessionCopy = {
  title: 'Find a melody by ear',
  summary: 'Hear whether a melody steps or leaps, and copy short phrases on one string.',
  goal: 'After this session you can hear whether a melody steps or leaps, and copy a short tune on one string.',
  needs: 'A guitar in tune. About 15 minutes.',
  recap: [
    'The root is the note a song rests on and sounds like home.',
    'One fret up or down is one semitone.',
    'G is the open third string and also fret 3 of string 6.',
  ],
  parts: {
    listen: {
      title: 'Listen',
      body: [
        'A melody moves up or down, by small steps or by leaps.',
        'A step moves to the very next note of the scale. A leap jumps across several notes.',
      ],
    },
    understand: {
      title: 'Understand',
      body: [
        'Most tunes use only seven notes around the root: the major scale.',
        'We number them 1 to 7 from the root; 8 is the root again, higher. These numbers are degrees.',
        'On one string the scale is a pattern of frets you can see: two frets, two frets, one fret, two, two, two, one.',
      ],
    },
    play: {
      title: 'Play',
      body: [
        'Sing the phrase first, then tap it.',
        'The first note is always the root (the open string).',
        'If you miss, the app says whether the note you want is higher or lower.',
      ],
    },
    challenge: {
      title: 'Challenge',
      body: [
        'Three phrases of a tune you may know. Do not look it up: find it.',
        'Then play all three in a row on your own guitar.',
      ],
    },
  },
  blocks: {
    moves: {
      intro: 'A melody moves up or down, by small steps or by leaps. Listen to two notes.',
      ask: 'Step, or leap?',
      answers: {
        stepUp: 'A step up',
        stepDown: 'A step down',
        leapUp: 'A leap up',
        leapDown: 'A leap down',
      },
      right: 'Right: {answer}.',
      wrong: 'That was {answer}. Listen to the two notes again, slower.',
    },
    formula: {
      intro: 'The major scale is a pattern of steps: whole, whole, half, whole, whole, whole, half.',
    },
    echo: {
      intro:
        'Sing the phrase first, then tap it. The first note is always the root (the open string). If you miss, the app says whether the note you want is higher or lower.',
      ask: 'Hear the phrase, then tap it back.',
      right: 'Right.',
      higher: 'The note you want is higher.',
      lower: 'The note you want is lower.',
      done: 'You copied the phrases by ear.',
    },
    tune: {
      intro:
        'Three phrases of a tune you may know. Do not look it up: find it. Then play all three in a row on your own guitar.',
      ask: 'Find each phrase on string 3.',
      right: 'Right.',
      higher: 'The note you want is higher.',
      lower: 'The note you want is lower.',
      done: 'That was Frère Jacques.',
    },
  },
  check: [
    {
      question: 'How many different notes are in a major scale?',
      options: ['5', '7', '12'],
      why: 'A major scale has 7 different notes. Degree 8 is the root again, an octave higher.',
    },
    {
      question: 'Degree 1 of a scale is…',
      options: ['the root.', 'the highest note.', 'any note you choose.'],
      why: 'Degree 1 is always the root of the scale.',
    },
    {
      question: 'Before trying to play a phrase on your guitar…',
      options: ['count the frets.', 'guess the highest note.', 'sing or hum it.'],
      why: 'If you can sing or hum a phrase first, your ear guides your fingers to find it.',
    },
  ],
  canDo: [
    'I can tell a step from a leap.',
    'I can copy a three-note phrase.',
    'I can play the tune of the challenge on one string.',
  ],
};
