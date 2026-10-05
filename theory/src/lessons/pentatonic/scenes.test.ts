import { SEQUENCE_IDS, homeFret, midiAt } from '../../core/fretboard';
import { MAJOR_KEY_TONICS, MINOR_KEY_TONICS, format, parseNote, pc, scaleNotes } from '../../core/music';
import {
  DRILL_BPM,
  MAJOR_KEYS,
  NECK_FRETS,
  PAIR_FRETS,
  QUIZ_POOL,
  VAMP_CELLS,
  answerFret,
  boxPair,
  boxes,
  crossRun,
  drillRun,
  judge,
  majorView,
  quizQuestion,
  quizView,
  samePos,
  scaleNeck,
  songChordSymbol,
  vampVoicing,
  type QuizQuestion,
} from './scenes';

const n = parseNote;
const range = (b: { minFret: number; maxFret: number }) => [b.minFret, b.maxFret];

describe('step 1: five boxes (K3.4)', () => {
  it('tiles A minor as in the knowledge base: 5–8, 7–10, 9–13, 12–15, 2–5', () => {
    expect(boxes().map(range)).toEqual([[5, 8], [7, 10], [9, 13], [12, 15], [2, 5]]);
  });

  it('gives each box 12 notes, two per string, lowest pitch first, all within the drawn neck', () => {
    for (const b of boxes()) {
      expect(b.notes).toHaveLength(12);
      for (const s of [1, 2, 3, 4, 5, 6]) expect(b.notes.filter((x) => x.string === s)).toHaveLength(2);
      b.notes.slice(1).forEach((x, i) => expect(x.midi).toBeGreaterThan(b.notes[i]!.midi));
      expect(b.maxFret).toBeLessThanOrEqual(NECK_FRETS);
    }
  });

  it('starts box 1 on the minor home on string 6', () => {
    const [b1] = boxes();
    expect(b1!.notes[0]).toMatchObject({ string: 6, fret: 5, name: 'A', isTonic: true, degree: '1' });
  });

  it('labels the neck with A minor pentatonic names and degrees only', () => {
    const names = new Set(scaleNotes(n('A'), 'minorPentatonic').map(format));
    for (const x of scaleNeck(n('A'))) {
      expect(names.has(x.name)).toBe(true);
      expect(['1', 'b3', '4', '5', 'b7']).toContain(x.degree);
    }
  });
});

describe('step 2: joining boxes (K3.5)', () => {
  it.each([1, 2, 3, 4, 5])('box %i and the next share six notes: its top note on each string', (k) => {
    const pair = boxPair(k);
    expect(pair.shared).toHaveLength(6);
    for (const s of [1, 2, 3, 4, 5, 6]) {
      const top = pair.from.notes.filter((x) => x.string === s).at(-1)!;
      const bottom = pair.to.notes.filter((x) => x.string === s)[0]!;
      expect(samePos(top, bottom)).toBe(true);
    }
    expect(pair.to.maxFret).toBeLessThanOrEqual(PAIR_FRETS);
    for (const x of pair.to.notes) expect(x.midi).toBe(midiAt(x));
  });

  it('moves box 1 up an octave after box 5 in A minor, and box 5 up after box 4', () => {
    expect(range(boxPair(5).to)).toEqual([5, 8]);
    expect(range(boxPair(4).to)).toEqual([14, 17]);
  });

  it('runs up one box and down the next: 24 notes, ending on the low note of the next box', () => {
    const pair = boxPair(1);
    const run = crossRun(pair);
    expect(run).toHaveLength(24);
    expect(run[11]).toEqual(pair.from.notes[11]);
    expect(run.at(-1)).toEqual(pair.to.notes[0]);
  });
});

describe('step 3: sequences (K3.6)', () => {
  it('plays groups of 3 in box 1 from the home note', () => {
    const run = drillRun(boxes()[0]!, 'threes', 'up');
    expect(run.slice(0, 6).map((x) => x.name)).toEqual(['A', 'C', 'D', 'C', 'D', 'E']);
  });

  it.each(SEQUENCE_IDS.map((id) => [id] as const))('%s: an even number of eighths so beats stay on the click', (id) => {
    for (const dir of ['up', 'down'] as const) expect(drillRun(boxes()[0]!, id, dir).length % 2).toBe(0);
  });

  it('starts slow', () => {
    expect(DRILL_BPM).toBe(60);
  });
});

describe('step 4: major keys (K3.3)', () => {
  it('lists the 12 major keys by home fret on string 6', () => {
    expect(MAJOR_KEYS.map((k) => homeFret(k))).toEqual([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11]);
    expect(MAJOR_KEYS.map(format)).toEqual(['E', 'F', 'F♯', 'G', 'A♭', 'A', 'B♭', 'B', 'C', 'D♭', 'D', 'E♭']);
  });

  it.each(MAJOR_KEY_TONICS.map((k) => [format(k), k] as const))('%s: box 1 is the minor shape 3 frets below the major home', (_k, k) => {
    const v = majorView(k);
    expect(v.box1.notes[0]).toMatchObject({ string: 6, fret: v.minorFret });
    expect(v.majorFret - v.minorFret).toBe(3);
    const major = v.box1.notes.find((x) => x.string === 6 && x.fret === v.majorFret)!;
    expect(major.isTonic).toBe(true);
    expect(major.name).toBe(format(k));
    expect(v.box1.maxFret).toBeLessThanOrEqual(NECK_FRETS);
    expect(v.notes.every((x) => ['1', '2', '3', '5', '6'].includes(x.degree))).toBe(true);
  });

  it('runs from the major home to its octave and back: 1 2 3 5 6 1 6 5 3 2 1', () => {
    const v = majorView(n('G'));
    expect(v.run.map((x) => x.degree)).toEqual(['1', '2', '3', '5', '6', '1', '6', '5', '3', '2', '1']);
    expect(v.run[0]!.name).toBe('G');
    expect(v.run[5]!.midi - v.run[0]!.midi).toBe(12);
  });

  it('spells major keys with their own names: B♭ major has E♭, not D♯', () => {
    const names = new Set(majorView(n('Bb')).notes.map((x) => x.name));
    expect(names.has('B♭')).toBe(true);
    expect(names.has('A♯')).toBe(false);
  });
});

describe('step 5: which shape? (K3.7)', () => {
  const q = (kind: QuizQuestion['kind'], tonic: string): QuizQuestion => ({ kind, tonic: n(tonic) });

  it('asks every minor key, every major key, and blues in every major key', () => {
    expect(QUIZ_POOL).toHaveLength(36);
    expect(QUIZ_POOL.filter((x) => x.kind === 'minor').map((x) => format(x.tonic))).toEqual(MINOR_KEY_TONICS.map(format));
  });

  it('puts box 1 on the root for minor and blues, 3 frets lower for major', () => {
    expect(answerFret(q('minor', 'A'))).toBe(5);
    expect(answerFret(q('blues', 'E'))).toBe(0);
    expect(answerFret(q('major', 'G'))).toBe(0);
    expect(answerFret(q('major', 'C'))).toBe(5);
  });

  it('judges a click on string 6, an octave up included, and names the usual slips', () => {
    expect(judge(q('minor', 'A'), 17)).toBe('right');
    expect(judge(q('blues', 'E'), 12)).toBe('right');
    expect(judge(q('major', 'G'), 3)).toBe('songRoot');
    expect(judge(q('minor', 'A'), 2)).toBe('majorTrick');
    expect(judge(q('blues', 'A'), 14)).toBe('majorTrick');
    expect(judge(q('minor', 'A'), 8)).toBe('other');
    expect(judge(q('major', 'C'), 2)).toBe('other');
  });

  it('names the vamp chord: Am, G, E7', () => {
    expect([q('minor', 'A'), q('major', 'G'), q('blues', 'E')].map(songChordSymbol)).toEqual(['Am', 'G', 'E7']);
  });

  it('voices the vamp chord from its formula, root on string 6', () => {
    expect(vampVoicing({ root: n('A'), id: 'minor' })).toEqual([45, 57, 60, 64]);
    expect(vampVoicing({ root: n('E'), id: 'dom7' })).toEqual([40, 52, 56, 59, 62]);
  });

  it.each(QUIZ_POOL.map((x) => [`${x.kind} ${format(x.tonic)}`, x] as const))('%s: the shown box starts where the answer says and fits the vamp loop', (_l, x) => {
    const v = quizView(x);
    expect(v.box1.notes[0]).toMatchObject({ string: 6, fret: answerFret(x) });
    expect(v.run[0]!.isTonic && pc(n(v.run[0]!.name.replace('♯', '#').replace('♭', 'b'))) === pc(x.tonic)).toBe(true);
    expect(v.run.length).toBeLessThanOrEqual(VAMP_CELLS);
  });

  it('never asks the same song twice in a row', () => {
    const first = quizQuestion(() => 0);
    for (let r = 0; r < 1; r += 0.05) {
      const next = quizQuestion(() => r, first);
      expect(next.kind === first.kind && pc(next.tonic) === pc(first.tonic)).toBe(false);
    }
  });
});
