import type { SessionCopy } from '../types';

export const en: SessionCopy = {
  title: 'Chords from outside the key',
  summary: 'Spot chords borrowed from outside the key: hear the three most common guest chords (♭VII, iv, III7) and play their loops.',
  goal: 'After this session you can hear when a song uses a chord from outside its key, and name the three most common ones.',
  needs: 'A guitar in tune. About 15 minutes.',
  recap: [
    'A key has its own chords (I, IV, V major; vi minor).',
    'V7 pulls to I.',
    'Lower case = minor.',
  ],
  parts: {
    listen: {
      title: 'Listen',
      body: [
        'Most songs stick to the chords of the key, but surprises happen.',
        'Listen to four bars in a major key.',
        'Decide which bar has the chord that does not belong.',
      ],
    },
    understand: {
      title: 'Understand',
      body: [
        'Songs borrow chords from outside the key to add colour and surprise.',
        'Three guests cover most cases, shown next to the chord they replace:',
        '♭VII (a major chord one whole step below I: in G, F) sounds like rock; iv (the IV chord made minor: Cm) sounds wistful, often right after IV; III7 (B7) is a 7th chord that pulls into vi, just as V7 pulls into I.',
      ],
    },
    play: {
      title: 'Play',
      body: [
        'One loop per guest chord in the key of G.',
        'Strum with pattern D-D-D-DU and feel how each guest creates its own mood.',
        'Notice how iv often follows IV, and III7 resolves into vi.',
      ],
    },
    challenge: {
      title: 'Challenge',
      body: [
        'Four bars; one may be a guest chord.',
        'If a bar sounds not from here, try the three guests.',
        'Fill in the Roman numerals for each bar.',
      ],
    },
  },
  blocks: {
    odd: {
      intro: 'Which bar has the chord that does not belong?',
      ask: 'Which bar has the chord that does not belong?',
      answers: {
        '2': 'Bar 2',
        '3': 'Bar 3',
        '4': 'Bar 4',
      },
      right: 'Right: bar {answer}. The guest chord was {detail}.',
      wrong: 'That was bar {answer}: {detail}. Hear the progression again, then with the key’s own chord.',
    },
    guests: {
      intro: 'Three guests cover most cases, shown next to the chord they replace: V next to ♭VII, IV next to iv, vi next to III7.',
    },
    flat7: {
      intro: '♭VII: a major chord one whole step below I: in G, F. Sounds like rock.',
    },
    minor4: {
      intro: 'iv: the IV chord made minor: Cm. Sounds wistful, often right after IV.',
    },
    three7: {
      intro: 'III7: B7 is a 7th chord that pulls into vi, just as V7 pulls into I.',
    },
    fill: {
      intro: 'Four bars; one may be a guest. If a bar sounds not from here, try the three guests: ♭VII, iv, or III7.',
      ask: 'Pick a Roman numeral for each bar',
      allRight: 'All right: every chord fits!',
      someWrong: 'Check each bar that sounds outside the key.',
    },
  },
  check: [
    {
      question: 'In the key of G major, what is the ♭VII chord?',
      options: ['F', 'F♯', 'Em'],
      why: 'A whole step below G is F, so ♭VII in G major is F major.',
    },
    {
      question: 'How does the iv chord differ from IV?',
      options: ['It is minor instead of major.', 'It has an added 7th.', 'It is played one fret higher.'],
      why: 'iv takes the key’s major IV chord and turns it into a minor triad.',
    },
    {
      question: 'Which chord does III7 naturally lead to?',
      options: ['vi', 'I', 'IV'],
      why: 'III7 is a 7th chord that pulls a fourth up into vi, just like V7 pulls to I.',
    },
  ],
  canDo: [
    'Hear which bar is the outside chord.',
    'Play the three loops.',
    'Name ♭VII, iv and III7 in G.',
  ],
};
