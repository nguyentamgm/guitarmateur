import type { SessionCopy } from '../types';

export const en: SessionCopy = {
  title: 'Bends and vibrato',
  summary: 'Match a bend to a fretted note, hold the pitch, and add vibrato.',
  goal: 'Bend up a whole step to a target pitch and return to that pitch after a small vibrato.',
  needs: 'A guitar in standard tuning. About 15–20 minutes.',
  recap: [
    'Two frets on the same string span a whole step.',
    'D and E are the 4 and 5 of A minor pentatonic.',
  ],
  parts: {
    listen: {
      title: 'Listen',
      body: [
        'Hum the first note. The second note starts lower and rises. Listen to where it settles after the rise. Does it stop below the pitch you hummed, match it, or go past it?',
      ],
    },
    understand: {
      title: 'Understand',
      body: [
        'On string 3, pick E at fret 9. Then pick D at fret 7 with your ring finger and use the other fingers to support it as you push the string sideways. Hold the bend and compare it with the fretted E. A flat bend stops below E. A sharp bend goes above it.',
        'Each full bend in the diagram has a target a whole step up. The blues curl is a smaller bend from ♭3 towards 3. Its pitch can sit between those two notes.',
      ],
    },
    play: {
      title: 'Play',
      body: [
        'Play the A shuffle at 72 BPM. In the first A7 bar, pick E at fret 9 on beat 1. Pick D at fret 7 on beat 2, bend it up to E and hold through beats 3 and 4. Repeat in the next bar. Once the bent E is steady, ease the bend a little and bring it back to E a few times. Settle on E again.',
      ],
    },
    challenge: {
      title: 'Challenge',
      body: [
        'Aim for seven or eight correct answers in the listening round. Then check the bend on your guitar. Pick E at fret 9 on string 3, bend D up to match it, and hold for two beats.',
        'Listen for any drift while you hold. Add a small, even vibrato and let the pitch settle. Pick the fretted E again to check where you landed.',
      ],
    },
  },
  blocks: {
    pitch: {
      intro:
        'The first note gives you the target pitch. Focus on the held part of the bend at the end.',
      ask: 'Where did the bend land?',
      answers: { flat: 'Flat', inTune: 'On pitch', sharp: 'Sharp' },
      right: 'Yes. {answer} on the {detail} bend.',
      wrong:
        'You heard {answer} on the {detail} bend. The replay gives the target and a bend that matches it.',
    },
    bends: {
      intro:
        'Choose 4 → 5 and play the target followed by the bend. Watch the line rise to the dashed target. Try the other two full bends, then select the ♭3 curl and listen to the smaller rise. The quiz below gives you another way to compare the landing with its target.',
    },
    backing: {
      intro:
        'Use the highlighted bar to find A7 at the start of the chorus. Pause the backing and check the fretted E whenever you need a fresh reference.',
    },
    match: {
      intro:
        'Keep the target in your ear while the bend rises. Judge the pitch where the note holds.',
      ask: 'Where did the bend land?',
      answers: { flat: 'Flat', inTune: 'On pitch', sharp: 'Sharp' },
      right: 'Yes. {answer} on the {detail} bend.',
      wrong:
        'You heard {answer} on the {detail} bend. The replay gives the target and a bend that matches it.',
    },
  },
  check: [
    {
      question: 'Which fret gives the target for a whole-step bend from fret 7 on string 3?',
      options: ['Fret 8 on string 3', 'Fret 9 on string 3', 'Fret 7 on string 2'],
      why: 'The reference at fret 9 is two semitones higher on the same string.',
    },
    {
      question: 'The bend rises but settles below the reference E. Where did it land?',
      options: ['Flat', 'On pitch', 'Sharp'],
      why: 'Flat describes a pitch below the target.',
    },
    {
      question: 'What should you hear when your vibrato on the bent E settles?',
      options: ['The fretted D', 'A pitch above E', 'The same E you used as a reference'],
      why: 'Use small, even pitch movements, then return to the matched pitch.',
    },
  ],
  canDo: [
    'I can hear whether a bend lands below, on, or above its target.',
    'I can bend D to E on string 3, hold the pitch for two beats, then add a small vibrato and settle on E.',
  ],
};
