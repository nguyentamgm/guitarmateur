import { midiAt } from '../../core/fretboard';
import { format, parseNote } from '../../core/music';
import {
  BOOGIE_FRETS,
  BOOGIE_KEYS,
  MAX_ROOT_FRET,
  OCTAVE_STRINGS,
  POWER_FRETS,
  RIFF,
  RIFF_CELLS,
  boogieForm,
  boogieShape,
  boogieTops,
  octaveView,
  powerView,
  riffChords,
  slideFrom,
  stopsView,
  thirdOver,
} from './scenes';

const n = parseNote;

describe('step 1: power chords (K4.2)', () => {
  it('names the chord on its root, spelled like a key: A5, B♭5, F♯5', () => {
    expect(powerView({ string: 6, fret: 5 }).symbol).toBe('A5');
    expect(powerView({ string: 5, fret: 1 }).symbol).toBe('B♭5');
    expect(powerView({ string: 6, fret: 2 }).symbol).toBe('F♯5');
  });

  it('has 1, 5 and 8 and fits the drawn neck from every offered root', () => {
    for (const string of [6, 5] as const) {
      for (let fret = 0; fret <= MAX_ROOT_FRET; fret++) {
        const v = powerView({ string, fret });
        expect(v.notes.map((x) => x.degree)).toEqual(['1', '5', '8']);
        expect(Math.max(...v.notes.map((x) => x.fret))).toBeLessThanOrEqual(POWER_FRETS);
      }
    }
    expect(powerView({ string: 6, fret: 3 }, false).notes).toHaveLength(2);
  });

  it('sits under a major or a minor 3rd: no 3rd of its own', () => {
    const root = { string: 6 as const, fret: 5 };
    expect(thirdOver(root, 'major') - midiAt(root)).toBe(16);
    expect(thirdOver(root, 'minor') - midiAt(root)).toBe(15);
    const pcs = powerView(root).notes.map((x) => (x.midi - midiAt(root)) % 12);
    expect(pcs).not.toContain(3);
    expect(pcs).not.toContain(4);
  });
});

describe('step 2: riff (K6.5)', () => {
  it('fills two bars of eighths back to back', () => {
    let next = 0;
    for (const e of RIFF) {
      expect(e.cell).toBe(next);
      next += e.cells;
    }
    expect(next).toBe(RIFF_CELLS);
  });

  it('plays E5, G5, A5 on string 6 in E: chugs as two notes, rings as three', () => {
    const chords = riffChords();
    expect([...new Set(chords.map((c) => c.symbol))]).toEqual(['E5', 'G5', 'A5']);
    expect(chords.map((c) => c.root.fret).filter((f, i, a) => a.indexOf(f) === i)).toEqual([0, 3, 5]);
    for (const c of chords) expect(c.notes).toHaveLength(c.mute ? 2 : 3);
  });

  it.each(BOOGIE_KEYS.map((k) => [format(k), k] as const))('%s: the roots always climb I → ♭III → IV along string 6', (_k, k) => {
    const frets = riffChords(k).map((c) => c.root.fret);
    const [i, iii, iv] = [...new Set(frets)];
    expect([iii! - i!, iv! - i!]).toEqual([3, 5]);
  });
});

describe('step 3: double stops (K6.6)', () => {
  it.each([1, 2, 3, 4, 5])('box %i: only 4ths, except a major 3rd on G–B', (k) => {
    const { pairs } = stopsView(k);
    expect(pairs.length).toBeGreaterThanOrEqual(4);
    for (const p of pairs) {
      expect(p.high.fret).toBe(p.low.fret);
      expect(p.high.string).toBe(p.low.string - 1);
      expect(p.semitones).toBe(p.low.string === 3 ? 4 : 5);
      expect(p.high.midi - p.low.midi).toBe(p.semitones);
    }
  });

  it('names the pairs in A minor: box 1 B–e at fret 5 is E and A, G–B is C and E', () => {
    const names = stopsView(1).pairs.map((p) => `${p.low.string}/${p.low.fret} ${p.names.join('+')}`);
    expect(names).toContain('2/5 E+A');
    expect(names).toContain('3/5 C+E');
  });

  it('slides in from two frets below, never past the nut', () => {
    expect([slideFrom(5), slideFrom(1), slideFrom(0)]).toEqual([3, 0, 0]);
  });
});

describe('step 4: octaves (K6.7, K0.6)', () => {
  it.each(OCTAVE_STRINGS.map((s) => [s] as const))('lower string %i: every pair is an octave, +2 frets or +3 across G→B', (s) => {
    const { pairs } = octaveView(s);
    for (const p of pairs) {
      expect(p.high.midi - p.low.midi).toBe(12);
      expect(p.high.string).toBe(s - 2);
      expect(p.high.fret - p.low.fret).toBe(s <= 4 ? 3 : 2);
      expect(p.muted).toBe(s - 1);
    }
  });

  it('starts every phrase on fret 5, named as a minor key: A, D, G, C', () => {
    expect(OCTAVE_STRINGS.map((s) => format(octaveView(s).tonic))).toEqual(['A', 'D', 'G', 'C']);
    expect(octaveView(6).pairs.map((p) => p.low.fret)).toEqual([5, 8, 10, 12, 10, 8, 5]);
  });
});

describe('step 5: the boogie (K4.2, K5.4)', () => {
  it('puts I on string 6 and IV, V on string 5 beside it: A at 5, D at 5, E at 7', () => {
    const form = boogieForm();
    expect(form.map((b) => b.symbol).join(' ')).toBe('A7 A7 A7 A7 D7 D7 A7 A7 E7 D7 A7 A7');
    const roots = Object.fromEntries(form.map((b) => [b.degree, `${b.root.string}/${b.root.fret}`]));
    expect(roots).toEqual({ I: '6/5', IV: '5/5', V: '5/7' });
  });

  it('rocks 5 5 6 6 ♭7 ♭7 6 6 over the root: +2, +4, +5 frets on the next string', () => {
    const root = { string: 6 as const, fret: 5 };
    expect(Array.from({ length: 8 }, (_, e) => boogieShape(root, e)[1].fret - 5)).toEqual([2, 2, 4, 4, 5, 5, 4, 4]);
    expect(boogieTops(root).map((x) => x.degree)).toEqual(['5', '6', 'b7']);
  });

  it.each(BOOGIE_KEYS.map((k) => [format(k), k] as const))('%s: every shape stays on the drawn neck, IV and V close to I', (_k, k) => {
    for (const b of boogieForm(k, { quickChange: true, turnaround: true })) {
      for (const t of boogieTops(b.root)) expect(t.fret).toBeLessThanOrEqual(BOOGIE_FRETS);
      expect(Math.abs(b.root.fret - boogieForm(k)[0]!.root.fret)).toBeLessThanOrEqual(2);
    }
  });

  it('spells chords in the key: B♭ boogie is B♭7, E♭7, F7', () => {
    expect([...new Set(boogieForm(n('Bb')).map((b) => b.symbol))]).toEqual(['B♭7', 'E♭7', 'F7']);
  });
});
