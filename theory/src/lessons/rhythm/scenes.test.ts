import { CELLS_PER_BAR, NOTE_CELLS, fillBar, formatStrum, pendulum } from '../../core/rhythm';
import {
  DOWN_STRINGS,
  DRILL_START_FRETS,
  LENGTH_CHOICES,
  NOTE_MIDI,
  STRUM_PRESET_IDS,
  UP_STRINGS,
  beatsText,
  fingerDrill,
  noteBeats,
  presetHits,
  slotStarts,
} from './scenes';

describe('step 2: lengths (K1.2)', () => {
  it('plays the examples on A3', () => {
    expect(NOTE_MIDI).toBe(57);
  });

  it('says beats the way players do', () => {
    expect(LENGTH_CHOICES.map(noteBeats)).toEqual(['4', '3', '2', '1', '½', '¼']);
    expect(beatsText(6)).toBe('1½');
    expect(beatsText(3)).toBe('¾');
  });

  it('finds the slot starting on each cell', () => {
    const starts = slotStarts(fillBar('dottedHalf'), CELLS_PER_BAR);
    expect(starts[0]).toBe(0);
    expect(starts[12]).toBe(1);
    expect(starts.filter((i) => i >= 0)).toHaveLength(2);
  });

  it('offers values that each fill the bar at least once', () => {
    for (const id of LENGTH_CHOICES) expect(NOTE_CELLS[id]).toBeLessThanOrEqual(CELLS_PER_BAR);
  });
});

describe('step 4: strumming (K1.4)', () => {
  it('has valid presets, every one hitting beat 1 with a down stroke', () => {
    for (const id of STRUM_PRESET_IDS) {
      const hits = presetHits(id);
      expect(hits).toHaveLength(8);
      expect(hits[0]).toBe(true);
      expect(pendulum(0)).toBe('down');
    }
    expect(formatStrum(presetHits('folk'))).toBe('D-DU-UDU');
  });

  it('strums down across all six strings and up across the top three', () => {
    expect(DOWN_STRINGS).toEqual([6, 5, 4, 3, 2, 1]);
    expect(UP_STRINGS).toEqual([3, 2, 1]);
  });
});

describe('step 5: finger drill (K0.8)', () => {
  it.each(DRILL_START_FRETS)('puts one finger per fret from fret %i, string 6 to 1', (start) => {
    const drill = fingerDrill(start);
    expect(drill).toHaveLength(24);
    expect(drill.slice(0, 4).map((n) => [n.string, n.fret, n.finger])).toEqual([
      [6, start, 1],
      [6, start + 1, 2],
      [6, start + 2, 3],
      [6, start + 3, 4],
    ]);
    expect(drill[23]).toMatchObject({ string: 1, fret: start + 3, finger: 4 });
    for (const n of drill) expect(n.fret - start + 1).toBe(n.finger);
  });
});
