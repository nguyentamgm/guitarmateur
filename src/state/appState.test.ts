import { describe, expect, it } from 'vitest';
import { TONICS } from '../music';
import { defaultState, reducer, type AppState } from './appState';

/** Deterministic nextSeed for tests so assertions are repeatable. */
let testSeedCounter = 0;
const testNextSeed = (): number => ++testSeedCounter;

function fresh(): AppState {
  testSeedCounter = 0;
  return defaultState(testNextSeed);
}

const G = TONICS.find((t) => t.letter === 'G' && t.alter === 0)!;

const gMajor = { tonic: G, quality: 'M' as const };

describe('reducer', () => {
  it('setKey changes tonic and resets progression/positions', () => {
    const s = fresh();
    const next = reducer(s, { type: 'setKey', tonic: G }, testNextSeed);
    expect(next.key.tonic).toBe(G);
    // Progression should be replaced (fresh seeds = fresh ids)
    expect(next.progression).not.toEqual(s.progression);
    // Should not be empty — defaults have a progression
    expect(next.progression.length).toBeGreaterThan(0);
  });

  it('setScale changes scale and resets progression/positions', () => {
    const s = fresh();
    const next = reducer(s, { type: 'setScale', scaleId: 'blues' }, testNextSeed);
    expect(next.key.scaleId).toBe('blues');
    expect(next.progression).not.toEqual(s.progression);
  });

  it('setTempo clamps to the 40–200 BPM range', () => {
    const s = fresh();
    expect(reducer(s, { type: 'setTempo', bpm: 128 }, testNextSeed).tempoBpm).toBe(128);
    expect(reducer(s, { type: 'setTempo', bpm: 5 }, testNextSeed).tempoBpm).toBe(40);
    expect(reducer(s, { type: 'setTempo', bpm: 9000 }, testNextSeed).tempoBpm).toBe(200);
  });

  it('setBars toggles a single entry between 1 and 2 without touching others', () => {
    const s = fresh();
    const id = s.progression[0]!.id;
    const two = reducer(s, { type: 'setBars', id, bars: 2 }, testNextSeed);
    expect(two.progression[0]!.bars).toBe(2);
    expect(two.progression[0]!.lickSeed).toBe(s.progression[0]!.lickSeed); // seed preserved
    expect(two.progression.slice(1)).toEqual(s.progression.slice(1));
  });

  it('new chords default to 1 bar', () => {
    const s = fresh();
    const next = reducer(s, { type: 'addChord', chord: gMajor }, testNextSeed);
    expect(next.progression[next.progression.length - 1]!.bars).toBe(1);
  });

  it('togglePosition: min 1 selected (cannot deselect the last)', () => {
    const s = fresh();
    const only = s.positions[0]!;
    const next = reducer(s, { type: 'togglePosition', index: only }, testNextSeed);
    expect(next.positions).toContain(only);
    expect(next.positions.length).toBe(1);
  });

  it('togglePosition: adjacent combine (max 2)', () => {
    const s = fresh();
    // Force positions to [0] so we can add an adjacent one
    const first = s.positions[0]!;
    const adj = first === 0 ? 1 : first - 1;
    const next = reducer(s, { type: 'togglePosition', index: adj }, testNextSeed);
    expect(next.positions.length).toBe(2);
    expect(next.positions).toContain(first);
    expect(next.positions).toContain(adj);
  });

  it('setLevel updates level', () => {
    const s = fresh();
    const next = reducer(s, { type: 'setLevel', level: 3 }, testNextSeed);
    expect(next.level).toBe(3);
  });

  it('setTargetRole updates role', () => {
    const s = fresh();
    const next = reducer(s, { type: 'setTargetRole', role: '3' }, testNextSeed);
    expect(next.targetRole).toBe('3');
  });

  it('addChord appends an entry', () => {
    const s = fresh();
    const before = s.progression.length;
    const next = reducer(s, { type: 'addChord', chord: gMajor }, testNextSeed);
    expect(next.progression.length).toBe(before + 1);
    const last = next.progression[next.progression.length - 1]!;
    expect(last.chord.tonic).toBe(G);
  });

  it('removeChord removes by id', () => {
    const s = fresh();
    const id = s.progression[0]!.id;
    const next = reducer(s, { type: 'removeChord', id }, testNextSeed);
    expect(next.progression.find((e) => e.id === id)).toBeUndefined();
    expect(next.progression.length).toBe(s.progression.length - 1);
  });

  it('clearProgression empties the progression', () => {
    const s = fresh();
    const next = reducer(s, { type: 'clearProgression' }, testNextSeed);
    expect(next.progression).toEqual([]);
  });

  it('resetProgression restores default length', () => {
    const s = fresh();
    const cleared = reducer(s, { type: 'clearProgression' }, testNextSeed);
    expect(cleared.progression.length).toBe(0);
    const reset = reducer(cleared, { type: 'resetProgression' }, testNextSeed);
    expect(reset.progression.length).toBeGreaterThan(0);
  });

  it('reorderChord moves an entry to the target index', () => {
    const s = fresh();
    const first = s.progression[0]!;
    const second = s.progression[1]!;
    // Swap first and second
    const next = reducer(s, { type: 'reorderChord', fromId: first.id, toIndex: 1 }, testNextSeed);
    expect(next.progression[0]!.id).toBe(second.id);
    expect(next.progression[1]!.id).toBe(first.id);
  });

  it('rerollLick changes only the target seed', () => {
    const s = fresh();
    const firstSeed = s.progression[0]!.lickSeed;
    const secondSeed = s.progression[1]!.lickSeed;
    const next = reducer(s, { type: 'rerollLick', id: s.progression[0]!.id }, testNextSeed);
    expect(next.progression[0]!.lickSeed).not.toBe(firstSeed);
    expect(next.progression[1]!.lickSeed).toBe(secondSeed);
  });

  it('rerollAll changes all seeds', () => {
    const s = fresh();
    const seeds = s.progression.map((e) => e.lickSeed);
    const next = reducer(s, { type: 'rerollAll' }, testNextSeed);
    next.progression.forEach((e, i) => {
    expect(e.lickSeed).not.toBe(seeds[i]);
    });
  });

  it('toggleAdvanced flips ui.advancedOpen', () => {
    const s = fresh();
    expect(s.ui.advancedOpen).toBe(false);
    const next = reducer(s, { type: 'toggleAdvanced' }, testNextSeed);
    expect(next.ui.advancedOpen).toBe(true);
  });

  it('setAdvRoot updates advRoot', () => {
    const s = fresh();
    const next = reducer(s, { type: 'setAdvRoot', tonic: G }, testNextSeed);
    expect(next.ui.advRoot).toBe(G);
  });

  it('setAdvQuality updates advQuality', () => {
    const s = fresh();
    const next = reducer(s, { type: 'setAdvQuality', quality: 'm' }, testNextSeed);
    expect(next.ui.advQuality).toBe('m');
  });
});
