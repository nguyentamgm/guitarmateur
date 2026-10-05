import type { ChordTableCopy } from './model';

export const en: ChordTableCopy = {
  title: 'The Chord Formula Table',
  summary: '7th chords, 9ths and 11ths, inversions and slash chords: every chord name is a formula, and the neck shows where its notes are.',
  lead:
    'Triads are three notes. Most chord names you meet add one more 3rd on top, or a colour note above that, or put another note in the bass. This lesson turns the whole chord chart into one table of formulas, then shows the shapes, the inversions, and how to cut a strange chord down to one you can play. Five steps. Click any note to hear it.',
  steps: {
    sevenths: {
      title: '7th chords: one more 3rd on top',
      body: [
        'Stack another 3rd on a triad and you reach the 7th. Which 3rds you stack decides the chord: major 3rd, minor 3rd, major 3rd gives maj7, soft and bright; major, minor, minor gives the plain 7, the tense dominant chord; minor, major, minor gives m7, mellow.',
        'Two more are built from smaller 3rds only: m7♭5 (half-diminished) and °7, four minor 3rds that divide the octave evenly. The names follow the formula letter by letter, so C°7 has a B𝄫, not an A.',
      ],
      takeaway: 'maj7 = 1 3 5 7, 7 = 1 3 5 ♭7, m7 = 1 ♭3 5 ♭7: the 3rd and the 7th decide.',
      tryIt: 'Play Cmaj7, then C7, then Cm7 as arpeggios, and name the colour each one has.',
    },
    table: {
      title: 'The formula table',
      body: [
        'Every chord in this app comes from one table: a name, and a formula of degrees over the root. Pick a root and a row and the neck lights every place that chord\'s notes sound, coloured by role: root, 3rd, 5th, 7th, colour notes.',
        'A 9 is a 2 an octave up, an 11 is a 4 an octave up: colour notes stacked past the 7th. Add2 puts the 2 in without a 7th. Any shape you find with these notes, anywhere on the neck, is that chord.',
      ],
      takeaway: 'A chord name is a formula; the neck shows every place its notes live.',
      tryIt: 'Pick Dm7 and find three different places on the neck to play its four notes together.',
    },
    openSevenths: {
      title: 'Open 7th and m11 chords',
      body: [
        'The open 7th chords are their triads with one finger added or lifted. E7 is E with the octave on string 4 dropped to the ♭7; G7 is G with the top note dropped to F; Cmaj7 is C with the root on string 2 let go so the open B rings.',
        'Am11 and Em11 are mostly open strings: they skip the 5th or the 9th, which the ear barely misses. The A-shape m11 moves like any barre chord; Dm11 sits at fret 5.',
      ],
      takeaway: 'An open 7th is its triad plus one changed finger: find the 7th in the shape.',
      tryIt: 'Switch C ↔ C7 and G ↔ G7 and find the one note that changes. Then slide the m11 shape to Dm11.',
    },
    inversions: {
      title: 'Inversions and slash chords',
      body: [
        'G/B means a G chord with B as its lowest note. When the bass note belongs to the chord it is an inversion: the 3rd in the bass is the first inversion, the 5th the second, the 7th the third.',
        'The chord sounds the same; the bass line gets smoother. C, G/B, Am, G walks the bass down step by step, C B A G, while the hand barely moves.',
      ],
      takeaway: 'X/Y = chord X with Y in the bass: same chord, a different bass line.',
      tryIt: 'Play C → G/B → Am → G and follow the bass walking down.',
    },
    simplify: {
      title: 'Simplify a strange chord',
      body: [
        'When a chart says G11 or Cm9 and you do not know a shape, cut it down: drop the highest colour note and you still have the same chord, a little plainer. G11 → G9 → G7 → G is always safe.',
        'Going the other way is how players dress up chords: a major chord can become add2 or maj7, a minor chord m7 or m11, as long as the melody does not clash.',
      ],
      takeaway: 'Drop colour notes until you reach a 7th or a triad you can play.',
      tryIt: 'Play each ladder from the top down and listen for the note that leaves at each step.',
    },
  },
  scene: {
    root: 'Root',
    chord: 'Chord',
    play: 'Play',
    stop: 'Stop',
    together: 'Together',
    arpeggio: 'One by one',
    labels: 'Labels',
    degrees: 'Degrees',
    notes: 'Notes',
    mutedMark: '×',
    interval: {
      name: '{quality} {number}',
      numbers: ['unison', '2nd', '3rd', '4th', '5th', '6th', '7th', 'octave'],
      qualities: { perfect: 'perfect', major: 'major', minor: 'minor', augmented: 'augmented', diminished: 'diminished' },
    },
    sevenths: {
      caption: '{symbol} = {formula} = {notes}. Stacked: {gaps}.',
    },
    table: {
      group: 'Group',
      groups: { triads: 'Triads', sevenths: '7th chords', extended: '9, 11, add' },
      roles: { root: 'Root', third: '3rd', fifth: '5th', seventh: '7th', colour: 'Colour note' },
      caption: '{symbol} = {formula} = {notes}',
    },
    openSevenths: {
      compare: 'Compare with {symbol}',
      caption: '{symbol}, low to high: {degrees}',
      changed: 'From {base}: {moved}.',
      movable: 'Movable (A shape)',
      kind: 'Kind',
      movableCaption: '{symbol}, A shape at fret {fret}: {degrees}',
    },
    inversions: {
      bass: 'Bass',
      bassItem: '{note} ({degree})',
      caption: '{symbol}: {bass} in the bass (degree {degree}).',
      walk: 'C → G/B → Am → G',
      walkCaption: '{chords}. Bass: {basses}.',
    },
    simplify: {
      simpler: 'One step simpler',
      reset: 'Back to the top',
      caption: '{symbol} = {formula} = {notes}',
      dropped: '{from} → {to}: the {degree} is gone.',
    },
  },
  notYetTitle: 'What you do not need yet',
  notYetIntro: 'This table covers the chords most songs use. These can wait.',
  notYet: [
    { title: '13th chords', why: 'One more colour note on top. Cut them down to a 9 or a 7 for now.' },
    { title: 'Altered notes: ♭9, ♯9, ♯11', why: 'Jazz colours on dominant chords. They come with jazz harmony.' },
    { title: 'Drop-2 and close voicings', why: 'Other ways to arrange the same notes. The open and barre shapes come first.' },
    { title: 'Choosing inversions in a progression', why: 'Which inversion to use where comes with keys and progressions.' },
  ],
};
