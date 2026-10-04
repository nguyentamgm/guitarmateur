import { homeFret, midiAt } from '../../core/fretboard';
import { format, parseNote, pc } from '../../core/music';
import {
  NATURALS,
  OCTAVE_KEYS,
  isAnswer,
  naturalAt,
  naturalHomes,
  octaveView,
  openStrings,
  quizQuestion,
  semitoneRun,
  tabExample,
} from './scenes';

describe('step 1: string numbers (K0.1)', () => {
  it('lists strings 1 to 6, thinnest first, tuned e B G D A E', () => {
    const open = openStrings();
    expect(open.map((s) => s.string)).toEqual([1, 2, 3, 4, 5, 6]);
    expect(open.map((s) => s.name)).toEqual(['E', 'B', 'G', 'D', 'A', 'E']);
    expect(open.map((s) => s.midi)).toEqual([64, 59, 55, 50, 45, 40]);
  });
});

describe('step 2: one fret = one semitone (K0.2)', () => {
  it.each([6, 5, 4, 3, 2, 1] as const)('climbs string %i one semitone a fret, to an octave at 12', (s) => {
    const run = semitoneRun(s);
    expect(run.map((n) => n.fret)).toEqual([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]);
    run.slice(1).forEach((n, i) => expect(n.midi - run[i]!.midi).toBe(1));
    expect(run[12]!.midi - run[0]!.midi).toBe(12);
  });
});

describe('step 3: reading tab (K0.3)', () => {
  const tab = tabExample();

  it('opens on the open A string, then climbs six single notes of A minor pentatonic box 1', () => {
    const singles = tab.slice(0, 7).map((c) => c.notes.map((n) => `${n.string}/${n.fret}`));
    expect(singles).toEqual([['5/0'], ['6/5'], ['6/8'], ['5/5'], ['5/7'], ['4/5'], ['4/7']]);
    expect(tab[1]!.notes[0]!.midi).toBe(tab[0]!.notes[0]!.midi);
    for (let i = 2; i < 7; i++) expect(tab[i]!.notes[0]!.midi).toBeGreaterThan(tab[i - 1]!.notes[0]!.midi);
  });

  it('ends on home and its octave struck together', () => {
    const last = tab[tab.length - 1]!.notes;
    expect(last.map((n) => `${n.string}/${n.fret}`)).toEqual(['6/5', '4/7']);
    expect(last[1]!.midi - last[0]!.midi).toBe(12);
  });
});

describe('step 4: octave shapes (K0.6, K0.4)', () => {
  it('finds every A on a 15-fret neck', () => {
    const v = octaveView(parseNote('A'));
    expect(v.notes.map((n) => `${n.string}/${n.fret}`).sort()).toEqual(
      ['6/5', '5/0', '5/12', '4/7', '3/2', '3/14', '2/10', '1/5'].sort(),
    );
    for (const n of v.notes) expect(pc(parseNote('A'))).toBe(n.midi % 12);
  });

  it.each(OCTAVE_KEYS.map((k) => [format(k), k] as const))('links %s up an octave: +2, or +3 across B', (_n, k) => {
    const v = octaveView(k);
    expect(v.links.length).toBeGreaterThan(0);
    for (const l of v.links) {
      expect(l.from.string - l.to.string).toBe(2);
      expect(midiAt(l.to) - midiAt(l.from)).toBe(12);
      expect(l.shift).toBe(l.crossesB ? 3 : 2);
      expect(l.crossesB).toBe(l.from.string === 4 || l.from.string === 3);
    }
    for (const f of v.outer) expect(midiAt({ string: 1, fret: f }) - midiAt({ string: 6, fret: f })).toBe(24);
  });

  it('orders the picker by home fret on string 6', () => {
    expect(OCTAVE_KEYS.map(format)).toEqual(['E', 'F', 'G', 'A', 'B', 'C', 'D']);
  });
});

describe('step 5: home notes on strings 6 and 5 (K0.7, K0.5)', () => {
  const row = (s: 6 | 5) => naturalHomes(s).map((c) => `${format(c.name)}${c.fret}`);

  it('matches the knowledge base tables', () => {
    expect(row(6)).toEqual(['E0', 'F1', 'G3', 'A5', 'B7', 'C8', 'D10', 'E12']);
    expect(row(5)).toEqual(['A0', 'B2', 'C3', 'D5', 'E7', 'F8', 'G10', 'A12']);
  });

  it('names naturals only; sharps and flats sit between', () => {
    expect(naturalAt({ string: 6, fret: 8 })).toEqual(parseNote('C'));
    expect(naturalAt({ string: 5, fret: 1 })).toBeNull();
    expect(naturalAt({ string: 6, fret: 2 })).toBeNull();
  });

  it('accepts the home fret and the same note 12 frets up, on the asked string only', () => {
    const q = { name: parseNote('E'), string: 6 } as const;
    expect(isAnswer(q, { string: 6, fret: 0 })).toBe(true);
    expect(isAnswer(q, { string: 6, fret: 12 })).toBe(true);
    expect(isAnswer(q, { string: 5, fret: 7 })).toBe(false);
    expect(isAnswer(q, { string: 6, fret: 5 })).toBe(false);
    for (const s of [6, 5] as const) {
      for (const name of NATURALS) {
        const pos = { string: s, fret: homeFret(name, s) };
        expect(isAnswer({ name, string: s }, pos)).toBe(true);
        expect(midiAt(pos) % 12).toBe(pc(name));
      }
    }
  });

  it('draws every question, never the same one twice in a row', () => {
    const seen = new Set<string>();
    for (let i = 0; i < 14; i++) {
      const q = quizQuestion(() => i / 14);
      seen.add(`${q.string}${q.name.letter}`);
    }
    expect(seen.size).toBe(14);
    const prev = quizQuestion(() => 0);
    for (let r = 0; r < 1; r += 0.05) expect(quizQuestion(() => r, prev)).not.toEqual(prev);
    expect(quizQuestion(() => 0.9999999, prev)).toBeDefined();
  });
});
