import type { SessionCopy } from '../types';

export const en: SessionCopy = {
  title: 'Guide tones on the change',
  summary: 'Use the third and seventh to make a chord change audible in one short line.',
  goal: 'Land on the third of an incoming chord on beat 1, with a one-fret move in the A blues.',
  needs: 'A guitar in standard tuning. About 15–20 minutes.',
  recap: [
    'The dominant 7 formula is 1, 3, 5 and ♭7.',
    'In the standard A blues, D7 first arrives in bar 5.',
  ],
  parts: {
    listen: {
      title: 'Listen',
      body: [
        'The first chord and lead note establish the key. When the second chord arrives, listen to the lead. Does it move to the new chord’s third, or stay on the key’s root?',
      ],
    },
    understand: {
      title: 'Understand',
      body: [
        'The third and seventh are guide tones. They help your ear recognise the chord. Take the root, third and ♭7 from familiar dominant 7 chords and put them on the three thinnest strings. Listen to the middle voice of the two shapes below.',
      ],
    },
    play: {
      title: 'Play',
      body: [
        'Start the shuffle in A. On string 2, sing and play G at fret 8 over A7. Land one fret lower, on F♯, on beat 1 of D7 in bar 5. Say the roles as you play: ♭7 of A7, then 3 of D7. Try another pass holding A at fret 5 on string 1 across the change and compare how clearly each line points to D7.',
      ],
    },
    challenge: {
      title: 'Challenge',
      body: [
        'Use the A backing in Play again. End a short lick with E on beat 3 and G on beat 4 of bar 4, then F♯ on beat 1 of bar 5. Stay on string 2 at frets 5, 8 and 7. Repeat in the next chorus and sing F♯ before you play it. Try the ii–V–I below once you can hear the A blues change.',
      ],
    },
  },
  blocks: {
    third: {
      intro:
        'Both versions use the same chords. Focus on the lead note as the second chord starts.',
      ask: 'What happened to the lead note at the chord change?',
      answers: { third: 'Moved to the new chord’s third', root: 'Stayed on the key’s root' },
      right: 'Yes. At {detail} the lead {answer}.',
      wrong: 'At {detail} the lead {answer}. Hear the other landing first, then the original.',
    },
    guide: {
      intro:
        'Play the line in the 12-bar blues scene. Its targets come from the current scale, so listen to how its seventh can help outline a chord change.',
    },
    one: { intro: 'Strum this three-note A7. Sing G, the ♭7 that sounds on string 2 at fret 8.' },
    four: {
      intro:
        'Strum this three-note D7. Sing F♯, the 3 on string 2 at fret 7. Alternate the two shapes and listen for the middle voice moving down a half step.',
    },
    blues: {
      intro:
        'Watch the marked 3rds and 7ths change with the backing. Tap the target dots to hear them. F♯ is outside A minor pentatonic, and the neck adds it at fret 7 on string 2 as a third of D7.',
    },
    jazz: {
      intro:
        'Optional ii–V–I in C. When bar 2 reaches G7, find B at fret 7 on string 1 and F at fret 6 on string 2. B is the third and F is the ♭7. Try F on beat 1 of G7, then E one fret lower when C arrives.',
    },
  },
  check: [
    {
      question: 'Which note is the third of D7?',
      options: ['G', 'A', 'F♯'],
      why: 'F♯ is a major third above D. It is the note you reach at fret 7 on string 2.',
    },
    {
      question: 'What role does G have over A7?',
      options: ['Third', '♭7', 'Fifth'],
      why: 'The guide-tone line begins on the ♭7 of A7 before moving to the third of D7.',
    },
    {
      question: 'When does the F♯ landing make the change clearest?',
      options: ['On beat 1 of D7', 'On beat 1 of A7', 'On beat 4 just before D7'],
      why: 'A strong beat on the new chord lets its third define the change.',
    },
  ],
  canDo: [
    'I can sing G–F♯ and play it on string 2 as A7 changes to D7.',
    'I can lead into F♯ with E and G and reach it on beat 1 of D7.',
  ],
};
