import type { SessionCopy } from '../types';

export const en: SessionCopy = {
  title: 'The 7th chord pulls home',
  summary: 'Meet dominant 7th chords: add a ♭7 to create tension that pulls powerfully back to the I chord.',
  goal: 'After this session you can hear a 7th chord, play D7, A7 and E7, and use V7 to lead back to I.',
  needs: 'A guitar in tune. About 15 minutes.',
  recap: [
    'The V chord pulls back to I.',
    'A chord has three chord tones: 1, 3, 5.',
    'Changing key keeps the numbers.',
  ],
  parts: {
    listen: {
      title: 'Listen',
      body: [
        'Major chords sound plain and settled.',
        'A 7th chord sounds restless, a little rough, and wants to move.',
        'Listen to one chord strummed: can you tell whether it is plain or with a 7th?',
      ],
    },
    understand: {
      title: 'Understand',
      body: [
        'Add one more note to a major chord, the note a whole step below its root (called the flat 7 and written ♭7), and you get a 7th chord (its full name: dominant 7).',
        'For example, D becomes D7.',
        'On the V chord, this extra note is one semitone above the 3 of the I chord and leans into it: that is why V7 → I sounds so final.',
        'Songbooks write "G7", "D7"; now you know what the 7 does.',
      ],
    },
    play: {
      title: 'Play',
      body: [
        'Compare three pairs of chords, each a V and its V7: D and D7 in G, A and A7 in D, E and E7 in A. In each pair, only one finger changes.',
        'Then strum I–IV–V7–I in G, D, and A.',
        'Listen to how V7 pulls strongly back to I on the final chord.',
      ],
    },
    challenge: {
      title: 'Challenge',
      body: [
        'Play Twinkle Twinkle Little Star again, this time with V7 on offer.',
        'Use V7 where the tune is about to come home to I.',
        'Both V and V7 are accepted, but hear how V7 adds extra pull.',
      ],
    },
  },
  blocks: {
    plain: {
      intro: 'A 7th chord sounds restless and wants to move, while a plain major chord sounds calm.',
      ask: 'Plain, or with a 7th?',
      answers: {
        plain: 'Plain',
        seventh: 'With a 7th',
      },
      right: 'Right: {answer}. The chord was {detail}.',
      wrong: 'That was {answer}: {detail}. Hear the other chord, then this one again.',
    },
    sevenths: {
      intro: 'Add the note a whole step below the root (♭7) to a major triad to build a dominant 7th chord.',
    },
    pull: {
      intro: 'Focus on the first part: see how the ♭7 of V7 leans into the 3 of I (V7 → I). The ii–V–I progression is for later.',
    },
    inG: {
      intro: 'In the key of G: V is D and V7 is D7. Notice how only one finger changes.',
    },
    inD: {
      intro: 'In the key of D: V is A and V7 is A7. Lift one finger to add the ♭7 note.',
    },
    inA: {
      intro: 'In the key of A: V is E and V7 is E7. Again, only one finger changes.',
    },
    loop: {
      intro: 'Strum I–IV–V7–I at 85 BPM. Hear how V7 drives the progression straight home to I. Try it in G, D, and A.',
    },
    with7: {
      intro: 'The tune again, with V7 on offer: use it where the tune is about to come home.',
      ask: 'Pick a chord for each slot',
      result: '{right} of {total} slots right.',
      allRight: 'All right: you used V7 to lead home!',
    },
  },
  check: [
    {
      question: 'The extra note added to a major chord to make a 7th chord is…',
      options: ['♭7', '7', '6'],
      why: 'A dominant 7th chord adds the ♭7, a whole step below the root, to a major triad (1, 3, 5, ♭7).',
    },
    {
      question: 'In the key of G, the V7 chord is…',
      options: ['D7', 'G7', 'C7'],
      why: 'The V chord in G major is D, so the V7 chord is D7.',
    },
    {
      question: 'A V7 chord creates tension that most wants to move to…',
      options: ['I', 'IV', 'vi'],
      why: 'The ♭7 of the V7 chord leans directly into the 3 of the I chord, pulling strongly home to I.',
    },
  ],
  canDo: [
    'I can hear the difference between a plain major chord and a 7th chord.',
    'I can play D7, A7 and E7.',
    'I can play I–IV–V7–I in three keys (G, D, A).',
  ],
};
