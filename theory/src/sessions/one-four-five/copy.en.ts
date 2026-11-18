import type { SessionCopy } from '../types';

export const en: SessionCopy = {
  title: 'I, IV or V?',
  summary: 'Tell IV from V by ear, hear how V pulls back to I, and write a four-bar progression by ear.',
  goal: 'After this session you can hear whether a chord is I, IV or V, and write down a four-bar progression by ear.',
  needs: 'A guitar in tune. About 15 minutes.',
  recap: [
    'I, IV, V are the chords on degrees 1, 4, 5 (G, C, D in G).',
    'The I chord is where the music rests (session 3’s “finished”).',
    'Chords change on beat 1.',
  ],
  parts: {
    listen: {
      title: 'Listen',
      body: [
        'Each chord in a key has a job.',
        'V leans back towards I: it creates tension and wants to go home.',
        'IV moves away from I and can stay away.',
        'Listen to three chords: I, then IV or V, then I. Can you hear whether the middle chord was IV or V?',
      ],
    },
    understand: {
      title: 'Understand',
      body: [
        'I is home, V pulls home, and IV goes away.',
        'Because numbers describe these jobs, the same numbers work in every key.',
        'Learn a progression as numbers and you can move it to any key: the numbers stay.',
      ],
    },
    play: {
      title: 'Play',
      body: [
        'Here are two loops to play. In the first loop (I–IV–I–V), bar 4 (V) pulls you back to bar 1.',
        'In the second loop (I–V–IV–I), IV comes after V and the pull is softer.',
        'Strum with the pattern D-D-D-DU at 80 BPM. Say the numbers aloud as you change chords.',
      ],
    },
    challenge: {
      title: 'Challenge',
      body: [
        'Four bars, and the first bar is always I.',
        'Listen to the progression, pick a number for each bar, press a chip to hear that chord, then check.',
        'Aim for three rounds right in a row.',
      ],
    },
  },
  blocks: {
    which: {
      intro: 'Each chord has a job. V pulls back towards I, while IV moves away. Listen to three chords: I, then the mystery chord, then I.',
      ask: 'Was the middle chord IV or V?',
      answers: {
        IV: 'IV',
        V: 'V',
      },
      right: 'Right: {answer}. The chords were {detail}.',
      wrong: 'That was {answer}: {detail}. Hear both versions to compare.',
    },
    numbers: {
      intro: 'Play I–V–vi–IV… pick the progression I–IV–V and move it to another key: the numbers stay.',
    },
    a: {
      intro: 'Bar 4 (V) pulls you back to bar 1 (I). Play along with the D-D-D-DU pattern at 80 BPM.',
    },
    b: {
      intro: 'Here IV follows V and the pull is softer. Say the numbers aloud as you play.',
    },
    fill: {
      intro: 'Four bars, the first is always I. Listen, pick a number for each bar, press a chip to hear that chord, then check. Aim for three rounds right in a row.',
      ask: 'Pick the chord for each bar',
      allRight: 'All four bars right!',
      someWrong: 'Some bars were different. Press Play again to compare.',
    },
  },
  check: [
    {
      question: 'Which chord pulls hardest back to I?',
      options: ['V', 'IV', 'ii'],
      why: 'The V chord creates the strongest pull home to I: in G, D pulls directly back to G.',
    },
    {
      question: 'A progression ends on V: it sounds…',
      options: ['finished.', 'not finished.', 'out of tune.'],
      why: 'Because V pulls strongly to I, ending on V leaves the music hanging and wanting to resolve.',
    },
    {
      question: 'I–IV–V in the key of D is…',
      options: ['D, G, A', 'D, E, A', 'G, C, D'],
      why: 'In the key of D major, degree 1 is D (I), degree 4 is G (IV), and degree 5 is A (V).',
    },
  ],
  canDo: [
    'I can hear IV from V after the I chord.',
    'I can fill in a four-bar progression of I, IV, V by ear.',
    'I can play I–IV–I–V and I–V–IV–I in G.',
  ],
};
