import {
  CELLS_PER_BAR,
  NOTE_CELLS,
  NOTE_VALUES,
  beatSeconds,
  cellSeconds,
  clampBpm,
  countBar,
  fillBar,
  formatStrum,
  isBeat,
  lengthInBeats,
  parseStrum,
  pendulum,
  slotsCells,
  strumDelays,
  toggleRest,
  valueOfLength,
  type Syllable,
  countTriplets,
  swingDelay,
  swingLength,
  swingOnset,
  TRIPLET_CELLS,
} from '.';

const say = (s: Syllable) => (s.kind === 'beat' ? String(s.n) : s.kind);

describe('tempo (K1.1)', () => {
  it('turns BPM into seconds per beat and per cell', () => {
    expect(beatSeconds(60)).toBe(1);
    expect(beatSeconds(120)).toBe(0.5);
    expect(cellSeconds(120, 4)).toBe(0.125);
  });

  it('keeps tempo within the offered range, whole numbers only', () => {
    expect(clampBpm(10)).toBe(40);
    expect(clampBpm(999)).toBe(200);
    expect(clampBpm(92.6)).toBe(93);
  });
});

describe('note lengths (K1.2)', () => {
  it('matches the knowledge base in beats', () => {
    expect(NOTE_VALUES.map(lengthInBeats)).toEqual([4, 3, 2, 1.5, 1, 0.5, 0.25]);
  });

  it.each(NOTE_VALUES)('fills a bar of %s back to back, with one rest for any leftover', (id) => {
    const bar = fillBar(id);
    expect(slotsCells(bar)).toBe(CELLS_PER_BAR);
    bar.forEach((s, i) => expect(s.start).toBe(i === 0 ? 0 : bar[i - 1]!.start + bar[i - 1]!.length));
    const notes = bar.filter((s) => !s.rest);
    expect(notes.every((s) => s.length === NOTE_CELLS[id])).toBe(true);
    expect(bar.filter((s) => s.rest).length).toBeLessThanOrEqual(1);
  });

  it('leaves a quarter rest after a dotted half, and two eighths after two dotted quarters', () => {
    expect(fillBar('dottedHalf')).toEqual([
      { start: 0, length: 12, rest: false },
      { start: 12, length: 4, rest: true },
    ]);
    expect(fillBar('dottedQuarter').map((s) => [s.length, s.rest])).toEqual([
      [6, false],
      [6, false],
      [4, true],
    ]);
  });

  it('names every length a bar can hold, the leftover rests included', () => {
    for (const id of NOTE_VALUES) {
      expect(valueOfLength(NOTE_CELLS[id])).toBe(id);
      for (const s of fillBar(id)) expect(valueOfLength(s.length)).toBeDefined();
    }
    expect(valueOfLength(5)).toBeUndefined();
  });

  it('turns a note into a rest of the same length and back', () => {
    const bar = fillBar('quarter');
    const rested = toggleRest(bar, 1);
    expect(rested[1]).toEqual({ start: 4, length: 4, rest: true });
    expect(toggleRest(rested, 1)).toEqual(bar);
    expect(slotsCells(rested)).toBe(16);
  });
});

describe('counting (K1.3)', () => {
  it('counts beats, eighths and sixteenths', () => {
    expect(countBar(1).map(say).join(' ')).toBe('1 2 3 4');
    expect(countBar(2).map(say).join(' ')).toBe('1 and 2 and 3 and 4 and');
    expect(countBar(4).map(say).join(' ')).toBe('1 e and a 2 e and a 3 e and a 4 e and a');
  });

  it('marks the cells that start a beat', () => {
    expect([0, 1, 2, 3, 4].map((c) => isBeat(c, 4))).toEqual([true, false, false, false, true]);
    expect([0, 1, 2].map((c) => isBeat(c, 2))).toEqual([true, false, true]);
  });
});

describe('strumming (K1.4)', () => {
  it('swings down on beats and up on "and"s', () => {
    expect([0, 1, 2, 3].map(pendulum)).toEqual(['down', 'up', 'down', 'up']);
  });

  it('parses and prints patterns', () => {
    expect(parseStrum('D-DU-UDU')).toEqual([true, false, true, true, false, true, true, true]);
    expect(formatStrum(parseStrum('D-DU-UDU'))).toBe('D-DU-UDU');
    expect(formatStrum(parseStrum('D-D- D-D-'))).toBe('D-D-D-D-');
  });

  it('rejects a stroke against the pendulum or a wrong length', () => {
    expect(() => parseStrum('U-DU-UDU')).toThrow(SyntaxError);
    expect(() => parseStrum('DD------')).toThrow(SyntaxError);
    expect(() => parseStrum('D-D')).toThrow(RangeError);
  });

  it('meets the thick strings first going down, the thin ones first going up', () => {
    expect(strumDelays([6, 5, 4], 'down', 0.01)).toEqual([
      { item: 6, delay: 0 },
      { item: 5, delay: 0.01 },
      { item: 4, delay: 0.02 },
    ]);
    expect(strumDelays([6, 5, 4], 'up', 0.01).map((d) => d.item)).toEqual([4, 5, 6]);
  });
});

describe('triplets and swing (K1.5)', () => {
  it('counts a bar of triplets: 1 trip let 2 trip let …', () => {
    const words = countTriplets().map((s) => (s.kind === 'beat' ? String(s.n) : s.kind));
    expect(words).toEqual(['1', 'trip', 'let', '2', 'trip', 'let', '3', 'trip', 'let', '4', 'trip', 'let']);
    expect(words).toHaveLength(TRIPLET_CELLS);
  });

  it('puts the "and" halfway when straight and on the last triplet third at full swing', () => {
    expect(swingOnset(1, 0)).toBe(0.5);
    expect(swingOnset(1, 1)).toBeCloseTo(2 / 3);
    expect(swingOnset(3, 1)).toBeCloseTo(1 + 2 / 3);
    expect(swingOnset(4, 1)).toBe(2);
    expect(swingOnset(1, 0.5)).toBeCloseTo(0.5 + 1 / 12);
  });

  it('plays long–short at full swing and keeps every beat the same length', () => {
    expect(swingLength(0, 1)).toBeCloseTo(2 / 3);
    expect(swingLength(1, 1)).toBeCloseTo(1 / 3);
    for (const s of [0, 0.3, 1]) expect(swingLength(0, s) + swingLength(1, s)).toBeCloseTo(1);
  });

  it('clamps the swing amount and delays only the off-beats', () => {
    expect(swingOnset(1, 5)).toBeCloseTo(2 / 3);
    expect(swingOnset(1, -1)).toBe(0.5);
    expect(swingDelay(0, 1, 60)).toBe(0);
    expect(swingDelay(1, 1, 60)).toBeCloseTo(1 / 6);
  });
});
