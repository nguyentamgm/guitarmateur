import type { ChordsCopy } from './model';

export const en: ChordsCopy = {
  title: 'Chords Are Stacked Intervals',
  summary: 'A triad is a root with two intervals piled on top. Learn the formula and every chord shape on the neck explains itself.',
  lead:
    'You can memorise chord shapes one by one, or learn what they are made of. A chord is a root plus a few intervals stacked on it; change one interval and you change the chord. Five steps, from three notes on three strings to building any triad yourself. Click any note to hear it.',
  steps: {
    stack: {
      title: 'A triad is three notes stacked in 3rds',
      body: [
        'Take a root, add the note a 3rd above it, then the note a 3rd above that. Three notes, two 3rds stacked: a triad. On guitar the stack fits on three neighbouring strings, one note each.',
        'A major triad is a major 3rd with a minor 3rd on top. Flip the order, minor 3rd first, and you get a minor triad. Either way the root and the top note are a perfect 5th apart.',
      ],
      takeaway: 'Major = major 3rd + minor 3rd; minor = minor 3rd + major 3rd.',
      tryIt: 'Play the stack one note at a time, then together. Move it to D at fret 5 and to G at fret 10 on string 5.',
    },
    qualities: {
      title: 'Four qualities from one formula',
      body: [
        'The major formula is 1 3 5. Lower the 3 and you get minor, 1 ♭3 5. Raise the 5 for augmented, 1 3 ♯5; lower both 3 and 5 for diminished, 1 ♭3 ♭5. Each change is one fret.',
        'The names follow the formula, not whichever sharp or flat name looks more familiar: C minor has E♭, not D♯, because the 3rd of C is some kind of E. That is why F♯ minor is F♯ A C♯ and B♭ diminished has an F♭.',
      ],
      takeaway: 'The 3rd decides major or minor; the 5th decides augmented or diminished.',
      tryIt: 'On A, switch major ↔ minor and listen to the one note that moves. Then try augmented and diminished.',
    },
    sus: {
      title: 'Sus chords: the 3rd is suspended',
      body: [
        'A sus chord swaps the 3rd for its neighbour: the 2 (sus2) or the 4 (sus4). With no 3rd it is neither major nor minor; it sounds open and waiting.',
        'That waiting is the point. Play sus4 and then the major chord, and the 4 falls onto the 3 like a door closing. Songs use this all the time.',
      ],
      takeaway: 'Sus replaces the 3rd with the 2 or the 4: unresolved until the 3rd comes back.',
      tryIt: 'Play Dsus4 → D, then Dsus2 → D. Which one wants to resolve more?',
    },
    open: {
      title: 'Open chords use the same formula',
      body: [
        'The first chords most players learn, C, A, G, E and D, look like five unrelated shapes. Label each note by its degree and they are all the same thing: 1, 3 and 5, repeated across the strings with open strings filling in.',
        'E and Em, A and Am, D and Dm differ by one finger: the 3rd moves down one fret. The root is always the lowest note played; strings below it are left out.',
      ],
      takeaway: 'Every open chord is 1, 3, 5 spread over six strings: the shape changes, the formula does not.',
      tryIt: 'Find every 3rd in C, G and D. Then switch E to Em and watch which dot moves.',
    },
    build: {
      title: 'Build any triad yourself',
      body: [
        'Given a chord name, you can find it from nothing: put the root on string 5, then count up the formula. One string up is 5 frets higher, so a major 3rd sits one fret left of the root on the next string, a minor 3rd two frets left; the 5th is three frets left, two strings up.',
        'Any octave counts. If you find the right note somewhere else on the neck, it is still the right note.',
      ],
      takeaway: 'Name → formula → frets: no chord chart needed.',
      tryIt: 'Get ten in a row. Then switch to all six kinds and do it again.',
    },
  },
  scene: {
    root: 'Root',
    arpeggio: 'One by one',
    together: 'Together',
    labels: 'Labels',
    degrees: 'Degrees',
    notes: 'Notes',
    interval: {
      name: '{quality} {number}',
      numbers: ['unison', '2nd', '3rd', '4th', '5th', '6th', '7th', 'octave'],
      qualities: { perfect: 'perfect', major: 'major', minor: 'minor', augmented: 'augmented', diminished: 'diminished' },
    },
    kinds: { major: 'Major', minor: 'Minor', aug: 'Augmented', dim: 'Diminished', sus2: 'Sus2', sus4: 'Sus4' },
    stack: {
      caption: '{symbol}: {lower} + {upper}, root to top a {outer}.',
    },
    qualities: {
      quality: 'Quality',
      caption: '{symbol} = {formula} = {notes}',
    },
    sus: {
      kind: 'Chord',
      resolve: 'Sus, then major',
      caption: '{symbol} = {formula} = {notes}: {lower} + {upper}.',
    },
    open: {
      chord: 'Chord',
      switchTo: 'Switch to {symbol}',
      strum: 'Strum',
      mutedMark: '×',
      caption: '{symbol}, low to high: {degrees}',
    },
    build: {
      pool: 'Chords',
      basic: 'Major and minor',
      all: 'All six kinds',
      question: 'Build {symbol}: the root is on string 5, fret {fret}. Click its other notes.',
      found: 'Yes: that is the {degree} of {symbol}.',
      root: 'That is the root itself. Find the other notes.',
      miss: 'That note is {semitones} semitones above the root: not in {symbol}, which is {formula}.',
      solved: 'Done: {symbol} = {notes}.',
      next: 'Next chord',
      score: '{right} of {total} · {streak} in a row',
    },
  },
  notYetTitle: 'What you do not need yet',
  notYetIntro: 'Triads are the core of every chord. These build on them later.',
  notYet: [
    { title: '7th chords and the formula table', why: 'They add one more 3rd on top. They come with the chord table.' },
    { title: 'Barre chords', why: 'Movable full shapes, built from the same formula on string 6 and 5 roots. Next lesson.' },
    { title: 'Inversions and slash chords', why: 'The same notes with another one in the bass. They come with the chord table.' },
    { title: 'Chord progressions', why: 'Which chords belong together in a key comes with keys and Roman numerals.' },
    { title: 'Open C7, F and other shapes', why: 'Some open chords need a barre or a stretch; the simple rule here does not reach them yet.' },
  ],
};
