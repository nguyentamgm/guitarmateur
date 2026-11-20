import type { SessionCopy } from '../types';

export const en: SessionCopy = {
  title: 'Work out a new song',
  summary:
    'Work out the chords of any song using a five-step routine, and test yourself on three tunes.',
  goal: 'After this session you have a five-step routine for finding the chords of a song you have never played, and you have used it on three tunes.',
  needs: 'A guitar in tune. About 15 minutes.',
  recap: [
    'The root is where the song rests.',
    'I is home, V pulls home, IV goes away, vi is the sad one.',
    'The numbers stay when the key changes.',
  ],
  parts: {
    listen: {
      title: 'The routine',
      body: [
        '1. Find the root. Hum the note the song rests on at the end of a line; find it on string 6. That names the key.',
        '2. Major or minor? Play the major chord on that root, then the minor one. One of them is home.',
        '3. Count. Tap the beat and count from a strong beat: 3 or 4.',
        '4. Find the changes, then the chords. Mark where the chord changes. Try I first, then V, then IV, then vi. Still wrong? Try a guest: ♭VII, iv or III7.',
        '5. Fit the singer. Too high or too low? Keep the numbers, move the root, or use a capo.',
      ],
    },
    understand: {
      title: 'Understand',
      body: [
        'The table is your map: the four chords in five keys.',
        'Any song you work out in numbers can be read off this table in another key.',
      ],
    },
    play: {
      title: 'Play',
      body: [
        'A warm-up with numbers only, in four keys.',
        'If C is hard, that is the F chord: keep at it.',
      ],
    },
    challenge: {
      title: 'Challenge',
      body: [
        'Three tunes, empty slots, no hints: use the routine. Then switch the key and check that the numbers still work.',
        'Now pick a song you love. Put the phone down, use the five steps, and write its chords as numbers. It may take a few evenings: that is normal, and it is the whole point.',
      ],
    },
  },
  blocks: {
    keys: {
      intro:
        'The table gives the four main chords (I, V, vi, IV) across five keys. Click any row to hear it.',
      caption: 'Any song you work out in numbers can be read off this table in another key.',
    },
    review: {
      intro:
        'Play the four chords (I–V–vi–IV) using numbers only. Switch keys with the chips to warm up your ear.',
    },
    one: {
      intro:
        'Tune 1: find the root, then fill the empty slots using the routine. Switch keys to confirm.',
      ask: 'Pick a chord for each slot',
      result: '{right} of {total} slots right.',
      allRight: 'All right: London Bridge uses only I and V!',
    },
    two: {
      intro: 'Tune 2: hum the resting note and work through the five steps with no hints.',
      ask: 'Pick a chord for each slot',
      result: '{right} of {total} slots right.',
      allRight: 'All right: Ode to Joy resolved with I and V!',
    },
    three: {
      intro:
        'Tune 3: count the beats, watch where the chords change, and test each Roman numeral.',
      ask: 'Pick a chord for each slot',
      result: '{right} of {total} slots right.',
      allRight: 'All right: Jingle Bells fits I, IV and V across every key!',
    },
  },
  check: [
    {
      question: 'What is the first thing to find in a new song?',
      options: ['Its root (the note it rests on)', 'The fastest strumming pattern', 'A guest chord like ♭VII'],
      why: 'Humming the note the song rests on at the end of a line names the key.',
    },
    {
      question: 'When a chord changes, which chord should you try first?',
      options: ['I', 'vi', '♭VII'],
      why: 'Always try I first because it is home; if it clashes, try V, then IV, then vi.',
    },
    {
      question: 'If a song is too high for the singer, you…',
      options: [
        'keep the numbers and move the root, or use a capo.',
        'change the time signature to 3/4.',
        'only play minor chords.',
      ],
      why: 'The numbers stay the same when the key changes: move the root or use a capo.',
    },
  ],
  canDo: [
    'I can say the five steps without looking.',
    'I found the chords of all three tunes.',
    'I have started on a song of my own choice.',
  ],
};
