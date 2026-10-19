/**
 * Where the answer sits on the neck (#224): a five-fret window anchored on a root on string 6 or 5,
 * holding the note that was heard, with the active degrees in it. Pure; standard tuning.
 */
import { interval, mod, pc, type DegreeLabel, type Key } from '@shared/core/music';
import { DEGREES, degreeId } from './degrees';
import type { Question } from './questions';

export type GuitarString = 1 | 2 | 3 | 4 | 5 | 6;

/** Open strings in standard tuning, MIDI: E2 A2 D3 G3 B3 E4. */
export const OPEN_MIDI: Readonly<Record<GuitarString, number>> = {
  6: 40,
  5: 45,
  4: 50,
  3: 55,
  2: 59,
  1: 64,
};
const STRINGS: readonly GuitarString[] = [6, 5, 4, 3, 2, 1];

/**
 * The highest fret a root sits at, and how many frets a window spans: a window reaches fret 18 at
 * most, on the neck of any full-size guitar. Held to 15, the top notes (F major's 7 at E5) could
 * not be shown at the pitch heard.
 */
export const MAX_FRET = 15;
export const WINDOW_FRETS = 5;

export interface NeckSpot {
  readonly string: GuitarString;
  readonly fret: number;
  readonly midi: number;
}

export interface NeckDot extends NeckSpot {
  /** The degree id the note is in the key. */
  readonly degree: DegreeLabel;
  /** 'root' for the anchor, 'target' for the note heard, 'tone' for another active degree. */
  readonly role: 'root' | 'target' | 'tone';
}

export interface NeckWindow {
  /** Lowest and highest fret shown (0 is the open strings). */
  readonly lo: number;
  readonly hi: number;
  readonly root: NeckSpot;
  readonly target: NeckSpot;
  /** Every active degree in the window, the root and the target among them, low string first. */
  readonly dots: readonly NeckDot[];
}

/** The fret a degree sits at on one string, the root at fret 0 (level 14's answer): ♭3 is 3, 5 is 7. */
export const fretFromRoot = (d: DegreeLabel): number => mod(interval(d).semitones, 12);

/** The degree id a MIDI note is in the key. */
const degreeOf = (key: Key, midi: number): DegreeLabel =>
  DEGREES[mod(midi - pc(key.tonic), 12)]!.label;

/** The window a root at `fret` anchors: from a fret below it (the first finger's reach), five frets. */
const windowAt = (fret: number) => {
  const lo = Math.max(0, fret - 1);
  return { lo, hi: lo + WINDOW_FRETS - 1 };
};

/** The spots on the neck sounding `midi` within frets lo..hi. */
const spotsOf = (midi: number, lo: number, hi: number): NeckSpot[] =>
  STRINGS.flatMap((string) => {
    const fret = midi - OPEN_MIDI[string];
    return fret >= lo && fret <= hi ? [{ string, fret, midi }] : [];
  });

/**
 * The window for a question: a root on string 6 or 5 (frets 0–15) whose five frets hold the note
 * heard, at its pitch, choosing the root nearest in pitch to the tonic that note was heard against
 * (then the lower fret, then string 6), and the note's spot nearest that root. Only if no window
 * holds the pitch does it fall back to the same degree in another octave, nearest the note heard.
 */
export function neckWindow(key: Key, q: Question, active: readonly DegreeLabel[]): NeckWindow {
  const heardTonic = q.midi - interval(degreeId(q.degree)).semitones;
  const roots: NeckSpot[] = ([6, 5] as const).flatMap((string) =>
    Array.from({ length: MAX_FRET + 1 }, (_, fret) => ({
      string,
      fret,
      midi: OPEN_MIDI[string] + fret,
    })).filter((s) => mod(s.midi - pc(key.tonic), 12) === 0),
  );
  const byNearness = (a: NeckSpot, b: NeckSpot) =>
    Math.abs(a.midi - heardTonic) - Math.abs(b.midi - heardTonic) ||
    a.fret - b.fret ||
    b.string - a.string;
  const pick = (targetMidis: (root: NeckSpot) => number[]) => {
    for (const root of [...roots].sort(byNearness)) {
      const { lo, hi } = windowAt(root.fret);
      const spots = targetMidis(root).flatMap((m) => spotsOf(m, lo, hi));
      if (spots.length === 0) continue;
      const near = (s: NeckSpot) => Math.abs(s.fret - root.fret) + Math.abs(s.string - root.string);
      const target = spots.sort(
        (a, b) => Math.abs(a.midi - q.midi) - Math.abs(b.midi - q.midi) || near(a) - near(b),
      )[0]!;
      return { root, target, lo, hi };
    }
    return null;
  };
  const found =
    pick(() => [q.midi]) ??
    pick((root) =>
      Array.from({ length: 4 }, (_, o) => root.midi + mod(q.midi - root.midi, 12) + 12 * (o - 1)),
    )!;
  const on = new Set(active.map(degreeId));
  const dots: NeckDot[] = [];
  for (const string of STRINGS) {
    for (let fret = found.lo; fret <= found.hi; fret++) {
      const midi = OPEN_MIDI[string] + fret;
      const degree = degreeOf(key, midi);
      const isRoot = string === found.root.string && fret === found.root.fret;
      const isTarget = string === found.target.string && fret === found.target.fret;
      if (!isRoot && !isTarget && !on.has(degree)) continue;
      dots.push({
        string,
        fret,
        midi,
        degree,
        role: isTarget ? 'target' : isRoot ? 'root' : 'tone',
      });
    }
  }
  return { lo: found.lo, hi: found.hi, root: found.root, target: found.target, dots };
}
