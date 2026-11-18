import type { SessionCopy } from '../types';

export const en: SessionCopy = {
  title: 'The sad chord in a happy key: vi',
  summary: 'Meet the vi chord — the only minor chord most pop songs use — and hear how it softens the progression.',
  goal: 'After this session you can spot the vi chord by ear, play I–V–vi–IV and I–vi–IV–V, and know how vi fits into the key.',
  needs: 'A guitar in tune. About 15 minutes.',
  recap: [
    'I, IV, and V are the three major chords of a major key (G, C, D in G).',
    'Major chords sound bright and open; minor chords sound darker and reflective.',
    'Chords change on beat 1.',
  ],
  parts: {
    listen: {
      title: 'Listen',
      body: [
        'A song in a major key doesn’t have to stay bright all the time.',
        'Many songs slip in one minor chord to give the melody a touch of sadness or reflection.',
        'Listen to four bars in G. The first bar is always G (I). Exactly one of the next three bars is a minor chord: can you hear which bar it is?',
      ],
    },
    understand: {
      title: 'Understand',
      body: [
        'Build a triad on degree 6 of the G major scale (E) and you get an E minor chord: Em.',
        'Because it is minor, musicians write it in lowercase Roman numerals: vi.',
        'Notice that Em (E–G–B) shares two notes with G (G–B–D). That is why vi feels like an alternate home: stable like the I chord, but sadder.',
        'Together with I, IV, and V, vi completes the famous "four chords" behind hundreds of hit songs.',
      ],
    },
    play: {
      title: 'Play',
      body: [
        'Play the four chords in G: G (I), D (V), Em (vi), and C (IV).',
        'In the first loop (I–V–vi–IV), the vi chord steps in right after the tension of V.',
        'In the second loop (I–vi–IV–V), vi follows I immediately to create an emotional early lift.',
        'Switch the key to D: I is D, V is A, IV is G, and vi is Bm. Because Bm has no open shape, it is played as a barre chord on fret 2.',
      ],
    },
    challenge: {
      title: 'Challenge',
      body: [
        'Listen to a four-bar progression using chords I, IV, V, and vi.',
        'Bar 1 is always I. Listen for where the minor colour appears: that is your vi chord.',
        'Fill in all four bars and aim for three rounds right in a row.',
      ],
    },
  },
  blocks: {
    minor: {
      intro: 'Pop songs in a major key often bring in one minor chord to add feeling. Listen to four bars.',
      ask: 'Which bar has the minor chord?',
      answers: {
        '2': 'Bar 2',
        '3': 'Bar 3',
        '4': 'Bar 4',
      },
      right: 'Right: {answer}. The minor chord was {detail}.',
      wrong: 'That was {answer}: {detail}. Hear the four bars again, with the minor chord held longer.',
    },
    family: {
      intro: 'Look at the chords of G major. Chords 1, 4, 5 are major, while chord 6 is minor: Em, written as vi.',
    },
    shapes: {
      intro: 'The four most popular chords in modern songs: G, D, Em, C (I, V, vi, IV). Click any chord to hear it.',
    },
    loopA: {
      intro: 'Play I–V–vi–IV at 80 BPM. Notice how vi (Em) softens the progression between V (D) and IV (C).',
    },
    loopB: {
      intro: 'Now try I–vi–IV–V. In the key of D, vi is Bm: because Bm has no open shape, it is played as a barre chord at fret 2.',
    },
    fill: {
      intro: 'Four bars, bar 1 is always I. Listen, identify where the vi chord (and IV or V) lands, then check.',
      ask: 'Pick the chord for each bar',
      allRight: 'All four bars right!',
      someWrong: 'Some bars were different. Press Play again to compare.',
    },
  },
  check: [
    {
      question: 'In a major key, why is the six chord written in lowercase as vi?',
      options: ['Because it is a minor chord.', 'Because it has six notes.', 'Because it is played softer.'],
      why: 'Roman numerals use lowercase (like vi) for minor chords and uppercase (like I, IV, V) for major chords.',
    },
    {
      question: 'In the key of G, the vi chord is…',
      options: ['Em', 'Am', 'Bm'],
      why: 'Counting six degrees up the G major scale (G, A, B, C, D, E) gives E: the vi chord is Em.',
    },
    {
      question: 'The four-chord progression I–V–vi–IV is famous because vi…',
      options: ['adds a touch of sadness to a major key.', 'changes the key permanently to minor.', 'must always be played as a barre chord.'],
      why: 'The vi chord provides an emotional, reflective contrast before IV and V lift the music back home.',
    },
  ],
  canDo: [
    'I can hear when a progression touches the vi chord.',
    'I can play I–V–vi–IV and I–vi–IV–V in the key of G.',
    'I know that in the key of G, vi is Em.',
  ],
};
