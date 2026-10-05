import type { BarreCopy } from './model';

export const en: BarreCopy = {
  title: 'Barre Chords: Two Shapes, Every Chord',
  summary: 'Lay your first finger across the strings and two open shapes become every major, minor and 7th chord on the neck.',
  lead:
    'Open chords only exist in a few keys. Barre chords fix that: your first finger takes the place of the nut, and an open E or A shape slides anywhere. Two shapes, six variants each, and the name always comes from the note under your barre. Five steps. Click any note to hear it.',
  steps: {
    slide: {
      title: 'Your first finger is a moving nut',
      body: [
        'Play an open E chord with fingers 2, 3 and 4, leaving your first finger free. Now lay that finger flat across all six strings one fret up and move the shape with it: you are playing F. Every open string of the E shape is now under the barre.',
        'Slide the whole thing up and the chord keeps its quality but changes its name. The name is simply the note under the barre on string 6, which you already know from the fretboard lesson.',
      ],
      takeaway: 'E shape + barre = every major chord; its name is the note on string 6.',
      tryIt: 'Play F at fret 1, G at fret 3 and A at fret 5. Name each one before you check.',
    },
    eShape: {
      title: 'The E shape: root on string 6',
      body: [
        'The E-shape barre comes in the same variants as the open chords: major, minor, 7, m7, maj7 and sus4. They are not six shapes to memorise. Each is the major shape with one or two notes moved, exactly as the formula says.',
        'Minor lowers the 3rd one fret. A 7 chord drops the octave on string 4 to the ♭7. Maj7 puts the 7 there instead, one fret higher. Sus4 lifts the 3rd to the 4.',
      ],
      takeaway: 'Learn the degrees in the shape: the variants are the 3rd and the 7th moving.',
      tryIt: 'Play G, then Gm, then Gm7 at fret 3, and notice which fingers lift each time.',
    },
    aShape: {
      title: 'The A shape: root on string 5',
      body: [
        'The open A chord moves the same way, with the barre across strings 5 to 1 and the root on string 5. Its variants follow the same rule: the 3rd and the 7th move, the rest stays.',
        'Between the two shapes you can play any chord in two places: with the root on string 6, or on string 5. That choice is what lets your hand stay put in the next steps.',
      ],
      takeaway: 'A shape = root on string 5, same variants, same degrees.',
      tryIt: 'Play C at fret 3, then Cm, C7 and Cmaj7 without moving the barre.',
    },
    find: {
      title: 'Find any barre chord',
      body: [
        'To play a chord you have never played, find its root on string 6 or string 5 using the notes you learned on those strings. Put the barre there, pick the shape for that string, and choose the variant from the name: m for minor, 7, maj7, m7.',
        'Both answers are right. Most chords are easier in one of the two places, depending on where your hand already is.',
      ],
      takeaway: 'Root on string 6 → E shape; root on string 5 → A shape; the symbol picks the variant.',
      tryIt: 'Answer ten in a row, and use string 5 at least half the time.',
    },
    changes: {
      title: 'Change chords without jumping',
      body: [
        'A song in G might go G, Em, C, D. Play all of them with the E shape and your hand jumps from fret 3 down to 0, up to 8 and on to 10. Mix the shapes and the same chords sit within a few frets of each other.',
        'Look at the next chord, find its root on both string 6 and string 5, and take the one closer to where you are. Your hand stays in one place, and the changes get faster.',
      ],
      takeaway: 'Mix E and A shapes to keep the barre in one area of the neck.',
      tryIt: 'Play the loop both ways in G and in another key, and feel the difference in your arm.',
    },
  },
  scene: {
    strum: 'Strum',
    stop: 'Stop',
    root: 'Root',
    labels: 'Labels',
    degrees: 'Degrees',
    notes: 'Notes',
    kinds: { major: 'Major', minor: 'm', dom7: '7', m7: 'm7', maj7: 'maj7', sus4: 'sus4' },
    slide: {
      fret: 'Barre at fret',
      caption: '{symbol}: barre at fret {fret}; the root on string 6 names the chord.',
      open: '{symbol}: fret 0, the open chord itself. Move the barre up.',
    },
    shape: {
      variant: 'Variant',
      caption: '{symbol}, {shape} shape, barre at fret {fret}: {degrees}',
      moved: 'From {base}: {moved} moved.',
    },
    find: {
      question: 'Find {symbol}: click its root on string 6 or 5.',
      right: 'Yes: {symbol}, {shape} shape at fret {fret}. It also lives at fret {otherFret} in the {otherShape} shape.',
      wrongString: 'Barre chords have their root on string 6 or string 5.',
      wrongNote: 'That is {heard}. Look for {root}.',
      next: 'Next chord',
      score: '{right} of {total} · {streak} in a row',
    },
    changes: {
      key: 'Key',
      path: 'Shapes',
      near: 'Mix E and A',
      string6: 'All E shape',
      play: 'Play the loop',
      chordItem: '{symbol}: {shape} {fret}',
      caption: '{chords}. The barre travels {travel} frets around the loop.',
    },
  },
  notYetTitle: 'What you do not need yet',
  notYetIntro: 'Two shapes cover every chord you will meet for a long time. These come later.',
  notYet: [
    { title: 'The m11 shape', why: 'It needs the chord table and a different voicing rule. It comes with 7th chords.' },
    { title: 'C, G and D shapes (CAGED)', why: 'Three more movable shapes. The E and A shapes do the job first.' },
    { title: 'Partial barres and small triads', why: 'Three-string shapes high on the neck come with soloing over changes.' },
    { title: 'Inversions', why: 'Another note in the bass. They come with the chord table.' },
    { title: 'Why I, vi, IV, V', why: 'The Roman numerals and which chords belong to a key come with keys and progressions.' },
  ],
};
