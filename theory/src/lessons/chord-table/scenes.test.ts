import { STRINGS } from '../../core/fretboard';
import { format, parseNote } from '../../core/music';
import {
  GROUPS,
  INVERSION_CHORDS,
  LADDERS,
  MIN_ROOT_FRET,
  MOVABLE,
  OPEN_SEVENTHS,
  ROOTS,
  SEVENTHS,
  STACK_FRETS,
  TABLE,
  WALKDOWN,
  bassOptions,
  baseTriadView,
  inversionView,
  ladder,
  movableView,
  openView,
  roleOf,
  stackView,
  tableView,
} from './scenes';

const n = parseNote;
const shape = (v: { notes: readonly { string: number; fret: number }[]; muted: readonly number[] }) =>
  STRINGS.map((s) => (v.muted.includes(s) ? 'x' : String(v.notes.find((x) => x.string === s)!.fret))).join('');

describe('step 1: 7th chords (K4.3)', () => {
  it('spells the 7th chords on C as the knowledge base does', () => {
    expect(SEVENTHS.map((id) => `${stackView(n('C'), id).symbol}: ${stackView(n('C'), id).spelled.join(' ')}`)).toEqual([
      'Cmaj7: C E G B',
      'C7: C E G B♭',
      'Cm7: C E♭ G B♭',
      'Cm7♭5: C E♭ G♭ B♭',
      'C°7: C E♭ G♭ B𝄫',
      'C+7: C E G♯ B♭',
    ]);
  });

  it('stacks three 3rds: maj7 = M3 m3 M3, 7 = M3 m3 m3, m7 = m3 M3 m3, °7 = m3 m3 m3', () => {
    expect(stackView(n('C'), 'maj7').gaps.map((g) => g.name.quality)).toEqual(['major', 'minor', 'major']);
    expect(stackView(n('C'), 'dom7').gaps.map((g) => g.name.quality)).toEqual(['major', 'minor', 'minor']);
    expect(stackView(n('C'), 'm7').gaps.map((g) => g.name.quality)).toEqual(['minor', 'major', 'minor']);
    expect(stackView(n('C'), 'dim7').gaps.map((g) => g.name.quality)).toEqual(['minor', 'minor', 'minor']);
  });

  it.each(ROOTS.map((r) => [format(r), r] as const))('%s: every 7th stacks on strings 5–2 within the neck', (_r, r) => {
    for (const id of SEVENTHS) {
      const v = stackView(r, id);
      expect(v.notes.map((x) => x.string)).toEqual([5, 4, 3, 2]);
      expect(v.notes[0]!.fret).toBeGreaterThanOrEqual(MIN_ROOT_FRET);
      expect(Math.max(...v.notes.map((x) => x.fret))).toBeLessThanOrEqual(STACK_FRETS);
      expect(Math.min(...v.notes.map((x) => x.fret))).toBeGreaterThanOrEqual(0);
    }
  });
});

describe('step 2: the table (K4.3, K4.4)', () => {
  it('covers every chord in the core registry once', () => {
    const all = GROUPS.flatMap((g) => TABLE[g]);
    expect(new Set(all).size).toBe(all.length);
    expect(all).toHaveLength(19);
  });

  it('lights every chord tone on the neck with its degree: Dm7 = D F A C', () => {
    const v = tableView(n('D'), 'm7');
    expect(v.spelled).toEqual(['D', 'F', 'A', 'C']);
    expect(new Set(v.neck.map((x) => x.name))).toEqual(new Set(['D', 'F', 'A', 'C']));
    expect(new Set(v.neck.map((x) => x.degree))).toEqual(new Set(['1', 'b3', '5', 'b7']));
  });

  it('gives each degree a role', () => {
    expect(['1', 'b3', '5', 'b7', '9', '11', '2', '#5'].map(roleOf)).toEqual(['root', 'third', 'fifth', 'seventh', 'colour', 'colour', 'colour', 'fifth']);
  });
});

describe('step 3: open 7th and m11 chords (K4.5, K4.6)', () => {
  it('derives every open 7th and m11 shown', () => {
    expect(OPEN_SEVENTHS.map((c) => `${openView(c).symbol} ${shape(openView(c))}`)).toEqual([
      'E7 020100',
      'A7 x02020',
      'D7 xx0212',
      'G7 320001',
      'C7 x32310',
      'B7 x21202',
      'Am7 x02010',
      'Em7 020000',
      'Dm7 xx0211',
      'Cmaj7 x32000',
      'Gmaj7 320002',
      'Dmaj7 xx0222',
      'Amaj7 x02120',
      'Am11 x00010',
      'Em11 000000',
    ]);
  });

  it('finds the triad underneath: E7 → E, Am11 → Am, B7 → none open', () => {
    expect(baseTriadView({ root: n('E'), id: 'dom7' })!.symbol).toBe('E');
    expect(baseTriadView({ root: n('A'), id: 'm11' })!.symbol).toBe('Am');
    expect(baseTriadView({ root: n('B'), id: 'dom7' })).toBeNull();
  });

  it('moves the A-shape m11: Dm11 = x55565, Am11 up an octave at 12', () => {
    expect(shape(movableView(n('D'), 'm11'))).toBe('x55565');
    expect(movableView(n('D'), 'm11').notes.map((x) => x.degree)).toEqual(['1', '11', 'b7', 'b3', '5']);
    expect(new Set(tableView(n('C'), 'dom9').neck.map((x) => x.degree))).toEqual(new Set(['1', '3', '5', 'b7', '9']));
    expect(movableView(n('A'), 'm11').fret).toBe(12);
    for (const r of ROOTS) for (const id of MOVABLE) expect(Math.max(...movableView(r, id).notes.map((x) => x.fret))).toBeLessThanOrEqual(15);
  });
});

describe('step 4: inversions (K4.7)', () => {
  it('names and voices slash chords: C/E 032010, G/B x20003, D/F♯ 200232, Am/C x32210', () => {
    const c = INVERSION_CHORDS;
    expect([inversionView(c[0]!, '3'), inversionView(c[1]!, '3'), inversionView(c[2]!, '3'), inversionView(c[3]!, 'b3')].map((v) => `${v.symbol} ${shape(v)}`)).toEqual([
      'C/E 032010',
      'G/B x20003',
      'D/F♯ 200232',
      'Am/C x32210',
    ]);
  });

  it('offers at least root position and one inversion for every chord shown', () => {
    for (const c of INVERSION_CHORDS) {
      const opts = bassOptions(c);
      expect(opts[0]).toBe('1');
      expect(opts.length).toBeGreaterThanOrEqual(2);
    }
  });

  it('walks the bass down C B A G', () => {
    expect(WALKDOWN.map((w) => inversionView(w.chord, w.bass).notes[0]!.midi)).toEqual([48, 47, 45, 43]);
  });
});

describe('step 5: simplify (K4.8)', () => {
  it('strips G11 to G9, G7, G, naming what left at each step', () => {
    const rungs = ladder(LADDERS[0]!);
    expect(rungs.map((r) => r.symbol)).toEqual(['G11', 'G9', 'G7', 'G']);
    expect(rungs.map((r) => r.dropped)).toEqual([null, '11', '9', 'b7']);
    expect(rungs[0]!.midis.map((m) => m - rungs[0]!.midis[0]!)).toEqual([0, 4, 7, 10, 14, 17]);
  });

  it('ends every ladder on a triad', () => {
    for (const c of LADDERS) expect(ladder(c).at(-1)!.formula).toHaveLength(3);
  });
});
