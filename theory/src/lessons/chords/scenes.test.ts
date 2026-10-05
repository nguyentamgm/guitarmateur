import { STRINGS, midiAt } from '../../core/fretboard';
import { format, parseNote, pc } from '../../core/music';
import {
  BUILD_POOL,
  MIN_ROOT_FRET,
  OPEN_CHORDS,
  QUALITIES,
  ROOTS,
  STACK_FRETS,
  SUS_KINDS,
  buildQuestion,
  judgeBuild,
  openView,
  rootOnFive,
  stackView,
  toFind,
} from './scenes';

const n = parseNote;
const gapText = (g: { name: { quality: string; number: number } }) => `${g.name.quality} ${g.name.number}`;

describe('step 1: stacked 3rds (K4.1)', () => {
  it('stacks C major as a major 3rd under a minor 3rd, a perfect 5th overall', () => {
    const v = stackView(n('C'), 'major');
    expect(v.notes.map((x) => x.name)).toEqual(['C', 'E', 'G']);
    expect(v.stack.map(gapText)).toEqual(['major 3', 'minor 3']);
    expect(gapText(v.outer)).toBe('perfect 5');
    expect(v.notes.map((x) => x.string)).toEqual([5, 4, 3]);
  });

  it('turns the stack over for minor: minor 3rd under major 3rd', () => {
    expect(stackView(n('A'), 'minor').stack.map(gapText)).toEqual(['minor 3', 'major 3']);
  });

  it('puts every root on string 5 at fret 4 or higher, so every quality fits', () => {
    expect(ROOTS.map(format)).toEqual(['C', 'D♭', 'D', 'E♭', 'E', 'F', 'F♯', 'G', 'A♭', 'A', 'B♭', 'B']);
    for (const r of ROOTS) expect(rootOnFive(r).fret).toBeGreaterThanOrEqual(MIN_ROOT_FRET);
  });
});

describe('step 2: four qualities (K4.1)', () => {
  it('spells C, Cm, C+, C° as the knowledge base does', () => {
    expect(QUALITIES.map((q) => stackView(n('C'), q).spelled.join(' '))).toEqual(['C E G', 'C E♭ G', 'C E G♯', 'C E♭ G♭']);
    expect(QUALITIES.map((q) => stackView(n('C'), q).symbol)).toEqual(['C', 'Cm', 'C+', 'C°']);
  });

  it('spells F♯m with A and C♯, B♭° with D♭ and F♭', () => {
    expect(stackView(n('F#'), 'minor').spelled).toEqual(['F♯', 'A', 'C♯']);
    expect(stackView(n('Bb'), 'dim').spelled).toEqual(['B♭', 'D♭', 'F♭']);
  });

  it.each(ROOTS.map((r) => [format(r), r] as const))('%s: from major, minor and aug move one dot one fret, dim moves two; all fit the neck', (_r, r) => {
    const major = stackView(r, 'major').notes;
    const expected = { major: [], minor: ['b3'], aug: ['#5'], dim: ['b3', 'b5'] } as Record<string, string[]>;
    for (const q of QUALITIES) {
      const v = stackView(r, q);
      const moved = v.notes.filter((x, i) => x.fret !== major[i]!.fret);
      expect(moved.map((x) => x.degree)).toEqual(expected[q]);
      for (const m of moved) expect(Math.abs(m.fret - major[v.notes.indexOf(m)]!.fret)).toBe(1);
      expect(Math.max(...v.notes.map((x) => x.fret))).toBeLessThanOrEqual(STACK_FRETS);
      v.notes.forEach((x, i) => expect(pc(n(x.name.replace('♯', '#').replace('♭', 'b')))).toBe(midiAt(v.notes[i]!) % 12));
    }
  });
});

describe('step 3: sus chords (K4.1)', () => {
  it('replaces the 3rd with the 2 or the 4: Dsus2 D E A, Dsus4 D G A', () => {
    expect(SUS_KINDS.map((k) => stackView(n('D'), k).spelled.join(' '))).toEqual(['D E A', 'D F♯ A', 'D G A']);
    expect(stackView(n('D'), 'sus4').stack.map(gapText)).toEqual(['perfect 4', 'major 2']);
    expect(stackView(n('D'), 'sus2').stack.map(gapText)).toEqual(['major 2', 'perfect 4']);
  });
});

describe('step 4: open chords (K4.5)', () => {
  it('has an open shape for every chord shown, root in the bass, all tones in', () => {
    for (const c of OPEN_CHORDS) {
      const v = openView(c);
      expect(v.notes[0]!.degree).toBe('1');
      expect(new Set(v.notes.map((x) => x.degree)).size).toBe(3);
      expect(v.notes.length + v.muted.length).toBe(STRINGS.length);
    }
  });

  it('pairs E/Em, A/Am, D/Dm, and nothing for C or G (no open minor) or sus', () => {
    const partners = OPEN_CHORDS.filter((c) => openView(c).partner).map((c) => openView(c).symbol);
    expect(partners).toEqual(['A', 'E', 'D', 'Am', 'Em', 'Dm']);
  });

  it('moves only the 3rd between E and Em', () => {
    const e = openView({ root: n('E'), id: 'major' }).notes;
    const em = openView({ root: n('E'), id: 'minor' }).notes;
    const diff = e.filter((x, i) => x.fret !== em[i]!.fret);
    expect(diff.map((x) => [x.string, x.degree])).toEqual([[3, '3']]);
  });
});

describe('step 5: build it yourself', () => {
  it('asks six kinds on twelve roots, never the same twice in a row', () => {
    expect(BUILD_POOL).toHaveLength(72);
    const q = buildQuestion(() => 0);
    for (let r = 0; r < 1; r += 0.05) {
      const next = buildQuestion(() => r, q);
      expect(next.id === q.id && pc(next.root) === pc(q.root)).toBe(false);
    }
    expect(buildQuestion(() => 0.99, undefined, ['dim']).id).toBe('dim');
  });

  it('judges any octave of a chord tone, names misses by semitones', () => {
    const q = { root: n('Bb'), id: 'minor' as const };
    const root = rootOnFive(q.root);
    expect(judgeBuild(q, root)).toEqual({ kind: 'root' });
    // One string up is +5 semitones, two strings up +10: ♭3 sits 2 frets left, the 5th 3 frets left.
    expect(judgeBuild(q, { string: 4, fret: root.fret - 2 })).toEqual({ kind: 'tone', degree: 'b3' });
    expect(judgeBuild(q, { string: 3, fret: root.fret - 3 })).toEqual({ kind: 'tone', degree: '5' });
    expect(judgeBuild(q, { string: 1, fret: 1 })).toEqual({ kind: 'tone', degree: '5' });
    expect(judgeBuild(q, { string: 4, fret: root.fret - 1 })).toEqual({ kind: 'miss', semitones: 4 });
    expect(toFind(q)).toEqual(['b3', '5']);
  });
});
