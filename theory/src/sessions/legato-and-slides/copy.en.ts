import type { SessionCopy } from '../types';

export const en: SessionCopy = {
  title: 'Legato and slides',
  summary: 'Hear how the fretting hand connects notes and play the technique marks in tab.',
  goal: 'Play a hammer-on, a pull-off and a slide from tab, with one pick stroke per pair of notes.',
  needs: 'A guitar in standard tuning. About 15–20 minutes.',
  recap: [
    'The top line of tab is string 1, the thinnest string.',
    'In A minor pentatonic, box 1 has A and C at frets 5 and 8 on that string.',
  ],
  parts: {
    listen: {
      title: 'Listen',
      body: [
        'Listen to how the second pitch arrives. A separately picked note has a fresh attack. Legato joins the two notes with a quick change of pitch. A slide lets you hear the pitch move between the frets.',
      ],
    },
    understand: {
      title: 'Understand',
      body: [
        'On string 1, pick frets 5 and 8 separately. Then try 5h8. Pick fret 5 once and bring your little finger down firmly at fret 8 to sound the second note. This is a hammer-on, marked h.',
        'For 8p5, hold fret 5 before picking fret 8. Pull your little finger slightly across the string as you lift it so fret 5 sounds. That is a pull-off, marked p. For a slide, marked / here, keep your finger pressing the string as you move it along the neck. The ~ marks vibrato on a held note.',
      ],
    },
    play: {
      title: 'Play',
      body: [
        'Start the backing in A minor. On string 1, play 5h8 on beats 1 and 2 and 8p5 on beats 3 and 4. Leave the next bar free to listen. When Dm arrives, pick fret 5 and slide to fret 8. Hold the last note, then try a small vibrato.',
      ],
    },
    challenge: {
      title: 'Challenge',
      body: [
        'Listen to the full tab, then play it slowly on your guitar. Use one pick stroke at the start of each pair. Listen for two clear pitches on each pair and a smooth move on the slide.',
      ],
    },
  },
  blocks: {
    articulation: {
      intro:
        'The two notes are on one string. Listen for a second pick attack, a sudden change of pitch, or the glide between the notes.',
      ask: 'How were the two notes played?',
      answers: { picked: 'Two separate picks', legato: 'Hammer-on or pull-off', slide: 'Slide' },
      right: 'Yes. {answer}.',
      wrong: 'You heard {answer}. Listen to the same example played slower.',
    },
    techniques: {
      intro:
        'Choose Hammer-on and press Play. The diagram uses frets 5 and 7 on string 3. Choose Pull-off to hear the same pair in reverse. The Slide example uses frets 5 and 7 on string 4. Watch the pitch curve on each example, then choose Vibrato to hear it on a held note.',
    },
    backing: {
      intro:
        'Use the highlighted bars to tell when Am changes to Dm. The same fret pair works in both parts of the exercise.',
    },
    tab: {
      intro:
        'All six notes are on string 1. Play 5h8, then 8p5, then pick fret 5 and slide to fret 8. Hold fret 8 and let the vibrato start after the slide arrives.',
      label: 'Tab for the hammer-on, pull-off and slide phrase',
      play: 'Play the tab',
    },
    echo: {
      intro:
        'For extra practice, listen to a short new phrase and echo it on the diagram. Try it on your guitar too. Connect a pair when both notes are on the same string.',
      ask: 'Can you find the rest of the phrase in box 1?',
      right: 'You found the note. Keep going, or choose Next when the phrase is complete.',
      higher: 'Listen for a higher pitch.',
      lower: 'Listen for a lower pitch.',
      done: 'You echoed four phrases. Try connecting two notes on your guitar.',
    },
  },
  check: [
    {
      question: 'What does 5h8 tell you to do on one string?',
      options: [
        'Pick both frets separately',
        'Pick fret 5 and hammer on to fret 8',
        'Pick fret 8 and pull off to fret 5',
      ],
      why: 'The first number is the fret you pick. The h tells your fretting hand to sound the second note.',
    },
    {
      question: 'What do you prepare before playing 8p5?',
      options: [
        'Lift both fingers',
        'Move your finger along the neck',
        'Hold fret 5 while you pick fret 8',
      ],
      why: 'The lower fret is already held when your finger pulls away from fret 8 and sounds it.',
    },
    {
      question: 'What happens to the pitch during a slide?',
      options: [
        'It moves through the pitches between the frets',
        'It jumps directly to the second pitch',
        'It wavers around the starting pitch',
      ],
      why: 'Keeping the finger in contact lets the pitch change as the finger moves.',
    },
  ],
  canDo: [
    'I can recognise the sound of two picks, a hammer-on or pull-off, and a slide.',
    'I can play the tab with one pick attack per pair and make both notes of each pair sound clearly.',
  ],
};
