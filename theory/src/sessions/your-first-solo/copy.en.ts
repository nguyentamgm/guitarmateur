import type { SessionCopy } from '../types';

export const en: SessionCopy = {
  title: 'Your first solo',
  summary: 'Find the key by ear, build a phrase over the changes and listen back to a full take.',
  goal: 'After this session you can use a four-step routine to solo over a new song and revise one landing by ear.',
  needs: 'A guitar in tune. About 20 minutes.',
  recap: [
    'The key helps you choose a scale. The chord under your phrase gives you a landing note.',
    'Repeat the rhythm of a short motif so you can recognise it when its notes change.',
  ],
  parts: {
    listen: {
      title: 'Find the key by ear',
      body: [
        'Start with a backing whose key is hidden. Listen for the note it comes back to at the end.',
      ],
    },
    understand: {
      title: 'A four-step solo routine',
      body: [
        '1. Find the root. Hum the note the song settles on and match it on string 6.',
        '2. Choose a scale. Try the major and minor chords on that root. Start with the pentatonic that fits. For blues, try the minor pentatonic with the blue note.',
        '3. Plan the phrase. Count through the form, choose two chord changes and pick a note from each incoming chord. Give a short motif room to breathe.',
        '4. Play a full pass and listen back. Keep counting through the rests. Compare one landing with a nearby chord tone and keep the one you prefer.',
        'Take G–D–Em–C. Hum G, check it at fret 3 on string 6, and choose G major pentatonic. Plan to land on A, the 5 of D, and then G, the ♭3 of Em.',
        'In bar 1, play G–B on beats 1 and 2. Count beats 3 and 4 in silence. Repeat that rhythm with A–B over D, then G–B over Em. Play E–G over C and count to the end. Use open string 3 for G, fret 2 on that string for A, open string 2 for B and open string 1 for E.',
      ],
    },
    play: {
      title: 'Play through the changes',
      body: [
        'Listen to a line that follows the chords, then play the four-bar example on your guitar.',
      ],
    },
    challenge: {
      title: 'Record, compare and play a full pass',
      body: [
        'First, record your taps on the on-screen neck and compare the two versions. The chord-tone counts are feedback for that take.',
        'Then return to the G pop backing in Play and solo through one full form on your guitar. Name the two changes you are aiming for before you start. Count through your planned rests, bring back your motif and listen for both landings.',
      ],
    },
  },
  blocks: {
    key: {
      intro:
        'Start the backing. Before opening the answer, sing the root, find it on your guitar and decide which mode and pentatonic fit.',
      ask: 'Which note feels like the root? Which chord on it fits, major or minor?',
      answer:
        'Root {detail}, string 6 fret {fret}. Start with {detail} {answer} pentatonic. Hear the root again, then replay the backing and try your scale.',
      replayAnswer: 'Hear the root',
    },
    scale: {
      intro:
        'Choose Pop in G and compare both scale choices over the same chord loop. Try the 12-bar blues, Rock and Jazz ii–V–I too. Hear the brighter major pentatonic in blues and the extra notes of the major scale in jazz. Stop the backing before moving on.',
    },
    guide: {
      intro:
        'Choose Pop in G and play the backing with Play the line set to On. Listen for the note at the start of each bar. Then try one pass with each of the other three styles.',
    },
    pop: {
      intro:
        'Start in G. Play the four-bar motif above and count the two silent beats in each bar. Listen for A as D arrives and G as Em arrives. If you switch keys, choose new targets from the chords shown. Stop the loop before recording.',
    },
    record: {
      intro:
        'Choose Pop in G, press Record and tap the four-bar example. On your first take, try E in place of A as D arrives so you have a landing to compare. After the pass, use Hear it back for Your take and Fixed landings. Listen to the D bar in both, decide which landing you prefer, then record it again with your chosen note.',
    },
  },
  check: [
    {
      question: 'What helps you choose a pentatonic for an unfamiliar song?',
      options: [
        'Find the root and test major or minor.',
        'Start at the highest fret.',
        'Match the tempo of the last song.',
      ],
      why: 'The root tells you where to put the box. The key and style help you choose the scale.',
    },
    {
      question: 'Why does A work as D arrives in the G pop loop?',
      options: ['It is the root of the key.', 'It is the third of Em.', 'It is the fifth of D.'],
      why: 'You chose A from the chord you are moving into. It is the 5 of D.',
    },
    {
      question: 'What can you learn by comparing your take with Fixed landings?',
      options: [
        'How fast you played every note.',
        'How one nearby chord tone changes the sound of an arrival.',
        'How many rests you should fill.',
      ],
      why: 'The booth changes the first note of a bar when it falls outside the chord and a nearby chord tone is available. Use your ear to choose a landing.',
    },
  ],
  canDo: [
    'On my guitar, I kept my place through a full form, including the rests.',
    'I brought back a motif I could recognise.',
    'I named two chord changes before playing and heard my chosen landing at both.',
  ],
  practiceLabel: 'Practise the 12-bar A blues in Practice →',
};
