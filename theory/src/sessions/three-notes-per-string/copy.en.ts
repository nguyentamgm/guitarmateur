import type { SessionCopy } from '../types';

export const en: SessionCopy = {
  title: 'Three notes per string',
  summary:
    'Add a passing note to a familiar lick and carry the full scale across the strings in time.',
  goal: 'Play a lick with one new scale note and cross strings in the first position without losing the pulse.',
  needs: 'A guitar in standard tuning. About 15–20 minutes.',
  recap: [
    'A minor pentatonic gives you A, C, D, E and G.',
    'A passing note helps the melody move between two notes.',
  ],
  parts: {
    listen: {
      title: 'Listen',
      body: [
        'Tap with the click. Both runs start with the same notes. Listen to how many fit between clicks. On your guitar, play the familiar A–C–E lick, then put B between A and C. Hear the added note lead into C.',
      ],
    },
    understand: {
      title: 'Understand',
      body: [
        'A natural minor adds B (2) and F (♭6) to A minor pentatonic. A seven-note scale gives you seven positions when each string takes three successive notes. Three notes per string tells your fretting hand where to go. A triplet tells both hands when to play three evenly spaced notes in one beat.',
      ],
    },
    play: {
      title: 'Play',
      body: [
        'Count “1 trip-let, 2 trip-let”. In the G major run, start with three notes on string 6 and change to string 5 on the next click. Repeat at a pace you can keep even. Then find position 1 of A natural minor and move the A–B–C–E idea there.',
      ],
    },
    challenge: {
      title: 'Challenge',
      body: [
        'Keep the A minor backing running. In position 1, play A–C–E over Am, then try A–B–C–E next time Am returns. Use frets 5, 7 and 8 on string 6 and fret 7 on string 5. Then try E–F–G. Play E and F at frets 7 and 8 on string 5 and land on G at fret 5 on string 4.',
      ],
    },
  },
  blocks: {
    pulse: {
      intro:
        'Listen for the accent on beat 1. The two versions keep the same tempo and start on the same note.',
      ask: 'How many even notes fit in each beat?',
      answers: { eighths: 'Two eighth notes', triplets: 'Three triplet notes' },
      right: 'Yes. {answer} per beat.',
      wrong:
        'You heard {answer} per beat. Hear the other subdivision at the same tempo, then hear yours again.',
    },
    passing: {
      intro:
        'Start the Am backing. The model plays A–C–E in bar 1 and A–B–C–E in bar 2 over the same chord. Try both on guitar in the next two bars.',
    },
    spelling: {
      intro:
        'Choose F major and look for B♭. The key signature gives it a flat, and each letter appears once in the scale.',
    },
    strings: {
      intro:
        'In G major position 1, find G–A–B on string 6, then C–D–E on string 5. Tap the six notes and follow the string change.',
    },
    tile: {
      intro:
        'Select neighbouring positions and see which notes they share. Follow the numbered positions around the neck until the pattern starts over.',
    },
    triplets: {
      intro:
        'Choose position 1, Straight and Up. Start slowly. Each click begins a new group of three. Cross to the next string on the next click before you increase the tempo.',
    },
    keys: {
      intro:
        'Choose C major, then A minor, then position 1. C major and A natural minor use the same notes with a different root. Find A–B–C on string 6 and E on string 5.',
    },
    rock: {
      intro:
        'Use the box to check the string change. Play B or F briefly on the way into the next note and listen to what the extra note does to the lick.',
    },
  },
  check: [
    {
      question: 'Which note can lead from A into C in A natural minor?',
      options: ['B', 'B♭', 'C♯'],
      why: 'B is degree 2 and sits between A and C.',
    },
    {
      question: 'What does a triplet describe?',
      options: [
        'The number of frets in a shape',
        'The number of strings to cross',
        'Three even notes in one beat',
      ],
      why: 'Triplet describes timing. Three notes per string describes the fingering layout.',
    },
    {
      question: 'How many positions come from starting on each degree of the full scale?',
      options: ['Five', 'Seven', 'Twelve'],
      why: 'Each of the seven degrees can start a position on string 6.',
    },
  ],
  canDo: [
    'I can add B or F as a passing note and hear what it changes.',
    'I can play three even notes and arrive on the next string with the click.',
  ],
};
