import { describe, expect, it } from 'vitest';
import {
  format,
  mod,
  parseNote,
  pc,
  sameNote,
  scaleNotes,
  type Key,
  type NoteName,
} from '@shared/core/music';
import { midiOf, noteOf } from './degrees';
import { RESOLUTION_NOTE_BEATS, resolution, resolutionNoteSeconds } from './resolution';

const key = (tonic: string, mode: Key['mode']): Key => ({ tonic: parseNote(tonic), mode });
const names = (k: Key, degree: string, midi: number) =>
  resolution(k, degree, midi).map((s) => `${format(s.pitch)}${s.pitch.octave}`);

/** The issue's tables (#215), verbatim: each note and the walk it resolves along. */
const MAJOR: Record<string, string> = {
  '1': '1',
  '♭2': '♭2 1',
  '2': '2 1',
  '♭3': '♭3 2 1',
  '3': '3 2 1',
  '4': '4 3 2 1',
  '♯4': '♯4 5 6 7 1',
  '5': '5 6 7 1',
  '♭6': '♭6 6 7 1',
  '6': '6 7 1',
  '♭7': '♭7 7 1',
  '7': '7 1',
};
const MINOR: Record<string, string> = {
  '1': '1',
  '♭2': '♭2 1',
  '2': '2 1',
  '♭3': '♭3 2 1',
  '3': '3 ♭3 2 1',
  '4': '4 ♭3 2 1',
  '♭5': '♭5 4 ♭3 2 1',
  '5': '5 ♭6 ♭7 1',
  '♭6': '♭6 ♭7 1',
  '6': '6 ♭7 1',
  '♭7': '♭7 1',
  '7': '7 1',
};
const TABLES = { major: MAJOR, minor: MINOR } as const;
const ascii = (label: string) => label.replace('♭', 'b').replace('♯', '#');

/** Several keys per mode: naturals, sharps, flats, and the six-accidental ones. */
const KEYS: Key[] = [
  ...['C', 'G', 'B', 'F♯', 'D♭', 'B♭'].map((t) => key(t, 'major')),
  ...['A', 'E', 'C♯', 'G♯', 'E♭', 'F'].map((t) => key(t, 'minor')),
];
const keyName = (k: Key) => `${format(k.tonic)} ${k.mode}`;
const OCTAVE = 4;

/** The key's scale, from the shared registry: the oracle the walk's spelling is checked against. */
const scaleOf = (k: Key) => scaleNotes(k.tonic, k.mode === 'major' ? 'major' : 'naturalMinor');
const inScale = (k: Key, n: NoteName) => scaleOf(k).some((m) => sameNote(m, n));

/** Every row of both tables in every key, the note sounding in OCTAVE above the tonic. */
const CASES = KEYS.flatMap((k) =>
  Object.entries(TABLES[k.mode]).map(([note, walk]) => {
    const degrees = walk.split(' ').map(ascii);
    const start = midiOf(k, degrees[0]!, OCTAVE);
    // The table's walk goes up when it reaches the tonic from 7 or b7.
    const up = ['7', 'b7'].includes(degrees[degrees.length - 2] ?? '');
    const steps = resolution(k, degrees[0]!, start);
    return { name: `${keyName(k)} ${note}`, k, degrees, start, up, steps };
  }),
);
const eachCase = it.each(CASES.map((c) => [c.name, c] as const));

describe("resolution, the issue's tables", () => {
  eachCase('%s resolves as the table says, degrees and pitches', (_, c) => {
    const { k, degrees, up, steps } = c;
    expect(steps.map((s) => s.degree)).toEqual(degrees);
    // Every note in OCTAVE, the tonic's; the closing tonic of an upward walk an octave higher.
    const last = degrees.length - 1;
    const midis = degrees.map((d, i) => midiOf(k, d, up && i === last ? OCTAVE + 1 : OCTAVE));
    expect(steps.map((s) => s.midi)).toEqual(midis);
    expect(steps.map((s) => format(s.pitch))).toEqual(degrees.map((d) => format(noteOf(k, d))));
  });
});

describe('resolution, over every row in every key', () => {
  eachCase('%s ends on the tonic: below the note, or an octave above that', (_, c) => {
    const { k, start, up, steps } = c;
    const last = steps[steps.length - 1]!;
    expect(last.degree).toBe('1');
    expect(sameNote(last.pitch, k.tonic)).toBe(true);
    expect(mod(last.midi, 12)).toBe(pc(k.tonic));
    expect(last.midi).toBe(midiOf(k, '1', OCTAVE) + (up ? 12 : 0));
    expect(last.midi >= start).toBe(up || steps.length === 1);
  });

  eachCase('%s moves one way, a half or whole step at a time', (_, c) => {
    const moves = c.steps.slice(1).map((s, i) => s.midi - c.steps[i]!.midi);
    for (const m of moves) expect(Math.abs(m)).toBeGreaterThanOrEqual(1);
    for (const m of moves) expect(Math.abs(m)).toBeLessThanOrEqual(2);
    expect(new Set(moves.map(Math.sign)).size).toBeLessThanOrEqual(1);
  });

  eachCase("%s walks the key's own scale notes after the first", (_, c) => {
    for (const s of c.steps.slice(1)) expect(inScale(c.k, s.pitch), format(s.pitch)).toBe(true);
  });
});

describe('resolution', () => {
  it('walks down to the tonic below, or up to the tonic an octave above it', () => {
    const c = key('C', 'major');
    expect(names(c, '4', 65)).toEqual(['F4', 'E4', 'D4', 'C4']);
    expect(names(c, '#4', 66)).toEqual(['F♯4', 'G4', 'A4', 'B4', 'C5']);
    expect(resolution(c, '#4', 66).map((s) => s.midi)).toEqual([66, 67, 69, 71, 72]);
    expect(names(key('A', 'minor'), 'b5', 75)).toEqual(['E♭5', 'D5', 'C5', 'B4', 'A4']);
  });

  it('takes the tritone up in major (#4 → 5) and down in minor (b5 → 4), either label', () => {
    for (const k of KEYS) {
      const start = midiOf(k, '#4', OCTAVE);
      for (const label of ['#4', 'b5']) {
        const [first, second] = resolution(k, label, start);
        expect(first!.degree).toBe(k.mode === 'major' ? '#4' : 'b5');
        expect(second!.degree).toBe(k.mode === 'major' ? '5' : '4');
        expect(second!.midi - start).toBe(k.mode === 'major' ? 1 : -1);
      }
    }
  });

  it('moves a note outside the scale a half step into the scale first', () => {
    const c = key('C', 'major');
    expect(names(c, 'b6', 68)).toEqual(['A♭4', 'A4', 'B4', 'C5']);
    expect(names(c, 'b2', 61)).toEqual(['D♭4', 'C4']);
    expect(names(key('A', 'minor'), '3', 73)).toEqual(['C♯5', 'C5', 'B4', 'A4']);
    expect(names(key('A', 'minor'), '7', 80)).toEqual(['G♯5', 'A5']);
    const outside = CASES.filter((c) => !inScale(c.k, c.steps[0]!.pitch));
    expect(outside).toHaveLength(KEYS.length * 5);
    for (const c of outside) expect(Math.abs(c.steps[1]!.midi - c.start), c.name).toBe(1);
  });

  it('walks from the note where it sounds, below the tonic too', () => {
    expect(names(key('C', 'major'), '5', 55)).toEqual(['G3', 'A3', 'B3', 'C4']);
    expect(names(key('E', 'minor'), '5', 47)).toEqual(['B2', 'C3', 'D3', 'E3']);
    expect(names(key('E', 'minor'), '4', 45)).toEqual(['A2', 'G2', 'F♯2', 'E2']);
  });

  it('resolves degree 1 to itself', () => {
    const tonic = { degree: '1', pitch: { letter: 'C', alter: 0, octave: 4 }, midi: 60 };
    expect(resolution(key('C', 'major'), '1', 60)).toEqual([tonic]);
    for (const c of CASES.filter((x) => x.degrees[0] === '1')) expect(c.steps).toHaveLength(1);
  });

  it('rejects a MIDI note that is not the degree in the key', () => {
    expect(() => resolution(key('C', 'major'), '5', 66)).toThrow(RangeError);
    expect(midiOf(key('C', 'major'), '5', 4)).toBe(67);
  });
});

describe('resolutionNoteSeconds', () => {
  it('is an eighth note at the cadence tempo, clamped like the cadence', () => {
    expect(RESOLUTION_NOTE_BEATS).toBe(0.5);
    expect(resolutionNoteSeconds(120)).toBe(0.25);
    expect(resolutionNoteSeconds(10)).toBe(0.75);
    expect(resolutionNoteSeconds(1000)).toBe(0.15);
  });
});
