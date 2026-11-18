import type { SessionCopy } from '../types';

export const en: SessionCopy = {
  title: 'Three chords that belong together',
  summary: 'Meet the three main chords of a key, call them I, IV, V, and play your first progression in G.',
  goal: 'After this session you can play G, C and D, and you know them as I, IV and V of the key of G.',
  needs: 'A guitar in tune. About 15 minutes.',
  recap: [
    'A song in the key of G rests on the note G: that note is its root.',
    'A major scale has seven notes numbered 1 to 7.',
    'Strum on every beat and change chords on beat 1.',
  ],
  parts: {
    listen: {
      title: 'Listen',
      body: [
        'A song rarely uses many chords. Most simple songs are built from just two or three.',
        'Listen to four bars. Can you tell how many different chords were played?',
      ],
    },
    understand: {
      title: 'Understand',
      body: [
        'Build a chord on each note of the scale and you get the chords of the key.',
        'The three chords on degrees 1, 4 and 5 are major, and they are the ones songs use most.',
        'Players write them as Roman numerals: I, IV, V. In the key of G: I = G, IV = C, V = D.',
        'A row of chords is a progression.',
      ],
    },
    play: {
      title: 'Play',
      body: [
        'Here are three shapes to learn: G, C and D.',
        'Learn G and C first, then D. Tip: practise moving from G to C slowly without strumming before using the loop.',
        'Then play the progression I–IV–V–I at 70 BPM along with the app.',
      ],
    },
    challenge: {
      title: 'Challenge',
      body: [
        'The same loop, but the grid shows only Roman numerals.',
        'Say the number out loud as you change chords: one, four, five, one.',
      ],
    },
  },
  blocks: {
    count: {
      intro: 'A song rarely uses many chords. Listen to four bars.',
      ask: 'How many different chords did you hear?',
      answers: { two: 'Two', three: 'Three' },
      right: 'Right: {answer}. The chords were {detail}.',
      wrong: 'That was {answer}: {detail}. Hear the four bars again, played slower.',
    },
    family: {
      intro: 'Press chords 1, 4 and 5 of G. Ignore the others for now: session 10 comes back to them.',
    },
    shapes: {
      intro: 'Learn G and C first, then D. Click any chord to hear it.',
    },
    loop: {
      intro: 'Play I–IV–V–I at 70 BPM along with the app. Change chords on beat 1 of each bar.',
    },
    numbers: {
      intro: 'The same loop at 80 BPM, but the grid shows only numbers. Say each number out loud as you change.',
    },
  },
  check: [
    {
      question: 'In the key of G, the IV chord is…',
      options: ['D', 'C', 'Am'],
      why: 'Counting up four degrees of the G major scale (G, A, B, C) gives C: the IV chord of G.',
    },
    {
      question: 'Roman numerals name a chord by…',
      options: ['its place in the key.', 'how many strings it uses.', 'its tempo in BPM.'],
      why: 'Roman numerals tell you which degree of the key the chord is built on: I is degree 1, IV is degree 4, and V is degree 5.',
    },
    {
      question: 'In a major key, which three chords are major?',
      options: ['ii, iii, vi', 'I, ii, iii', 'I, IV, V'],
      why: 'In every major key, the chords on degrees 1, 4 and 5 (I, IV and V) are always major chords.',
    },
  ],
  canDo: [
    'I can play G, C and D.',
    'I can play I–IV–V–I in G without stopping.',
    'I can name G, C, D as I, IV, V.',
  ],
};
