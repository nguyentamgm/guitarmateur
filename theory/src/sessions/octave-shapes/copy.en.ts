import type { SessionCopy } from '../types';

export const en: SessionCopy = {
  title: 'Find the root with octave shapes',
  summary:
    'Start with a root on string 6 and find two higher notes of the same name on strings 4 and 2.',
  goal: 'Recognise an octave by ear and use its shape to find the root higher on the neck.',
  needs: 'A guitar in standard tuning. About 15–20 minutes.',
  recap: [
    'A at fret 5 on string 6 is the root of A minor pentatonic.',
    'Each fret is one semitone.',
  ],
  parts: {
    listen: {
      title: 'Listen',
      body: [
        'Pick A at fret 5 on string 6 and hum A an octave higher. Pick the low A again, followed by fret 7 on string 5 (E). Repeat from low A, this time reaching fret 7 on string 4 (A). Which upper note matches the A you sang?',
      ],
    },
    understand: {
      title: 'Understand',
      body: [
        'From A at fret 5 on string 6, cross to string 4 and move two frets towards the guitar body. Pick fret 7. You hear A again, 12 semitones higher. A fifth spans seven semitones, so a fifth above A gives you E.',
        'From fret 7 on string 4, predict where the next A falls on string 2. This move crosses the G and B strings. They are tuned four semitones apart, while the other adjacent pairs are five apart. Move one extra fret to make up the difference: A is at fret 10 on string 2. This is the G–B shift.',
      ],
    },
    play: {
      title: 'Play',
      body: [
        'Play the three As on strings 6, 4 and 2, then retrace your steps. Start again from G at fret 3 on string 6 and try the same shapes. Sing the next note before picking it to check your prediction.',
      ],
    },
    challenge: {
      title: 'Challenge',
      body: [
        'You will hear a root and see its starting fret on string 6. Play the next two octaves on your guitar before revealing the answer. Listen back and match each of your three notes to the example.',
      ],
    },
  },
  blocks: {
    pair: {
      intro:
        'Each pair sounds one note at a time, then together. Hum the low note an octave higher and compare it with the second note.',
      ask: 'Which interval did you hear?',
      answers: { octave: 'Octave', fifth: 'Fifth' },
      right: 'Yes. From {detail}, you heard {answer}.',
      wrong:
        'That was {answer} from {detail}. Listen to the other interval from the same low note, then hear the original again.',
    },
    grid: {
      intro:
        'Play the string pairs. When a fretted note matches the next open string, look at its fret number. From G to B, fret 4 is enough.',
    },
    octaves: {
      intro:
        'Select A and tap the three As at frets 5, 7 and 10 on strings 6, 4 and 2. Also try A at fret 5 on string 1. It sounds two octaves above A at the same fret on string 6.',
    },
    homes: {
      intro:
        'Use the note map on strings 6 and 5 to find your starting note. Try naturals first, then select all 12 notes. For example, G at fret 3 on string 6 becomes G♯ one fret higher.',
    },
    roots: {
      intro:
        'Find the same note name on string 4, then on string 2. Allow for the G–B shift on the second move.',
      ask: 'Start on {detail}, string 6 fret {start}. Where are the next two octaves?',
      answer:
        '{detail} is on string 6 fret {start}, string 4 fret {middle}, then string 2 fret {high}.',
    },
  },
  check: [
    {
      question: 'Which interval takes A up to the next A?',
      options: ['A fifth', 'An octave', 'A fourth'],
      why: 'After twelve semitones you reach the same note name one octave higher.',
    },
    {
      question: 'Why does the octave shape move three frets from string 4 to string 2?',
      options: [
        'String 2 is thicker than string 4',
        'Each fret adds a whole tone',
        'G and B are tuned four semitones apart',
      ],
      why: 'G to B spans one semitone less than the other adjacent pairs. The extra fret makes up the difference.',
    },
    {
      question: 'How far apart are notes at the same fret on strings 6 and 1?',
      options: ['Two octaves', 'One octave', 'A fifth'],
      why: 'The two open E strings are two octaves apart. Fretting both at the same fret preserves that distance.',
    },
  ],
  canDo: [
    'I can distinguish an octave from a fifth by ear from the same low note.',
    'Given a root on string 6, I can play the next octaves on strings 4 and 2 before checking the answer.',
  ],
};
