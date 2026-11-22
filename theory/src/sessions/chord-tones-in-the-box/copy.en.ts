import type { SessionCopy } from '../types';

export const en: SessionCopy = {
  title: 'Chord tones in the box',
  summary: 'Keep one scale shape and find the notes that belong to each chord as it sounds.',
  goal: 'Land on a note of the incoming chord on beat 1 and hear how it fits.',
  needs: 'A guitar in standard tuning. About 15–20 minutes.',
  recap: [
    'You can play the same pentatonic box across a progression in one key.',
    'Chord degrees are counted from the root of the chord you hear.',
  ],
  parts: {
    listen: {
      title: 'Listen',
      body: [
        'Listen to the strummed chord, then to the note that stays at the end of the phrase. Hum it against the chord. Does it feel settled, or does it sound like the phrase could keep going?',
      ],
    },
    understand: {
      title: 'Understand',
      body: [
        'The scale is your set of notes for the key. The sounding chord gives you places to land. A triad has a root, a third and a fifth. A seventh chord adds a seventh. A scale note outside the chord can add tension and lead into a chord tone.',
      ],
    },
    play: {
      title: 'Play',
      body: [
        'Keep your hand in box 1 of A minor pentatonic. On beat 1 of Am, play E at fret 5 on string 2. It is the fifth of Am. On beat 1 of G, play G at fret 8 on the same string. That makes G the root of the chord you hear. Listen through the other two bars and repeat.',
      ],
    },
    challenge: {
      title: 'Challenge',
      body: [
        'In G major, land on B on the open second string on beat 1 of G. It is the third of G. Play D at fret 3 on that string when D arrives. In the last bar, try ending on G at fret 3 on string 1. Over C, that G is a fifth.',
      ],
    },
  },
  blocks: {
    landing: {
      intro:
        'Judge only the long last note. In the replay, the first two lead notes and the chord stay the same.',
      ask: 'Does the last note belong to the chord?',
      answers: { chordTone: 'Chord tone', outside: 'Outside the chord' },
      right: 'Yes. The landing was {detail}.',
      wrong:
        'You heard {answer}. The landing was {detail}. Hear the other ending first, then the original.',
    },
    intervals: {
      intro:
        'Tap fret 7 on string 5 to find E above C. Play the pair and hear the major third. Lower E a half step to hear the minor third.',
    },
    scale: {
      intro:
        'Choose Rock i–VII–VI–VII. Look at the A minor pentatonic box and listen to the changing roots. The backing in Play adds the thirds so you can hear the full chords.',
    },
    tones: {
      intro:
        'Choose the same rock backing here. While stopped, select Am, then G. Watch which notes light up while your hand stays in the same box.',
    },
    rock: {
      intro:
        'Start in A. As the bar lights up, say the name of the sounding chord before reading the degree on the neck.',
    },
    pop: {
      intro:
        'Start in G and try one note on each new beat 1. Use the bright dots to find a landing, then listen to how its role changes with the chord.',
    },
  },
  check: [
    {
      question: 'What role does E have over Am?',
      options: ['Root', 'Fifth', 'Minor third'],
      why: 'Am contains A, C and E. E is seven semitones above A.',
    },
    {
      question: 'What changes as Am moves to G while you keep the same scale box?',
      options: ['Which notes belong to the sounding chord', 'The frets in the box', 'The tuning'],
      why: 'The chord changes under the same scale notes, so their roles change.',
    },
    {
      question: 'What can an outside note do in a phrase?',
      options: ['Change the key by itself', 'Move beat 1', 'Create tension before a chord tone'],
      why: 'Try the outside note briefly, then hear what happens when you land on a note in the chord.',
    },
  ],
  canDo: [
    'I can play E over Am and G over G on beat 1 from the same box.',
    'I can choose a different chord tone on beat 1 over the G major backing.',
  ],
};
