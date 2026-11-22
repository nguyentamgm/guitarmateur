import { describe, expect, it } from 'vitest';
import { chordNotes, pc, type Chord } from '../../core/music';
import { midiAt } from '../../core/fretboard';
import { chordShape, shapeMidis } from '../voicing';
import { sameChord, type SameChordQuestion } from './sameChord';

const pcs = (midis: readonly number[]) => new Set(midis.map((m) => m % 12));
const chordPcs = (c: Chord) => new Set(chordNotes(c).map(pc));

describe('sameChord drill', () => {
  // The first random value picks the answer: below 0.5 "same", else "different".
  it.each([
    ['same', 0.1],
    ['different', 0.9],
  ] as const)('%s: an open chord, then a fretted barre whose notes match the answer', (answer, r) => {
    const q = sameChord.next(() => r) as SameChordQuestion;
    expect(q.answer).toBe(answer);
    const [open, barre] = q.sound.events;
    expect(open!.midis).toEqual(shapeMidis(chordShape(q.firstChord!)));
    expect(barre!.midis).toEqual(q.barre!.notes.map(midiAt));
    expect(pcs(open!.midis!)).toEqual(chordPcs(q.firstChord!));
    expect(pcs(barre!.midis!)).toEqual(chordPcs(q.secondChord!));
    if (answer === 'same') expect(q.secondChord).toEqual(q.firstChord);
    else {
      // Another chord of the same quality: the ear has to hear the root move, not major vs minor.
      expect(q.secondChord!.id).toBe(q.firstChord!.id);
      expect(pcs(barre!.midis!)).not.toEqual(pcs(open!.midis!));
    }
    // The barre's bass is fretted: no open string under the hand.
    expect(q.barre!.notes[0]!.fret).toBeGreaterThan(0);
    // Compare: the two as asked, then the second chord open, in that order.
    expect(q.compare!.events.map((e) => e.midis)).toEqual([open!.midis, barre!.midis, shapeMidis(chordShape(q.secondChord!))]);
    expect(q.compare!.events.map((e) => e.at)).toEqual([0, 3, 6]);
  });

  it('breaks a run of two even when random always picks the same', () => {
    const first = sameChord.next(() => 0.1);
    const second = sameChord.next(() => 0.1, first);
    expect(sameChord.next(() => 0.1, second).answer).not.toBe(second.answer);
  });
});
