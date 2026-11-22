import type { SessionCopy } from '../types';

const listening = {
  ask: 'How were the power chords played?',
  answers: { muted: 'Palm muted', open: 'Left to ring' },
  right: 'Yes. {answer}.',
  wrong:
    'You heard the chords {answer}. The replay starts with the other sound, then plays the original again.',
};

export const en: SessionCopy = {
  title: 'Power chords and palm mute',
  summary: 'Give a three-chord riff a short, pitched chug and leave beat 4 quiet.',
  goal: 'Play a palm-muted power-chord riff in E, A and G and keep a full beat of rest.',
  needs: 'A guitar in standard tuning. About 15–20 minutes.',
  recap: ['In 4/4, count four beats per bar.', 'Two eighth notes fit in one beat.'],
  parts: {
    listen: {
      title: 'Listen',
      body: [
        'Play E5 with string 6 open and string 5 at fret 2. Pick it twice on “1 and” and let the strings ring. Play the same two eighth notes again with the edge of your picking hand lightly touching the strings near the bridge. Listen for a shorter sound with a clear pitch. If the pitch disappears, ease the pressure.',
      ],
    },
    understand: {
      title: 'Understand',
      body: [
        'A power chord uses the root and its fifth. You can double the root an octave higher. The third decides whether a chord is major or minor. A power chord leaves that choice open, and the simple shape stays clear with distortion.',
      ],
    },
    play: {
      title: 'Play',
      body: [
        'Play E5 twice on beat 1, G5 twice on beat 2 and A5 twice on beat 3. The roots on string 6 are open, fret 3 and fret 5. On beat 4, stop both strings and keep counting. Start the next bar on time.',
      ],
    },
    challenge: {
      title: 'Challenge',
      body: [
        'Hear the riff and identify its sound, then echo it on your guitar. Begin in E. Play two bars in a row with clear chugs and a silent fourth beat in each bar.',
        'Move the starting root to fret 5 for A and fret 3 for G. From either root, go up three frets for the second chord and two more for the third. Check that the rest is the same length in each key.',
      ],
    },
  },
  blocks: {
    sound: {
      ...listening,
      intro:
        'Both versions use the same E5, G5 and A5. Listen to how long each pair of notes rings.',
    },
    power: {
      intro:
        'Tap the open-string position on string 6 to move the shape from A5 to E5. Play it with 2 notes and then with 3. The upper E is the octave. Try the major and minor third buttons to hear how the same power chord fits under both.',
    },
    mute: {
      intro:
        'Play the two-bar riff and switch Palm mute off and on. Compare the short PM hits with the ringing chords. On your guitar, keep your hand close to the bridge so the short notes still have a pitch.',
    },
    riff: {
      intro:
        'Start the one-bar loop in E. Switch between Let ring and Palm mute and keep tapping through the rest. Choose A or G and restart to hear the same rhythm at the new frets.',
      grid: 'Power-chord riff in eighths with a rest on beat 4',
      rest: 'Rest',
      articulation: 'Articulation',
      muted: 'Palm mute',
      open: 'Let ring',
    },
    backing: {
      intro:
        'Stop the riff loop and start the E minor backing. Play one bar of your own riff over it. Keep beat 4 quiet in your part while the backing carries on.',
    },
    echo: {
      ...listening,
      intro:
        'Tap all four beats as you listen. When a comparison plays, the other sound comes first. The original riff is the second pass.',
    },
  },
  check: [
    {
      question: 'Which notes make a two-note power chord?',
      options: ['Root and third', 'Root and fifth', 'Third and fifth'],
      why: 'The fifth sits above the root. The three-note shape adds the root an octave higher.',
    },
    {
      question: 'Where does the edge of your picking hand touch for a clear palm mute?',
      options: ['Over the frets', 'Halfway along the strings', 'Lightly near the bridge'],
      why: 'Light contact near the bridge shortens the sound while keeping the pitch clear.',
    },
    {
      question: 'What stays the same when you move the riff from E to A?',
      options: [
        'Two eighth notes on each of beats 1–3 and a rest on beat 4',
        'The starting fret',
        'The names of all three chords',
      ],
      why: 'Move the shape and keep the count and the rest in the same places.',
    },
  ],
  canDo: [
    'I can play a short palm-muted E5 and still hear its pitch.',
    'I can loop the riff in E, A and G with a quiet beat 4 and an on-time restart.',
  ],
};
