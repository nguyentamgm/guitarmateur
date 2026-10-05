import type { RhythmCopy } from './model';

export const en: RhythmCopy = {
  title: 'Rhythm Without Sheet Music',
  summary: 'Hear the beat, see notes as lengths on a grid, count out loud, strum like a pendulum.',
  lead:
    'Rhythm is where notes go in time. You do not need the staff to learn it: a grid of cells, a click and your own voice are enough. Every scene below plays; start slow and turn the tempo up only when it feels easy.',
  steps: {
    beat: {
      title: 'The beat is the pulse you tap your foot to',
      body: [
        'The beat is the steady pulse under a song. Tempo is how many beats fit in a minute, written BPM: at 60 BPM each beat lasts one second, at 120 BPM half a second.',
        'Beats come in groups called bars. Most rock, pop and blues use 4/4: four beats per bar, and beat 1 feels strongest. The metronome below marks it with a higher click.',
      ],
      takeaway: '4/4 means four beats per bar, and beat 1 is the strongest.',
      tryIt: 'Start the metronome at 80 BPM, tap your foot, and say "1" out loud with every high click.',
    },
    lengths: {
      title: 'A note’s length is the length of its block',
      body: [
        'Here one bar is a strip of 16 cells, four per beat. A note is a block as long as the cells it lasts: a whole note fills all 16, a quarter note takes 4, an eighth 2, a sixteenth 1. A dot adds half again, so a dotted half lasts 3 beats.',
        'A rest is an empty block of the same length. Silence is part of the rhythm and needs counting just as much as the notes do.',
      ],
      takeaway: 'Length = number of cells; a rest is a note you count but do not play.',
      tryIt: 'Pick quarter notes, turn beats 2 and 4 into rests, and play along on one string.',
    },
    counting: {
      title: 'Count out loud to know where you are',
      body: [
        'Counting keeps your place inside the bar. Say the beat numbers on the beats. Split each beat in two and say "and" on the half: 1 & 2 & 3 & 4 &.',
        'Split it in four and add "e" and "a": 1 e & a 2 e & a. Switch the sound to click only and keep counting by yourself, without the notes to lean on.',
      ],
      takeaway: 'Numbers on the beats, "&" on the halves, "e" and "a" on the sixteenths in between.',
      tryIt: 'Count eighths out loud at 70 BPM with the click only, then sixteenths at 60.',
    },
    strum: {
      title: 'Your strumming hand is a pendulum',
      body: [
        'Keep the strumming hand moving down and up all the time, like a pendulum: down on every beat, up on every "&". The rhythm comes from when the pick touches the strings, not from changing how the hand moves.',
        'In the grid below a solid arrow hits the strings and a faint one is a ghost strum, a stroke that misses on purpose. A down strum crosses all six strings; an up strum catches only the thin ones. Click a cell to make your own pattern.',
      ],
      takeaway: 'Never stop the hand: down on the beat, up on the "&"; only the contact changes.',
      tryIt: 'Play D – D U – U D U on the open strings, saying "1 & 2 & 3 & 4 &" while the hand keeps swinging.',
    },
    fingers: {
      title: 'Finger drill 1-2-3-4, on the click',
      body: [
        'One finger per fret: index on the first fret, middle on the next, then ring, then little finger. Play the four frets on string 6, move to string 5, and so on to string 1.',
        'Alternate the pick down and up, and land each note exactly on the click. Speed comes from playing slowly and evenly first: raise the tempo by a few BPM only when a whole run is clean.',
      ],
      takeaway: 'Slow and even first, fast later: go up in BPM only after a clean run.',
      tryIt: 'Run the drill from fret 5 at 60 BPM, one note per beat, then two per beat.',
    },
  },
  scene: {
    tempo: { label: 'Tempo', value: '{bpm} BPM' },
    start: 'Start',
    stop: 'Stop',
    beat: {
      grid: 'One bar of four beats',
      idle: 'Press start and tap your foot on every beat. Beat 1 has the higher click.',
      caption: 'Beat {n} of 4',
    },
    lengths: {
      value: 'Note',
      names: {
        whole: 'Whole',
        dottedHalf: 'Dotted half',
        half: 'Half',
        dottedQuarter: 'Dotted quarter',
        quarter: 'Quarter',
        eighth: 'Eighth',
        sixteenth: 'Sixteenth',
      },
      legendNote: 'note',
      legendRest: 'rest',
      caption: '{name}: beats per note {beats} · notes per bar {count}',
      hint: 'Click a block to turn it into a rest of the same length, and back.',
      note: '{name} note (beats: {beats})',
      rest: 'Rest (beats: {beats})',
    },
    counting: {
      level: 'Count',
      levels: { beats: 'Beats', eighths: 'Eighths', sixteenths: 'Sixteenths' },
      sound: 'Sound',
      notes: 'Notes and click',
      clickOnly: 'Click only',
      syllables: { e: 'e', and: '&', a: 'a' },
      idle: 'Press start and count out loud with the cursor.',
    },
    strum: {
      pattern: 'Pattern',
      presets: { downs: 'Downs only', downUp: 'Down-up', folk: 'D – D U – U D U' },
      custom: 'Your own',
      down: 'down',
      up: 'up',
      hit: 'hits the strings',
      miss: 'ghost strum',
      cell: 'Cell {n}: {stroke}, {state}',
      caption: 'Pattern: {pattern}',
    },
    fingers: {
      startFret: 'From fret',
      perBeat: 'Notes per beat',
      tab: 'Finger drill tab',
      idle: 'Press start. One note on each click, fingers 1-2-3-4.',
      caption: 'String {string}, fret {fret}, finger {finger}',
      checklistTitle: 'Before you press start',
      checklist: [
        'Thumb behind the neck, not wrapped over the top.',
        'Wrist low and relaxed, with a little space between palm and neck.',
        'Pick held between thumb and index finger, only the tip showing.',
        'Fingertips right behind the fret wire, each finger over its own fret.',
      ],
    },
  },
  notYetTitle: 'What you do not need yet',
  notYetIntro: 'You will meet these later. For now the grid, the click and your voice are enough.',
  notYet: [
    { title: 'Note symbols on the staff', why: 'Heads, stems and flags only encode the lengths you see here as cells.' },
    { title: 'Time signatures other than 4/4', why: 'Most of what you will play on electric guitar is in 4/4. Others come when a song needs them.' },
    { title: 'Triplets, swing and shuffle', why: 'They are the feel of the blues, so they come with the blues lesson.' },
    { title: 'Reading syncopation', why: 'Count and strum steadily first; off-beat accents grow out of the pendulum.' },
    { title: 'Dynamics', why: 'Beyond a stronger beat 1, playing louder and softer can wait.' },
    { title: 'Fretted chords while strumming', why: 'Here you strum open strings so the right hand gets all your attention. Chords come later.' },
  ],
};
