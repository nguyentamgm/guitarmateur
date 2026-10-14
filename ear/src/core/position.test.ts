import { describe, expect, it } from 'vitest';
import { mulberry32 } from '@shared/core/rng';
import {
  MAJOR_KEY_TONICS,
  MINOR_KEY_TONICS,
  format,
  mod,
  parseNote,
  pc,
  type Key,
} from '@shared/core/music';
import { DEGREES, degreeId, presetDegrees } from './degrees';
import { REGISTERS, nextQuestion, type Question } from './questions';
import { MAX_FRET, OPEN_MIDI, WINDOW_FRETS, neckWindow } from './position';

const KEYS: Key[] = [
  ...MAJOR_KEY_TONICS.map((tonic) => ({ tonic, mode: 'major' as const })),
  ...MINOR_KEY_TONICS.map((tonic) => ({ tonic, mode: 'minor' as const })),
];
const CHROMATIC = DEGREES.map((d) => d.label);
const name = (k: Key) => `${format(k.tonic)} ${k.mode}`;

describe('neckWindow, over every key, register and degree', () => {
  it.each(REGISTERS)(
    'register %s: the root on string 6 or 5 at frets 0–15, five frets, the note heard at its pitch',
    (register) => {
      for (const key of KEYS) {
        const settings = { key, degrees: CHROMATIC, register, keyChange: 'fixed' as const };
        const rng = mulberry32(224);
        const history: Question[] = [];
        for (let i = 0; i < 200; i++) {
          const q = nextQuestion(settings, history, rng);
          history.push(q);
          const w = neckWindow(key, q, settings.degrees);
          const where = `${name(key)} ${q.degree} @${q.midi}`;
          expect([5, 6], where).toContain(w.root.string);
          expect(mod(w.root.midi - pc(key.tonic), 12), where).toBe(0);
          expect(w.root.midi, where).toBe(OPEN_MIDI[w.root.string] + w.root.fret);
          expect(w.hi - w.lo + 1, where).toBe(WINDOW_FRETS);
          expect(w.lo, where).toBe(Math.max(0, w.root.fret - 1));
          expect(w.lo, where).toBeGreaterThanOrEqual(0);
          expect(w.root.fret, where).toBeLessThanOrEqual(MAX_FRET);
          expect(w.hi, where).toBeLessThanOrEqual(MAX_FRET + 3);
          // The note heard, at the very pitch heard, inside the window.
          expect(w.target.midi, where).toBe(q.midi);
          expect(w.target.midi, where).toBe(OPEN_MIDI[w.target.string] + w.target.fret);
          expect(w.target.fret, where).toBeGreaterThanOrEqual(w.lo);
          expect(w.target.fret, where).toBeLessThanOrEqual(w.hi);
          for (const d of w.dots) {
            expect(d.fret, where).toBeGreaterThanOrEqual(w.lo);
            expect(d.fret, where).toBeLessThanOrEqual(w.hi);
            expect(d.degree, where).toBe(DEGREES[mod(d.midi - pc(key.tonic), 12)]!.label);
          }
          expect(
            w.dots.filter((d) => d.role === 'target'),
            where,
          ).toHaveLength(1);
          expect(w.dots.find((d) => d.role === 'target')!.degree, where).toBe(degreeId(q.degree));
        }
      }
    },
  );

  it('picks the root nearest in pitch to the tonic the note was heard against', () => {
    // A major, 3 heard at C♯4 (61) above A3 (57): A3 is on string 5, fret 12.
    const w = neckWindow(
      { tonic: parseNote('A'), mode: 'major' },
      { key: { tonic: parseNote('A'), mode: 'major' }, degree: '3', midi: 61 },
      ['1', '3', '5'],
    );
    expect(w.root).toEqual({ string: 5, fret: 12, midi: 57 });
    expect(w.target).toEqual({ string: 4, fret: 11, midi: 61 });
    expect([w.lo, w.hi]).toEqual([11, 15]);
  });

  it('a low note: the open position, fret 0 included', () => {
    // E major, 5 heard at B2 (47) above E2 (40): the root is the open low E.
    const e: Key = { tonic: parseNote('E'), mode: 'major' };
    const w = neckWindow(e, { key: e, degree: '5', midi: 47 }, ['1', '3', '5']);
    expect(w.root).toEqual({ string: 6, fret: 0, midi: 40 });
    expect([w.lo, w.hi]).toEqual([0, 4]);
    expect(w.target).toEqual({ string: 5, fret: 2, midi: 47 });
  });

  it('shows the active degrees only, plus the root and the target', () => {
    const a: Key = { tonic: parseNote('A'), mode: 'minor' };
    const pent = presetDegrees('minorPentatonic', 'minor')!;
    // ♭3 heard at C3 (48), against A2 (45): the open A string and string 6 fret 5 are both A2;
    // the lower fret wins, the open position.
    const w = neckWindow(a, { key: a, degree: 'b3', midi: 48 }, pent);
    const degrees = new Set(w.dots.map((d) => d.degree));
    for (const d of degrees) expect(pent).toContain(d);
    expect(w.dots.filter((d) => d.role === 'root')).toHaveLength(1);
    // A minor pentatonic in the open position: two notes per string, twelve in all.
    expect(w.root).toEqual({ string: 5, fret: 0, midi: 45 });
    expect([w.lo, w.hi]).toEqual([0, 4]);
    expect(w.dots).toHaveLength(12);
    expect(w.target).toEqual({ string: 5, fret: 3, midi: 48 });
  });
});
