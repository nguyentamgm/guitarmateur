import { midi, toneRole, type Chord, type ToneRole } from '../music';
import type { Box, FretNote } from '../fretboard';
import { choice, weightedChoice, type Rng } from './rng';
import type { LickParams } from './model';

export type Contour = 'ascend' | 'descend' | 'arch' | 'valley' | 'wave';

const CONTOURS: Contour[] = ['ascend', 'descend', 'arch', 'valley', 'wave'];

/** Level 1 favors mono-directional motion; higher levels spread weight to the shaped contours. */
const LEVEL_WEIGHTS: Record<LickParams['level'], Record<Contour, number>> = {
  1: { ascend: 4, descend: 4, arch: 1, valley: 1, wave: 0.5 },
  2: { ascend: 3, descend: 3, arch: 2, valley: 2, wave: 1 },
  3: { ascend: 2, descend: 2, arch: 2.5, valley: 2.5, wave: 2 },
  4: { ascend: 2, descend: 2, arch: 2.5, valley: 2.5, wave: 2.5 },
  5: { ascend: 1.5, descend: 1.5, arch: 2.5, valley: 2.5, wave: 3 },
};

export function pickContour(level: LickParams['level'], rng: Rng): Contour {
  const weights = LEVEL_WEIGHTS[level];
  return weightedChoice(
    rng,
    CONTOURS.map((c) => ({ item: c, weight: weights[c] })),
  );
}

/** Fallback chase order when the requested role has no box notes (e.g. sus chords). */
const ROLE_FALLBACK: ToneRole[] = ['3', '5', 'R'];

function candidatesForRole(box: Box, chord: Chord, role: ToneRole): FretNote[] {
  return box.notes.filter((n) => toneRole(n.pitch, chord) === role);
}

/**
 * A chord-tone note in the box for `role`, cascading role → 3 → 5 → R → any chord tone → any box
 * note, so generation always produces *something* even for exotic chord/scale combinations.
 */
export function pickChordTone(box: Box, chord: Chord, role: ToneRole, rng: Rng): FretNote {
  const order = [role, ...ROLE_FALLBACK.filter((r) => r !== role)];
  for (const r of order) {
    const cands = candidatesForRole(box, chord, r);
    if (cands.length) return choice(rng, cands);
  }
  const anyChordTone = box.notes.filter((n) => toneRole(n.pitch, chord) !== null);
  if (anyChordTone.length) return choice(rng, anyChordTone);
  return choice(rng, box.notes);
}

/** First note: any chord tone of the current chord, weighted to give the contour room to move. */
export function pickFirstNote(
  box: Box,
  chord: Chord,
  last: FretNote,
  contour: Contour,
  rng: Rng,
  prevLastMidi?: number,
): FretNote {
  const anyChordTone = box.notes.filter((n) => toneRole(n.pitch, chord) !== null);
  const pool = anyChordTone.length ? anyChordTone : box.notes;
  const lastMidi = midi(last.pitch);

  const weighted = pool.map((n) => {
    const d = midi(n.pitch) - lastMidi;
    let weight: number;
    switch (contour) {
      case 'ascend':
        weight = d < 0 ? 1 + Math.min(-d, 12) : 0.2;
        break;
      case 'descend':
        weight = d > 0 ? 1 + Math.min(d, 12) : 0.2;
        break;
      default:
        weight = 1 / (1 + Math.abs(d));
    }
    if (prevLastMidi !== undefined) {
      const distance = Math.abs(midi(n.pitch) - prevLastMidi);
      weight *= 1 / (1 + distance * 0.2);
    }
    return { item: n, weight };
  });
  return weightedChoice(rng, weighted);
}
