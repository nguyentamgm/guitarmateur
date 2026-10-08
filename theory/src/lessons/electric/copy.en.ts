import type { ElectricCopy } from './model';

export const en: ElectricCopy = {
  title: 'Electric Guitar: Power Chords, Mutes, Double Stops, Octaves',
  summary: 'The two-note chord of rock, the palm-muted chug, two-string licks, octave melodies, and the blues boogie as one moving shape.',
  lead:
    'Single notes and bends are half of electric guitar. The other half is a few small shapes played with attitude: the power chord, the palm-muted chug, double stops and octaves. Five steps, each one a shape you can carry anywhere on the neck. Click any note to hear it.',
  steps: {
    power: {
      title: 'A power chord is just 1 and 5',
      body: [
        'Put a root on string 6 or 5, add the note two frets up on the next string (a perfect 5th), and add the root again two frets up one string further if you like. That is a power chord, written A5, C5 and so on.',
        'It has no 3rd, so it is neither major nor minor. That is why the same shape fits under a major or a minor song, and why it stays clear through distortion, where fuller chords turn to mush.',
      ],
      takeaway: 'Power chord = root + 5th (+ octave): one shape for every key, major or minor.',
      tryIt: 'Using the notes you know on strings 6 and 5, play E5, G5 and A5 on string 6, then C5 and D5 on string 5.',
    },
    mute: {
      title: 'Palm mute: the chug between the hits',
      body: [
        'Rest the edge of your picking hand lightly on the strings right where they meet the bridge. The note gets short, dark and thick: a chug instead of a ring.',
        'Most rock riffs alternate the two: chug the root in tight eighths, then lift the hand and let a chord ring. This riff takes its roots from E minor pentatonic, E, G and A (I, ♭III and IV), all as power chords.',
      ],
      takeaway: 'Chug the root palm-muted, lift to let the accents ring.',
      tryIt: 'Chug E5 in steady eighths with the click, then play the riff and lift the palm only on the long chords.',
    },
    doubleStops: {
      title: 'Double stops: two strings, same fret',
      body: [
        'Play two neighbouring strings at the same fret inside a pentatonic box and you get two scale notes at once. Across most string pairs that is a perfect 4th; across G and B, tuned a fret closer, it is a major 3rd.',
        'They are all over rock and country solos, often slid into from two frets below. You do not need new shapes: every pair is already in the boxes you know.',
      ],
      takeaway: 'Same fret on two strings: a 4th, or a major 3rd on G–B. Slide in from below.',
      tryIt: 'In box 1, slide the B–e pair at fret 5 in from fret 3, then pick it twice and let it ring.',
    },
    octaves: {
      title: 'Octaves: one melody, twice as thick',
      body: [
        'The octave shape skips a string: two strings up and two frets right, or three frets right when the jump crosses G→B. Fret both notes and let the underside of your first finger touch the string in between, so it stays silent.',
        'Strum all three strings and only the octave sounds. Move the shape along the strings and any melody comes out bigger and rounder than single notes.',
      ],
      takeaway: 'Octave = two strings up, +2 frets (+3 across G→B), middle string muted.',
      tryIt: 'Play the phrase in octaves on strings 5 and 3, strumming through the muted string 4.',
    },
    boogie: {
      title: 'The blues boogie is a moving power chord',
      body: [
        'The shuffle behind the blues lesson is a boogie: a two-note power chord whose top finger rocks: 5, 5, 6, 6, ♭7, ♭7, 6, 6. The root stays put; the 6 is two frets past the 5, the ♭7 three.',
        'Play the I on string 6 and move to string 5 for the IV and V, so your hand barely travels. Palm-mute it lightly and swing it, and you are the band.',
      ],
      takeaway: 'Boogie = root + 5–6–♭7–6 on the next string, I on string 6, IV and V on string 5.',
      tryIt: 'Play all 12 bars in A, palm-muted, then switch on the quick change.',
    },
  },
  scene: {
    play: 'Play',
    stop: 'Stop',
    tempo: 'Tempo',
    bpm: '{bpm} BPM',
    palmMute: 'Palm mute',
    on: 'On',
    off: 'Off',
    power: {
      notes: 'Notes',
      two: '2: 1 5',
      three: '3: 1 5 8',
      overMajor: 'Under a major 3rd',
      overMinor: 'Under a minor 3rd',
      caption: '{symbol}: root on string {string}, fret {fret}.',
      idle: 'Click any fret on string 6 or 5 to move the shape there.',
    },
    mute: {
      grid: 'Two bars of the riff, in eighths',
      chug: 'PM',
      legendRing: 'Let ring',
      legendMute: 'Palm-muted chug',
      playing: '{symbol}',
      idle: 'Riff in E: E5, G5, A5. Press play, then try it with the palm mute off.',
    },
    doubleStops: {
      box: 'Box',
      pair: 'Pair',
      slide: 'Slide in',
      fourth: 'perfect 4th',
      third: 'major 3rd',
      caption: 'Strings {low}–{high}, fret {fret}: {a} + {b}, a {interval}.',
    },
    octaves: {
      strings: 'Strings',
      pairItem: '{low}/{high}',
      mutedMark: '×',
      caption: '{key} minor from fret 5 on string {low}: the octave on string {high} sits {shift} frets to the right.',
    },
    boogie: {
      key: 'Key',
      quickChange: 'Quick change',
      turnaround: 'Turnaround',
      form: 'The 12 bars',
      idle: '{key} boogie, swung. Press play and watch the shape change strings.',
      playing: 'Bar {n}: {chord}, root on string {string}',
    },
  },
  notYetTitle: 'What you do not need yet',
  notYetIntro: 'These shapes are enough to play most rock rhythm parts. These can wait.',
  notYet: [
    { title: 'Distortion and amp tone', why: 'The shapes sound right clean first. Tone is a matter of gear and taste.' },
    { title: 'Barre chords', why: 'Full major and minor shapes come with chords, built from the same root strings.' },
    { title: 'Double-stop bends and chicken pickin\'', why: 'Country technique, built on what you just learned.' },
    { title: 'Writing your own riffs', why: 'Swap the roots of this riff for other pentatonic degrees first.' },
  ],
};
