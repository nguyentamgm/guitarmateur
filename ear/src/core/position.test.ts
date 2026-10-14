import { describe, expect, it } from 'vitest';
import {
  MAJOR_KEY_TONICS,
  MINOR_KEY_TONICS,
  format,
  interval,
  mod,
  parseNote,
  pc,
  type Key,
} from '@shared/core/music';
import { DEGREES, degreeId, presetDegrees } from './degrees';
import { REGISTERS, questionTonic } from './questions';
import { MAX_FRET, OPEN_MIDI, WINDOW_FRETS, neckWindow } from './position';

const KEYS: Key[] = [
  ...MAJOR_KEY_TONICS.map((tonic) => ({ tonic, mode: 'major' as const })),
  ...MINOR_KEY_TONICS.map((tonic) => ({ tonic, mode: 'minor' as const })),
];
const CHROMATIC = DEGREES.map((d) => d.label);
const name = (k: Key) => `${format(k.tonic)} ${k.mode}`;

describe('neckWindow, over every key, register and degree', () => {
  // Every pitch a question can have: each degree, wherever the register puts it, in every key.
  // Problems are gathered and checked once: an expect per check over ~1,300 cases is slow on CI.
  it.each(REGISTERS)(
    'register %s: the root on string 6 or 5 at frets 0–15, five frets, the note heard at its pitch',
    (register) => {
      const problems: string[] = [];
      let cases = 0;
      for (const key of KEYS) {
        const settings = { key, degrees: CHROMATIC, register, keyChange: 'fixed' as const };
        const tonic = questionTonic(key, settings);
        for (const degree of CHROMATIC) {
          const s = interval(degree).semitones;
          const offsets =
            register === 'above'
              ? [s]
              : register === 'around'
                ? [s <= 6 ? s : s - 12]
                : [s, s + 12];
          for (const midi of offsets.map((o) => tonic + o)) {
            cases++;
            const w = neckWindow(key, { key, degree, midi }, CHROMATIC);
            const where = `${name(key)} ${degree} @${midi}`;
            const check = (ok: boolean, what: string) => ok || problems.push(`${where}: ${what}`);
            check(w.root.string === 5 || w.root.string === 6, 'root string');
            check(mod(w.root.midi - pc(key.tonic), 12) === 0, 'root pitch class');
            check(w.root.midi === OPEN_MIDI[w.root.string] + w.root.fret, 'root midi');
            check(w.root.fret <= MAX_FRET, 'root fret');
            check(
              w.hi - w.lo + 1 === WINDOW_FRETS && w.lo === Math.max(0, w.root.fret - 1),
              'window',
            );
            check(w.target.midi === midi, `target ${w.target.midi}`);
            check(w.target.midi === OPEN_MIDI[w.target.string] + w.target.fret, 'target midi');
            check(w.target.fret >= w.lo && w.target.fret <= w.hi, 'target in window');
            check(
              w.dots.every((d) => d.fret >= w.lo && d.fret <= w.hi),
              'dots in window',
            );
            check(
              w.dots.every((d) => d.degree === DEGREES[mod(d.midi - pc(key.tonic), 12)]!.label),
              'dot degrees',
            );
            const targets = w.dots.filter((d) => d.role === 'target');
            check(
              targets.length === 1 && targets[0]!.degree === degreeId(degree),
              'one target, the degree asked',
            );
          }
        }
      }
      expect(cases).toBe(register === 'twoOctaves' ? 24 * 12 * 2 : 24 * 12);
      expect(problems).toEqual([]);
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
