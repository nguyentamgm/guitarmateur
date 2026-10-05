import type { FretboardCopy } from './model';

export const en: FretboardCopy = {
  title: 'The Neck Is a Grid',
  summary: 'Read tab, count frets, and find any note from the notes on two strings and two octave shapes.',
  lead:
    'You do not need to memorise every note on the neck. You need to count frets, read tab, know two octave shapes and where the natural notes sit on the two thickest strings. Five steps, each one a picture you can play. Click any note to hear it.',
  steps: {
    strings: {
      title: 'String 1 is the thinnest, and it sits on top',
      body: [
        'The six strings are numbered from the thinnest (1) to the thickest (6). Tuned the standard way, from string 6 to string 1, they are E A D G B E.',
        'Tab and every picture in this app draw string 1 as the top line. Holding the guitar it is the other way round: string 6 is the one nearest your face. Keep that flip in mind and tab will never trick you.',
      ],
      takeaway: 'String 1 is the thinnest string and the top line of tab.',
      tryIt: 'Play the open strings from 6 to 1 while saying their numbers out loud, then their names.',
    },
    semitones: {
      title: 'Every fret is one semitone',
      body: [
        'Moving up one fret raises the pitch by a semitone, the smallest step in Western music. Two frets make a whole step.',
        'Twelve frets make an octave: fret 12 has the same name as the open string, only higher. That is why the neck repeats itself after fret 12, and why fret 12 carries a double dot.',
      ],
      takeaway: '1 fret = 1 semitone; 12 frets = 1 octave, same name, higher.',
      tryIt: 'Pick any string. Play it open, then at fret 12, and hear the same note one octave higher.',
    },
    tab: {
      title: 'Tab: lines are strings, numbers are frets',
      body: [
        'Tab has six lines, one per string, with string 1 on top. A number on a line is the fret to press on that string; 0 means play it open.',
        'Read left to right. Numbers stacked straight up and down are played at the same time. Tab does not say how long each note lasts: later lessons put it on a beat grid.',
      ],
      takeaway: 'Number on a line = fret on that string; 0 = open; stacked = together.',
      tryIt: 'Play the tab below slowly. Then click any number and check where your finger should be.',
    },
    octaves: {
      title: 'Two octave shapes find every copy of a note',
      body: [
        'The same note lives in several places on the neck. Go two strings up and two frets right and you land on the same name, one octave higher.',
        'When the jump lands on the B or high E string, go three frets instead of two. That extra fret is the G–B shift: G and B are the only pair of strings tuned 4 frets apart instead of 5. And strings 6 and 1 share names at every fret, two octaves apart.',
      ],
      takeaway: 'Two strings up: +2 frets, or +3 when you land on string 2 or 1.',
      tryIt: 'Find A at fret 5 on string 6. Use the shapes to reach every other A up to fret 15 without looking.',
    },
    home: {
      title: 'Learn the notes on strings 6 and 5 only',
      body: [
        'This is the one table worth learning by heart. Every scale box and barre chord later on hangs from a root on string 6 or string 5.',
        'There are seven letters, A to G. Neighbouring letters are a whole step apart, except E to F and B to C, which are a semitone apart. Sharps (♯) raise a note one fret and flats (♭) lower it one fret, so the frets between the letters have two names, such as C♯ and D♭.',
      ],
      takeaway: 'Know where A to G sit on strings 6 and 5; the octave shapes find the rest.',
      tryIt: 'Hide the names and take the quiz until you answer ten in a row without missing. Then switch on all 12: a ♯ is one fret above its letter, a ♭ one fret below.',
    },
  },
  scene: {
    strings: {
      note: 'String 1 is the top line, as in tab. Holding the guitar, it is the string nearest the floor.',
      play: 'Play strings 6 → 1',
      stop: 'Stop',
      idle: 'Click a dot at the nut to hear an open string.',
      caption: 'String {n}: {name}',
    },
    semitones: {
      string: 'String',
      run: 'Climb 12 frets',
      stop: 'Stop',
      idle: 'Each dot is one semitone above the dot on its left.',
      step: 'Fret {fret}: the open string + {fret} semitones',
      octave: 'Fret 12: same name as the open string, one octave higher',
    },
    tab: {
      label: 'Tab',
      play: 'Play the tab',
      stop: 'Stop',
      idle: 'Click a number on the tab or a dot on the neck: the other one lights up.',
      single: 'String {string}, fret {fret}',
      together: 'Played together: {notes}',
      open: 'String {string}, open (0)',
    },
    octaves: {
      picker: 'Note on string 6',
      play: 'Play them all',
      stop: 'Stop',
      caption: '{note}: {count} places on the first 15 frets',
      twoOctaves: '2 octaves',
    },
    home: {
      mapTitle: 'Natural notes',
      onString: 'String {n}',
      names: 'Note names',
      show: 'Show',
      hide: 'Hide',
      pool: 'Notes',
      naturals: 'A–G',
      all: 'All 12 (♯/♭)',
      question: 'Find {note} on string {n}',
      next: 'Next note',
      right: 'Yes: {note} on string {n} is at fret {fret}.',
      wrongString: 'Right idea, wrong string: look on string {n}.',
      wrongFret: 'Fret {fret} is {heard}. Try again.',
      between: 'Fret {fret} is a sharp or a flat, between two letters. Try again.',
      score: 'First try: {right} of {total}',
    },
  },
  notYetTitle: 'What you do not need yet',
  notYetIntro:
    'All of these matter at some point. Leaving them out now keeps your attention on the neck itself.',
  notYet: [
    { title: 'Every note name on every string', why: 'The notes on strings 6 and 5 plus two octave shapes find any note you need.' },
    { title: 'Reading staff notation', why: 'Tab and shapes cover electric guitar. The staff can wait until you need it.' },
    { title: 'Chord diagrams', why: 'They read like tab turned on its side. They come with the chord lessons.' },
    { title: 'How long each note lasts', why: 'Tab leaves rhythm out. The rhythm lesson puts tab on a beat grid.' },
    { title: 'Finger exercises and posture drills', why: 'They work best with a metronome, so they move to the rhythm lesson.' },
    { title: 'Choosing between sharp and flat names', why: 'Which name is right depends on the scale. That comes with the major scale.' },
    { title: 'Tuning by ear', why: 'It uses the fret-5 rule from this lesson. For now a tuner app is fine.' },
  ],
};
