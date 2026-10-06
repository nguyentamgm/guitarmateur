import type { KeysCopy } from './model';

export const en: KeysCopy = {
  title: 'Keys and Progressions: Chords by Number',
  summary: 'Seven chords belong to every key. Name them by number and any progression moves to any key, and you can hear which chord is home.',
  lead:
    'Songs do not pick chords at random. Most use the seven chords that grow out of one major scale, and players talk about them by number: "a one–five–six–four in G". This lesson builds those seven chords, turns them into Roman numerals, trains your ear to find home, and shows why the V chord pulls and how two keys can share the same chords. Five steps. Click any note to hear it.',
  steps: {
    family: {
      title: 'Every key has a family of seven chords',
      body: [
        'Take the major scale and build a chord on each note, using only notes of the scale: start on a note, skip one, take the next, skip one, take the next. From G that gives G B D; from A, A C E; from B, B D F♯; and so on up the scale.',
        'The scale has semitones in fixed places, so the chords come out the same in every key: major on degrees 1, 4 and 5, minor on 2, 3 and 6, and diminished on 7. Take one more note the same way and you get 7th chords: maj7 on 1 and 4, the dominant 7 on 5, m7 on 2, 3 and 6, and m7♭5 on 7.',
      ],
      takeaway: 'Stack every other scale note: major on 1, 4, 5; minor on 2, 3, 6; diminished on 7.',
      tryIt: 'Click through all seven chords in G, then switch to 7th chords and compare Gmaj7 with D7.',
    },
    numbers: {
      title: 'Numbers, not names',
      body: [
        'Players name these chords by Roman numerals: uppercase for major (I, IV, V), lowercase for minor (ii, iii, vi), and a small circle for diminished (vii°). The numeral tells you the chord\'s place in the key, not its letter.',
        'Change the key and every chord name changes, but the numerals stay. I–V–vi–IV is G D Em C in G and A E F♯m D in A: the same song, the same shapes, just slid up two frets. Learn a progression as numbers and you can play it in any key.',
      ],
      takeaway: 'Learn a progression as numerals; the key only decides where your hand starts.',
      tryIt: 'Play I–V–vi–IV in G, then move it to A and play it again without looking at the chord names.',
    },
    home: {
      title: 'Which chord is home?',
      body: [
        'The key of a song is the chord it wants to come back to: the I chord, built on the tonic. You can hear it. Stop a progression on the V chord and it hangs in the air until you play the I.',
        'You do not need a key signature to find the key. Listen for the chord that feels like the end of the sentence, the one the song starts or finishes on, or the one the V leads to.',
      ],
      takeaway: 'Home is the chord the progression wants to land on: the I.',
      tryIt: 'Listen to the lead-in, then pick the chord that ends it. Get five right in a row.',
    },
    twoFive: {
      title: 'V wants to go home, and ii–V–I',
      body: [
        'The V7 chord holds two notes that lean hard on the I: its 3rd sits a semitone below the tonic, and its ♭7 a semitone above the 3rd of the I. In C, G7 has B and F; they step to C and E. That pull is why V7 → I sounds like an ending.',
        'Put the ii chord in front and you get ii–V–I, the most common progression in jazz: Dm7 G7 Cmaj7. It works into any chord, not just the I. To lead into F, play its own ii and V first: Gm7 C7 F. Players write those as ii7/IV and V7/IV: "the ii and V of the IV chord".',
      ],
      takeaway: 'V7 pulls to I. To lead into any chord, play its own ii–V first.',
      tryIt: 'In C, add the ii–V into IV and hear Gm7 C7 pull into F. Then try it in G.',
    },
    relative: {
      title: 'Same chords, two homes',
      body: [
        'Every major key shares its chords with its relative minor, the key on its 6th degree. C major and A minor use exactly the same seven chords. Seen from A, the numerals shift: Am is i, C is III, G is VII, and the diminished chord is ii°.',
        'Which key a song is in depends on which chord wins. C G Am F lands on C, so it is in C major; Am G F G keeps coming back to Am, so it is in A minor. The home also tells you what to solo with: the major pentatonic of the major home, or the minor pentatonic of the minor one. They are the same five notes with a different root.',
      ],
      takeaway: 'The vi of a major key is the i of its relative minor; the chord that wins picks the pentatonic.',
      tryIt: 'Play both loops in C and hum the root over each. Then try them in G: G major against E minor.',
    },
  },
  scene: {
    stop: 'Stop',
    key: 'Key',
    playLoop: 'Play the loop',
    quality: { major: 'Major', minor: 'Minor', dim: 'Diminished' },
    family: {
      size: 'Chords',
      triads: 'Triads',
      sevenths: '7th chords',
      playAll: 'Play all seven',
      scale: 'The major scale, with the notes of the chord picked out',
      caption: '{roman}: {symbol} = {notes}, every other note of the scale from {start}.',
    },
    numbers: {
      progression: 'Progression',
      grid: 'The progression, numerals above, chord names below',
      caption: 'In {key}: {chords}. The barre travels {travel} frets around the loop.',
    },
    home: {
      question: 'Which chord sounds like home?',
      listen: 'Play the lead-in',
      leadIn: 'The lead-in',
      choices: 'The chord that ends it',
      right: 'Yes: {symbol} is the I. The V7 resolves to it: home in {key} major.',
      vi: '{symbol} is the vi. Close: it shares two notes with the I ({home}), so it sounds like a surprise ending, not home.',
      away: '{symbol} is the {roman}. It moves somewhere else; it does not land. Listen again.',
      next: 'Next key',
      score: '{right} of {total} · {streak} in a row',
    },
    twoFive: {
      pull: 'The pull',
      hang: 'Stop on V7',
      resolve: 'Resolve to I',
      hangCaption: 'I IV V7, then silence: {v} is left hanging, waiting for {i}.',
      resolveCaption: 'I IV V7 I: {v} goes home to {i}.',
      approach: 'Add a ii–V',
      off: 'Off',
      intoI: 'Into I',
      intoIV: 'Into IV',
      grid: 'The loop, numerals above, chord names below',
      offCaption: '{chords}: nothing pulls, the loop just floats.',
      onCaption: '{ii} and {v} lead into {target}.',
    },
    relative: {
      home: 'Home',
      majorHome: '{root} major',
      minorHome: '{root} minor',
      rowMajor: 'In {root} major',
      rowMinor: 'In {root} minor',
      caption: '{chords} lands on {root}. Solo with {scale}.',
      majorScale: '{root} major pentatonic',
      minorScale: '{root} minor pentatonic',
    },
  },
  notYetTitle: 'What you do not need yet',
  notYetIntro: 'Seven chords and their numbers cover most songs. These come later.',
  notYet: [
    { title: 'Key signatures and the circle of fifths', why: 'Theory finds the key by ear and by the chords, not by the sharps and flats on a staff.' },
    { title: 'Modes', why: 'Dorian, Mixolydian and the rest are the same scale with another home. The major and minor homes come first.' },
    { title: 'Harmonic minor and the major V in minor keys', why: 'Many minor songs borrow a major V7 for a stronger pull. One raised note, for later.' },
    { title: 'Borrowed chords', why: 'Chords from outside the key, like ♭VII in a major song. Learn the family first.' },
    { title: 'ii–V into a minor chord', why: 'It usually uses m7♭5 and a V7 with extra tension. It comes with jazz harmony.' },
    { title: 'Soloing over the changes', why: 'Playing the chord tones as each chord arrives is the next lesson.' },
  ],
};
