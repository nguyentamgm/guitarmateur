import type { SoloCopy } from './model';

export const en: SoloCopy = {
  title: 'Soloing over the Changes: Aim for the Chord',
  summary: 'Pick the scale from the key, then let the chord playing tell you which notes to land on, and build phrases you can answer.',
  lead:
    'Soloing over a backing comes down to two questions: which notes are safe here, and which one is best right now. The key answers the first; the chord playing answers the second. This lesson puts a backing under you (a blues, a pop loop, a rock loop or a jazz ii–V–I), lights up the notes of each chord as it comes round, and builds phrases for you to answer. Four steps. Play along on your guitar.',
  steps: {
    scale: {
      title: 'Pick the scale from the key',
      body: [
        'Start from the key. A minor home or a blues: the minor pentatonic, and in a blues add the ♭5, the blue note. A major home: the major pentatonic. Each of its notes sits well enough over every chord of the key, which is why it is the first scale players solo with.',
        'The style picks the flavour. Rock leans on the minor pentatonic and on bends. Blues adds the blue note and loose, swung phrasing. Jazz plays the whole major scale and follows each chord, because its chords carry 7ths that the pentatonic leaves out. Switch to the wrong pentatonic once to hear why the choice matters.',
      ],
      takeaway: 'The key picks the scale; the style picks its flavour.',
      tryIt: 'Play anything from the box over each backing for one time round. Then switch to the wrong scale and hear where it rubs.',
    },
    tones: {
      title: 'The chord tones light up',
      body: [
        'The scale tells you which notes are allowed. The chord playing tells you which are strongest right now: its own notes, the 1, 3, 5 and 7. Here the notes of the chord being heard light up, named by their place in the chord, and the light moves when the backing changes chord.',
        'The other notes are not wrong. They are passing notes: good on the way, weaker to stop on. Stop on a lit note, above all on beat 1 and at the end of a phrase, and the solo sounds as if it knows where the song is.',
      ],
      takeaway: 'The scale says what is allowed; the chord says what is strongest.',
      tryIt: 'Play freely, but land on a lit note on beat 1 of every bar.',
    },
    guide: {
      title: 'Aim for the 3rd',
      body: [
        'When the chord changes, its 3rd says so most clearly: it is the note that makes the chord major or minor. The 7th comes next. Together they are called guide tones. Play the nearest 3rd of each new chord and the changes come through even with no backing.',
        'The line here takes one target per bar and moves as little as it can, often by a single step. When the box has no 3rd for a chord, as with the major 3rds of a blues in the minor box, it takes the 7th instead.',
      ],
      takeaway: 'When the chord changes, aim for its 3rd; the 7th is next best.',
      tryIt: 'Play only the line, one long note per bar. Then add two or three notes leading into each one.',
    },
    phrase: {
      title: 'A small idea, again, then a new ending',
      body: [
        'A string of scale runs is not a solo. A good phrase starts from a small idea, three or four notes, and repeats it so the listener can catch it. Then it changes something: the rhythm, the direction or the last note. That change is what makes it sound intended.',
        'Leave space. The empty bar is part of the phrase: it lets the idea land and gives you room to answer. Each idea here is made from the scale, and every ending lands on a note of its bar\'s chord.',
      ],
      takeaway: 'Say an idea, say it again, change the end, then leave space.',
      tryIt: 'Listen to the idea, then answer each empty bar with your own version of it.',
    },
  },
  scene: {
    play: 'Play the backing',
    stop: 'Stop',
    key: 'Key',
    tempo: 'Tempo',
    bpm: '{bpm} BPM',
    backing: 'Backing',
    backings: { blues: '12-bar blues', pop: 'Pop I–V–vi–IV', rock: 'Rock i–VII–VI–VII', jazz: 'Jazz ii–V–I' },
    grid: 'The backing, numerals above, chord names below',
    neck: '{scale}, box 1',
    scales: {
      minorBlues: '{root} blues scale',
      majorPentatonic: '{root} major pentatonic',
      minorPentatonic: '{root} minor pentatonic',
      major: '{root} major scale',
    },
    scale: {
      choice: 'Scale',
      right: 'The one that fits',
      wrong: 'The wrong one',
      caption: 'Solo with the {scale}, box 1 at fret {fret}.',
      styles: {
        blues: 'Blues: lean on the ♭3 and the blue note, bend them, and let the shuffle swing your phrases.',
        pop: 'Pop: sing-like lines from the major pentatonic, mostly steps, ending on the root or the 3rd.',
        rock: 'Rock: the minor pentatonic, short riffs repeated, and bends up to the root and the 5th.',
        jazz: 'Jazz: every note of the major scale, chosen chord by chord. The next two steps show how.',
      },
      wrongCaption: 'The {scale}: {notes} are not in the key, and they rub against the chords. Listen for it.',
      wrongBlues: 'The {scale} over a blues is not wrong, just brighter: blues players mix both. The minor sound is the one to learn first.',
    },
    tones: {
      chord: 'Chord',
      caption: '{symbol}: {tones} light up.',
      playing: 'Bar {n}, {symbol}: land on {tones}.',
    },
    guide: {
      withLine: 'Play the line',
      on: 'On',
      off: 'Off',
      line: 'The line: {line}.',
      caption: 'Bar {n}, {symbol}: aim for {name}, its {degree}.',
      fallback: 'Bar {n}, {symbol}: the box has no 3rd for it, so aim for {name}, its {degree}.',
    },
    phrase: {
      newIdea: 'New idea',
      tab: 'The phrase, with the count each note starts on',
      offbeat: '{n}&',
      yourTurn: 'you',
      idle: 'Four bars: an idea, the same idea again, the idea with a new ending, then a bar for your answer.',
      roles: {
        idea: 'Bar {n}: the idea, landing on {name}, the {degree} of {symbol}.',
        again: 'Bar {n}: the same idea again.',
        change: 'Bar {n}: a new ending, landing on {name}, the {degree} of {symbol}.',
        yours: 'Bar {n}: your turn. Answer it.',
      },
    },
  },
  notYetTitle: 'What you do not need yet',
  notYetIntro: 'One box, the chord tones and one idea at a time are enough to make a solo sound intended. These come later.',
  notYet: [
    { title: 'Playing a phrase back by ear', why: 'Hearing a phrase and finding it on the neck comes with the review mode.' },
    { title: 'Recording your solo and hearing it back', why: 'Trying an idea and listening back comes with the review mode too.' },
    { title: 'Modes and a scale for every chord', why: 'Jazz players pick a scale per chord. Over a ii–V–I the major scale covers it for now.' },
    { title: 'Chromatic passing notes', why: 'Notes from outside the scale on the way to a chord tone. Learn the targets first.' },
    { title: 'Soloing across all five boxes', why: 'One box is enough to aim for chord tones. Connecting the boxes comes with scales across the whole neck.' },
    { title: 'Bends, slides and vibrato in your phrases', why: 'The blues and electric lessons teach them. Here the notes and the timing come first.' },
  ],
};
