import type { SessionCopy } from '../types';

export const en: SessionCopy = {
  title: 'Three beats in a bar',
  summary: 'Meet 3/4 time: hear whether a song counts in 3 or 4, strum a steady waltz rhythm, and find chords for two songs in 3.',
  goal: 'After this session you can hear whether a song counts in 3 or in 4, strum in 3, and find the chords of two songs in 3.',
  needs: 'A guitar in tune. About 15 minutes.',
  recap: [
    'Beat, bar, beat 1 is stronger.',
    'Chords change on beat 1.',
    'Try I, then V, then IV.',
  ],
  parts: {
    listen: {
      title: 'Listen',
      body: [
        'Tap along and count from each strong beat: do you reach 3 or 4?',
        'Songs in 4/4 count 1 2 3 4; songs in 3/4 count 1 2 3.',
        'Listen to each pattern and feel how many beats fit between the strong pulses.',
      ],
    },
    understand: {
      title: 'Understand',
      body: [
        'How many beats a bar has is the time signature.',
        '4/4 is four beats; 3/4 is three: STRONG weak weak.',
        'The picture is the 4/4 click you know: count it once, then go back to the drill and count 3.',
        'A song in 3 never fits a count of 4: the strong beat drifts.',
      ],
    },
    play: {
      title: 'Play',
      body: [
        'Down on every beat, lean on beat 1.',
        'Then down, down-up, down-up.',
        'Keep the 3-beat pulse steady through chord changes.',
      ],
    },
    challenge: {
      title: 'Challenge',
      body: [
        'Two songs in 3. Both begin before beat 1 (a pickup): the first slot has no chord.',
        'Listen to the melody and find the chord that fits each slot.',
        'Try chord I first, then V, then IV.',
      ],
    },
  },
  blocks: {
    count: {
      intro: 'Tap along and count from each strong beat: do you reach 3 or 4?',
      ask: 'Three or four beats in a bar?',
      answers: {
        three: '3 beats',
        four: '4 beats',
      },
      right: 'Right: {answer} in a bar.',
      wrong: 'That was {answer} in a bar. Listen to the other meter to compare.',
    },
    beat: {
      intro: 'How many beats a bar has is the time signature. 4/4 is four beats; 3/4 is three: STRONG weak weak. Count the 4/4 click here, then contrast it with 3/4.',
    },
    waltz: {
      intro: 'Down on every beat, lean on beat 1. Play I–I–IV–I in G at 90 BPM with three beats in a bar.',
    },
    waltz2: {
      intro: 'Now try down, down-up, down-up (D-DUDU). Play I–V–V–I in G.',
    },
    first: {
      intro: 'A traditional celebration song in 3. It begins before beat 1 (a pickup), so the first slot has no chord.',
      ask: 'Pick a chord for each slot',
      result: '{right} of {total} slots right.',
      allRight: 'All right: every chord fits!',
    },
    second: {
      intro: 'A timeless hymn in 3. Like the first tune, it starts with a pickup before beat 1.',
      ask: 'Pick a chord for each slot',
      result: '{right} of {total} slots right.',
      allRight: 'All right: every chord fits!',
    },
  },
  check: [
    {
      question: 'What does a 3/4 time signature mean?',
      options: ['Three beats in a bar.', 'Three bars in a song.', 'Playing three chords at once.'],
      why: 'In 3/4, the top number indicates that there are three beats in each bar.',
    },
    {
      question: 'To find the meter of a song by ear, count from…',
      options: ['each strong beat.', 'the end of the song.', 'the fastest melody note.'],
      why: 'Beat 1 of each bar is the strong beat. Counting beats from one strong beat to the next reveals the meter.',
    },
    {
      question: 'In 3/4 time, chords usually change on…',
      options: ['beat 1.', 'beat 2.', 'beat 3.'],
      why: 'Chords almost always change on the strong beat (beat 1) of the bar.',
    },
  ],
  canDo: [
    'I can hear whether a song counts in 3 or in 4.',
    'I can strum a steady 3/4 pattern.',
    'I found the chords of both songs in 3/4.',
  ],
};
