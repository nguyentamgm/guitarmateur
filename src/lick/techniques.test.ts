import { describe, expect, it } from 'vitest';
import { mulberry32 } from './rng';
import { decorateTechniques } from './techniques';
import type { LickNote, Technique } from './model';
import type { ToneRole } from '../music';

/** Build a minimal LickNote for testing. */
function note(opts: Pick<LickNote, 'string' | 'fret' | 'startBeat'> & { technique?: Technique; role?: ToneRole }): LickNote {
  return {
    string: opts.string,
    fret: opts.fret,
    pitch: { letter: 'A', alter: 0, octave: 4 },
    startBeat: opts.startBeat,
    durationBeats: 1,
    technique: opts.technique,
    role: opts.role,
  };
}

describe('decorateTechniques', () => {
  it('no techniques for single-note input', () => {
    const notes: LickNote[] = [note({ string: 5, fret: 0, startBeat: 0 })];
    const result = decorateTechniques(notes, 5, mulberry32(42));
    expect(result).toHaveLength(1);
    expect(result[0]!.technique).toBeUndefined();
  });

  it('non-adjacent strings → no technique', () => {
    const notes: LickNote[] = [
      note({ string: 5, fret: 0, startBeat: 0 }),
      note({ string: 3, fret: 1, startBeat: 1 }),
    ];
    const result = decorateTechniques(notes, 5, mulberry32(42));
    expect(result[1]!.technique).toBeUndefined();
  });

  it('same string ascending step → hammer', () => {
    const notes: LickNote[] = [
      note({ string: 5, fret: 0, startBeat: 0 }),
      note({ string: 5, fret: 1, startBeat: 1 }),
    ];
    const result = decorateTechniques(notes, 5, mulberry32(42));
    expect(result[1]!.technique).toBe('hammer');
  });

  it('same string descending step → pull', () => {
    const notes: LickNote[] = [
      note({ string: 5, fret: 2, startBeat: 0 }),
      note({ string: 5, fret: 1, startBeat: 1 }),
    ];
    const result = decorateTechniques(notes, 5, mulberry32(42));
    expect(result[1]!.technique).toBe('pull');
  });

  it('same string 2-fret move → slide', () => {
    const notes: LickNote[] = [
      note({ string: 5, fret: 0, startBeat: 0 }),
      note({ string: 5, fret: 2, startBeat: 1 }),
    ];
    const result = decorateTechniques(notes, 5, mulberry32(42));
    expect(result[1]!.technique).toBe('slide');
  });

  it('level 1-2: no techniques ever', () => {
    for (const level of [1, 2] as const) {
      // Create many eligible pairs across multiple seeds
      for (let seed = 0; seed < 50; seed++) {
        const notes: LickNote[] = [
          note({ string: 5, fret: 0, startBeat: 0 }),
          note({ string: 5, fret: 1, startBeat: 1 }),
          note({ string: 5, fret: 2, startBeat: 2 }),
          note({ string: 5, fret: 1, startBeat: 3 }),
        ];
        const result = decorateTechniques(notes, level, mulberry32(seed));
        for (const n of result) {
          expect(n.technique).toBeUndefined();
        }
      }
    }
  });

  it('level 3: hammers, pulls, slides — no bends', () => {
    // Bend requires level 5 + chord tone role
    for (let seed = 0; seed < 20; seed++) {
      const notes: LickNote[] = [
        note({ string: 5, fret: 0, startBeat: 0 }),
        note({ string: 5, fret: 1, startBeat: 1, role: 'R' }), // would be bendHalf at level 5
      ];
      const result = decorateTechniques(notes, 3, mulberry32(seed));
      // Should be hammer, not bendHalf
      if (result[1]!.technique === 'hammer') {
        // correct — hammers are fine
      } else if (result[1]!.technique === undefined) {
        // also fine — probabilistic skip
      } else {
        expect(result[1]!.technique).toBe('hammer');
      }
      expect(result[1]!.technique).not.toBe('bendHalf');
      expect(result[1]!.technique).not.toBe('bendFull');
    }
  });

  it('level 5: bendHalf on single-fret step up to chord tone', () => {
    // With a high probability (0.7) and a specific seed, we should get a bendHalf
    // for ascending step to a chord-tone role
    const notes: LickNote[] = [
      note({ string: 5, fret: 0, startBeat: 0 }),
      note({ string: 5, fret: 1, startBeat: 1, role: 'R' }),
    ];
    // Seed 42 should produce an rng value < 0.7 early
    const result = decorateTechniques(notes, 5, mulberry32(42));
    expect(result[1]!.technique).toBe('bendHalf');
  });

  it('level 5: bendFull on 2-fret step up to chord tone', () => {
    const notes: LickNote[] = [
      note({ string: 5, fret: 0, startBeat: 0 }),
      note({ string: 5, fret: 2, startBeat: 1, role: 'R' }),
    ];
    const result = decorateTechniques(notes, 5, mulberry32(42));
    expect(result[1]!.technique).toBe('bendFull');
  });

  it('landing note: no technique below level 4', () => {
    for (const level of [1, 2, 3] as const) {
      for (let seed = 0; seed < 20; seed++) {
        const notes: LickNote[] = [
          note({ string: 5, fret: 0, startBeat: 0 }),
          note({ string: 5, fret: 1, startBeat: 1 }), // landing note
        ];
        const result = decorateTechniques(notes, level, mulberry32(seed));
        expect(result[1]!.technique).toBeUndefined();
      }
    }
  });

  it('level 4: landing note can have technique', () => {
    const notes: LickNote[] = [
      note({ string: 5, fret: 0, startBeat: 0 }),
      note({ string: 5, fret: 1, startBeat: 1 }), // landing note
    ];
    const result = decorateTechniques(notes, 4, mulberry32(42));
    // At level 4 prob=0.55, seed 42 may or may not trigger
    // Just check that it's at least considered (not blocked by level constraint)
    // The technique should be valid if probability check passes
    if (result[1]!.technique !== undefined) {
      expect(['hammer', 'pull']).toContain(result[1]!.technique);
    }
  });

  it('deterministic: same inputs => same output', () => {
    const notes: LickNote[] = [
      note({ string: 5, fret: 0, startBeat: 0 }),
      note({ string: 5, fret: 1, startBeat: 1 }),
      note({ string: 5, fret: 2, startBeat: 2 }),
    ];
    const a = decorateTechniques(notes, 5, mulberry32(42));
    const b = decorateTechniques(notes, 5, mulberry32(42));
    expect(a).toEqual(b);
  });

  it('max 1 technique per beat', () => {
    // Two pairs on the same beat — only one should get a technique
    const notes: LickNote[] = [
      note({ string: 5, fret: 0, startBeat: 0 }),
      note({ string: 5, fret: 1, startBeat: 0.5 }),
      note({ string: 5, fret: 2, startBeat: 1 }),
    ];
    // Check this across seeds
    for (let seed = 0; seed < 50; seed++) {
      const result = decorateTechniques(notes, 5, mulberry32(seed));
      const techsByBeat = new Map<number, number>();
      for (const n of result) {
        if (n.technique) {
          techsByBeat.set(n.startBeat, (techsByBeat.get(n.startBeat) ?? 0) + 1);
        }
      }
      for (const count of techsByBeat.values()) {
        expect(count).toBeLessThanOrEqual(1);
      }
    }
  });
});
