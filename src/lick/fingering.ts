import { fingerForFret, type Box, type Finger } from '../fretboard';
import { isBendFrom } from './bends';
import type { Lick } from './model';

/** Fretting-hand finger assignment for one lick note (and its double-stop partner, if any). */
export interface NoteFingering {
  readonly finger: Finger | null;
  readonly partnerFinger?: Finger | null;
}

/**
 * Compute per-note fretting-hand finger suggestions (1..4, or `null` for open strings) for `lick`
 * played in `box`, matching `TabStaff`'s note ordering.
 */
export function lickFingering(lick: Lick, box: Box): NoteFingering[] {
  const notes = [...lick.notes].sort((a, b) => a.startBeat - b.startBeat);

  let effectiveBox = box;
  if (box.maxFret - box.minFret >= 5) {
    const fretted: number[] = [];
    for (const n of notes) {
      if (n.fret > 0 && n.technique !== 'bendHalf' && n.technique !== 'bendFull') {
        fretted.push(n.fret);
      }
      if (n.partner && n.partner.fret > 0) {
        fretted.push(n.partner.fret);
      }
    }
    if (fretted.length > 0) {
      const lickMin = Math.min(...fretted);
      const lickMax = Math.max(...fretted);
      if (lickMin > 0 && lickMax - lickMin <= 3) {
        effectiveBox = {
          notes: box.notes.filter((bn) => bn.fret === 0 || (bn.fret >= lickMin && bn.fret <= lickMax)),
          minFret: lickMin,
          maxFret: lickMax,
        };
      }
    }
  }

  const out: NoteFingering[] = [];
  for (let i = 0; i < notes.length; i++) {
    const n = notes[i]!;
    const prev = i > 0 ? notes[i - 1] : undefined;
    let finger: Finger | null;
    if (n.fret <= 0) {
      finger = null;
    } else if (
      isBendFrom(n, prev) ||
      ((n.technique === 'bendHalf' || n.technique === 'bendFull') &&
        prev !== undefined &&
        prev.string === n.string &&
        prev.fret > 0)
    ) {
      finger = out[i - 1]!.finger;
    } else if (
      n.technique === 'release' &&
      prev !== undefined &&
      prev.string === n.string &&
      (prev.technique === 'bendHalf' || prev.technique === 'bendFull')
    ) {
      finger = out[i - 1]!.finger;
    } else {
      finger = fingerForFret(effectiveBox, n.string, n.fret);
    }

    if (n.partner) {
      const partnerFinger =
        n.partner.fret <= 0 ? null : fingerForFret(effectiveBox, n.partner.string, n.partner.fret);
      out.push({ finger, partnerFinger });
    } else {
      out.push({ finger });
    }
  }
  return out;
}
