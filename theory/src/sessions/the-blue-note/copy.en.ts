import type { SessionCopy } from '../types';

export const en: SessionCopy = {
  title: 'The blue note',
  summary: 'Hear the ♭5 between two familiar notes and use it in a short lick over the blues.',
  goal: 'Hear the extra note in the minor blues scale and use it to lead into a landing note.',
  needs: 'A guitar in standard tuning. About 15–20 minutes.',
  recap: [
    'A minor pentatonic has A, C, D, E and G.',
    'In the 12-bar blues in A, the first chord is A7.',
  ],
  parts: {
    listen: {
      title: 'Listen',
      body: [
        'On string 5, play D–E at frets 5 and 7. Then play D–E♭–E at frets 5, 6 and 7. Give both versions the same pulse. Listen for the extra note between D and E, then hear how the tension releases when you land on E.',
      ],
    },
    understand: {
      title: 'Understand',
      body: [
        'Add ♭5 to minor pentatonic and you have the minor blues scale. In A, that added note is E♭. It sits between D (4) and E (5). Use it as a passing note, a brief sound on the way to the next note.',
        'You heard a different kind of blues tension earlier when C, the ♭3 of A, rubbed against C♯, the 3 in A7. Strum an open A7 on your guitar, then pick C on string 5 at fret 3 while the upper strings ring. That tension comes from the notes sounding together. You can hear E♭ pull towards E even with no backing.',
      ],
    },
    play: {
      title: 'Play',
      body: [
        'Start the backing in A. Over the first A7 bar, play D–E. In the next bar, play D–E♭–E and let E ring. Give E♭ just a moment before you land.',
      ],
    },
    challenge: {
      title: 'Challenge',
      body: [
        'Listen to the four-note lick and sing the last note, E. Echo the lick on your guitar and hold E at the end. Then point to the fret that gave the lick its moment of tension.',
      ],
    },
  },
  blocks: {
    phrase: {
      intro:
        'Listen for three neighbouring pitches a half-step apart. The middle one is ♭5. The phrase can pass through it going up or coming down.',
      ask: 'Did the phrase pass through ♭5?',
      answers: { withBlue: 'With ♭5', plain: 'Plain pentatonic' },
      right: 'Yes. {answer} in {detail}.',
      wrong:
        'You heard {answer} in {detail}. Hear the other phrase in the same key first, then the original.',
    },
    blue: {
      intro:
        'Choose A minor blues and box 1. Play the phrase with Blue note on, then turn it off and play again. Watch the diagram as the phrase goes up to E and back through D. Listen for E♭ between them.',
    },
    backing: {
      intro:
        'Follow the highlighted bar to find the first A7. Keep your hand in box 1, with D, E♭ and E on string 5.',
    },
    echo: {
      intro:
        'Press Start for the model lick. After echoing it on guitar, tap the notes after the given root on the diagram. A is at fret 5 on string 6. On string 5, D, E♭ and E are at frets 5, 6 and 7. Choose Next for a new phrase.',
      ask: 'Can you echo the lick in box 1?',
      right: 'That’s the note. Keep going, or choose Next if you finished the phrase.',
      higher: 'The next note is higher. Listen again and try another fret.',
      lower: 'The next note is lower. Listen again and try another fret.',
      done: 'You echoed four phrases. Try the model on your guitar once more and listen to where it lands.',
    },
  },
  check: [
    {
      question: 'What do you add to A minor pentatonic to get the A minor blues scale?',
      options: ['E♭ (♭5)', 'C♯ (3)', 'B (2)'],
      why: 'E♭ is the added blue note between D and E.',
    },
    {
      question: 'Where can you land after passing through E♭ on the way up from D?',
      options: ['Stay on E♭', 'Back on D', 'Up on E'],
      why: 'E is a half-step above E♭. Try holding E to hear the tension settle.',
    },
    {
      question: 'Which note of A7 rubs against C when you play them together?',
      options: ['A', 'C♯', 'E'],
      why: 'C♯ is the major 3rd of A7, a half-step above the ♭3 you play.',
    },
  ],
  canDo: [
    'I can hear the difference between D–E and D–E♭–E on string 5.',
    'I can sing the E landing, play the model lick, and find the E♭ that leads into E.',
  ],
};
