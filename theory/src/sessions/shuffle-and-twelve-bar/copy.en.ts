import type { SessionCopy } from '../types';

export const en: SessionCopy = {
  title: 'Shuffle and the 12-bar blues',
  summary: 'Hear the long–short shuffle and count your way through a blues chorus in A.',
  goal: 'Keep a steady shuffle pulse and predict the chord changes in a 12-bar blues.',
  needs: 'A guitar in standard tuning. About 15–20 minutes.',
  recap: ['A bar of 4/4 has four beats.', 'In A, the chords on I, IV and V start on A, D and E.'],
  parts: {
    listen: {
      title: 'Listen',
      body: [
        'Tap four even beats as you listen. Both examples play twice per beat. Listen for whether the second attack is halfway to the next tap or arrives later.',
      ],
    },
    understand: {
      title: 'Understand',
      body: [
        'Split each beat into three equal parts and count “1 trip-let, 2 trip-let”. That gives you a triplet. For a shuffle, pick on the number and on “let”. The second note lands two thirds of the way through the beat. Keep tapping on the numbers.',
      ],
    },
    play: {
      title: 'Play',
      body: [
        'Start the backing in A and count three groups of four bars. At the end of bar 4, say “D7 next”, then play D7 on beat 1 of bar 5. Do the same for E7 at bar 9 and D7 at bar 10. One strum on beat 1 is enough. Leave the rest of the bar to count.',
      ],
    },
    challenge: {
      title: 'Challenge',
      body: [
        'Listen to the whole chorus and count along before filling the gaps. After checking your answers, return to the 12-bar diagram in Understand. Try Quick change to hear D7 in bar 2, or Turnaround to hear E7 in bar 12 leading back to A7.',
      ],
    },
  },
  blocks: {
    feel: {
      intro:
        'The click stays on the beat and the riff alternates two pitches. If you hear a replay with a different feel, see whether your foot can keep tapping at the same pace.',
      ask: 'Are the eighth notes straight or shuffled?',
      answers: { straight: 'Straight', shuffle: 'Shuffle' },
      right: 'Yes. You heard {answer}.',
      wrong:
        'You heard {answer}. Listen to the same riff in the other feel, then hear the original again.',
    },
    shuffle: {
      intro:
        'Play the single-note example and switch between Straight and Shuffle. Watch the second note move on the grid while the next numbered beat stays in place. Try both feels on the open A string.',
    },
    form: {
      intro:
        'Keep the key on A and both switches off. Watch the three rows of four bars as the backing plays. A7 (I7) fills the first row, D7 (IV7) starts the second and E7 (V7) starts the third.',
    },
    open: {
      intro:
        'A dominant 7 chord adds ♭7 to a major triad. Select A7, D7 and E7 to hear and see the open shapes for this blues. Pick one chord and switch to its triad to hear what the ♭7 adds.',
    },
    backing: {
      intro:
        'Press Play and use the highlighted bar to check your count. Try the changes in A before choosing another key.',
    },
    chorus: {
      intro:
        'Press Start. The grid follows all 12 bars as they sound. Listen for the missing chords at bars 5, 9 and 10.',
      ask: 'Which chord goes in each blank bar?',
      allRight:
        'You found all three changes. Play the chorus again and name each change one beat early.',
      someWrong:
        'The grid now shows the full form. Play it again and listen to where your choices differed.',
    },
  },
  check: [
    {
      question: 'Where does the second eighth note land in a triplet shuffle?',
      options: [
        'Halfway through the beat',
        'Two thirds of the way through the beat',
        'On the next beat',
      ],
      why: 'A shuffle picks on the first and third parts of the triplet.',
    },
    {
      question: 'Which chords start bars 5 and 9 in the standard blues in A?',
      options: ['D7 then E7', 'E7 then D7', 'A7 then D7'],
      why: 'Bar 5 moves to IV7 (D7). Bar 9 moves to V7 (E7).',
    },
    {
      question: 'Which note does a dominant 7 chord add to a major triad?',
      options: ['3', '7', '♭7'],
      why: 'The dominant 7 formula is 1, 3, 5 and ♭7.',
    },
  ],
  canDo: [
    'I can play shuffled eighth notes while tapping four steady beats.',
    'I can count the full 12 bars in A and play D7, E7 and D7 on beat 1 of bars 5, 9 and 10.',
  ],
};
