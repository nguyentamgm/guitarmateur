import { SEQUENCE_IDS } from '../../core/fretboard';
import { MAJOR_KEY_TONICS, format, parseNote } from '../../core/music';
import {
  MAJOR_KEYS,
  NECK_FRETS,
  barStarts,
  countAt,
  crossRun,
  drillRun,
  fingerMap,
  keyView,
  loopSteps,
  positionPair,
  renumber,
  rootRun,
  samePos,
  scaleNeck,
  stringRows,
  sevenPositions,
} from './scenes';

const n = parseNote;
const range = (p: { minFret: number; maxFret: number }) => [p.minFret, p.maxFret];
const frets = (p: { notes: readonly { string: number; fret: number }[] }) =>
  [6, 5, 4, 3, 2, 1].map((s) => p.notes.filter((x) => x.string === s).map((x) => x.fret));

describe('step 1: three notes on every string (K2.9)', () => {
  it('builds G major position 1 at frets 3–8, three notes on each string', () => {
    const p1 = sevenPositions()[0]!;
    expect(range(p1)).toEqual([3, 8]);
    expect(frets(p1)).toEqual([[3, 5, 7], [3, 5, 7], [4, 5, 7], [4, 5, 7], [5, 7, 8], [5, 7, 8]]);
    expect(p1.notes.slice(0, 7).map((x) => x.name)).toEqual(['G', 'A', 'B', 'C', 'D', 'E', 'F♯']);
  });

  it('uses only whole–whole, whole–half and half–whole strings, in every position of every key', () => {
    for (const k of MAJOR_KEY_TONICS) {
      for (const p of sevenPositions(k)) {
        const rows = stringRows(p);
        expect(rows).toHaveLength(6);
        for (const r of rows) expect(['ww', 'wh', 'hw']).toContain(r.shape);
      }
    }
  });

  it('labels G major position 1 string by string', () => {
    expect(stringRows(sevenPositions()[0]!).map((r) => r.shape)).toEqual(['ww', 'ww', 'hw', 'hw', 'wh', 'wh']);
  });

  it('fingers a half step with neighbouring fingers', () => {
    const fingers = fingerMap(sevenPositions()[0]!);
    expect([fingers.get('6:3'), fingers.get('6:5'), fingers.get('6:7')]).toEqual([1, 2, 4]);
    expect([fingers.get('4:4'), fingers.get('4:5'), fingers.get('4:7')]).toEqual([1, 2, 4]);
    expect([fingers.get('1:5'), fingers.get('1:7'), fingers.get('1:8')]).toEqual([1, 3, 4]);
  });

  it('spells every note in the key: F major has B♭, never A♯', () => {
    const names = new Set(sevenPositions(n('F')).flatMap((p) => p.notes.map((x) => x.name)));
    expect([...names].sort()).toEqual(['A', 'B♭', 'C', 'D', 'E', 'F', 'G']);
  });
});

describe('step 2: seven positions tile the neck (K2.9)', () => {
  const all = sevenPositions();

  it('places G major positions at 3–8, 5–10, 7–12, 8–14, 10–15, 12–17, 2–7', () => {
    expect(all.map(range)).toEqual([[3, 8], [5, 10], [7, 12], [8, 14], [10, 15], [12, 17], [2, 7]]);
  });

  it('starts position k on degree k on string 6', () => {
    expect(all.map((p) => p.notes[0]!.degree)).toEqual(['1', '2', '3', '4', '5', '6', '7']);
  });

  it('gives 18 notes lowest first, all on the drawn neck, in every key', () => {
    for (const k of MAJOR_KEYS) {
      for (const p of sevenPositions(k)) {
        expect(p.notes).toHaveLength(18);
        p.notes.slice(1).forEach((x, i) => expect(x.midi).toBeGreaterThan(p.notes[i]!.midi));
        expect(p.minFret).toBeGreaterThanOrEqual(0);
        expect(p.maxFret).toBeLessThanOrEqual(NECK_FRETS);
      }
    }
  });

  it('shares two notes per string with the next position, 7 → 1 included, in every key', () => {
    for (const k of MAJOR_KEYS) {
      for (let i = 1; i <= 7; i++) {
        const pair = positionPair(i, k);
        expect(pair.shared).toHaveLength(12);
        expect(pair.to.index).toBe((i % 7) + 1);
      }
    }
  });

  it('draws every pair on the neck, the moved-up next position included', () => {
    let top = 0;
    for (const k of MAJOR_KEYS) {
      for (let i = 1; i <= 7; i++) top = Math.max(top, positionPair(i, k).to.maxFret, positionPair(i, k).from.maxFret);
    }
    expect(top).toBe(NECK_FRETS);
  });

  it('crosses up one position and down the next with no gap', () => {
    const run = crossRun(positionPair(1));
    expect(run).toHaveLength(36);
    expect(samePos(run[0]!, { string: 6, fret: 3 })).toBe(true);
    expect(samePos(run.at(-1)!, { string: 6, fret: 5 })).toBe(true);
  });

  it('covers every scale note in a 12-fret stretch of G major, frets 3–14', () => {
    const covered = all.flatMap((p) => p.notes);
    const neck = scaleNeck().filter((x) => x.fret >= 3 && x.fret <= 14);
    for (const x of neck) expect(covered.some((c) => samePos(c, x))).toBe(true);
  });
});

describe('step 3: three notes = one beat (K1.5, K3.6)', () => {
  const p1 = sevenPositions()[0]!;

  it('plays a straight run one string per beat: every "1 2 3 4" lands on the first note of a string', () => {
    const run = drillRun(p1, 'straight', 'up');
    run.forEach((x, i) => {
      if (countAt(i).kind === 'beat') expect(x).toBe(p1.notes.filter((m) => m.string === x.string)[0]);
    });
    expect(countAt(0)).toEqual({ kind: 'beat', n: 1 });
    expect(countAt(13)).toEqual({ kind: 'trip' });
  });

  it('drills every pattern in both directions from the position\'s own notes', () => {
    for (const id of SEQUENCE_IDS) {
      for (const dir of ['up', 'down'] as const) {
        const run = drillRun(p1, id, dir);
        expect(run.length).toBeGreaterThan(0);
        for (const x of run) expect(p1.notes).toContain(x);
      }
    }
  });

  it('rounds every loop up to whole bars so it restarts on "1"', () => {
    expect(loopSteps(18, 12)).toBe(24);
    expect(loopSteps(48, 12)).toBe(48);
    expect(loopSteps(15, 8)).toBe(16);
  });

  it('draws a bar line every 12 notes', () => {
    expect(barStarts(18)).toEqual([12]);
    expect(barStarts(48)).toEqual([12, 24, 36]);
    expect(barStarts(12)).toEqual([]);
  });
});

describe('step 4: any key, and the relative minor (K2.8, K3.5)', () => {
  it('slides every position the same distance when the key changes', () => {
    const g = sevenPositions(n('G'));
    const a = sevenPositions(n('A'));
    a.forEach((p, i) => {
      const d = (((p.minFret - g[i]!.minFret) % 12) + 12) % 12;
      expect(d).toBe(2);
      expect(stringRows(p).map((r) => r.shape)).toEqual(stringRows(g[i]!).map((r) => r.shape));
    });
  });

  it('numbers E minor from its own root: E minor position 1 is G major position 6', () => {
    const view = keyView(n('G'), 'minor');
    expect(format(view.relativeMinor)).toBe('E');
    expect(frets(view.positions[0]!)).toEqual(frets(sevenPositions()[5]!));
    expect(view.positions[0]!.notes[0]!.degree).toBe('1');
  });

  it('renumbers both ways for every position and every key', () => {
    for (const k of MAJOR_KEYS) {
      const major = keyView(k, 'major').positions;
      const minor = keyView(k, 'minor').positions;
      for (let i = 1; i <= 7; i++) {
        const m = renumber(i, 'major');
        expect(renumber(m, 'minor')).toBe(i);
        expect(frets(minor[m - 1]!)).toEqual(frets(major[i - 1]!));
      }
    }
  });

  it('keeps the same dots and moves only the root', () => {
    const major = keyView(n('C'), 'major').neck;
    const minor = keyView(n('C'), 'minor').neck;
    expect(minor.map((x) => `${x.string}:${x.fret}`).sort()).toEqual(major.map((x) => `${x.string}:${x.fret}`).sort());
    expect(new Set(major.filter((x) => x.isTonic).map((x) => x.name))).toEqual(new Set(['C']));
    expect(new Set(minor.filter((x) => x.isTonic).map((x) => x.name))).toEqual(new Set(['A']));
  });

  it('runs from the lowest root to the highest and back', () => {
    for (const k of MAJOR_KEYS) {
      for (const mode of ['major', 'minor'] as const) {
        for (const p of keyView(k, mode).positions) {
          const run = rootRun(p);
          expect(run[0]!.isTonic).toBe(true);
          expect(run.at(-1)).toBe(run[0]);
          expect(run.length).toBeGreaterThanOrEqual(15);
        }
      }
    }
  });
});
