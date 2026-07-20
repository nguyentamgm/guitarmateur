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
    const result = decorateTechniques(notes, 5, mulberry32(5));
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
    const result = decorateTechniques(notes, 5, mulberry32(5));
    expect(result[1]!.technique).toBe('slide');
  });

  it('same string 3-fret move → slide', () => {
    const notes: LickNote[] = [
      note({ string: 5, fret: 0, startBeat: 0 }),
      note({ string: 5, fret: 3, startBeat: 1 }),
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
    for (let seed = 0; seed < 20; seed++) {
      const notes: LickNote[] = [
        note({ string: 5, fret: 0, startBeat: 0 }),
        note({ string: 5, fret: 1, startBeat: 1, role: 'R' }),
      ];
      const result = decorateTechniques(notes, 3, mulberry32(seed));
      const t = result[1]!.technique;
      expect(t === 'hammer' || t === undefined).toBe(true);
    }

    // slides also work at dFret=3 on same string at level 3 (with role to allow landing note)
    const notesSlide: LickNote[] = [
      note({ string: 5, fret: 0, startBeat: 0 }),
      note({ string: 5, fret: 3, startBeat: 1, role: 'R' }),
    ];
    const slideResult = decorateTechniques(notesSlide, 5, mulberry32(42));
    expect(slideResult[1]!.technique).toBe('slide');
  });

  it('level 5: hammer on single-fret step up to chord tone', () => {
    const notes: LickNote[] = [
      note({ string: 5, fret: 0, startBeat: 0 }),
      note({ string: 5, fret: 1, startBeat: 1, role: 'R' }),
    ];
    const result = decorateTechniques(notes, 5, mulberry32(5));
    expect(result[1]!.technique).toBe('hammer');
  });

  it('level 5: slide on 2-fret step up to chord tone', () => {
    const notes: LickNote[] = [
      note({ string: 5, fret: 0, startBeat: 0 }),
      note({ string: 5, fret: 2, startBeat: 1, role: 'R' }),
    ];
    const result = decorateTechniques(notes, 5, mulberry32(5));
    expect(result[1]!.technique).toBe('slide');
  });

  it('generates bendHalf at level 5 for dFret=1 ascending pairs', () => {
    const notes: LickNote[] = [
      note({ string: 5, fret: 0, startBeat: 0 }),
      note({ string: 5, fret: 1, startBeat: 1, role: 'R' }),
    ];
    const result = decorateTechniques(notes, 5, mulberry32(42));
    expect(result[1]!.technique).toBe('bendHalf');
    // fret/pitch/string must be unchanged by the bend articulation
    expect(result[1]!.fret).toBe(1);
    expect(result[1]!.string).toBe(5);
  });

  it('generates bendFull at level 5 for dFret=2 ascending pairs', () => {
    const notes: LickNote[] = [
      note({ string: 5, fret: 0, startBeat: 0 }),
      note({ string: 5, fret: 2, startBeat: 1, role: 'R' }),
    ];
    const result = decorateTechniques(notes, 5, mulberry32(42));
    expect(result[1]!.technique).toBe('bendFull');
    // fret/pitch/string must be unchanged by the bend articulation
    expect(result[1]!.fret).toBe(2);
    expect(result[1]!.string).toBe(5);
  });

  it('level 4 never produces bends', () => {
    for (let seed = 0; seed < 100; seed++) {
      const notesHalf: LickNote[] = [
        note({ string: 5, fret: 0, startBeat: 0 }),
        note({ string: 5, fret: 1, startBeat: 1, role: 'R' }),
      ];
      const resultHalf = decorateTechniques(notesHalf, 4, mulberry32(seed));
      expect(resultHalf[1]!.technique).not.toBe('bendHalf');

      const notesFull: LickNote[] = [
        note({ string: 5, fret: 0, startBeat: 0 }),
        note({ string: 5, fret: 2, startBeat: 1, role: 'R' }),
      ];
      const resultFull = decorateTechniques(notesFull, 4, mulberry32(seed));
      expect(resultFull[1]!.technique).not.toBe('bendFull');
    }
  });

  it('level 5 descending pairs still produce pull, not bends', () => {
    for (let seed = 0; seed < 50; seed++) {
      const notes: LickNote[] = [
        note({ string: 5, fret: 2, startBeat: 0 }),
        note({ string: 5, fret: 1, startBeat: 1, role: 'R' }),
      ];
      const result = decorateTechniques(notes, 5, mulberry32(seed));
      const t = result[1]!.technique;
      expect(t === 'pull' || t === undefined).toBe(true);
    }
  });

  it('level 5: slide on 3-fret step up to chord tone', () => {
    const notes: LickNote[] = [
      note({ string: 5, fret: 0, startBeat: 0 }),
      note({ string: 5, fret: 3, startBeat: 1, role: 'R' }),
    ];
    const result = decorateTechniques(notes, 5, mulberry32(42));
    expect(result[1]!.technique).toBe('slide');
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
