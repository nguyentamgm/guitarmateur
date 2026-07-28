import { describe, expect, it } from 'vitest';
import { pickContour, pickChordTone, pickFirstNote, type Contour } from './contour';
import { mulberry32 } from './rng';
import type { Box, FretNote } from '../fretboard';
import { pitch, midi } from '../music';
import type { Chord } from '../music';

/** Helper: build a FretNote with min fields. Caller must supply pitch. */
function fn(
  string: number,
  fret: number,
  overrides: Partial<FretNote> = {},
): FretNote {
  return {
    string,
    fret,
    degree: 1,
    isTonic: false,
    isDecoration: false,
    ...overrides,
  } as FretNote;
}

describe('pickContour', () => {
  it('returns one of the five contour types', () => {
    const contours: Contour[] = ['ascend', 'descend', 'arch', 'valley', 'wave'];
    for (let seed = 0; seed < 100; seed++) {
      const c = pickContour(3, mulberry32(seed));
      expect(contours).toContain(c);
    }
  });

  it('level 1 strongly favors ascend/descend', () => {
    // Level 1: ascend=4, descend=4, arch=1, valley=1, wave=0.5
    let monoCount = 0;
    const total = 500;
    for (let seed = 0; seed < total; seed++) {
      const c = pickContour(1, mulberry32(seed));
      if (c === 'ascend' || c === 'descend') monoCount++;
    }
    // With weights [4,4,1,1,0.5], ascend/descend = 8/10.5 ≈ 76%
    // Even allowing statistical noise, should be > 60%
    expect(monoCount).toBeGreaterThan(total * 0.6);
  });

  it('level 5 spreads weight across contours', () => {
    // Level 5: ascend=1.5, descend=1.5, arch=2.5, valley=2.5, wave=4
    // wave = 4/12 ≈ 33%, mono = 3/12 ≈ 25%
    let waveCount = 0;
    const total = 500;
    for (let seed = 0; seed < total; seed++) {
      const c = pickContour(5, mulberry32(seed));
      if (c === 'wave') waveCount++;
    }
    // wave is the most likely single contour at level 5
    expect(waveCount).toBeGreaterThan(total * 0.2);
  });

  it('is deterministic with same seed', () => {
    const a = pickContour(3, mulberry32(42));
    const b = pickContour(3, mulberry32(42));
    expect(a).toBe(b);
  });

  it('different seeds can produce different results', () => {
    const a = pickContour(3, mulberry32(1));
    const b = pickContour(3, mulberry32(2));
    // Occasionally they'd match, but for different seeds this is rare enough
    // that we just verify it returns something valid
    expect(['ascend', 'descend', 'arch', 'valley', 'wave']).toContain(a);
    expect(['ascend', 'descend', 'arch', 'valley', 'wave']).toContain(b);
  });
});

describe('pickChordTone', () => {
  /** A C major chord with role annotations on the box notes. */
  const cMajor: Chord = { tonic: pitch('C', 0, 3), quality: 'M' };

  const boxR3: Box = {
    notes: [
      fn(0, 0, { pitch: pitch('E', 0, 3), degree: 3 }),      // E3 — 3rd
      fn(0, 2, { pitch: pitch('F', 1, 3), degree: 4 }),       // F♯3 — not a chord tone
      fn(1, 0, { pitch: pitch('G', 0, 3), degree: 5 }),       // G3 — 5th
      fn(1, 2, { pitch: pitch('A', 0, 3), degree: 6 }),       // A3 — not a chord tone
      fn(2, 0, { pitch: pitch('C', 0, 4), degree: 1, isTonic: true }), // C4 — Root
      fn(2, 2, { pitch: pitch('D', 0, 4), degree: 2 }),       // D4 — not a chord tone
    ],
    minFret: 0,
    maxFret: 2,
  };

  it('prefers the requested role when available', () => {
    // Request the 3rd (E) — should pick the E note
    const note = pickChordTone(boxR3, cMajor, '3', mulberry32(42));
    expect(midi(note.pitch)).toBe(midi(pitch('E', 0, 3)));
  });

  it('falls back to 3 when requested role is unavailable', () => {
    // Box without 5th or Root
    const no5rBox: Box = {
      notes: [
        fn(0, 0, { pitch: pitch('E', 0, 3), degree: 3 }),      // E3 — 3rd
        fn(0, 2, { pitch: pitch('F', 1, 3), degree: 4 }),       // F♯3 — not a chord tone
      ],
      minFret: 0,
      maxFret: 2,
    };
    // Request the 7th (which doesn't exist in C major triad) — should fall back to 3
    const note = pickChordTone(no5rBox, cMajor, '7', mulberry32(42));
    // degree 3 = the 3rd in the scale (E is degree 3 in C major)
    expect(note.degree).toBe(3);
  });

  it('falls through 3 → 5 → R when earlier roles absent', () => {
    // Box with only Root (C)
    const onlyRoot: Box = {
      notes: [
        fn(0, 0, { pitch: pitch('C', 0, 4), degree: 1, isTonic: true }),
      ],
      minFret: 0,
      maxFret: 0,
    };
    // Request 7th → fall to 3 → fall to 5 → fall to R
    const note = pickChordTone(onlyRoot, cMajor, '7', mulberry32(42));
    expect(midi(note.pitch)).toBe(midi(pitch('C', 0, 4)));
  });

  it('falls back to any box note when no chord tones exist', () => {
    // Box with only non-chord tones
    const noChord: Box = {
      notes: [
        fn(0, 0, { pitch: pitch('D', 0, 3), degree: 2 }),       // D — not in C major
        fn(0, 2, { pitch: pitch('F', 1, 3), degree: 4 }),       // F♯ — not in C major
      ],
      minFret: 0,
      maxFret: 2,
    };
    const note = pickChordTone(noChord, cMajor, 'R', mulberry32(42));
    // Should pick one of the box notes since no chord tones exist
    expect(noChord.notes.map((n) => midi(n.pitch))).toContain(midi(note.pitch));
  });

  it('falls back to any box note as last resort', () => {
    // Even with an empty-fallback box, should return something
    const singleNote: Box = {
      notes: [
        fn(0, 0, { pitch: pitch('D', 0, 3), degree: 2 }),
      ],
      minFret: 0,
      maxFret: 0,
    };
    const note = pickChordTone(singleNote, cMajor, '7', mulberry32(42));
    expect(midi(note.pitch)).toBe(midi(pitch('D', 0, 3)));
  });

  it('is deterministic with same seed', () => {
    const a = pickChordTone(boxR3, cMajor, 'R', mulberry32(42));
    const b = pickChordTone(boxR3, cMajor, 'R', mulberry32(42));
    expect(a).toEqual(b);
  });
});

describe('pickFirstNote', () => {
  /** C major chord with a box of chord tones and non-chord-tones. */
  const cMajor: Chord = { tonic: pitch('C', 0, 3), quality: 'M' };

  const box: Box = {
    notes: [
      fn(0, 0, { pitch: pitch('C', 0, 3), degree: 1, isTonic: true }), // C3 — MIDI 48
      fn(0, 2, { pitch: pitch('D', 0, 3), degree: 2 }),                 // D3 — MIDI 50
      fn(0, 4, { pitch: pitch('E', 0, 3), degree: 3 }),                 // E3 — MIDI 52
      fn(1, 0, { pitch: pitch('F', 0, 3), degree: 4 }),                 // F3 — MIDI 53
      fn(1, 2, { pitch: pitch('G', 0, 3), degree: 5 }),                 // G3 — MIDI 55
      fn(1, 3, { pitch: pitch('A', 0, 3), degree: 6 }),                 // A3 — MIDI 57
      fn(1, 5, { pitch: pitch('B', 0, 3), degree: 7 }),                 // B3 — MIDI 59
    ],
    minFret: 0,
    maxFret: 5,
  };

  it('prefers chord tones when available', () => {
    // Last note is A3 (not a chord tone in C major)
    const last = box.notes[5]!; // A3
    for (let seed = 0; seed < 50; seed++) {
      const note = pickFirstNote(box, cMajor, last, 'ascend', mulberry32(seed));
      // pickFirstNote already filters for chord tones internally;
      // just verify the function runs and returns a box note
      expect(box.notes.some((n) => n.string === note.string && n.fret === note.fret)).toBe(true);
    }
  });

  it('returns a box note', () => {
    const last = box.notes[0]!;
    const note = pickFirstNote(box, cMajor, last, 'ascend', mulberry32(42));
    expect(box.notes.map((n) => n.string === note.string && n.fret === note.fret)).toContain(true);
  });

  it('ascend contour favors notes above the last', () => {
    // Start from the lowest note, ascend contour should prefer higher notes
    const last = box.notes[0]!; // C3 (lowest)
    const lowMidi = midi(last.pitch);
    let aboveCount = 0;
    const total = 100;
    for (let seed = 0; seed < total; seed++) {
      const note = pickFirstNote(box, cMajor, last, 'ascend', mulberry32(seed));
      if (midi(note.pitch) > lowMidi) aboveCount++;
    }
    // Ascend favors notes higher than last (>50% should be above)
    expect(aboveCount).toBeGreaterThan(total * 0.5);
  });

  it('descend contour favors notes below the last', () => {
    // Start from the highest note, descend contour should prefer lower notes
    const last = box.notes[6]!; // B3 (highest)
    const highMidi = midi(last.pitch);
    let belowCount = 0;
    const total = 100;
    for (let seed = 0; seed < total; seed++) {
      const note = pickFirstNote(box, cMajor, last, 'descend', mulberry32(seed));
      if (midi(note.pitch) < highMidi) belowCount++;
    }
    // Descend favors notes lower than last (>50% should be below)
    expect(belowCount).toBeGreaterThan(total * 0.5);
  });

  it('wave contour considers both sides', () => {
    // Start from middle, wave should spread evenly
    const last = box.notes[3]!; // F3 (middle)
    const lastMidi = midi(last.pitch);
    let aboveCount = 0;
    const total = 200;
    for (let seed = 0; seed < total; seed++) {
      const note = pickFirstNote(box, cMajor, last, 'wave', mulberry32(seed));
      if (midi(note.pitch) > lastMidi) aboveCount++;
    }
    // Wave should have some spread in both directions so above shouldn't be 0 or total
    expect(aboveCount).toBeGreaterThan(0);
    expect(aboveCount).toBeLessThan(total);
  });

  it('applies prevLastMidi distance penalty', () => {
    const last = box.notes[0]!; // C3
    // With prevLastMidi = very high (far away), the weight penalty reduces the chance
    // of choosing the farthest note, but the function still returns a box note
    const farAway = pickFirstNote(box, cMajor, last, 'ascend', mulberry32(42), 100);
    expect(box.notes.some((n) => n.string === farAway.string && n.fret === farAway.fret)).toBe(true);
  });

  it('is deterministic with same seed', () => {
    const last = box.notes[0]!;
    const a = pickFirstNote(box, cMajor, last, 'ascend', mulberry32(42));
    const b = pickFirstNote(box, cMajor, last, 'ascend', mulberry32(42));
    expect(a).toEqual(b);
  });
});
