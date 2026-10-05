/**
 * What each scene of "Blues: blue notes, shuffle and bends" shows, derived from the core. Boxes
 * and blue notes come from `positions()`, the form from `twelveBar()`, chords from `bluesChord()`,
 * timing from `swingOnset()`, pitch movements from core/audio's glides. The bends, demos and the
 * lick name notes by their place in box 1 (degree, or index in pitch order), never by fret.
 */
import { semisAt, type Glide, type PitchPoint } from '../../core/audio';
import {
  allPositions,
  byHomeFret,
  midiAt,
  pitchAtPos,
  positions,
  type FretPos,
} from '../../core/fretboard';
import {
  BOOGIE,
  MAJOR_KEY_TONICS,
  bluesChord,
  chordSymbol,
  decorationDegrees,
  degreeOf,
  format,
  interval,
  mod,
  parseNote,
  pc,
  relativeMajorTonic,
  scaleNotes,
  twelveBar,
  type BluesDegree,
  type Chord,
  type DegreeLabel,
  type NoteName,
  type TwelveBarOptions,
} from '../../core/music';
import { swingLength, swingOnset } from '../../core/rhythm';

/** A minor blues: the lesson's key, the same as the pentatonic lessons. */
export const EXAMPLE_TONIC: NoteName = parseNote('A');
export const NECK_FRETS = 15;

export interface NeckNote extends FretPos {
  readonly midi: number;
  readonly name: string;
  readonly degree: DegreeLabel;
  readonly isTonic: boolean;
  /** The added blue note: ♭5 in minor blues, ♭3 in major blues (K6.1). */
  readonly isBlue: boolean;
}

// --- Step 1: one extra note (K6.1, K6.2) ---

export type BluesKind = 'minor' | 'major';
const SCALE_OF = { minor: 'minorBlues', major: 'majorBlues' } as const;

/** Minor blues on A; major blues on C, its relative major, so the boxes stay where they are. */
export const bluesTonic = (kind: BluesKind, minorTonic: NoteName = EXAMPLE_TONIC): NoteName =>
  kind === 'minor' ? minorTonic : relativeMajorTonic(minorTonic);

function neckNote(pos: FretPos, tonic: NoteName, kind: BluesKind): NeckNote {
  const scale = SCALE_OF[kind];
  const pitch = pitchAtPos(pos, scaleNotes(tonic, scale));
  const degree = degreeOf(tonic, pitch);
  return {
    ...pos,
    midi: midiAt(pos),
    name: format(pitch),
    degree,
    isTonic: pc(pitch) === pc(tonic),
    isBlue: decorationDegrees(scale).includes(degree),
  };
}

/** Every note of the blues scale from fret 0 to `maxFret`, blue notes flagged. */
export function bluesNeck(kind: BluesKind, maxFret = NECK_FRETS): NeckNote[] {
  const tonic = bluesTonic(kind);
  return scaleNotes(tonic, SCALE_OF[kind])
    .flatMap((n) => allPositions(n, maxFret))
    .map((pos) => neckNote(pos, tonic, kind));
}

export interface Box {
  readonly index: number;
  readonly minFret: number;
  readonly maxFret: number;
  /** The pentatonic box's 12 notes plus the blue notes inside it, lowest pitch first. */
  readonly notes: readonly NeckNote[];
}

export function bluesBoxes(kind: BluesKind): Box[] {
  const tonic = bluesTonic(kind);
  return positions({ tonic, scale: SCALE_OF[kind], notesPerString: 2 }).map((p) => ({
    index: p.index,
    minFret: p.minFret,
    maxFret: p.maxFret,
    notes: p.notes.map((n) => neckNote(n, tonic, kind)),
  }));
}

/**
 * A short phrase heard with and without the blue note: from the first home note in the box up to
 * the 5th above it, then back down. Without the blue note it is the plain pentatonic.
 */
export function bluePhrase(box: Box, withBlue: boolean): NeckNote[] {
  const notes = box.notes.filter((n) => withBlue || !n.isBlue);
  const first = notes.findIndex((n) => n.isTonic);
  const five = notes.findIndex((n, i) => i > first && n.degree === '5');
  const up = notes.slice(first, five < 0 ? undefined : five + 1);
  return [...up, ...up.slice(0, -1).reverse()];
}

// --- Step 2: triplets and shuffle (K1.5) ---

/** The note the shuffle drill plays: the open A string, damped short. */
export const SHUFFLE_MIDI = midiAt({ string: 5, fret: 0 });
export const EIGHTHS_PER_BAR = 8;

export interface SwingBlock {
  readonly eighth: number;
  /** In triplet cells (3 per beat), so a full shuffle lands on the grid lines. */
  readonly start: number;
  readonly length: number;
}

/** One bar of eighths placed on a triplet grid at a swing amount from 0 (straight) to 1 (shuffle). */
export function swingBar(swing: number): SwingBlock[] {
  return Array.from({ length: EIGHTHS_PER_BAR }, (_, eighth) => ({
    eighth,
    start: swingOnset(eighth, swing) * 3,
    length: swingLength(eighth, swing) * 3,
  }));
}

// --- Step 3: the 12-bar blues (K5.4) ---

/** The 12 major keys by home fret on string 6, as blues keys are found on the neck. */
export const BLUES_KEYS: readonly NoteName[] = byHomeFret(MAJOR_KEY_TONICS);

export interface Bar {
  readonly degree: BluesDegree;
  readonly chord: Chord;
  readonly symbol: string;
}

export function bluesForm(tonic: NoteName, opts: TwelveBarOptions = {}): Bar[] {
  return twelveBar(opts).map((degree) => {
    const chord = bluesChord(tonic, degree);
    return { degree, chord, symbol: chordSymbol(chord) };
  });
}

/** The chord root as a low bass note between low E (40) and the D♯ above it (51). */
export const bassMidi = (root: NoteName): number => 40 + mod(pc(root) - 4, 12);

/** MIDI notes the backing plays on eighth `eighth` (0–7) of a bar of `chord`. */
export function shuffleNotes(chord: Chord, eighth: number): number[] {
  const root = bassMidi(chord.root);
  return [root, root + interval(BOOGIE[mod(eighth, EIGHTHS_PER_BAR)]!).semitones];
}

export const BLUES_BPM = 84;

// --- Step 4: bends (K6.3) ---

export interface BendDef {
  readonly from: DegreeLabel;
  /** Degree reached: '3' for the curl, which stops short of it. */
  readonly to: DegreeLabel;
  readonly semis: number;
}

/** The natural bends of minor pentatonic: to the next scale note, and the blues curl. */
export const BENDS: readonly BendDef[] = [
  { from: '4', to: '5', semis: 2 },
  { from: 'b7', to: '1', semis: 2 },
  { from: 'b3', to: '4', semis: 2 },
  { from: 'b3', to: '3', semis: 0.5 },
];

export interface BendView {
  readonly def: BendDef;
  /** Where to bend: the highest note of degree `from` in box 1. */
  readonly at: NeckNote;
  /** Where the target sounds when fretted: same string, `semis` frets up (whole frets only). */
  readonly target: FretPos;
  readonly targetMidi: number;
}

const box1 = (tonic: NoteName = EXAMPLE_TONIC): Box => {
  const boxes = positions({ tonic, scale: 'minorPentatonic', notesPerString: 2 });
  return {
    ...boxes[0]!,
    notes: boxes[0]!.notes.map((n) => neckNote(n, tonic, 'minor')),
  };
};

export function bendView(def: BendDef, tonic: NoteName = EXAMPLE_TONIC): BendView {
  const at = box1(tonic).notes.filter((n) => n.degree === def.from).at(-1)!;
  return {
    def,
    at,
    target: { string: at.string, fret: at.fret + Math.round(def.semis) },
    targetMidi: at.midi + def.semis,
  };
}

export type BendOutcome = 'flat' | 'full' | 'sharp';
export const BEND_OUTCOMES: readonly BendOutcome[] = ['flat', 'full', 'sharp'];
/** How far off a flat or sharp bend lands: a quarter tone, easy to hear against the target. */
export const OUTCOME_SEMIS: Readonly<Record<BendOutcome, number>> = { flat: -0.5, full: 0, sharp: 0.5 };

export interface BendQuestion {
  /** Index into the full bends (the curl is never quizzed: it has no exact target). */
  readonly bend: number;
  readonly outcome: BendOutcome;
}

export const FULL_BENDS: readonly BendDef[] = BENDS.filter((b) => b.semis === 2);

export function bendQuestion(random: () => number, previous?: BendQuestion): BendQuestion {
  const all = FULL_BENDS.flatMap((_, bend) => BEND_OUTCOMES.map((outcome) => ({ bend, outcome })));
  const pool = previous ? all.filter((q) => q.bend !== previous.bend || q.outcome !== previous.outcome) : all;
  return pool[Math.min(pool.length - 1, Math.floor(random() * pool.length))]!;
}

/** Semitones the quiz bend actually reaches. */
export const questionSemis = (q: BendQuestion): number => FULL_BENDS[q.bend]!.semis + OUTCOME_SEMIS[q.outcome];

// --- Step 5: hammer-ons, pull-offs, slides, vibrato (K6.4) ---

export type Technique = 'pick' | 'hammer' | 'pull' | 'slide' | 'bend' | 'release';

export interface LickEvent {
  /** Eighth note it starts on, from 0. */
  readonly cell: number;
  /** Eighths it lasts. */
  readonly cells: number;
  /** The note, as its index in box 1, lowest pitch = 0. A bend's index is the fretted note. */
  readonly note: number;
  readonly technique: Technique;
  /** Semitones of a bend (or of the bend a release comes down from). */
  readonly bend?: number;
  /** Shake the note from halfway through. */
  readonly vibrato?: boolean;
}

/**
 * The lick: two bars, in box 1, written by box index so it moves with the key. Bend the 4 up to
 * the 5 and back, pull off to ♭3; hammer ♭7 to 1 and pull back; slide ♭7 up to the home note and
 * hold it with vibrato.
 */
export const LICK: readonly LickEvent[] = [
  { cell: 0, cells: 2, note: 7, technique: 'bend', bend: 2 },
  { cell: 2, cells: 1, note: 7, technique: 'release', bend: 2 },
  { cell: 3, cells: 1, note: 6, technique: 'pull' },
  { cell: 4, cells: 1, note: 4, technique: 'pick' },
  { cell: 5, cells: 1, note: 5, technique: 'hammer' },
  { cell: 6, cells: 1, note: 4, technique: 'pull' },
  { cell: 7, cells: 1, note: 2, technique: 'pick' },
  { cell: 8, cells: 1, note: 4, technique: 'pick' },
  { cell: 9, cells: 7, note: 5, technique: 'slide', vibrato: true },
];
export const LICK_CELLS = 16;
/** Bars of the 12-bar where the lick plays: the start of each 4-bar line. */
export const LICK_BARS: readonly number[] = [0, 4, 8];

export interface LickNote extends NeckNote {
  readonly event: LickEvent;
  /** What tab shows: '7b9', 'r7', 'p5', 'h7', '/7', '7~'. */
  readonly text: string;
}

/** Place lick events in box 1 of a key and write their tab. */
function toLickNotes(events: readonly LickEvent[], tonic: NoteName): LickNote[] {
  const notes = box1(tonic).notes;
  return events.map((event) => {
    const n = notes[event.note]!;
    const f = String(n.fret);
    const text = {
      pick: f,
      hammer: `h${f}`,
      pull: `p${f}`,
      slide: `/${f}`,
      bend: `${f}b${n.fret + (event.bend ?? 0)}`,
      release: `r${f}`,
    }[event.technique];
    return { ...n, event, text: event.vibrato ? `${text}~` : text };
  });
}

export const lickNotes = (tonic: NoteName = EXAMPLE_TONIC): LickNote[] => toLickNotes(LICK, tonic);

/** True for techniques that sound without a new pick: they carry on the previous note's sound. */
export const isLegato = (t: Technique): boolean => t !== 'pick' && t !== 'bend';

export interface PluckPlan {
  /** Eighth the pick happens on. */
  readonly cell: number;
  readonly midi: number;
  /** Eighths until the sound stops. */
  readonly cells: number;
  /** Pitch movement in eighths (not seconds) and semitones from the picked note. */
  readonly points: readonly PitchPoint[];
}

/** How long a bend takes to rise or fall, in eighths. */
const BEND_CELLS = 0.5;

/** Group the lick into picks: each legato note becomes a pitch movement of the note before it. */
export function lickPlan(notes: readonly LickNote[]): PluckPlan[] {
  const plans: { cell: number; midi: number; cells: number; points: PitchPoint[] }[] = [];
  for (const n of notes) {
    const e = n.event;
    const last = plans.at(-1);
    if (!isLegato(e.technique) || !last) {
      const points: PitchPoint[] = [{ t: 0, semis: 0, ramp: 'step' }];
      if (e.technique === 'bend') points.push({ t: BEND_CELLS, semis: e.bend ?? 2, ramp: 'linear' });
      plans.push({ cell: e.cell, midi: n.midi, cells: e.cells, points });
    } else {
      const at = e.cell - last.cell;
      const semis = n.midi - last.midi;
      if (e.technique === 'release') {
        last.points.push({ t: at, semis: semis + (e.bend ?? 2), ramp: 'step' }, { t: at + BEND_CELLS, semis, ramp: 'linear' });
      } else if (e.technique === 'slide') {
        last.points.push({ t: at - 0.4, semis: semisAt(last.points, at - 0.4), ramp: 'step' }, { t: at, semis, ramp: 'linear' });
      } else {
        last.points.push({ t: at, semis, ramp: 'step' });
      }
      last.cells = at + e.cells;
    }
    if (e.vibrato) {
      // Over the second half of the note: two wobbles per eighth (about 5–6 a second at a blues
      // tempo), ±0.35 semitone, eight points per wobble.
      const p = plans.at(-1)!;
      const end = e.cell - p.cell + e.cells;
      const base = semisAt(p.points, end);
      const from = end - e.cells / 2;
      const steps = Math.round((e.cells / 2) * 2 * 8);
      // Hold the pitch until the wobble starts: a linear point would otherwise ramp to it.
      p.points.push({ t: from, semis: base, ramp: 'step' });
      for (let i = 1; i <= steps; i++) {
        p.points.push({ t: from + i / 16, semis: base + 0.35 * Math.sin((2 * Math.PI * i) / 8), ramp: 'linear' });
      }
    }
  }
  return plans;
}

/** Turn a plan's eighths into seconds at a tempo and swing, ready for the player. */
export function planGlide(plan: PluckPlan, bpm: number, swing: number): Glide {
  const beat = 60 / bpm;
  const at = (cell: number) => {
    const whole = Math.floor(cell);
    const frac = cell - whole;
    const a = swingOnset(whole, swing);
    const b = swingOnset(whole + 1, swing);
    return (a + (b - a) * frac) * beat;
  };
  const start = at(plan.cell);
  return plan.points.map((p) => ({ ...p, t: at(plan.cell + p.t) - start }));
}

/** Seconds a plan's sound lasts. */
export const planSeconds = (plan: PluckPlan, bpm: number, swing: number): number =>
  (swingOnset(plan.cell + plan.cells, swing) - swingOnset(plan.cell, swing)) * (60 / bpm);

export type DemoId = 'hammer' | 'pull' | 'slide' | 'vibrato' | 'bendRelease';
export const DEMOS: readonly DemoId[] = ['hammer', 'pull', 'slide', 'vibrato', 'bendRelease'];

/** Each technique alone, as a two-bar lick fragment in box 1: the notes it uses and how it moves. */
export function demoNotes(id: DemoId, tonic: NoteName = EXAMPLE_TONIC): LickNote[] {
  const events: Record<DemoId, LickEvent[]> = {
    hammer: [
      { cell: 0, cells: 2, note: 6, technique: 'pick' },
      { cell: 2, cells: 4, note: 7, technique: 'hammer' },
    ],
    pull: [
      { cell: 0, cells: 2, note: 7, technique: 'pick' },
      { cell: 2, cells: 4, note: 6, technique: 'pull' },
    ],
    slide: [
      { cell: 0, cells: 2, note: 4, technique: 'pick' },
      { cell: 2, cells: 4, note: 5, technique: 'slide' },
    ],
    vibrato: [{ cell: 0, cells: 6, note: 5, technique: 'pick', vibrato: true }],
    bendRelease: [
      { cell: 0, cells: 3, note: 7, technique: 'bend', bend: 2 },
      { cell: 3, cells: 3, note: 7, technique: 'release', bend: 2 },
    ],
  };
  return toLickNotes(events[id], tonic);
}

