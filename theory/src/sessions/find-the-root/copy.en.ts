import type { SessionCopy } from '../types';

export const en: SessionCopy = {
  title: 'The root: the note that sounds like home',
  summary: 'Hear when a song has come home, hum its root, and find it on string 6.',
  goal: 'After this session you can hear when a song has come home, hum its root, and find that note on your thickest string.',
  needs: 'A guitar in tune. About 15 minutes.',
  recap: [
    'Major chords sound bright and minor chords sound dark.',
    'Music has a steady beat, and you count it 1 2 3 4.',
    'You can strum a chord once on every beat.',
  ],
  parts: {
    listen: {
      title: 'Listen',
      body: [
        'Some endings feel finished, like a full stop at the end of a sentence.',
        'Others feel like a question: the music wants to go on.',
      ],
    },
    understand: {
      title: 'Understand',
      body: [
        'Every song has one note where it rests and sounds like home. That note is the root.',
        'The set of notes and chords around that root is the song\'s key. When people say "this song is in G", G is the root.',
        'One fret up is the next note: one semitone higher.',
        'On the thickest string the notes go E (open), F (fret 1), G (fret 3), A (fret 5), B (fret 7), C (fret 8) and D (fret 10). The picture names them.',
      ],
    },
    play: {
      title: 'Play',
      body: [
        'The app strums a G chord. Hum along and slide your voice up and down until one note feels at rest. That note is G.',
        'Now find it on string 6, fret 3, and pick it on every beat 1.',
        'You do not need the G chord shape yet: it comes in session 5.',
      ],
    },
    challenge: {
      title: 'Challenge',
      body: [
        'The app plays four chords in some key. Hum the note that feels like home.',
        'Hunt for that note on string 6, one fret at a time, then show the answer.',
      ],
    },
  },
  blocks: {
    finished: {
      intro: 'Listen to four chords. Does the music stop at home?',
      ask: 'Finished, or not?',
      answers: { finished: 'Finished', notFinished: 'Not finished' },
      right: 'Right: {answer}.',
      wrong: 'That was {answer}. A phrase is finished only when its last chord is the one the music wants to rest on: {detail}. Hear the four chords again, now with {detail} added at the end.',
    },
    semitones: {
      intro: 'Each fret raises the note by one semitone.',
    },
    home: {
      intro: 'Use this quiz until you can find G, A, C and D without counting.',
    },
    hum: {
      intro: 'Hum along with the G chord until one note feels at rest. Then pick G on string 6, fret 3, on every beat 1.',
    },
    root: {
      intro: 'Listen to the four chords, hum the note that sounds like home, and hunt for it on string 6.',
      ask: 'Find the root on your thickest string.',
      answer: 'The root is {detail}: fret {answer} on string 6.',
    },
  },
  check: [
    {
      question: 'The root of a song is…',
      options: ['the first note of the song.', 'the note the song rests on.', 'the highest note of the song.'],
      why: 'The root is the note the song rests on: it sounds like home.',
    },
    {
      question: 'One fret higher on the same string is…',
      options: ['one semitone higher.', 'two semitones higher.', 'the same note.'],
      why: 'Each fret is one semitone, so one fret up is one semitone higher.',
    },
    {
      question: 'A song in the key of A has its root on string 6 at fret…',
      options: ['0', '3', '5'],
      why: 'On string 6, A is at fret 5: E (open), F (1), G (3), A (5).',
    },
  ],
  canDo: [
    'I can hear whether a phrase has finished.',
    'I can hum the root of a chord pattern.',
    'I can find that note on string 6.',
  ],
};
