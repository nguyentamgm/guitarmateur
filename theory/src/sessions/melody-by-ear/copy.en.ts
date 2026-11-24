import type { SessionCopy } from '../types';

export const en: SessionCopy = {
  title: 'Find a melody by ear',
  summary: 'Tell a step from a leap, and find short tunes on one string.',
  goal: 'After this session you can hear whether a melody moves by step or leap, and copy a short tune by ear on one string.',
  needs: 'A guitar in tune. About 15 minutes.',
  recap: [
    'The root is the note a song rests on and sounds like home.',
    'One fret up or down is one semitone.',
    'Open string 3 is G.',
  ],
  parts: {
    listen: {
      title: 'Listen',
      body: [
        'A melody moves up or down from note to note.',
        'Sometimes it moves to a close neighbour (a small step). Other times it jumps across several notes (a leap).',
      ],
    },
    understand: {
      title: 'Understand',
      body: [
        'Most melodies use only seven notes around the root: the major scale.',
        'We number them 1 to 7 from the root, and 8 is the root again, higher. These numbers are degrees.',
        'On one string, the major scale follows one fret pattern from the root: two frets, two frets, one fret, then two, two, two, one.',
        'In G on string 3, the first five notes sit at frets 0 (G), 2 (A), 4 (B), 5 (C) and 7 (D).',
      ],
    },
    play: {
      title: 'Play',
      body: [
        'Now copy three-note phrases in G on string 3 (degrees 1 to 5, frets 0 to 7).',
        'Hum each phrase before you tap the neck on screen. Once you find it, play the same frets on your own guitar.',
      ],
    },
    challenge: {
      title: 'Challenge',
      body: [
        'Find three phrases of a familiar tune in G on string 3 without looking it up.',
        'Not every phrase starts on the open string here, so look at which dot is lit before you tap the rest.',
      ],
    },
  },
  blocks: {
    moves: {
      intro:
        'Press Start to hear two notes, then choose whether the second note moved up or down, by step or by leap.',
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
      intro:
        'Pick G below and play the run along string 5 to watch the +2 and +1 gaps, then switch keys to see the same pattern move.',
    },
    echo: {
      intro:
        'Press Start. The first note is already lit at fret 0 (open string 3). Tap the next two dots on screen; if you miss, the hint tells you whether the note is higher or lower. Try three or four phrases.',
      ask: 'Hear the phrase, then tap it on string 3.',
      right: 'Right.',
      higher: 'The note you want is higher.',
      lower: 'The note you want is lower.',
      done: 'You copied the phrases by ear.',
    },
    tune: {
      intro:
        'Work through each phrase by ear, then press Next. After the third phrase, play all three in a row on your own guitar and press Play again to check your playing.',
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
      why: 'A major scale has 7 different notes. Degree 8 is the root again, higher.',
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
    'I can copy a three-note phrase by ear on string 3.',
    'I can play all three phrases of the challenge tune on one string.',
  ],
};
