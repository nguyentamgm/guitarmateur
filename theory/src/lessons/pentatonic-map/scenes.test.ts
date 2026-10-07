import { homeFret, openMidi, scaleNeck, upAndDown } from '../../core/fretboard';
import { format, parseNote, pc } from '../../core/music';
import {
  FINDER_KEYS,
  NECK_FRETS,
  SCALE,
  boxes,
  formulaStrip,
  homeView,
  inBox,
  keyView,
  slide,
  stringPairs,
} from './scenes';

describe('step 1: string pairs (K0.4)', () => {
  const pairs = stringPairs();

  it('pairs every string with the next thinner one, open', () => {
    expect(pairs.map((p) => [p.low.string, p.high.string])).toEqual([[6, 5], [5, 4], [4, 3], [3, 2], [2, 1]]);
    for (const p of pairs) expect(openMidi(p.low.string) + p.low.fret).toBe(openMidi(p.high.string));
  });

  it('has exactly one odd pair: G→B at fret 4', () => {
    expect(pairs.filter((p) => p.odd)).toEqual([{ low: { string: 3, fret: 4 }, high: { string: 2, fret: 0 }, odd: true }]);
    expect(pairs.filter((p) => !p.odd).every((p) => p.low.fret === 5)).toBe(true);
  });
});

describe('step 2: the formula (K3.2)', () => {
  it('climbs 3 2 2 3 2 from A at fret 5 to A at fret 17', () => {
    const strip = formulaStrip();
    expect(strip.steps).toEqual([3, 2, 2, 3, 2]);
    expect(strip.notes.map((n) => n.fret)).toEqual([5, 8, 10, 12, 15, 17]);
    expect(strip.notes.map((n) => n.degree)).toEqual(['1', 'b3', '4', '5', 'b7', '1']);
    expect(strip.notes[5]!.midi - strip.notes[0]!.midi).toBe(12);
  });
});

describe('step 3: five boxes (K3.4)', () => {
  const all = boxes();

  it('gives the A minor boxes of the knowledge base', () => {
    expect(all.map((b) => [b.minFret, b.maxFret])).toEqual([[5, 8], [7, 10], [9, 13], [12, 15], [2, 5]]);
  });

  it('has 12 notes per box, 2 per string, all inside the frame and on the 15-fret neck', () => {
    const neck = new Set(scaleNeck(parseNote('A'), SCALE, NECK_FRETS).map((n) => `${n.string}:${n.fret}`));
    for (const b of all) {
      expect(b.notes).toHaveLength(12);
      for (const n of b.notes) {
        expect(inBox(b, n)).toBe(true);
        expect(neck.has(`${n.string}:${n.fret}`)).toBe(true);
      }
    }
  });

  it('plays up then down without repeating the top note', () => {
    expect(upAndDown([1, 2, 3])).toEqual([1, 2, 3, 2, 1]);
  });
});

describe('step 4: changing key (K0.7, K3.5)', () => {
  it('offers one key per fret 0–11 on string 6, spelled as minor keys', () => {
    expect(FINDER_KEYS.map((k) => homeFret(k))).toEqual([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11]);
    expect(FINDER_KEYS.map(format)).toEqual(['E', 'F', 'F♯', 'G', 'G♯', 'A', 'B♭', 'B', 'C', 'C♯', 'D', 'E♭']);
  });

  it('puts box 1 on the new home note', () => {
    const c = keyView(parseNote('C'));
    expect(c.homeFret).toBe(8);
    expect(c.box1.minFret).toBe(8);
    expect(c.notes.some((n) => n.string === 6 && n.fret === 8 && n.isTonic)).toBe(true);
  });

  it('slides the short way', () => {
    expect(slide(parseNote('A'), parseNote('C'))).toBe(3);
    expect(slide(parseNote('A'), parseNote('E'))).toBe(-5);
    expect(slide(parseNote('E'), parseNote('Eb'))).toBe(-1);
  });
});

describe('step 5: same notes, other home (K3.1, K3.3)', () => {
  const minor = homeView('minor');
  const major = homeView('major');

  it('keeps every dot where it is', () => {
    const where = (v: typeof minor) => v.notes.map((n) => `${n.string}:${n.fret}`);
    expect(where(major)).toEqual(where(minor));
  });

  it('moves home from A to C, three frets up', () => {
    expect(format(minor.home)).toBe('A');
    expect(format(major.home)).toBe('C');
    expect(homeFret(major.home) - homeFret(minor.home)).toBe(3);
    expect(new Set(major.notes.filter((n) => n.isTonic).map((n) => pc(parseNote(n.name))))).toEqual(new Set([0]));
  });

  it('labels degrees from the chosen home', () => {
    const at = (v: typeof minor, s: number, f: number) => v.notes.find((n) => n.string === s && n.fret === f)!.degree;
    expect(at(minor, 6, 5)).toBe('1');
    expect(at(major, 6, 5)).toBe('6');
    expect(at(major, 6, 8)).toBe('1');
    expect(new Set(major.notes.map((n) => n.degree))).toEqual(new Set(['1', '2', '3', '5', '6']));
  });
});
