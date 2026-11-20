import type { MelodyEchoCopy, SessionCopy } from '../types';

const echo: MelodyEchoCopy = {
  intro:
    'Listen once. Hum the three notes, find them on your guitar, then tap them here. The first note is lit.',
  ask: 'Can you find the next note?',
  right: 'That pitch matches.',
  higher: 'Try a higher pitch.',
  lower: 'Try a lower pitch.',
  done: 'You found four phrases by ear.',
};

export const en: SessionCopy = {
  title: 'Five notes in box 1',
  summary: 'Find a three-note phrase by ear in A minor pentatonic.',
  goal: 'Play a short phrase across two strings in time, then leave a clean rest.',
  needs: 'A guitar in tune and a pick. About 15–20 minutes.',
  recap: ['A is at fret 5 on string 6.', 'Hum the root to hear where a phrase can settle.'],
  parts: {
    listen: {
      title: 'Listen',
      body: ['Let the first note guide your ear. Replay the call as often as you need.'],
    },
    understand: {
      title: 'Understand',
      body: [
        'A minor pentatonic uses five notes: A, C, D, E and G. A box gathers those notes within reach of one hand.',
      ],
    },
    play: {
      title: 'Play',
      body: [
        'Start slowly. Play three notes across two strings, one note per beat. Rest on beat four.',
      ],
    },
    challenge: {
      title: 'Challenge',
      body: [
        'Find a new call by ear. Then play your two-string phrase twice in time with the backing.',
      ],
    },
  },
  blocks: {
    call: echo,
    tab: {
      intro: 'Read the tab from left to right. Each line is a string and each number is a fret.',
    },
    formula: {
      intro: 'Sing the degrees up from the root: 1 ♭3 4 5 ♭7. Then sing the root above them.',
    },
    box: { intro: 'Find A on string 6 and follow the notes in box 1. Play them up and back down.' },
    fingers: {
      intro:
        'Keep the fretting hand in one position. Alternate down and up strokes as you cross strings.',
    },
    backing: {
      intro:
        'In A, play A and C on string 6, then D on string 5. Pick down, up, down. Touch the unused strings lightly. Stop the last note on beat four and repeat. Highlighted degrees count from the current chord; the other degrees count from the scale root.',
    },
    scales: {
      intro:
        'Both examples climb from the same root to the next octave. Listen for the spaces between the middle notes.',
      ask: 'Which scale did you hear?',
      answers: { pentatonic: 'Minor pentatonic', majorScale: 'Major scale' },
      right: 'Yes. You heard {answer} from {detail}.',
      wrong:
        'You heard {answer} from {detail}. Listen to the other scale, then the first one again.',
    },
    echo: {
      ...echo,
      intro:
        'Hum a new call and find it in box 1. Try four calls, then finish with your two-string phrase.',
    },
  },
  check: [
    {
      question: 'Which degree is A in A minor pentatonic?',
      options: ['♭3', '1', '5'],
      why: 'A is the root, degree 1.',
    },
    {
      question: 'What does a number on a tab line tell you?',
      options: ['The beat', 'The finger', 'The fret'],
      why: 'The line gives the string and the number gives the fret.',
    },
    {
      question: 'What should you hear on the rest?',
      options: ['Silence from the guitar', 'The last note ringing', 'An open string'],
      why: 'Touch the strings lightly to stop them while the backing keeps going.',
    },
  ],
  canDo: [
    'I can hum a three-note call and find it in box 1.',
    'I can play a three-note phrase across two strings twice in time, with even attacks and a quiet rest.',
  ],
};
