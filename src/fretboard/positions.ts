import { midi, pc, pitchAt, transpose, type Key } from '../music';
import { SCALES } from '../music';
import { scaleSpelling, type FretNote } from './neck';
import type { Tuning } from './tuning';

export interface Position {
  /** 0..N-1, keyed by the scale degree the box starts on. */
  index: number;
  notes: FretNote[];
  /** Fret range of the base-scale notes (decorations never widen it). */
  minFret: number;
  maxFret: number;
}

const mod = (n: number, m: number): number => ((n % m) + m) % m;

/**
 * Generate the N playable positions of a scale, one per starting degree, algorithmically — no
 * shape tables. For decorated scales (blues) the boxes come from the base scale and the added
 * tones fill inside them. See docs/plans/03-fretboard-engine.md for the walk.
 */
export function positions(tuning: Tuning, key: Key): Position[] {
  const def = SCALES[key.scaleId];
  const baseId = def.decoration?.baseScaleId ?? key.scaleId;
  const baseDef = SCALES[baseId];
  const baseKey: Key = { tonic: key.tonic, scaleId: baseId };
  const N = baseDef.intervals.length;
  const span = N >= 6 ? 4 : 3;
  const numStrings = tuning.strings.length;

  const spelling = scaleSpelling(baseKey);
  const openMidi = (s: number) => midi(tuning.strings[s]!);
  const startPc = (di: number) => pc(transpose(key.tonic, baseDef.intervals[mod(di, N)]!));

  /** Lowest fret ≥ 0 on the lowest string whose note is base-scale degree index `di`. */
  const anchorFret = (di: number): number => mod(startPc(di) - mod(openMidi(0), 12), 12);

  const makeNote = (s: number, fret: number): FretNote => {
    const m = openMidi(s) + fret;
    const entry = spelling.get(mod(m, 12))!;
    return {
      string: s,
      fret,
      pitch: pitchAt(entry.name, m),
      degree: entry.degree,
      isTonic: entry.degree === 1,
      isDecoration: false,
    };
  };

  const result: Position[] = [];
  for (let startIdx = 0; startIdx < N; startIdx++) {
    const anchor = anchorFret(startIdx);
    // A position is the scale notes inside a fret window [anchor-1, anchor+span] across all
    // strings. The window width (span+1) makes the fret-span invariant hold by construction, and
    // the tuning's per-string offsets (incl. the B string) fall out because we scan actual frets.
    const lo = Math.max(0, anchor - 1);
    const hi = anchor + span;
    const notes: FretNote[] = [];
    for (let s = 0; s < numStrings; s++) {
      for (let fret = lo; fret <= hi; fret++) {
        if (spelling.has(mod(openMidi(s) + fret, 12))) notes.push(makeNote(s, fret));
      }
    }

    const frets = notes.map((n) => n.fret);
    const minFret = Math.min(...frets);
    const maxFret = Math.max(...frets);
    result.push({ index: startIdx, notes, minFret, maxFret });
  }

  if (def.decoration) decorate(result, tuning, key);

  return result.sort((a, b) => a.minFret - b.minFret);
}

/** Fill each box with the scale's added tones, inside [minFret, maxFret], skipping occupied frets. */
function decorate(positionsArr: Position[], tuning: Tuning, key: Key): void {
  const def = SCALES[key.scaleId];
  if (!def.decoration) return;
  const fullIntervals = def.intervals;
  const tonicPc = pc(key.tonic);
  const openMidi = (s: number) => midi(tuning.strings[s]!);

  for (const iv of def.decoration.addedIntervals) {
    const addPc = mod(tonicPc + iv.semitones, 12);
    const fullDegree = fullIntervals.findIndex((x) => mod(tonicPc + x.semitones, 12) === addPc) + 1;
    const name = transpose(key.tonic, iv); // strict spelling of the added tone

    for (const pos of positionsArr) {
      const occupied = new Set(pos.notes.map((n) => `${n.string}:${n.fret}`));
      for (let s = 0; s < tuning.strings.length; s++) {
        for (let fret = pos.minFret; fret <= pos.maxFret; fret++) {
          if (mod(openMidi(s) + fret, 12) !== addPc) continue;
          if (occupied.has(`${s}:${fret}`)) continue;
          pos.notes.push({
            string: s,
            fret,
            pitch: pitchAt(name, openMidi(s) + fret),
            degree: fullDegree,
            isTonic: false,
            isDecoration: true,
          });
        }
      }
    }
  }
}
