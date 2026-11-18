import type { SessionCopy } from '../types';

export const en: SessionCopy = {
  title: 'When do the chords change?',
  summary: 'Hear the moment chords change, learn a down-up strumming pattern, and play eight bars in G.',
  goal: 'After this session you can hear the moment a chord changes, and strum a pattern with an up stroke.',
  needs: 'A guitar in tune. About 15 minutes.',
  recap: [
    'Beats come in groups called bars: count 1, 2, 3, 4.',
    'G, C and D are I, IV and V in the key of G.',
    'Chords change on beat 1.',
  ],
  parts: {
    listen: {
      title: 'Listen',
      body: [
        'Before naming a chord, your ear must notice when it changes.',
        'You do not need to know which chord is playing yet. Tap the button every time you hear the chord change.',
        'In this first round, each chord lasts two bars.',
      ],
    },
    understand: {
      title: 'Understand',
      body: [
        'Chords usually change on beat 1 and last one or two bars.',
        'Your strumming hand swings down on the beat and up between beats, like a pendulum, even when it does not touch the strings.',
        'A strumming pattern is which swings touch the strings.',
      ],
    },
    play: {
      title: 'Play',
      body: [
        'Here is a classic pattern: down on beats 1, 2, 3, then down-up on beat 4 (D-D-D-DU).',
        'Two bars per chord. Keep the hand moving steadily like a pendulum during the change.',
        'Play I–I–IV–IV–V–V–I–I in G at 70 BPM along with the app.',
      ],
    },
    challenge: {
      title: 'Challenge',
      body: [
        'Now a chord may last one bar or two bars.',
        'Catch every change; an extra tap counts against you.',
      ],
    },
  },
  blocks: {
    slow: {
      intro: 'You do not need to know which chord yet, only when it changes. Here each chord lasts two bars.',
      ask: 'Tap when the chord changes',
      result: 'You caught {caught} of {total} chord changes. Extra taps: {extra}.',
    },
    strum: {
      intro: 'Try the patterns, then make your own.',
    },
    pattern: {
      intro: 'The pattern is down on 1, 2, 3, then down-up on 4. Two bars per chord. Keep the hand moving during the change.',
    },
    fast: {
      intro: 'Now a chord may last one bar or two. Catch every change; an extra tap counts against you.',
      ask: 'Tap when the chord changes',
      result: 'You caught {caught} of {total} chord changes. Extra taps: {extra}.',
    },
  },
  check: [
    {
      question: 'Chords usually change on…',
      options: ['beat 1.', 'beat 2.', 'any beat equally.'],
      why: 'In most songs, chord changes happen on beat 1: the first and strongest beat of a bar.',
    },
    {
      question: 'Between beats the strumming hand…',
      options: [
        'comes up, whether or not it touches the strings.',
        'stays still.',
        'rests on the strings to mute them.',
      ],
      why: 'The strumming hand swings continuously like a pendulum: down on the beat and up between beats, even when it does not touch the strings.',
    },
    {
      question: 'To find the chords of a song, first listen for…',
      options: ['the highest note.', 'when they change.', 'the bass guitar.'],
      why: 'Before trying to name a chord, the ear must first notice the moment it changes.',
    },
  ],
  canDo: [
    'I can tap every chord change in an eight-bar loop.',
    'I can strum down, down, down, down-up while changing chords.',
  ],
};
