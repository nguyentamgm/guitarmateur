import { format, parseNote, pc } from '../../core/music';
import {
  BARRE_FRETS,
  FIND_POOL,
  PROGRESSION_KEYS,
  ROOTS,
  VARIANTS,
  barreView,
  chordPath,
  findQuestion,
  judgeFind,
  movedStrings,
  progressionChords,
  slideView,
  travel,
} from './scenes';

const n = parseNote;

describe('step 1: the moving nut (K4.6)', () => {
  it('names the E shape by the note under the barre on string 6: E F F♯ G … E', () => {
    expect(Array.from({ length: 13 }, (_, f) => slideView(f).symbol)).toEqual(['E', 'F', 'F♯', 'G', 'A♭', 'A', 'B♭', 'B', 'C', 'D♭', 'D', 'E♭', 'E']);
    expect(slideView(1).notes.map((x) => x.fret)).toEqual([1, 3, 3, 2, 1, 1]);
    for (let f = 0; f <= 12; f++) expect(Math.max(...slideView(f).notes.map((x) => x.fret))).toBeLessThanOrEqual(BARRE_FRETS);
  });
});

describe('steps 2–3: variants of each shape (K4.6, K4.3)', () => {
  const moved = (shape: 'E' | 'A', id: (typeof VARIANTS)[number]) => {
    const major = barreView({ root: n('G'), id: 'major' }, shape)!;
    const other = barreView({ root: n('G'), id }, shape)!;
    return movedStrings(major, other).map((s) => other.notes.find((x) => x.string === s)!.degree);
  };

  it('moves only the notes the formula changes, E shape on G', () => {
    expect(moved('E', 'minor')).toEqual(['b3']);
    expect(moved('E', 'dom7')).toEqual(['b7']);
    expect(moved('E', 'm7')).toEqual(['b7', 'b3']);
    expect(moved('E', 'maj7')).toEqual(['7']);
    expect(moved('E', 'sus4')).toEqual(['4']);
  });

  it('moves only the notes the formula changes, A shape on G', () => {
    expect(moved('A', 'minor')).toEqual(['b3']);
    expect(moved('A', 'dom7')).toEqual(['b7']);
    expect(moved('A', 'maj7')).toEqual(['7']);
    expect(moved('A', 'sus4')).toEqual(['4']);
  });

  it.each(ROOTS.map((r) => [format(r), r] as const))('%s: every variant exists in both shapes, root in the bass, on the neck', (_r, r) => {
    for (const id of VARIANTS) {
      for (const shape of ['E', 'A'] as const) {
        const v = barreView({ root: r, id }, shape)!;
        expect(v.notes[0]!.degree).toBe('1');
        expect(v.notes[0]!.string).toBe(shape === 'E' ? 6 : 5);
        expect(Math.max(...v.notes.map((x) => x.fret))).toBeLessThanOrEqual(BARRE_FRETS);
      }
    }
  });
});

describe('step 4: find any barre chord (K0.7)', () => {
  it('asks six variants on twelve roots, never twice in a row', () => {
    expect(FIND_POOL).toHaveLength(72);
    const q = findQuestion(() => 0);
    for (let r = 0; r < 1; r += 0.05) {
      const next = findQuestion(() => r, q);
      expect(next.id === q.id && pc(next.root) === pc(q.root)).toBe(false);
    }
  });

  it('accepts the root on string 6 or 5 and shows the other shape too', () => {
    const q = { root: n('Bb'), id: 'm7' as const };
    const on6 = judgeFind(q, { string: 6, fret: 6 });
    expect(on6.kind).toBe('right');
    if (on6.kind === 'right') {
      expect([on6.view.shape, on6.view.fret, on6.view.symbol]).toEqual(['E', 6, 'B♭m7']);
      expect([on6.other.shape, on6.other.fret]).toEqual(['A', 1]);
    }
    const on5 = judgeFind(q, { string: 5, fret: 13 });
    expect(on5.kind === 'right' && on5.view.fret).toBe(13);
    expect(judgeFind(q, { string: 4, fret: 8 })).toEqual({ kind: 'wrongString' });
    // E on string 5 at fret 7: the E shape nearby is at fret 12, not the open chord at 0.
    const e = judgeFind({ root: n('E'), id: 'major' }, { string: 5, fret: 7 });
    expect(e.kind === 'right' && [e.other.shape, e.other.fret]).toEqual(['E', 12]);
    expect(judgeFind(q, { string: 6, fret: 5 })).toEqual({ kind: 'wrongNote', heard: 'A' });
    expect(judgeFind(q, { string: 6, fret: 4 })).toEqual({ kind: 'wrongNote', heard: 'G♯ / A♭' });
  });
});

describe('step 5: changes without jumping (K4.6)', () => {
  it('plays I vi IV V in G as G Em C D', () => {
    expect(progressionChords(n('G')).map((c) => format(c.root) + (c.id === 'minor' ? 'm' : ''))).toEqual(['G', 'Em', 'C', 'D']);
  });

  it('keeps the hand around frets 0–5 in G by mixing shapes (Em is the open chord, fret 0)', () => {
    const path = chordPath(progressionChords(n('G')), 'near');
    expect(path.map((v) => `${v.symbol} ${v.shape}${v.fret}`)).toEqual(['G E3', 'Em E0', 'C A3', 'D A5']);
    expect(travel(path)).toBe(10);
    const one = chordPath(progressionChords(n('G')), 'string6');
    expect(one.map((v) => v.fret)).toEqual([3, 0, 8, 10]);
    expect(travel(path)).toBeLessThan(travel(one));
  });

  it.each(PROGRESSION_KEYS.map((k) => [format(k), k] as const))('%s: mixing shapes never travels further than staying on string 6', (_k, k) => {
    const chords = progressionChords(k);
    expect(travel(chordPath(chords, 'near'))).toBeLessThanOrEqual(travel(chordPath(chords, 'string6')));
    for (const v of chordPath(chords, 'near')) expect(Math.max(...v.notes.map((x) => x.fret))).toBeLessThanOrEqual(BARRE_FRETS);
  });
});
