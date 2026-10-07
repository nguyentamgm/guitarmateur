import { semisAt } from '../../core/audio';
import { MAJOR_KEY_TONICS, format, parseNote, type NoteName } from '../../core/music';
import {
  BENDS,
  BLUES_KEYS,
  DEMOS,
  FULL_BENDS,
  LICK,
  LICK_BARS,
  LICK_CELLS,
  LICK_BOXES,
  LICK_FRETS,
  LICK_KEYS,
  SHUFFLE_MIDI,
  bendQuestion,
  bendView,
  bluePhrase,
  bluesBoxes,
  bluesForm,
  bluesNeck,
  decorate,
  demoNotes,
  generateLick,
  isLegato,
  lickBox,
  lickNotes,
  lickPlan,
  planGlide,
  planSeconds,
  questionSemis,
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

describe('step 5: a new lick each time (K6.4, K7.4)', () => {
  /** A seeded random in [0, 1), so the tests are repeatable. */
  const seeded = (seed: number) => {
    let x = seed;
    return () => ((x = (x * 16807) % 2147483647) - 1) / 2147483646;
  };
  const licks = LICK_KEYS.flatMap((tonic, k) =>
    LICK_BOXES.flatMap((box) => {
      const random = seeded(k * 5 + box);
      return Array.from({ length: 8 }, () => ({ tonic, box, notes: lickNotes(tonic, generateLick(random, tonic, box), box) }));
    }),
  );
  /** Every note of a box as a pick, lowest first: what lick indexes point at. */
  const boxNotes = (tonic: NoteName, box: number) =>
    lickNotes(tonic, Array.from({ length: 12 }, (_, i) => ({ cell: i, cells: 1, note: i, technique: 'pick' as const })), box);

  it('plays in the 12 minor keys, spelled from the core', () => {
    expect(LICK_KEYS.map(format)).toHaveLength(12);
    expect(LICK_KEYS.map(format)).toContain('C♯');
    expect(LICK_KEYS.map(format)).not.toContain('D♭');
  });

  it('fills two bars in order, and ends on a root held to the end with vibrato', () => {
    for (const { notes } of licks) {
      let next = 0;
      for (const x of notes) {
        expect(x.event.cell).toBeGreaterThanOrEqual(next);
        next = x.event.cell + x.event.cells;
      }
      expect(next).toBe(LICK_CELLS);
      const last = notes.at(-1)!;
      expect(last.isTonic).toBe(true);
      expect(last.event.vibrato).toBe(true);
      expect(notes.slice(0, -1).some((x) => x.event.vibrato)).toBe(false);
    }
  });

  it('plays a hammer-on or pull-off on one string, the right way, after a quick note', () => {
    for (const { notes } of licks) {
      notes.forEach((x, i) => {
        const e = x.event;
        if (!isLegato(e.technique)) return;
        const p = notes[i - 1]!;
        expect(x.string, x.text).toBe(p.string);
        if (e.technique === 'release') {
          // Back down to the fret the bend was played on.
          expect([p.event.technique, x.fret, x.midi]).toEqual(['bend', p.fret, p.midi]);
          return;
        }
        expect(p.event.technique, x.text).not.toBe('bend');
        if (e.technique === 'hammer') expect(x.midi).toBeGreaterThan(p.midi);
        if (e.technique === 'pull') expect(x.midi).toBeLessThan(p.midi);
        if (e.technique === 'slide') expect([x.fret - p.fret, p.fret > 0]).toEqual([2, true]);
        if (e.technique === 'hammer' || e.technique === 'pull') expect(p.event.cells).toBe(1);
      });
    }
  });

  it('bends a fretted note up a whole step to the next note of the box, at most once a bar', () => {
    for (const { tonic, box: index, notes } of licks) {
      const box = boxNotes(tonic, index);
      const bends = notes.filter((x) => x.event.technique === 'bend');
      for (const b of bends) {
        expect(b.fret).toBeGreaterThan(0);
        expect(box[b.event.note + 1]!.midi - b.midi).toBe(2);
        expect(b.text).toBe(`${b.fret}b${b.fret + 2}`);
      }
      expect(new Set(bends.map((b) => Math.floor(b.event.cell / 8))).size).toBe(bends.length);
    }
  });

  it('shows at least one bend, hammer-on or pull-off in every lick, and varies', () => {
    for (const { notes } of licks) expect(notes.some((x) => ['bend', 'hammer', 'pull'].includes(x.event.technique))).toBe(true);
    expect(new Set(licks.map(({ notes }) => notes.map((x) => x.text).join(' '))).size).toBeGreaterThan(400);
    // Over many licks every technique of the lesson shows up.
    expect(new Set(licks.flatMap(({ notes }) => notes.map((x) => x.event.technique)))).toEqual(new Set(['pick', 'bend', 'release', 'hammer', 'pull', 'slide']));
  });

  it('sounds each lick as picks with pitch moves, lasting the two bars', () => {
    for (const { notes } of licks) {
      const plans = lickPlan(notes);
      expect(plans.at(-1)!.cell + plans.at(-1)!.cells).toBe(LICK_CELLS);
    }
  });

  it('plays every box of every key on the neck drawn, the root in each', () => {
    for (const tonic of LICK_KEYS) {
      for (const b of LICK_BOXES) {
        const box = lickBox(tonic, b);
        expect(box.notes).toHaveLength(12);
        expect(box.maxFret).toBeLessThan(LICK_FRETS);
        expect(box.notes.some((x) => x.isTonic)).toBe(true);
      }
    }
    expect(LICK_FRETS).toBe(17);
  });

  it('releases a bend when the line steps back to the fretted note, so it is never picked bent', () => {
    for (const { notes } of licks) {
      notes.forEach((x, i) => {
        const next = notes[i + 1];
        if (x.event.technique === 'bend' && next && next.midi === x.midi && next !== notes.at(-1)) expect(next.event.technique).toBe('release');
      });
    }
    // A minor, box 1: index 7 is D (4) at fret 7 on string 3, index 8 is E (5).
    const events = decorate(
      [
        { index: 8, at: 0, length: 2 },
        { index: 7, at: 2, length: 1 },
        { index: 6, at: 3, length: 1 },
        { index: 5, at: 4, length: 4 },
      ],
      boxNotes(n('A'), 1),
    );
    expect(lickNotes(n('A'), events).map((x) => x.text).join(' ')).toBe('7b9 r7 p5 7~');
  });

  it('decorates by rule: a quick note then the same string up is a hammer-on', () => {
    const box = boxNotes(n('A'), 1);
    // A minor, box 1: index 3 is E (5) at fret 7 on string 5, index 2 is D at fret 5 on string 5.
    const events = decorate(
      [
        { index: 2, at: 0, length: 1 },
        { index: 3, at: 1, length: 1 },
        { index: 4, at: 2, length: 6 },
      ],
      box,
    );
    expect(events.map((e) => e.technique)).toEqual(['pick', 'hammer', 'pick']);
  });
});
