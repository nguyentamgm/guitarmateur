import { semisAt } from '../../core/audio';
import { MAJOR_KEY_TONICS, format, parseNote } from '../../core/music';
import {
  BENDS,
  BLUES_KEYS,
  DEMOS,
  FULL_BENDS,
  LICK,
  LICK_BARS,
  LICK_CELLS,
  SHUFFLE_MIDI,
  bassMidi,
  bendQuestion,
  bendView,
  bluePhrase,
  bluesBoxes,
  bluesForm,
  bluesNeck,
  demoNotes,
  isLegato,
  lickNotes,
  lickPlan,
  planGlide,
  planSeconds,
  questionSemis,
  shuffleNotes,
  swingBar,
} from './scenes';

const n = parseNote;

describe('step 1: one extra note (K6.1)', () => {
  it('adds ♭5 (E♭) to A minor pentatonic and ♭3 (E♭) to C major pentatonic', () => {
    const minorBlue = new Set(bluesNeck('minor').filter((x) => x.isBlue).map((x) => `${x.name} ${x.degree}`));
    expect([...minorBlue]).toEqual(['E♭ b5']);
    const majorBlue = new Set(bluesNeck('major').filter((x) => x.isBlue).map((x) => `${x.name} ${x.degree}`));
    expect([...majorBlue]).toEqual(['E♭ b3']);
  });

  it('keeps the pentatonic boxes and puts the blue note inside them', () => {
    for (const kind of ['minor', 'major'] as const) {
      for (const b of bluesBoxes(kind)) {
        expect(b.notes.filter((x) => !x.isBlue)).toHaveLength(12);
        expect(b.notes.filter((x) => x.isBlue).length).toBeGreaterThan(0);
        for (const x of b.notes) expect(x.fret >= b.minFret && x.fret <= b.maxFret).toBe(true);
      }
    }
    expect(bluesBoxes('minor').map((b) => [b.minFret, b.maxFret])).toEqual([[5, 8], [7, 10], [9, 13], [12, 15], [2, 5]]);
  });

  it('plays 1 ♭3 4 ♭5 5 and back in minor, 1 2 ♭3 3 5 in major; the plain phrase skips the blue note', () => {
    const [m1] = bluesBoxes('minor');
    expect(bluePhrase(m1!, true).map((x) => x.degree).join(' ')).toBe('1 b3 4 b5 5 b5 4 b3 1');
    expect(bluePhrase(m1!, false).map((x) => x.degree).join(' ')).toBe('1 b3 4 5 4 b3 1');
    const [M1] = bluesBoxes('major');
    expect(bluePhrase(M1!, true).map((x) => x.degree).join(' ')).toBe('1 2 b3 3 5 3 b3 2 1');
  });

  it.each([1, 2, 3, 4, 5])('box %i: the phrase climbs by step and turns on the 5th', (i) => {
    for (const kind of ['minor', 'major'] as const) {
      const p = bluePhrase(bluesBoxes(kind)[i - 1]!, true);
      expect(p.length).toBeGreaterThanOrEqual(7);
      expect(p[0]!.isTonic).toBe(true);
      const top = p[(p.length - 1) / 2]!;
      expect(top.degree).toBe('5');
    }
  });
});

describe('step 2: shuffle (K1.5)', () => {
  it('places straight eighths on the half beat and a shuffle on the triplet grid', () => {
    expect(swingBar(0).map((b) => b.start)).toEqual([0, 1.5, 3, 4.5, 6, 7.5, 9, 10.5]);
    const shuffle = swingBar(1);
    shuffle.forEach((b) => {
      expect(b.start).toBeCloseTo(Math.round(b.start));
    });
    expect(shuffle.map((b) => Math.round(b.length))).toEqual([2, 1, 2, 1, 2, 1, 2, 1]);
    expect(SHUFFLE_MIDI).toBe(45);
  });
});

describe('step 3: the 12-bar blues (K5.4)', () => {
  it('spells the form in A as A7 A7 A7 A7 D7 D7 A7 A7 E7 D7 A7 A7', () => {
    expect(bluesForm(n('A')).map((b) => b.symbol).join(' ')).toBe('A7 A7 A7 A7 D7 D7 A7 A7 E7 D7 A7 A7');
    expect(bluesForm(n('A'), { quickChange: true, turnaround: true }).map((b) => b.symbol)[1]).toBe('D7');
    expect(bluesForm(n('A'), { turnaround: true }).at(-1)!.symbol).toBe('E7');
  });

  it('offers the 12 major keys by home fret', () => {
    expect(BLUES_KEYS).toHaveLength(12);
    expect(new Set(BLUES_KEYS.map(format))).toEqual(new Set(MAJOR_KEY_TONICS.map(format)));
  });

  it('plays a boogie: root with 5 5 6 6 ♭7 ♭7 6 6, low in the bass range', () => {
    const a7 = bluesForm(n('A'))[0]!.chord;
    expect(Array.from({ length: 8 }, (_, i) => shuffleNotes(a7, i)[1]! - shuffleNotes(a7, i)[0]!)).toEqual([7, 7, 9, 9, 10, 10, 9, 9]);
    expect([bassMidi(n('E')), bassMidi(n('A')), bassMidi(n('D')), bassMidi(n('Eb'))]).toEqual([40, 45, 50, 51]);
  });
});

describe('step 4: bends (K6.3)', () => {
  it('finds each bend in box 1 of A minor: D→E on G, G→A on B, C→D on e', () => {
    const [d, g, c, curl] = BENDS.map((b) => bendView(b));
    expect([d!.at.name, d!.at.string, d!.at.fret, d!.target.fret]).toEqual(['D', 3, 7, 9]);
    expect([g!.at.name, g!.at.string, g!.at.fret]).toEqual(['G', 2, 8]);
    expect([c!.at.name, c!.at.string, c!.at.fret]).toEqual(['C', 1, 8]);
    expect(curl!.targetMidi - curl!.at.midi).toBe(0.5);
  });

  it.each(MAJOR_KEY_TONICS.map((k) => [format(k), k] as const))('%s minor: each full bend lands on the next scale note', (_k, k) => {
    for (const b of FULL_BENDS) {
      const v = bendView(b, k);
      expect(v.at.degree).toBe(b.from);
      expect(v.targetMidi - v.at.midi).toBe(2);
    }
  });

  it('asks every full bend flat, full or sharp, never the same twice in a row', () => {
    const q = bendQuestion(() => 0);
    expect(questionSemis(q)).toBe(1.5);
    for (let r = 0; r < 1; r += 0.05) {
      const next = bendQuestion(() => r, q);
      expect(next.bend === q.bend && next.outcome === q.outcome).toBe(false);
    }
    expect(questionSemis({ bend: 0, outcome: 'sharp' })).toBe(2.5);
  });
});

describe('step 5: legato and the lick (K6.4)', () => {
  it('keeps every legato note on the string of the note before it', () => {
    for (const notes of [lickNotes(), ...DEMOS.map((d) => demoNotes(d))]) {
      notes.forEach((x, i) => {
        if (i > 0 && isLegato(x.event.technique)) expect(x.string, x.text).toBe(notes[i - 1]!.string);
      });
    }
  });

  it('writes the lick as tab in A: 7b9 r7 p5 5 h7 p5 5 5 /7~', () => {
    expect(lickNotes().map((x) => x.text).join(' ')).toBe('7b9 r7 p5 5 h7 p5 5 5 /7~');
    expect(lickNotes().at(-1)!.isTonic).toBe(true);
  });

  it('fills two bars without overlaps and plays at the start of each 4-bar line', () => {
    let next = 0;
    for (const e of LICK) {
      expect(e.cell).toBe(next);
      next = e.cell + e.cells;
    }
    expect(next).toBe(LICK_CELLS);
    expect(LICK_BARS).toEqual([0, 4, 8]);
  });

  it('turns hammer-ons, pull-offs, releases and slides into pitch moves of one pick', () => {
    const plans = lickPlan(lickNotes());
    expect(plans.map((p) => p.cell)).toEqual([0, 4, 7, 8]);
    const [bend, hammer, , slide] = plans;
    expect(semisAt(bend!.points, 1)).toBe(2);
    expect(semisAt(bend!.points, 2.75)).toBe(0);
    expect(semisAt(bend!.points, 3.5)).toBe(-2);
    expect(semisAt(hammer!.points, 1.5)).toBe(2);
    expect(semisAt(hammer!.points, 2.5)).toBe(0);
    expect(Math.abs(semisAt(slide!.points, 4) - 2)).toBeLessThanOrEqual(0.35 + 1e-9);
    expect(plans.reduce((sum, p) => sum + p.cells, 0)).toBe(LICK_CELLS);
  });

  it('holds a vibrato note steady until the wobble starts', () => {
    const [plan] = lickPlan(demoNotes('vibrato'));
    expect(semisAt(plan!.points, 1)).toBe(0);
    expect(semisAt(plan!.points, 2.9)).toBe(0);
    const [, , , slide] = lickPlan(lickNotes());
    expect(semisAt(slide!.points, 2)).toBe(2);
    expect(semisAt(slide!.points, 4.4)).toBe(2);
  });

  it('times the movement in seconds with swing: a shuffle delays off-beat moves', () => {
    const [bend] = lickPlan(lickNotes());
    const straight = planGlide(bend!, 60, 0);
    const swung = planGlide(bend!, 60, 1);
    const release = (g: typeof straight) => g.find((p, i) => i > 0 && p.ramp === 'step' && p.t > 0)!.t;
    expect(release(straight)).toBeCloseTo(1);
    expect(release(swung)).toBeCloseTo(1);
    const pull = (g: typeof straight) => g.find((p) => p.semis === -2)!.t;
    expect(pull(straight)).toBeCloseTo(1.5);
    expect(pull(swung)).toBeCloseTo(1 + 2 / 3);
    expect(planSeconds(bend!, 60, 0)).toBeCloseTo(2);
  });
});
