import { describe, expect, it } from 'vitest';
import { defaultProgression } from './harmony';
import { note, pc } from './pitch';
import type { Key } from './key';
import { chordNotes } from './chord';
import type { Chord } from './chord';
import { scalePcs } from './scales';
import type { ScaleId } from './scales';

/** Build a minimal Key from a tonic like 'C', 'Bb', or 'F#'. */
function key(tonicTxt: string, scaleId: ScaleId): Key {
  const letters: Record<string, 'A' | 'B' | 'C' | 'D' | 'E' | 'F' | 'G'> = {
    A: 'A', B: 'B', C: 'C', D: 'D', E: 'E', F: 'F', G: 'G',
  };
  const letter = letters[tonicTxt[0]!]!;
  const c = tonicTxt[1];
  const alter = c === 'b' ? -1 : c === '#' ? 1 : 0;
  return { tonic: note(letter, alter as 0 | 1 | -1), scaleId };
}

/** Check chord tonic letter/alter and quality. Avoids `format()` ASCII/Unicode mismatch. */
function expectChord(chord: Chord, letter: string, alter: number, quality: string): void {
  expect(chord.tonic.letter).toBe(letter);
  expect(chord.tonic.alter).toBe(alter);
  expect(chord.quality).toBe(quality);
}

/** E.g. 'Bb' → { letter: 'B', alter: -1 }. Avoids Unicode issues in format(). */
function expectTonic(chord: Chord, tonicTxt: string): void {
  const letters: Record<string, 'A' | 'B' | 'C' | 'D' | 'E' | 'F' | 'G'> = {
    A: 'A', B: 'B', C: 'C', D: 'D', E: 'E', F: 'F', G: 'G',
  };
  const letter = letters[tonicTxt[0]!]!;
  const c = tonicTxt[1];
  const alter = c === 'b' ? -1 : c === '#' ? 1 : 0;
  expect(chord.tonic.letter).toBe(letter);
  expect(chord.tonic.alter).toBe(alter);
}

/** All scale types handled by defaultProgression. */
const SCALE_IDS: ScaleId[] = [
  'minorPentatonic',
  'majorPentatonic',
  'blues',
  'major',
  'dorian',
  'mixolydian',
  'natural-minor',
  'major-blues',
];

describe('defaultProgression', () => {
  // ── Each scale type produces chords ──────────────────────

  it.each(SCALE_IDS)('scale %s returns an array of chords', (scaleId) => {
    const chords = defaultProgression(key('C', scaleId));
    expect(Array.isArray(chords)).toBe(true);
    expect(chords.length).toBeGreaterThan(0);
    for (const c of chords) {
      expect(c).toHaveProperty('tonic');
      expect(c).toHaveProperty('quality');
    }
  });

  // ── Scale-specific progressions ─────────────────────────

  it('minorPentatonic: i - bVII - bVI - bVII', () => {
    const chords = defaultProgression(key('A', 'minorPentatonic'));
    expect(chords).toHaveLength(4);
    expectChord(chords[0]!, 'A', 0, 'm');
    expectChord(chords[1]!, 'G', 0, 'M');
    expectChord(chords[2]!, 'F', 0, 'M');
    expectChord(chords[3]!, 'G', 0, 'M');
  });

  it('majorPentatonic: I - V - vi - IV', () => {
    const chords = defaultProgression(key('C', 'majorPentatonic'));
    expect(chords).toHaveLength(4);
    expectChord(chords[0]!, 'C', 0, 'M');
    expectChord(chords[1]!, 'G', 0, 'M');
    expectChord(chords[2]!, 'A', 0, 'm');
    expectChord(chords[3]!, 'F', 0, 'M');
  });

  it('blues: I7 - IV7 - I7 - V7', () => {
    const chords = defaultProgression(key('A', 'blues'));
    expect(chords).toHaveLength(4);
    expectChord(chords[0]!, 'A', 0, 'dom7');
    expectChord(chords[1]!, 'D', 0, 'dom7');
    expectChord(chords[2]!, 'A', 0, 'dom7');
    expectChord(chords[3]!, 'E', 0, 'dom7');
  });

  it('major: Imaj7 - IVmaj7 - V7 - vim7', () => {
    const chords = defaultProgression(key('C', 'major'));
    expect(chords).toHaveLength(4);
    expectChord(chords[0]!, 'C', 0, 'M7');
    expectChord(chords[1]!, 'F', 0, 'M7');
    expectChord(chords[2]!, 'G', 0, 'dom7');
    expectChord(chords[3]!, 'A', 0, 'm7');
  });

  it('dorian: im7 - IV7 - im7 - bVIImaj7', () => {
    const chords = defaultProgression(key('D', 'dorian'));
    expect(chords).toHaveLength(4);
    expectChord(chords[0]!, 'D', 0, 'm7');
    expectChord(chords[1]!, 'G', 0, 'dom7');
    expectChord(chords[2]!, 'D', 0, 'm7');
    expectChord(chords[3]!, 'C', 0, 'M7');
  });

  it('mixolydian: I7 - bVIImaj7 - IVmaj7 - I7', () => {
    const chords = defaultProgression(key('G', 'mixolydian'));
    expect(chords).toHaveLength(4);
    expectChord(chords[0]!, 'G', 0, 'dom7');
    expectChord(chords[1]!, 'F', 0, 'M7');
    expectChord(chords[2]!, 'C', 0, 'M7');
    expectChord(chords[3]!, 'G', 0, 'dom7');
  });

  it('natural-minor: im7 - bIIImaj7 - bVII7 - vm7', () => {
    const chords = defaultProgression(key('A', 'natural-minor'));
    expect(chords).toHaveLength(4);
    expectChord(chords[0]!, 'A', 0, 'm7');
    expectChord(chords[1]!, 'C', 0, 'M7');
    expectChord(chords[2]!, 'G', 0, 'dom7');
    expectChord(chords[3]!, 'E', 0, 'm7');
  });

  it('major-blues: I7 - IV7 - I7 - V7 - IV7 - I7', () => {
    const chords = defaultProgression(key('C', 'major-blues'));
    expect(chords).toHaveLength(6);
    expectChord(chords[0]!, 'C', 0, 'dom7');
    expectChord(chords[1]!, 'F', 0, 'dom7');
    expectChord(chords[2]!, 'C', 0, 'dom7');
    expectChord(chords[3]!, 'G', 0, 'dom7');
    expectChord(chords[4]!, 'F', 0, 'dom7');
    expectChord(chords[5]!, 'C', 0, 'dom7');
  });

  // ── Determinism ─────────────────────────────────────────

  it('is deterministic (same inputs = same output)', () => {
    const a = defaultProgression(key('C', 'majorPentatonic'));
    const b = defaultProgression(key('C', 'majorPentatonic'));
    expect(a).toEqual(b);
  });

  // ── Different tonics ────────────────────────────────────

  it('works for all 12 practical tonics with minorPentatonic', () => {
    const tonics = ['A', 'Bb', 'B', 'C', 'C#', 'D', 'Eb', 'E', 'F', 'F#', 'G', 'G#'];
    for (const t of tonics) {
      const chords = defaultProgression(key(t, 'minorPentatonic'));
      expect(chords).toHaveLength(4);
      expectTonic(chords[0]!, t);
    }
  });

  it('works for all 12 practical tonics with majorPentatonic', () => {
    const tonics = ['A', 'Bb', 'B', 'C', 'C#', 'D', 'Eb', 'E', 'F', 'F#', 'G', 'G#'];
    for (const t of tonics) {
      const chords = defaultProgression(key(t, 'majorPentatonic'));
      expect(chords).toHaveLength(4);
      expectTonic(chords[0]!, t);
    }
  });

  // ── Correct spelling invariants ─────────────────────────

  it('spells chords correctly — C minorPentatonic uses Bb not A#', () => {
    const chords = defaultProgression(key('C', 'minorPentatonic'));
    expectChord(chords[0]!, 'C', 0, 'm');
    expectChord(chords[1]!, 'B', -1, 'M');  // B♭
    expectChord(chords[2]!, 'A', -1, 'M');  // A♭
    expectChord(chords[3]!, 'B', -1, 'M');  // B♭
  });

  it('spells chords correctly — F# minorPentatonic uses natural letters', () => {
    const chords = defaultProgression(key('F#', 'minorPentatonic'));
    expectChord(chords[0]!, 'F', 1, 'm');   // F♯
    expectChord(chords[1]!, 'E', 0, 'M');   // E
    expectChord(chords[2]!, 'D', 0, 'M');   // D
    expectChord(chords[3]!, 'E', 0, 'M');   // E
  });

  // ── Edge cases ──────────────────────────────────────────

  it('handles C blues correctly', () => {
    const chords = defaultProgression(key('C', 'blues'));
    expect(chords).toHaveLength(4);
    expectChord(chords[0]!, 'C', 0, 'dom7');
    expectChord(chords[1]!, 'F', 0, 'dom7');
    expectChord(chords[2]!, 'C', 0, 'dom7');
    expectChord(chords[3]!, 'G', 0, 'dom7');
  });

  it('first chord tonic matches key tonic for all scale types', () => {
    for (const scaleId of SCALE_IDS) {
      const chords = defaultProgression(key('E', scaleId));
      expect(chords[0]!.tonic.letter).toBe('E');
      expect(chords[0]!.tonic.alter).toBe(0);
    }
  });

  it('diatonic 7-note scales keep every chord tone inside the scale', () => {
    const diatonic = ['major', 'dorian', 'mixolydian', 'natural-minor'] as const;
    for (const scaleId of diatonic) {
      for (const tonicTxt of ['A', 'C', 'G', 'D']) {
        const k = key(tonicTxt, scaleId);
        const scale = scalePcs(k);
        for (const c of defaultProgression(k)) {
          for (const n of chordNotes(c)) {
            expect(scale.has(pc(n)), `${scaleId} ${tonicTxt}: ${n.letter}${n.alter} of ${c.quality} out of scale`).toBe(true);
          }
        }
      }
    }
  });
});
