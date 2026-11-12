import type { SessionCopy } from '../types';

export const en: SessionCopy = {
  title: 'Beat and bar',
  summary: 'Count 1 2 3 4, strum on every beat, and change between Em and Am on beat 1.',
  goal: 'After this session you can count 1 2 3 4, strum on every beat, and change between Em and Am exactly on beat 1.',
  needs: 'A guitar in tune. About 15 minutes.',
  recap: [
    'A chord is several notes played together: major sounds bright and minor dark.',
    'You can play Em with two fingers: middle and ring fingers on fret 2 of strings 5 and 4.',
  ],
  parts: {
    listen: {
      title: 'Listen',
      body: [
        'Music has a steady pulse you can tap your foot to.',
        'Hear the click and the guitar: is the guitar exactly on the click, or between the clicks?',
      ],
    },
    understand: {
      title: 'Understand',
      body: [
        'The pulse is the beat. Beats come in groups, usually of four: one group is a bar.',
        'Count "1 2 3 4"; beat 1 is a little stronger. Tempo is how fast the beats go.',
        'Chords almost always change on beat 1.',
      ],
    },
    play: {
      title: 'Play',
      body: [
        'Am is a new chord (the card shows it). Strum down once on every beat.',
        'First two bars of Em, then two of Am. Start moving your fingers on beat 4, so they land on beat 1.',
        'If you are late, lower the tempo.',
        'The small numbers i and iv above the chords are explained in a later session.',
      ],
    },
    challenge: {
      title: 'Challenge',
      body: [
        'One bar each, eight bars in a row with no late change at 80.',
        'Slower is fine; steady matters more than fast.',
      ],
    },
  },
  blocks: {
    onBeat: {
      intro: 'Listen to the guitar and the click.',
      ask: 'Is the guitar on the click or between the clicks?',
      answers: { on: 'On the click', off: 'Between the clicks' },
      right: 'Right: {answer}.',
      wrong: 'That was {answer}. Both will play again.',
    },
    beat: {
      intro: 'Tap your foot with the click: beat 1 has the higher click.',
    },
    counting: {
      intro: 'Count out loud with the numbers: 1 2 3 4.',
    },
    shapes: {
      intro: 'Place your fingers for Em and Am. Strum across the strings to hear each chord.',
    },
    slow: {
      intro: 'Strum down once on every beat. Two bars of Em, then two bars of Am.',
    },
    changes: {
      intro: 'Change chord on beat 1 of every bar: Em, Am, Em, Am at 80 BPM.',
    },
  },
  check: [
    {
      question: 'How many beats are in each bar of this session?',
      options: ['3', '4', '6'],
      why: 'The bars in this session have 4 beats each: count 1 2 3 4.',
    },
    {
      question: 'When do chords almost always change?',
      options: ['On beat 1.', 'On beat 4.', 'Between beats.'],
      why: 'Chords almost always change on beat 1, the first beat of a new bar.',
    },
    {
      question: 'What should you do if your chord change is late?',
      options: ['Skip the chord and wait.', 'Strum faster on the next beat.', 'Slow the tempo down and keep the beat steady.'],
      why: 'Lowering the tempo gives your fingers time to land cleanly on beat 1 while keeping the beat steady.',
    },
  ],
  canDo: [
    'I can count 1 2 3 4 with the click.',
    'I can strum Em and Am on every beat.',
    'I can change chord on beat 1 without stopping.',
  ],
};
