import type { SessionCopy } from '../types';

export const en: SessionCopy = {
  title: 'Happy or sad: major and minor',
  summary: 'Hear whether a chord is major or minor, and play E minor and E major.',
  goal: 'After this session you can hear whether a chord is major or minor, and play E minor and E major.',
  needs: 'A guitar in tune. About 15 minutes.',
  recap: [],
  parts: {
    listen: {
      title: 'Listen',
      body: [
        'A chord is several notes played together.',
        'Some chords sound bright or happy, some dark or sad.',
      ],
    },
    understand: {
      title: 'Understand',
      body: [
        'The bright chords are called major, the dark ones minor.',
        'A guitar has six strings, numbered 1 (thinnest) to 6 (thickest); a fret is one of the spaces on the neck.',
        'Major and minor on the same root differ by one note: in the picture, switch between E and Em and watch one dot move one fret.',
      ],
    },
    play: {
      title: 'Play',
      body: [
        'Read the chord picture and press your fingers just behind the fret.',
        'Strum down across all six strings.',
        'Play Em first with two fingers, then add one finger for E.',
      ],
    },
    challenge: {
      title: 'Challenge',
      body: [
        'The app plays E or Em. Play back what you heard on your guitar, then show the answer.',
        'Ten in a row is the aim.',
      ],
    },
  },
  blocks: {
    quality: {
      intro: 'Listen to the chord and notice how it feels.',
      ask: 'Happy or sad?',
      answers: { major: 'Happy', minor: 'Sad' },
      right: 'Right. That was {detail}: a {answer} chord.',
      wrong: 'That was {detail}: a {answer} chord. Both will play again.',
    },
    strings: {
      intro: 'Explore the six strings from string 1 (thinnest) to string 6 (thickest).',
    },
    open: {
      intro: 'Pick E, then Em. Only one finger changes.',
    },
    shapes: {
      intro: 'Place your fingers just behind the fret and strum across all six strings.',
    },
    echo: {
      intro: 'Listen closely, play the chord back on your guitar, then show the answer.',
      ask: 'Play back what you heard.',
      answer: 'It was {detail}.',
    },
  },
  check: [
    {
      question: 'What is the difference between E and E minor?',
      options: [
        'They are played on different strings.',
        'One note is one fret lower.',
        'It has two more notes.',
      ],
      why: 'E and E minor share the same root; only one note moves by one fret.',
    },
    {
      question: 'Which string is string 6?',
      options: [
        'The thickest string.',
        'The thinnest string.',
        'The middle string.',
      ],
      why: 'String 6 is the thickest string on the guitar.',
    },
    {
      question: 'A chord sounds dark and sad. It is probably…',
      options: [
        'A major chord.',
        'An open string.',
        'A minor chord.',
      ],
      why: 'Minor chords generally sound darker and sadder than bright major chords.',
    },
  ],
  canDo: [
    'I can hear whether a chord is major or minor.',
    'I can play Em and E and change between them.',
  ],
};
