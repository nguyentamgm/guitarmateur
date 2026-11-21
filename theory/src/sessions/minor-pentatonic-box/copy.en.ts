import type { MelodyEchoCopy, SessionCopy } from '../types';

const echo: MelodyEchoCopy = {
  intro:
    'The first note is already lit. Find the second note on your guitar, then tap its dot on the neck. Do the same for the last note. You can replay the whole phrase at any time.',
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
      body: [
        'Listen to the three notes as a short tune, then hum it back with one syllable per note. On the replay, listen for whether the tune goes up or down after the first note.',
      ],
    },
    understand: {
      title: 'Understand',
      body: [
        'A pentatonic scale has five notes. In A minor pentatonic they are A, C, D, E and G. Try singing A–C–D, then sing your way back to A. In A minor, ending on A gives the phrase a sense of rest. We call A the root and count it as degree 1.',
        'On one string you travel along the neck to play all five notes. You can also reach them on neighbouring strings between frets 5 and 8. That pattern is box 1 of A minor pentatonic. You see more than five dots because the same note names repeat in different octaves.',
      ],
    },
    play: {
      title: 'Play',
      body: [
        'Before starting the backing, count an even “one, two, three, four”. Pick A on one, C on two and D on three. On four, lightly touch the ringing string to silence it. Count that fourth beat out loud so you come back to A on time.',
      ],
    },
    challenge: {
      title: 'Challenge',
      body: [
        'Hum each new phrase before finding it on the guitar. After four phrases, return to Play, start the backing in A and play A–C–D twice. After the rest on beat four, does the next A land on beat one?',
      ],
    },
  },
  blocks: {
    call: echo,
    tab: {
      intro:
        'Tab shows where to play on six lines. The bottom line is string 6 (the thickest) and the top line is string 1 (the thinnest). Read left to right. For example, a 5 on the bottom line means press fret 5 on string 6 and pick that string. Tap a number on the tab to see its place on the neck.',
    },
    formula: {
      intro:
        'Listen from A at fret 5 on string 6. The move from A to C spans three frets, then C to D spans two. The numbers with a + sign show how many frets to move each time. The labels 1, ♭3, 4, 5 and ♭7 are the degrees of A, C, D, E and G. At the end you hear A again, one octave higher.',
    },
    box: {
      intro:
        'Choose box 1 and turn on note names. Find A and C on string 6 at frets 5 and 8. For D, cross to string 5 at fret 5. Tap those three dots in order, then play them on your guitar. Your fretting hand stays in one position.',
    },
    fingers: {
      intro:
        'Practise crossing strings with the click, alternating downstrokes and upstrokes (alternate picking). Give each finger its own fret. When you return to A–C–D, use your index finger at fret 5, your little finger at fret 8, then move your index finger to string 5.',
    },
    backing: {
      intro:
        'In A, play A and C on string 6, then D on string 5. Pick down, up, down. Touch the unused strings lightly. Stop the last note on beat four and repeat. Highlighted degrees count from the current chord; the other degrees count from the scale root.',
    },
    scales: {
      intro:
        'Both phrases start on the same note and end an octave higher. Listen to the move from the first note to the second. In the minor pentatonic phrase it spans three frets, like the A to C you just played. In the major scale phrase it spans two.',
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
