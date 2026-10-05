import { midiAt } from '../../core/fretboard';
import { format, interval, parseNote, pc, scaleNotes, type NoteName } from '../../core/music';
import {
  INTERVAL_ROOT,
  INTERVAL_TONIC,
  KEYS,
  SHAPES,
  SHAPE_FRETS,
  SPELLING_FRETS,
  alterLabel,
  degreeWindow,
  formulaRun,
  intervalTargets,
  labelsFor,
  readInterval,
  scaleNeck,
  spellingView,
  stamp,
  wrongFourth,
} from './scenes';

const n = parseNote;
const byKey = KEYS.map((k) => [format(k), k] as const);
const inScale = (k: NoteName) => new Set(scaleNotes(k, 'major').map(format));

describe('keys', () => {
  it('offers the 12 major keys by pitch, named with the fewest accidentals', () => {
    expect(KEYS.map(format)).toEqual(['C', 'D♭', 'D', 'E♭', 'E', 'F', 'F♯', 'G', 'A♭', 'A', 'B♭', 'B']);
  });
});

describe('step 1: the formula (K2.1, K0.2)', () => {
  it.each(byKey)('%s: 2 2 1 2 2 2 1 along string 5, half steps at 3→4 and 7→8', (_k, k) => {
    const run = formulaRun(k);
    expect(run.steps.map((s) => s.size)).toEqual([2, 2, 1, 2, 2, 2, 1]);
    expect(run.steps.map((s, i) => (s.half ? i + 1 : 0)).filter(Boolean)).toEqual([3, 7]);
    expect(run.notes.map((x) => x.degree)).toEqual(['1', '2', '3', '4', '5', '6', '7', '8']);
    run.notes.slice(1).forEach((x, i) => expect(x.midi - run.notes[i]!.midi).toBe(run.steps[i]!.size));
    expect(run.notes.every((x) => x.string === 5)).toBe(true);
    expect(run.notes[0]!.name).toBe(format(k));
    expect(run.notes[7]!.fret).toBeLessThanOrEqual(23);
  });
});

describe('step 2: one letter each (K2.2, K0.5)', () => {
  it('spells F with B♭; the A♯ spelling doubles A and drops B', () => {
    const right = spellingView(n('F'), false);
    expect(right.notes).toEqual(['F', 'G', 'A', 'B♭', 'C', 'D', 'E']);
    expect(right.letters.every((c) => c.notes.length === 1)).toBe(true);
    const wrong = spellingView(n('F'), true);
    expect(format(wrong.wrong)).toBe('A♯');
    expect(wrong.letters.find((c) => c.letter === 'A')!.notes).toEqual(['A', 'A♯']);
    expect(wrong.letters.find((c) => c.letter === 'B')!.notes).toEqual([]);
  });

  it.each(byKey)('%s: the wrong fourth sounds the same and repeats the third letter', (_k, k) => {
    const scale = scaleNotes(k, 'major');
    const w = wrongFourth(k);
    expect(pc(w)).toBe(pc(scale[3]!));
    expect(w.letter).toBe(scale[2]!.letter);
  });

  it('shows E♯ in F♯ major, B♭ in F major, G♭ in D♭ major', () => {
    const names = (k: string) => new Set(scaleNeck(n(k), SPELLING_FRETS).map((x) => x.name));
    expect(names('F#').has('E♯')).toBe(true);
    expect(names('F#').has('F')).toBe(false);
    expect(names('F').has('B♭')).toBe(true);
    expect(names('F').has('A♯')).toBe(false);
    expect(names('Db').has('G♭')).toBe(true);
    expect(names('Db').has('F♯')).toBe(false);
  });

  it.each(byKey)('%s: every dot on the neck carries a name from the scale', (_k, k) => {
    const neck = scaleNeck(k, SPELLING_FRETS);
    const names = inScale(k);
    for (const x of neck) {
      expect(names.has(x.name), `${x.string}/${x.fret}`).toBe(true);
      expect(pc(n(x.name.replace('♯', '#').replace('♭', 'b')))).toBe(x.midi % 12);
    }
  });
});

describe('step 3: interval names (K2.3)', () => {
  it('puts home on C, string 5, and reaches up to its octave', () => {
    expect(INTERVAL_ROOT).toEqual({ string: 5, fret: 3 });
    const t = intervalTargets();
    expect(new Set(t.map((x) => x.semitones))).toEqual(new Set([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]));
    for (const x of t) expect(x.midi - midiAt(INTERVAL_ROOT)).toBe(x.semitones);
  });

  it('names a click by semitones, giving both names at 6', () => {
    expect([0, 1, 2, 3, 4, 5, 7, 8, 9, 10, 11, 12].map((s) => labelsFor(s))).toEqual(
      ['1', 'b2', '2', 'b3', '3', '4', '5', 'b6', '6', 'b7', '7', '8'].map((l) => [l]),
    );
    expect(labelsFor(6)).toEqual(['#4', 'b5']);
    expect(readInterval(INTERVAL_TONIC, '#4')).toMatchObject({ number: 4, quality: 'augmented', note: n('F#') });
    expect(readInterval(INTERVAL_TONIC, 'b5')).toMatchObject({ number: 5, quality: 'diminished', note: n('Gb') });
  });

  it('turns major into minor and perfect into diminished or augmented', () => {
    expect(alterLabel('3', -1)).toBe('b3');
    expect(alterLabel('3', 1)).toBe('#3');
    expect(alterLabel('b3', -1)).toBeNull();
    expect(alterLabel('5', -1)).toBe('b5');
    expect(alterLabel('5', 1)).toBe('#5');
    expect(alterLabel('1', -1)).toBeNull();
    expect(alterLabel('8', 1)).toBeNull();
    for (const l of ['2', '3', '6', '7']) expect(readInterval(INTERVAL_TONIC, alterLabel(l, -1)!).quality).toBe('minor');
    for (const l of ['4', '5', '8']) expect(readInterval(INTERVAL_TONIC, alterLabel(l, -1)!).quality).toBe('diminished');
  });

  it('spells the upper note by letter count', () => {
    expect(format(readInterval(INTERVAL_TONIC, 'b3').note)).toBe('E♭');
    expect(format(readInterval(INTERVAL_TONIC, '#5').note)).toBe('G♯');
    expect(format(readInterval(INTERVAL_TONIC, 'b6').note)).toBe('A♭');
    expect(format(readInterval(INTERVAL_TONIC, '8').note)).toBe('C');
  });
});

describe('step 4: interval shapes (K2.4, K0.4)', () => {
  it('stamps every shape at its exact semitone count, from every root that fits', () => {
    for (const shape of SHAPES) {
      for (const string of [6, 5, 4, 3, 2, 1] as const) {
        for (let fret = 0; fret <= SHAPE_FRETS; fret++) {
          const s = stamp({ string, fret }, shape);
          if (!s) continue;
          expect(midiAt(s.to) - midiAt(s.from), `${shape.label} ${string}/${fret}`).toBe(interval(shape.label).semitones);
          expect(s.from.string - s.to.string).toBe(shape.stringsUp);
          expect(s.to.fret).toBeLessThanOrEqual(SHAPE_FRETS);
        }
      }
    }
  });

  it('shifts one fret right across G→B', () => {
    const major3 = SHAPES.find((s) => s.label === '3')!;
    expect(stamp({ string: 4, fret: 5 }, major3)).toMatchObject({ offset: -1, crossesB: false });
    expect(stamp({ string: 3, fret: 5 }, major3)).toMatchObject({ offset: 0, crossesB: true });
    const octave = SHAPES.find((s) => s.label === '8')!;
    expect(stamp({ string: 4, fret: 5 }, octave)).toMatchObject({ offset: 3, crossesB: true });
    expect(stamp({ string: 2, fret: 5 }, octave)).toBeNull();
  });
});

describe('step 5: degrees in one position (K2.1, K2.3)', () => {
  it.each(byKey)('%s: five frets around home hold all seven degrees, spelled in the key', (_k, k) => {
    const w = degreeWindow(k);
    expect(w.maxFret - w.minFret).toBe(4);
    expect(w.minFret).toBeGreaterThanOrEqual(0);
    expect(w.notes.find((x) => x.string === 6 && x.fret === w.home.fret)).toMatchObject({ degree: '1', isTonic: true });
    expect(new Set(w.notes.map((x) => x.degree))).toEqual(new Set(['1', '2', '3', '4', '5', '6', '7']));
    const names = inScale(k);
    for (const x of w.notes) expect(names.has(x.name)).toBe(true);
  });

  it('moves E up to fret 12 and spells F♯ major with E♯', () => {
    expect(degreeWindow(n('E')).home.fret).toBe(12);
    expect(degreeWindow(n('F#')).notes.filter((x) => x.degree === '7').map((x) => x.name)).toContain('E♯');
  });
});
