import type { PentatonicMapCopy } from './model';

export const en: PentatonicMapCopy = {
  title: 'The Pentatonic Map',
  summary: 'Five shapes cover the whole neck. Learn them as distances, move them to any key.',
  lead:
    'You can already count frets and read intervals. This lesson turns them into the five pentatonic shapes that most rock and blues solos are built on, with no staff notation, key signatures or circle of fifths: five ideas, each one a picture you can play. Click any note to hear it.',
  steps: {
    grid: {
      title: 'The neck is a grid, not a chart of note names',
      body: [
        'Every fret is one semitone, a half step. For the shapes in this lesson you only need to count frets, not name notes.',
        'Play fret 5 on any string and you get the same pitch as the next thinner string played open. There is exactly one exception: from G to B it is fret 4. That one exception, the G–B shift, is why every shape on the neck shifts by one fret when it crosses onto the B string.',
      ],
      takeaway: 'Fret 5 equals the next string open, except G to B, which is fret 4.',
      tryIt: 'Play fret 5 on the A string, then the open D string. Then fret 4 on G against the open B.',
    },
    formula: {
      title: 'Minor pentatonic is a formula of distances',
      body: [
        'Pick a root, the note that sounds like home. From there climb 3 frets, then 2, 2, 3 and 2, and you are back on the root, one octave higher. That is the whole scale.',
        'The labels 1, ♭3, 4, 5 and ♭7 under the notes are scale degrees, a name for each distance from the root. You do not need to memorise them yet. Later they help you choose where to stop: 1 and 5 sound settled, ♭3 sounds sad.',
      ],
      takeaway: 'Minor pentatonic = root, +3, +2, +2, +3, +2 frets.',
      tryIt: 'On the low E string, start at fret 5 and play the formula up to fret 17, then back down.',
    },
    boxes: {
      title: 'Fold the formula into your hand: two notes per string',
      body: [
        'Played along one string, the formula makes your hand travel a long way. Instead, fold it across the six strings, exactly two notes on each. The result is a box that fits in about four frets.',
        'Keep following the formula and you get the next box. The five boxes tile the neck like bricks, each sharing an edge with its neighbour, and the pattern repeats after fret 12.',
      ],
      takeaway: 'Two notes per string turns the formula into five boxes that tile the neck.',
      tryIt: 'Learn box 1 first. Then practise only the shared edge between box 1 and box 2.',
    },
    keys: {
      title: 'Changing key means sliding the shape',
      body: [
        'The shapes never change. The only thing that moves is where the root sits on the low E string. Want C minor? Find C on string 6 (fret 8) and put box 1 there.',
        'The note finder below is the only thing on this page worth memorising: where each root sits on string 6.',
      ],
      takeaway: 'Same shapes in every key: move box 1 so it starts on the new root.',
      tryIt: 'Pick a key from the finder, then play box 1 in it without looking at the screen.',
    },
    home: {
      title: 'Major or minor? Same five notes, a different root',
      body: [
        'A minor pentatonic and C major pentatonic use exactly the same notes. What changes is which note you treat as home, the root: the one you start on, rest on and lean into. The major root sits three frets above the minor root. Keys paired like this are called relative: A minor is the relative minor of C major.',
        'Switch between the two and watch: not a single dot moves. Only the highlighted root changes place.',
      ],
      takeaway: 'Minor root + 3 frets = major root, using the same notes.',
      tryIt: 'Play box 1 and end your phrases on A, then on C. Listen to the mood change.',
    },
  },
  scene: {
    grid: {
      run: 'Play the pairs',
      stop: 'Stop',
      idle: 'Each dashed line joins two places with the same pitch. Press play to hear every pair.',
      pair: 'String {low}, fret {fret} = string {high} open',
      oddPair: 'String {low}, fret {fret} = string {high} open: the G→B pair, the only 4-fret gap',
    },
    formula: {
      run: 'Play the formula',
      stop: 'Stop',
      example: 'Example on string 6, root at fret 5 (A)',
      home: 'root',
    },
    boxes: {
      box: 'Box',
      labels: 'Labels',
      degrees: 'Degrees',
      notes: 'Notes',
      play: 'Play the box',
      stop: 'Stop',
      caption: 'Box {n}: frets {min}–{max}',
    },
    keys: {
      finder: 'Root on string 6',
      cycle: 'Slide through keys',
      stop: 'Stop',
      caption: '{key} minor: root on string 6 at fret {fret}',
      moved: '{key} minor: root on string 6 at fret {fret}; the shape slid {shift} frets',
    },
    home: {
      switch: 'Root',
      minor: 'A minor',
      major: 'C major',
      legendMinor: 'minor root',
      legendMajor: 'major root',
      legendOther: 'other notes',
      caption: 'The root is {home}: on string 6 at fret {fret}',
    },
  },
  notYetTitle: 'What you do not need yet',
  notYetIntro:
    'None of this is useless. Learning it first would simply take all of your attention away from playing.',
  notYet: [
    { title: 'Reading staff notation', why: 'Electric guitar lives on tab and shapes. You can learn the staff later if you need it.' },
    { title: 'Naming every note', why: 'You only need the root on string 6. The shape gets every other note right for you.' },
    { title: 'Key signatures', why: 'On guitar, changing key is a slide of the hand, not a change of symbols.' },
    { title: 'The circle of fifths', why: 'Useful for writing harmony. Not needed to solo over a backing track.' },
    { title: 'The seven modes', why: 'They come after pentatonic, once you can link all five boxes.' },
    { title: 'Chord construction', why: 'For now you only need the key of the song, so you know where the root is.' },
  ],
};
