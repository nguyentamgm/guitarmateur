import type { SessionCopy } from '../types';

export const en: SessionCopy = {
  title: 'Songs in a minor key',
  summary: 'Discover minor keys, see how every major key shares its chords with a relative minor, and play the dramatic V–i cadence.',
  goal: 'After this session you can tell a major key from a minor key by ear, play progressions in A minor, and understand relative keys.',
  needs: 'A guitar in tune. About 15 minutes.',
  recap: [
    'A minor chord sounds darker and more reflective than a major chord.',
    'The vi chord in C major is Am, sharing notes with the C major scale.',
    'Chords change on beat 1.',
  ],
  parts: {
    listen: {
      title: 'Listen',
      body: [
        'A piece of music can feel open and bright (a major key) or darker and more dramatic (a minor key).',
        'That colour comes from which chord the music treats as home.',
        'Listen to four chords. Can you hear whether the progression rests in a major or minor key?',
      ],
    },
    understand: {
      title: 'Understand',
      body: [
        'C major and A minor share the exact same seven notes: A, B, C, D, E, F, G. A minor is called the relative minor of C major.',
        'If C is home (I), the music sounds bright. If A is home (i), the music takes on a brooding, minor character.',
        'Why is the V chord major instead of minor? In natural minor, chord 5 is minor (v, or Em in A minor). But a minor v lacks the sharp leading tone that pulls decisively back to i. Raising note 7 by a semitone (G to G♯) turns v into a major V (E) or dominant 7 (E7). That sharp pull creates the dramatic ending characteristic of minor keys.',
      ],
    },
    play: {
      title: 'Play',
      body: [
        'Learn the three core chords of A minor: Am (i), Dm (iv), and E (V).',
        'In the first loop (i–iv–V–i), feel the strong pull of the major V chord (E) resolving back home to Am.',
        'In the second loop (i–VI–VII–i), the progression steps through F and G before returning to Am. Note: F has no open shape, so it is played as a barre chord at fret 1.',
      ],
    },
    challenge: {
      title: 'Challenge',
      body: [
        'Four bars in a minor key (A minor or E minor), with bar 1 always starting on i.',
        'Listen for where the chords iv, V, VI, and VII appear, and fill in the missing bars.',
        'Aim for three rounds right in a row.',
      ],
    },
  },
  blocks: {
    mode: {
      intro: 'Each key has a distinct colour: major keys sound bright and open, while minor keys sound darker and reflective. Listen to four chords.',
      ask: 'Was this progression in a major or minor key?',
      answers: {
        major: 'Major',
        minor: 'Minor',
      },
      right: 'Right: {answer}. The final resting chord was {detail}.',
      wrong: 'That was {answer}: {detail}. Hear the other mode on the same root, then the question again.',
    },
    relative: {
      intro: 'C major and A minor share the same notes and chords. The difference is which chord is home.',
    },
    shapes: {
      intro: 'The three essential chords in A minor: Am (i), Dm (iv), and E (V). Click any chord to hear it.',
    },
    loopA: {
      intro: 'Play i–iv–V–i at 80 BPM. Listen to how the major V chord (E) pulls decisively back to Am (i).',
    },
    loopB: {
      intro: 'The i–VI–VII–i progression is a rock and pop favourite. F is played as a barre chord on fret 1.',
    },
    fill: {
      intro: 'Four bars in a minor key, bar 1 is always i. Listen, choose the chord for each bar, then check.',
      ask: 'Pick the chord for each bar',
      allRight: 'All four bars right!',
      someWrong: 'Some bars were different. Press Play again to compare.',
    },
  },
  check: [
    {
      question: 'C major and A minor are relative keys because they…',
      options: ['share the exact same seven notes.', 'have the same root note.', 'are both major keys.'],
      why: 'A minor uses the same notes as C major, but treats A as home (i) instead of C (I).',
    },
    {
      question: 'In a minor key, why is the V chord played as major (or dominant 7) rather than minor?',
      options: ['It pulls much stronger back to i.', 'Minor keys are forbidden from using minor chords.', 'Because open minor chords are too difficult to play.'],
      why: 'Raising the 7th degree creates a leading tone that pulls with dramatic tension straight into the i chord.',
    },
    {
      question: 'In the key of A minor, the three chords i, iv, and V are…',
      options: ['Am, Dm, E', 'Am, C, D', 'A, D, E'],
      why: 'Degree 1 is Am (i), degree 4 is Dm (iv), and degree 5 with a raised leading tone is E major (V).',
    },
  ],
  canDo: [
    'I can tell whether a progression is in a major or minor key by ear.',
    'I can play i–iv–V–i and i–VI–VII–i in A minor.',
    'I can explain why the relative minor shares its chords with the major key.',
  ],
};
