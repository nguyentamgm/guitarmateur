import type { SessionCopy } from '../types';

export const en: SessionCopy = {
  title: 'Barre chords: every key with two shapes',
  summary: 'Unlock every key with barre chords: move open E and A shapes up the neck with your first finger as a capo to play in any key.',
  goal: 'After this session you can play F and Bm, and move one shape along the neck to play I–IV–V in any key.',
  needs: 'A guitar in tune. About 15 minutes.',
  recap: [
    'The notes on string 6: E F G A B C D at frets 0 1 3 5 7 8 10.',
    'One fret is a semitone.',
    'A capo raises every open chord.',
  ],
  parts: {
    listen: {
      title: 'Listen',
      body: [
        'The same chord can be played in more than one place on the neck.',
        'Listen to an open chord, then a barre chord.',
        'Hear whether the second chord is the same chord or a different one.',
      ],
    },
    understand: {
      title: 'Understand',
      body: [
        'A barre chord is an open shape pushed up the neck, with your first finger acting as the capo.',
        'The E shape takes its name from the note under the barre on string 6; the A shape from string 5.',
        'Two shapes, twelve frets: every major and minor chord.',
      ],
    },
    play: {
      title: 'Play',
      body: [
        'Honest advice: barre chords take weeks, not minutes.',
        'Press close to the fret, keep the thumb behind the neck, and check each string alone.',
        'F and B♭ first; a buzzing string is normal at first.',
        'A handy picture: with I as an E-shape barre, IV is the A shape at the same fret and V is the A shape two frets higher.',
      ],
    },
    challenge: {
      title: 'Challenge',
      body: [
        'I–V–vi–IV with numbers only in F, B♭ and E♭: keys with no easy open chords.',
        'Use the E and A shapes to play the progression anywhere on the neck.',
      ],
    },
  },
  blocks: {
    same: {
      intro: 'The same chord can be played in more than one place.',
      ask: 'Is the second chord the same chord, or a different one?',
      answers: {
        same: 'Same chord',
        different: 'Different chord',
      },
      right: 'Right: {answer}. That was {detail}.',
      wrong: 'That was {answer}: {detail}. Hear both again, then the open shape.',
    },
    slide: {
      intro: 'Slide an open shape up the neck: your first finger replaces the nut or capo.',
    },
    eShape: {
      intro: 'The E shape takes its name from the note under the barre on string 6.',
    },
    aShape: {
      intro: 'The A shape takes its name from the note under the barre on string 5.',
    },
    inF: {
      intro: 'F, B♭ and C in F major. Press close to the fret and check each string alone.',
    },
    bm: {
      intro: 'Bm is an Am shape barred at fret 2. Keep your thumb behind the neck.',
    },
    loop: {
      intro: 'Play I–IV–V–I in F, then switch to B♭. With I as an E-shape barre, IV is the A shape at the same fret and V is two frets higher.',
    },
    anyKey: {
      intro: 'I–V–vi–IV with numbers only in F, B♭ and E♭: keys with no easy open chords.',
    },
  },
  check: [
    {
      question: 'The E-shape barre at fret 3 is which chord?',
      options: ['G', 'A', 'F'],
      why: 'String 6 at fret 3 is G, so an E shape barred at fret 3 is G major.',
    },
    {
      question: 'What replaces the capo in a barre chord?',
      options: ['Your first finger.', 'Your thumb.', 'A guitar strap.'],
      why: 'Your first finger lays across all strings, taking the place of the nut or capo.',
    },
    {
      question: 'From an E-shape I chord, where is IV?',
      options: ['A shape, at the same fret.', 'E shape, two frets higher.', 'A shape, two frets lower.'],
      why: 'The 4th of any root on string 6 lies across on string 5 at the same fret, played as an A shape.',
    },
  ],
  canDo: [
    'Play F and Bm so that most strings ring.',
    'Play I–IV–V–I in F.',
    'Find I, IV, V as barre chords in a key I choose.',
  ],
};
