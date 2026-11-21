import type { SessionCopy } from '../types';

export const en: SessionCopy = {
  title: 'Double stops and boogie',
  summary: 'Hear what a second string adds, then work a short double stop into a 12-bar shuffle.',
  goal: 'Keep the 12-bar boogie in time and play a short double-stop answer before the form starts over.',
  needs: 'A guitar in standard tuning. About 15–20 minutes.',
  recap: [
    'In the 12-bar blues in A, the three chords are A7, D7 and E7.',
    'An octave gives the same note name at a higher or lower pitch.',
  ],
  parts: {
    listen: {
      title: 'Listen',
      body: [
        'Hum the lower line. Listen for a single pitch, a second note a fourth higher, or the same note name doubled an octave up. Each example uses the same four scale degrees in the lower line.',
      ],
    },
    understand: {
      title: 'Understand',
      body: [
        'A double stop sounds two notes together. Try strings 2 and 1 at fret 5 in box 1. Play each string on its own, then sound E and A together. Keep both fingers or a small barre in place as you move the pair from fret 3 up to fret 5.',
      ],
    },
    play: {
      title: 'Play',
      body: [
        'On your guitar, keep open A on string 5 and play frets 2–4–5–4 on string 4. Sound both strings together. Sing the upper E–F♯–G–F♯ while the low A stays put. That moving line goes 5–6–♭7–6.',
        'Play each pair twice per beat with the shuffle feel. Use the same fret pattern over open D for D7 and open E for E7, each with the moving notes on the next thinner string. Follow the bar grid to know when to change roots.',
      ],
    },
    challenge: {
      title: 'Challenge',
      body: [
        'Play the boogie with the full A backing and count the bars in groups of four. In bar 11, play the boogie through beat 3. On beat 4, pick strings 2 and 1 together at fret 3. Slide both notes to fret 5 so you arrive on beat 1 of bar 12.',
        'Let the pair ring through beat 2, then leave space. Return to the boogie on beat 1 when the chorus starts over. Use the last row of the bar grid to check when your answer starts and when you come back in.',
      ],
    },
  },
  blocks: {
    texture: {
      intro:
        'Listen for the extra pitch on each step. If you need another listen, the same phrase plays more slowly after a wrong answer.',
      ask: 'How many notes are sounding together, and how far apart are they?',
      answers: {
        single: 'Single notes',
        doubleStop: 'Double stops a fourth apart',
        octave: 'Octaves',
      },
      right: 'Yes. {answer}.',
      wrong: 'You heard {answer}. Listen to the same phrase more slowly.',
    },
    shapes: {
      intro:
        'Choose 4 and move the shape to fret 5 on string 2. The other note lands at the same fret on string 1. Move the root to string 3 to see how the G–B shift moves the upper note one fret to the right.',
    },
    pair: {
      intro:
        'In box 1, choose 2–1 · 5. Press Play to hear E and A together. Press Slide in to hear the same pair of strings move from fret 3 to fret 5.',
    },
    boogie: {
      intro:
        'Keep the key on A and leave Quick change and Turnaround off. Start playback. In the first bar, the diagram shows A at fret 5 on string 6. Hear the same A bass you used on the open string and watch the top note move above it.',
    },
    backing: {
      intro:
        'Start the A shuffle and use the highlighted bars to find 11 and 12. Have the double stop ready before the last two bars arrive.',
    },
    octaves: {
      intro:
        'Optional after the boogie challenge. Choose 6/4 and play the octave melody. On your guitar, fret A on string 6 at fret 5 and its octave on string 4 at fret 7. Lightly touch string 5 with the underside of the finger on string 6. Brush across all three strings and listen for just the two pitched notes.',
    },
  },
  check: [
    {
      question: 'What makes a double stop?',
      options: [
        'Two picks on one note',
        'Two notes played one after the other',
        'Two notes sounding together',
      ],
      why: 'In the fret 5 shape on strings 2 and 1, E and A sound together.',
    },
    {
      question: 'Which line moves above the bass in the boogie?',
      options: ['5–6–♭7–6', '1–♭3–4–5', '1–5–1–5'],
      why: 'The bass stays on the chord root while the upper finger changes frets.',
    },
    {
      question: 'When do you return to the boogie after the double-stop answer?',
      options: ['Beat 2 of bar 12', 'Beat 1 of the next chorus', 'Bar 5 of the next chorus'],
      why: 'Leave space after the slide, then start the new cycle together with the backing.',
    },
  ],
  canDo: [
    'I can keep the bass steady and sing the moving top line of the boogie.',
    'I can insert the double stop across bars 11–12 and rejoin on beat 1 of the next chorus.',
  ],
};
