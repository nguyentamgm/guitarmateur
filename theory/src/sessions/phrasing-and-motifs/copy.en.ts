import type { SessionCopy } from '../types';

export const en: SessionCopy = {
  title: 'Phrasing and motifs',
  summary: 'Repeat a short idea, change its landing with the chord, and give it room to breathe.',
  goal: 'Sing and play a three-note motif, vary one ending, and keep time through a bar of rest.',
  needs: 'A guitar in standard tuning. About 15–20 minutes.',
  recap: [
    'A chord tone gives a lick a place to land.',
    'Keep counting through a rest so you know when to come in again.',
  ],
  parts: {
    listen: {
      title: 'Listen',
      body: [
        'Each example lasts three bars. Listen for an idea you could sing back. Does it return with the same rhythm and then change its ending, or do the eighth notes keep on moving?',
      ],
    },
    understand: {
      title: 'Understand',
      body: [
        'A motif is a short musical idea that you can recognise when it comes back. You can keep the first notes and the timing, change the last note to suit the new chord, and leave space after the phrase.',
      ],
    },
    play: {
      title: 'Play',
      body: [
        'Over Am, play A–C–E on beats 1, 2 and 3, then rest. Repeat the same idea over G with the same timing. When F arrives, keep A and C and change E to F. Leave the fourth bar empty and count back into Am.',
      ],
    },
    challenge: {
      title: 'Challenge',
      body: [
        'Hear the model, then sing and copy it on guitar. Go back to the backing above and play all four bars. On the next pass, sing the original idea and listen for the one changed ending. Use the ear exercise to try another short idea.',
      ],
    },
  },
  blocks: {
    idea: {
      intro:
        'Keep tapping through all three bars. Listen for the space after the first two phrases.',
      ask: 'Did you hear a motif or a continuous run?',
      answers: { motif: 'Motif with a changed ending', noodling: 'Continuous run' },
      right: 'Yes. You heard {answer} in {detail} minor.',
      wrong:
        'You heard {answer} in {detail} minor. On the replay, listen for the second bar and the final landing.',
    },
    phrase: {
      intro:
        'Choose Rock i–VII–VI–VII and play the backing. Follow the tab through the idea, its repeat, and the changed ending. The fourth bar gives you space to answer.',
    },
    rock: {
      intro:
        'Use frets 5 and 8 on string 6 for A and C. E is fret 7 on string 5. Move one fret higher on string 5 to reach F, the root of the third chord.',
    },
    model: {
      intro:
        'Tap along with A–C–E. Its fourth beat is empty. Keep that rhythm when you change the ending.',
      label: 'Tab of the A–C–E motif',
      play: 'Hear the motif',
    },
    ear: {
      intro:
        'Choose one bar and use the first-note help. Hear the idea and find it on guitar, then tap the notes on the diagram in order.',
    },
  },
  check: [
    {
      question: 'What keeps a changed motif recognisable?',
      options: [
        'A new rhythm for every note',
        'Keeping its opening notes and rhythm',
        'Making every note longer',
      ],
      why: 'A repeated opening lets your ear recognise the idea before the ending changes.',
    },
    {
      question: 'Which ending lands on the root when the third chord is F?',
      options: ['E', 'G', 'F'],
      why: 'F is one fret above E on string 5 and is the root of the new chord.',
    },
    {
      question: 'How do you keep your place through the fourth bar?',
      options: [
        'Count all four beats through the rest',
        'Skip to the top as soon as the last note stops',
        'Pick every beat',
      ],
      why: 'The backing still has four beats in the bar. Count them so the next entrance stays in time.',
    },
  ],
  canDo: [
    'I can sing and repeat a short idea without losing the beat.',
    'I can change the ending when F arrives and count through the empty fourth bar.',
  ],
};
