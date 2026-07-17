import { describe, expect, it } from 'vitest';
import { TONICS } from '../music';
import { defaultState } from './appState';
import { encodeState, decodeState } from './share';

const G = TONICS.find((t) => t.letter === 'G' && t.alter === 0)!;

describe('share: encode/decode', () => {
  it('round-trips the default state', () => {
    const state = defaultState(() => 42);
    const encoded = encodeState(state);
    const decoded = decodeState(encoded);

    expect(decoded).not.toBeNull();
    expect(decoded!.schemaVersion).toBe(3);
    expect(decoded!.key.tonic).toEqual(state.key.tonic);
    expect(decoded!.key.scaleId).toBe(state.key.scaleId);
    expect(decoded!.tuningId).toBe(state.tuningId);
    expect(decoded!.positions).toEqual(state.positions);
    expect(decoded!.level).toBe(state.level);
    expect(decoded!.targetRole).toBe(state.targetRole);
    expect(decoded!.resolveToNext).toBe(state.resolveToNext);
    expect(decoded!.tempoBpm).toBe(state.tempoBpm);
    expect(decoded!.progression.length).toBe(state.progression.length);
  });

  it('round-trips a modified state (different key and chords)', () => {
    const state = defaultState(() => 99);
    const modified = {
      ...state,
      key: { tonic: G, scaleId: 'majorPentatonic' as const },
      level: 4 as const,
      targetRole: '3' as const,
      resolveToNext: true,
      tempoBpm: 120,
      progression: [
        { id: 'abc', chord: { tonic: G, quality: 'M' as const }, lickSeed: 77, bars: 2 as const },
      ],
    };

    const encoded = encodeState(modified);
    const decoded = decodeState(encoded);

    expect(decoded).not.toBeNull();
    expect(decoded!.key.tonic).toEqual(G);
    expect(decoded!.key.scaleId).toBe('majorPentatonic');
    expect(decoded!.level).toBe(4);
    expect(decoded!.targetRole).toBe('3');
    expect(decoded!.resolveToNext).toBe(true);
    expect(decoded!.tempoBpm).toBe(120);
    expect(decoded!.progression.length).toBe(1);
    expect(decoded!.progression[0]!.chord.tonic).toEqual(G);
    expect(decoded!.progression[0]!.lickSeed).toBe(77);
    expect(decoded!.progression[0]!.bars).toBe(2);
  });

  it('returns null for an empty string', () => {
    expect(decodeState('')).toBeNull();
  });

  it('returns null for bad base64', () => {
    expect(decodeState('v1:!!!not-base64!!!')).toBeNull();
  });

  it('returns null when version prefix is missing', () => {
    expect(decodeState('v2:somepayload')).toBeNull();
    expect(decodeState('somepayload')).toBeNull();
  });

  it('returns null for garbage input', () => {
    expect(decodeState('v1:' + btoa('not-json-at-all'))).toBeNull();
  });
});
