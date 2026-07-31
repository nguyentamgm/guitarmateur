import { describe, expect, it } from 'vitest';
import { TONICS, chordNotes, pc } from '../music';
import { TUNINGS, mergedBox, positions } from '../fretboard';
import { defaultState } from './appState';
import { licksForState } from './selectors';

// Default state: key = A minorPentatonic (TONICS[0] = A).
// A minorPentatonic scale PCs: 9,0,2,4,7 (A C D E G).
const G = TONICS.find((t) => t.letter === 'G' && t.alter === 0)!;
const A = TONICS.find((t) => t.letter === 'A' && t.alter === 0)!;

const gMajor = { tonic: G, quality: 'M' as const }; // G, B♮, D — G(7) and D(2) are in A minPent
const aMinor = { tonic: A, quality: 'm' as const }; // A, C, E — all three are in A minPent

describe('licksForState', () => {
  it('returns one EntryLick per progression entry, in order, entryIds match', () => {
    const state = defaultState(() => 1);
    const result = licksForState(state);
    expect(result).toHaveLength(state.progression.length);
    result.forEach((el, i) => {
      expect(el.entryId).toBe(state.progression[i]!.id);
    });
  });

  it('empty progression returns []', () => {
    const state = { ...defaultState(() => 2), progression: [] };
    expect(licksForState(state)).toEqual([]);
  });

  it('determinism: same state object called twice returns deep-equal results', () => {
    const state = defaultState(() => 3);
    const a = licksForState(state);
    const b = licksForState(state);
    expect(a).toEqual(b);
  });

  it('memoization: identical slice values => same array reference; different level => different reference and content', () => {
    const base = defaultState(() => 4);
    // Two distinct state objects with the same JSON slice: same inputKey => same cached reference.
    const stateA = {
      ...base,
      progression: [{ id: 'memo-1', chord: gMajor, lickSeed: 77, bars: 1 as const }],
      level: 2 as const,
    };
    const stateB = {
      ...base,
      progression: [{ id: 'memo-1', chord: gMajor, lickSeed: 77, bars: 1 as const }],
      level: 2 as const,
    };

    const resultA = licksForState(stateA);
    const resultB = licksForState(stateB);
    expect(resultB).toBe(resultA);

    // Different level => cache miss => new reference and different lick content.
    const stateC = { ...stateA, level: 3 as const };
    const resultC = licksForState(stateC);
    expect(resultC).not.toBe(resultA);
    expect(resultC).not.toEqual(resultA);
  });

  it('resolveToNext: entry 0 last note is a PC of the next chord; resolveToNext:false => own chord', () => {
    const base = defaultState(() => 5);
    const e0 = { id: 'rtn-0', chord: gMajor, lickSeed: 11, bars: 1 as const };
    const e1 = { id: 'rtn-1', chord: aMinor, lickSeed: 22, bars: 1 as const };

    // resolveToNext: true — entry 0 targets entry 1's chord (aMinor)
    const stateOn = {
      ...base,
      progression: [e0, e1],
      resolveToNext: true,
      targetRole: 'R' as const,
    };
    const resultOn = licksForState(stateOn);
    const notesOn = resultOn[0]!.lick.notes;
    const lastPcOn = pc(notesOn[notesOn.length - 1]!.pitch);
    const aMinorPcs = chordNotes(aMinor).map(pc);
    expect(aMinorPcs).toContain(lastPcOn);

    // resolveToNext: false — entry 0 targets its own chord (gMajor)
    const stateOff = { ...stateOn, resolveToNext: false };
    const resultOff = licksForState(stateOff);
    const notesOff = resultOff[0]!.lick.notes;
    const lastPcOff = pc(notesOff[notesOff.length - 1]!.pitch);
    const gMajorPcs = chordNotes(gMajor).map(pc);
    expect(gMajorPcs).toContain(lastPcOff);
  });

  it('bars: 2 entry => lick.lengthBeats === 8; bars: 1 entry => lick.lengthBeats === 4', () => {
    const base = defaultState(() => 6);
    const state = {
      ...base,
      progression: [
        { id: 'bars-2', chord: gMajor, lickSeed: 33, bars: 2 as const },
        { id: 'bars-1', chord: aMinor, lickSeed: 44, bars: 1 as const },
      ],
    };
    const result = licksForState(state);
    expect(result[0]!.lick.lengthBeats).toBe(8);
    expect(result[1]!.lick.lengthBeats).toBe(4);
  });

  it('all lick notes have string/fret pairs that exist in the merged box', () => {
    const state = defaultState(() => 7);
    const pos = positions(TUNINGS[state.tuningId], state.key);
    const box = mergedBox(pos, state.positions);
    const validCells = new Set(box.notes.map((n) => `${n.string}:${n.fret}`));

    const result = licksForState(state);
    for (const { lick } of result) {
      for (const note of lick.notes) {
        expect(validCells.has(`${note.string}:${note.fret}`)).toBe(true);
      }
    }
  });
});
