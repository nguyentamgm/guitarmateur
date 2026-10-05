import type { MajorScaleCopy } from './model';

export const en: MajorScaleCopy = {
  title: 'The Major Scale and Interval Shapes',
  summary: 'One formula builds the major scale in every key; every interval is a shape you can carry around the neck.',
  lead:
    'The major scale is the ruler the rest of music theory is measured with: pentatonics, chords and keys are all described against it. Here it is a pattern of fret gaps, then a spelling rule, then a set of shapes. Five steps. Click any note to hear it.',
  steps: {
    formula: {
      title: 'The major scale is one formula: W W H W W W H',
      body: [
        'Pick a root, the note the scale starts from and feels at home on, and climb: whole step, whole step, half step, whole, whole, whole, half. On one string that is +2 +2 +1 +2 +2 +2 +1 frets, and you land on the root again one octave up.',
        'The two half steps, between degrees 3 and 4 and between 7 and 8, give the scale its sound. Change the root and the whole pattern slides along the string; the gaps never change.',
      ],
      takeaway: 'Major scale = root + 2 2 1 2 2 2 1 frets, in every key.',
      tryIt: 'Play the scale on string 5 from fret 3 (C), then from fret 5 (D), counting the gaps out loud.',
    },
    spelling: {
      title: 'Each letter A to G appears exactly once',
      body: [
        'A major scale has seven notes and uses each of the seven letters once, in order. The fret pattern decides the pitches; this rule decides their names.',
        'In F major the fourth note sits one fret above A. It could be called A♯ or B♭. A is already taken by the third note, and B would be missing, so the name is B♭. Follow the rule in any key and its major scale ends up with only sharps or only flats, never both.',
      ],
      takeaway: 'One letter per note, so F major has B♭, never A♯.',
      tryIt: 'Pick F and switch the fourth note to A♯: watch the letter A fill twice and B go empty. Then try a few keys with the names on the neck.',
    },
    intervals: {
      title: 'An interval has a number and a quality',
      body: [
        'The number counts letters, both ends included: C up to E is C D E, a 3rd. The quality comes from the semitones: C to E is 4 semitones, a major 3rd; C to E♭ is 3, a minor 3rd.',
        'Above the root in a major scale, degrees 2, 3, 6 and 7 are major intervals; 1, 4, 5 and 8 are perfect. One semitone lower turns major into minor and perfect into diminished; one higher makes any of them augmented. F♯ and G♭ sound the same over C, yet one is an augmented 4th and the other a diminished 5th: the letter count decides.',
      ],
      takeaway: 'Number = letters counted; quality = semitones. 2 3 6 7 are major, 1 4 5 8 perfect.',
      tryIt: 'Click a few notes above C and sing each interval before you press play. Then lower a major 3rd to minor and listen.',
    },
    shapes: {
      title: 'Every interval is a stamp you can move',
      body: [
        'On guitar an interval is a shape: a 3rd on the next string up, an octave two strings up and two frets right. Stamp the shape anywhere and it gives the same interval, in any key.',
        'The one exception is the G and B pair, tuned a semitone closer than the others. When a shape crosses from string 3 to string 2, the note on the B side moves one fret further right.',
      ],
      takeaway: 'Same shape, same interval, anywhere; +1 fret when it crosses G→B.',
      tryIt: 'Pick the major 3rd and stamp it on strings 5, 4 and 3. Feel where your finger has to shift.',
    },
    degrees: {
      title: 'A scale is a root plus six interval shapes',
      body: [
        'Put the root on string 6 and look at five frets around it. Every note of the major scale in that window is one of the shapes you just learned, measured from the root: a major 2nd, a major 3rd, a perfect 4th, and so on.',
        'Knowing the shapes means knowing the scale by its degrees, not by a box you memorised. The degree numbers are also how chords and the pentatonic are written later on.',
      ],
      takeaway: 'Each scale note is an interval from the root: 1 2 3 4 5 6 7.',
      tryIt: 'Play the root, then each degree in turn, and name the interval you hear before you check.',
    },
  },
  scene: {
    interval: {
      name: '{quality} {number}',
      numbers: ['unison', '2nd', '3rd', '4th', '5th', '6th', '7th', 'octave'],
      qualities: {
        perfect: 'perfect',
        major: 'major',
        minor: 'minor',
        augmented: 'augmented',
        diminished: 'diminished',
      },
      span: '{n} semitones',
      spanOne: '1 semitone',
    },
    formula: {
      key: 'Root',
      play: 'Play the scale',
      stop: 'Stop',
      whole: 'Whole step: +2',
      half: 'Half step: +1',
      idle: '{note} major on string 5, from fret {fret}.',
      step: 'Degree {n}: {note}',
    },
    spelling: {
      key: 'Key',
      letters: 'Letters of the scale',
      fourth: 'Degree 4',
      names: 'Names on the neck',
      show: 'Show',
      hide: 'Hide',
      right: 'Each letter once: {notes}',
      clash: '{wrong} uses the letter {letter} twice and leaves {missing} out. That is why {key} major has {right}.',
      neck: '{key} major on frets 0–12',
    },
    intervals: {
      home: 'Root: {note} on string 5',
      play: 'Play apart, then together',
      lower: 'Lower ½ step',
      raise: 'Raise ½ step',
      idle: 'Click a note above the root, up to its octave.',
      reading: '{from} → {to}: {name}, {span}',
      or: 'or',
    },
    shapes: {
      interval: 'Interval',
      play: 'Play the shape',
      idle: 'Click any note to move the stamp there.',
      up1: 'next string up',
      up2: 'two strings up',
      caption: '{name}, {from} → {to}: {up}, fret shift {offset}',
      crossesB: 'Crosses G→B: the upper note sits one fret further right.',
      offNeck: 'This shape does not fit on the neck from here. Click another note.',
    },
    degrees: {
      key: 'Key',
      labels: 'Labels',
      degrees: 'Degrees',
      notes: 'Notes',
      degree: 'Play the root, then',
      idle: '{key} major, five frets around the root at fret {fret} on string 6.',
      heard: 'Root, then degree {n}: {note}, a {name} ({span}).',
    },
  },
  notYetTitle: 'What you do not need yet',
  notYetIntro: 'The major scale opens many doors. These ones can wait until a lesson needs them.',
  notYet: [
    { title: 'The natural minor scale and relative keys', why: 'They are the same notes with another note as the root. They come with the full pentatonic and with keys.' },
    { title: 'Memorising key signatures', why: 'The letter rule names every note for you. Reading a key from the signature belongs to sheet music.' },
    { title: 'Double sharps and double flats', why: 'D♯ major would need F𝄪, so the same key is called E♭ major. They come back in chord formulas.' },
    { title: '9ths, 11ths and 13ths', why: 'They are 2, 4 and 6 an octave up. They matter for chord names.' },
    { title: 'Three notes per string', why: 'A way to play the scale across the whole neck. It comes after the pentatonic boxes.' },
    { title: 'Descending and inverted intervals, modes', why: 'Upward shapes from the root are enough for scales and chords for now.' },
  ],
};
