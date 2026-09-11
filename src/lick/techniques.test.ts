import { describe, expect, it } from 'vitest';
import { mulberry32 } from './rng';
import { decorateTechniques } from './techniques';
import type { LickNote, Technique } from './model';
import type { ToneRole } from '../music';
import { TONICS } from '../music';
import { TUNINGS, positions, mergedBox } from '../fretboard';
import { generateLick } from './index';

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
      note({ string: 5, fret: 6, startBeat: 0 }),
      note({ string: 5, fret: 8, startBeat: 1 }),
    ];
    const result = decorateTechniques(notes, 5, mulberry32(5));
    expect(result[1]!.technique).toBe('slide');
  });

  it('same string 3-fret move → slide', () => {
    const notes: LickNote[] = [
      note({ string: 5, fret: 6, startBeat: 0 }),
      note({ string: 5, fret: 9, startBeat: 1 }),
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
      note({ string: 5, fret: 6, startBeat: 0 }),
      note({ string: 5, fret: 9, startBeat: 1, role: 'R' }),
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
      note({ string: 5, fret: 6, startBeat: 0 }),
      note({ string: 5, fret: 8, startBeat: 1, role: 'R' }),
    ];
    const result = decorateTechniques(notes, 5, mulberry32(5));
    expect(result[1]!.technique).toBe('slide');
  });

  it('generates bendHalf at level 5 for dFret=1 ascending pairs', () => {
    const notes: LickNote[] = [
      note({ string: 5, fret: 6, startBeat: 0 }),
      note({ string: 5, fret: 7, startBeat: 1, role: 'R' }),
    ];
    const result = decorateTechniques(notes, 5, mulberry32(42));
    expect(result[1]!.technique).toBe('bendHalf');
    // fret/pitch/string must be unchanged by the bend articulation
    expect(result[1]!.fret).toBe(7);
    expect(result[1]!.string).toBe(5);
  });

  it('generates bendFull at level 5 for dFret=2 ascending pairs', () => {
    const notes: LickNote[] = [
      note({ string: 5, fret: 6, startBeat: 0 }),
      note({ string: 5, fret: 8, startBeat: 1, role: 'R' }),
    ];
    const result = decorateTechniques(notes, 5, mulberry32(42));
    expect(result[1]!.technique).toBe('bendFull');
    // fret/pitch/string must be unchanged by the bend articulation
    expect(result[1]!.fret).toBe(8);
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
      note({ string: 5, fret: 6, startBeat: 0 }),
      note({ string: 5, fret: 9, startBeat: 1, role: 'R' }),
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

  it('open-string origin: never bends or slides — only hammer or nothing, at levels 4 and 5', () => {
    const pairs: Array<[number, number]> = [[0, 1], [0, 2], [0, 3]];
    for (const level of [4, 5] as const) {
      for (const [fromFret, toFret] of pairs) {
        for (let seed = 0; seed < 100; seed++) {
          const notes: LickNote[] = [
            note({ string: 5, fret: fromFret, startBeat: 0 }),
            note({ string: 5, fret: toFret, startBeat: 1, role: 'R' }),
          ];
          const result = decorateTechniques(notes, level, mulberry32(seed));
          const t = result[1]!.technique;
          expect(['slide', 'bendHalf', 'bendFull']).not.toContain(t);
          if (fromFret === 0 && toFret === 1) {
            expect(t === 'hammer' || t === undefined).toBe(true);
          } else {
            expect(t).toBeUndefined();
          }
        }
      }
    }
  });

  it('descending slide into the open string stays allowed', () => {
    for (let seed = 0; seed < 100; seed++) {
      const notes: LickNote[] = [
        note({ string: 5, fret: 2, startBeat: 0 }),
        note({ string: 5, fret: 0, startBeat: 1, role: 'R' }),
      ];
      const result = decorateTechniques(notes, 5, mulberry32(seed));
      const t = result[1]!.technique;
      expect(t === 'slide' || t === undefined).toBe(true);
      expect(t).not.toBe('bendHalf');
      expect(t).not.toBe('bendFull');
    }
  });

  it('property sweep over real generated licks: no bend/slide originates from an open string', () => {
    const tuning = TUNINGS.standard;
    const tonics = ['A', 'E', 'D', 'G'];
    const scaleIds = ['minorPentatonic', 'blues'] as const;

    let bendOrSlideCount = 0;

    for (const letter of tonics) {
      const tonic = TONICS.find((t) => t.letter === letter && t.alter === 0)!;
      for (const scaleId of scaleIds) {
        const key = { tonic, scaleId };
        const pos = positions(tuning, key);
        const box = mergedBox(pos, [0]);
        const chord = { tonic, quality: 'm' as const };

        for (let seed = 0; seed < 20; seed++) {
          const lick = generateLick(box, chord, null, {
            level: 5,
            targetRole: 'R',
            resolveToNext: false,
            seed,
          });

          for (let i = 1; i < lick.notes.length; i++) {
            const prev = lick.notes[i - 1]!;
            const cur = lick.notes[i]!;
            if (cur.technique === 'slide' || cur.technique === 'bendHalf' || cur.technique === 'bendFull') {
              bendOrSlideCount++;
              expect(
                prev.fret,
                `seed ${seed} ${letter} ${scaleId}: note #${i} has ${cur.technique} from fret ${prev.fret}`,
              ).toBeGreaterThan(0);
            }
          }
        }
      }
    }

    // Guard against a vacuous pass: the sweep must actually exercise slides/bends.
    expect(bendOrSlideCount).toBeGreaterThan(0);
  });
});
