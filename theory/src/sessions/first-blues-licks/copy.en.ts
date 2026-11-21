import type { SessionCopy } from '../types';

export const en: SessionCopy = {
  title: 'First blues licks',
  summary: 'Turn three familiar notes into a call and shape a reply over the shuffle.',
  goal: 'Vary the rhythm of a short lick, answer it in time, and change the landing note on the next pass.',
  needs: 'A guitar in standard tuning. About 15–20 minutes.',
  recap: [
    'In box 1, A and C are at frets 5 and 8 on string 6. D is at fret 5 on string 5.',
    'This 12-bar shuffle has four steady beats per bar. Listen for the offbeat between taps.',
  ],
  parts: {
    listen: {
      title: 'Listen',
      body: [
        'Play A–C–D on beats 1, 2 and 3. Rest on beat 4. Answer with D–C–A and hold A for two beats. Sing D at the end of the call, then sing A at the end of the answer. Which one feels settled?',
      ],
    },
    understand: {
      title: 'Understand',
      body: [
        'A call gives your ear a short idea to remember. You can answer it with the same notes in a new order and land on the root to give it a sense of arrival. Count through the rests so both phrases have room to be heard.',
      ],
    },
    play: {
      title: 'Play',
      body: [
        'Keep A–C–D for all three versions. Start on beat 1 and rest on beat 4. Next, start on the “and” of beat 1 and play each note on an “and”. Notice how the same three notes feel when they enter between the clicks.',
        'For the last version, pick A on beat 1 and C on beat 2. Pick D on beat 4 and hold it through beat 1 of the next bar. Let go on beat 2 and count the rest of that bar in silence.',
      ],
    },
    challenge: {
      title: 'Challenge',
      body: [
        'Count the exchange aloud. Listen through bars 1–2, then answer on guitar in bars 3–4. Try D and C on the first two beats of bar 3. Land on A on beat 1 of bar 4, hold it for two beats, then leave space for the next call at bar 5.',
        'Listen again in bars 5–6 and 9–10, and answer in 7–8 and 11–12. When the chorus starts over, keep D and C and land on E instead of A. Check that you can hear the next call arrive after your answer.',
      ],
    },
  },
  blocks: {
    ending: {
      intro:
        'Listen for the rest after the call. Then listen to the last note of the second phrase. It may settle on the starting pitch or repeat the first ending.',
      ask: 'Did the second phrase answer the call or repeat it?',
      answers: { response: 'Answer to the root', repeat: 'Repeat' },
      right: 'Yes. You heard {answer} in {detail} minor pentatonic.',
      wrong:
        'You heard {answer} in {detail} minor pentatonic. Listen to both phrases again and compare their endings.',
    },
    lengths: {
      intro:
        'Choose Quarter and tap the fourth block to turn it into a rest. Start playback and keep tapping your foot through the empty beat.',
    },
    legato: {
      intro:
        'Choose The lick and play it over the 12-bar backing. Listen to the bend at the start and the slide into the held note at the end. Count the two bars the lick leaves open after it plays.',
    },
    rhythms: {
      intro:
        'Hear the three rhythms against a steady click. Follow the three entries in the tab and tap through the bar where D keeps ringing.',
      label: 'Three rhythms for A–C–D',
      play: 'Hear the three rhythms',
    },
    backing: {
      intro:
        'Start the A shuffle and try each version on guitar. Keep counting in four when you enter on an offbeat or hold D across a bar line.',
    },
    exchange: {
      intro:
        'The call opens with A–C–D, with a hammer-on into D. Listen for E♭ passing into E, then a bend from D up to E in the second bar. The backing keeps the beat while you play your answer.',
    },
  },
  check: [
    {
      question: 'Which ending brings the short A–C–D call back to its root?',
      options: ['End on D', 'End on E', 'End on A'],
      why: 'A is the root. Ending on A gives the answer a sense of arrival.',
    },
    {
      question: 'What do you do when your D carries from beat 4 through beat 1 of the next bar?',
      options: [
        'Let the same note ring while you count the new beat',
        'Pick D again on beat 1',
        'Stop D at the bar line',
      ],
      why: 'One pick can cover both beats. Keep counting while the note rings across the bar line.',
    },
    {
      question: 'The first call plays in bars 1–2. When do you answer?',
      options: ['Bars 2–3', 'Bars 3–4', 'Bars 5–6'],
      why: 'The two bars after the call are yours. The next call starts in bar 5.',
    },
  ],
  canDo: [
    'I can start A–C–D on the beat or on an offbeat, and hold D across a bar line.',
    'I can enter in the two bars after the call, leave room for the next call, and change my landing note on a repeat.',
  ],
};
