import type { SessionCopy } from '../types';

export const en: SessionCopy = {
  title: 'Connect the pentatonic boxes',
  summary:
    'Use a shared note to move between boxes 1 and 2, then practise playing the notes in groups.',
  goal: 'Cross from box 1 into box 2 and back in time, and hear how changing the order of the notes changes a run.',
  needs: 'A guitar in standard tuning. About 15–20 minutes.',
  recap: [
    'Box 1 of A minor pentatonic starts at fret 5 on string 6.',
    'A at the same fret on string 1 sounds two octaves higher.',
  ],
  parts: {
    listen: {
      title: 'Listen',
      body: [
        'Listen to the first few notes and notice what happens next. In a straight run, the pitch keeps rising one scale note at a time. In groups of three, you hear three notes in a row before the next group starts a little lower. In skips, each pair jumps over a scale note.',
      ],
    },
    understand: {
      title: 'Understand',
      body: [
        'On string 1, play A–C–D at frets 5–8–10, then come back through C to A. Fret 5 belongs to box 1 and fret 10 belongs to box 2. Both boxes use C at fret 8, so you can shift your hand at C on the way there and on the way back.',
      ],
    },
    play: {
      title: 'Play',
      body: [
        'A sequence repeats a pattern from each successive scale note. Play A–C–D, then C–D–E at the same pace. The second group starts one scale note later, on C. Sing C before you play the second group, then try to sing the start of the third.',
      ],
    },
    challenge: {
      title: 'Challenge',
      body: [
        'Count four slow, even beats. On string 1, play A–C–D on beats 1, 2 and 3. Rest on beat 4. With the same pulse, play D–C–A on the next three beats and rest again. Listen for any pause as your hand shifts at C in either direction.',
      ],
    },
  },
  blocks: {
    phrase: {
      intro:
        'As you listen, try humming the first three notes. On a replay, focus on where the melody first jumps or turns back.',
      ask: 'What pattern did you hear?',
      answers: { straight: 'Straight run', threes: 'Groups of three', skips: 'Skip one' },
      right: 'Yes. {answer} in {detail} minor pentatonic.',
      wrong:
        'You heard {answer} in {detail} minor pentatonic. Listen to the same notes again at a slower tempo.',
    },
    join: {
      intro:
        'Select 1→2 and tap frets 5, 8 and 10 on string 1. The ring around fret 8 marks the shared C. Each of the other five strings also has one ringed note.',
    },
    map: {
      intro:
        'Once you can make that crossing, select boxes 1 to 5 in order. Each box starts on the next scale note on string 6 and uses two notes per string. Together the five boxes cover the neck, and the same layout repeats an octave higher.',
    },
    patterns: {
      intro:
        'Select box 1, Groups of 3 and Up. Start playback and watch the first six notes on the tab. Start your own run on string 6 at fret 5, then fret 8, then string 5 at fret 5. Restart with Groups of 4, then with Skip one. Listen for A–C–D–E with four notes, and A–D followed by C–E with skips.',
    },
    cross: {
      intro:
        'Try the lick on your guitar first. Then select 1→2 and tap the frets on string 1 in each direction to check your notes. The ringed C is where you change hand position both times.',
    },
  },
  check: [
    {
      question: 'On string 1, which note belongs to both boxes 1 and 2?',
      options: ['A at fret 5', 'C at fret 8', 'D at fret 10'],
      why: 'The same C at fret 8 is in both shapes. Use it when shifting in either direction.',
    },
    {
      question: 'After A–C–D in groups of three, which group comes next?',
      options: ['A–C–D again', 'D–E–G', 'C–D–E'],
      why: 'The next group starts on C, one scale note after A.',
    },
    {
      question: 'How many notes do two neighbouring pentatonic boxes share?',
      options: ['Six', 'Two', 'Twelve'],
      why: 'The boxes share one fretted note on each of the six strings.',
    },
  ],
  canDo: [
    'I can play A–C–D from box 1 into box 2, then D–C–A from box 2 back into box 1, keeping the beat through both shifts.',
    'I can play the first two groups of three in box 1 and sing the starting note of the second group.',
  ],
};
