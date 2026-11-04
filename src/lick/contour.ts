import { midi, toneRole, type Chord, type ToneRole } from '../music';
import type { Box, FretNote } from '../fretboard';
import { choice, weightedChoice, type Rng } from '@shared/core/rng';
import type { LickParams } from './model';

export type Contour = 'ascend' | 'descend' | 'arch' | 'valley' | 'wave' | 'peak';

const CONTOURS: Contour[] = ['ascend', 'descend', 'arch', 'valley', 'wave', 'peak'];

/** Level 1 favors mono-directional motion; higher levels spread weight to the shaped contours. */
const LEVEL_WEIGHTS: Record<LickParams['level'], Record<Contour, number>> = {
  1: { ascend: 4, descend: 4, arch: 1, valley: 1, wave: 0.5, peak: 1 },
  2: { ascend: 3, descend: 3, arch: 2, valley: 2, wave: 1, peak: 2 },
  3: { ascend: 2, descend: 2, arch: 2.5, valley: 2.5, wave: 2, peak: 3 },
  4: { ascend: 2, descend: 2, arch: 2.5, valley: 2.5, wave: 3, peak: 3 },
  5: { ascend: 1.5, descend: 1.5, arch: 2.5, valley: 2.5, wave: 4, peak: 3 },
};

function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t;
}

/**
 * Where a melody of this `contour` should be, `progress` (0..1) of the way from `from` to `to`, in
 * whatever unit those are (MIDI, or rungs of the box's ladder). `lift` is how far arch, valley and
 * peak reach past the endpoints; `swing` is the wave's amplitude.
 *
 * - **ascend / descend**: straight from one end to the other.
 * - **arch / valley**: up (down) to a turning point halfway, then back.
 * - **wave**: the straight line with one full rise and fall laid over it.
 * - **peak**: *peak and resolution* — climb most of the phrase to a high point (two thirds in, a
 *   little above an arch's), then fall quickly to the target; the long build is the tension, the
 *   fall the release.
 */
export function contourCurve(contour: Contour, from: number, to: number, progress: number, lift: number, swing: number): number {
  switch (contour) {
    case 'ascend':
    case 'descend':
      return lerp(from, to, progress);
    case 'arch': {
      const top = Math.max(from, to) + lift;
      return progress < 0.5 ? lerp(from, top, progress / 0.5) : lerp(top, to, (progress - 0.5) / 0.5);
    }
    case 'valley': {
      const bottom = Math.min(from, to) - lift;
      return progress < 0.5 ? lerp(from, bottom, progress / 0.5) : lerp(bottom, to, (progress - 0.5) / 0.5);
    }
    case 'wave':
      return lerp(from, to, progress) + Math.sin(progress * Math.PI * 2) * swing;
    case 'peak': {
      const AT = 2 / 3;
      const top = Math.max(from, to) + lift * 1.25;
      return progress < AT ? lerp(from, top, progress / AT) : lerp(top, to, (progress - AT) / (1 - AT));
    }
  }
}

export function pickContour(level: LickParams['level'], rng: Rng): Contour {
  const weights = LEVEL_WEIGHTS[level];
  return weightedChoice(
    rng,
    CONTOURS.map((c) => ({ item: c, weight: weights[c] })),
  );
}

/**
 * Lead lines live on the middle and top strings; licks parked on the low E and A strings sound
 * like a bass line. So endpoint choices lean upward: weight 0.3 on the lowest string of the box,
 * rising to 1.3 on the highest.
 */
function registerWeight(box: Box, n: FretNote): number {
  const top = Math.max(...box.notes.map((c) => c.string));
  return 0.3 + (top > 0 ? n.string / top : 1);
}

/**
 * The solo's arc over a progression of `count` licks: where lick `index` should sit, from 0 (low,
 * calm) to 1 (climax). It builds to a peak about two thirds of the way through, then settles back
 * part of the way for the last chord, so the progression reads as one story with a high point
 * rather than as separate exercises. `undefined` for a single lick, which has no arc to follow.
 */
export function progressionArc(index: number, count: number): number | undefined {
  if (count < 2) return undefined;
  const t = index / (count - 1);
  const PEAK = 0.7;
  return t <= PEAK ? t / PEAK : 1 - ((t - PEAK) / (1 - PEAK)) * 0.6;
}

/** Fallback chase order when the requested role has no box notes (e.g. sus chords). */
const ROLE_FALLBACK: ToneRole[] = ['3', '5', 'R'];

function candidatesForRole(box: Box, chord: Chord, role: ToneRole): FretNote[] {
  return box.notes.filter((n) => toneRole(n.pitch, chord) === role);
}

/**
 * A chord-tone note in the box for `role`, cascading role → 3 → 5 → R → any chord tone → any box
 * note, so generation always produces *something* even for exotic chord/scale combinations. With
 * `registerMidi`, the octave nearest that pitch is preferred (the solo's arc, see `progressionArc`).
 */
export function pickChordTone(box: Box, chord: Chord, role: ToneRole, rng: Rng, registerMidi?: number): FretNote {
  const order = [role, ...ROLE_FALLBACK.filter((r) => r !== role)];
  for (const r of order) {
    const cands = candidatesForRole(box, chord, r);
    if (cands.length) {
      return weightedChoice(
        rng,
        cands.map((n) => ({
          item: n,
          // The solo's arc, when there is one, decides the register outright; otherwise lean upward.
          weight:
            registerMidi === undefined
              ? registerWeight(box, n)
              : 1 / (1 + ((midi(n.pitch) - registerMidi) / 4) ** 2),
        })),
      );
    }
  }
  const anyChordTone = box.notes.filter((n) => toneRole(n.pitch, chord) !== null);
  if (anyChordTone.length) return choice(rng, anyChordTone);
  return choice(rng, box.notes);
}

/**
 * How strongly a first note `distance` semitones from the previous lick's last note is preferred.
 * When the chord changes, a solo that hangs together keeps a common tone (distance 0) or moves to
 * the nearest chord tone of the new chord (a step); jumping elsewhere restarts the story.
 */
export function voiceLeadingWeight(distance: number): number {
  if (distance === 0) return 8;
  if (distance <= 2) return 4;
  return 1 / (1 + 0.5 * distance);
}

/**
 * First note: any chord tone of the current chord, weighted to give the contour room to move and —
 * given the previous lick's last note — to voice-lead across the chord change.
 */
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
      case 'arch':
      case 'peak':
        weight = d < 0 ? 1 + Math.min(-d, 12) : 0.2;
        break;
      case 'valley':
        weight = d > 0 ? 1 + Math.min(d, 12) : 0.2;
        break;
      default:
        weight = 1 / (1 + Math.abs(d));
    }
    // Mid-solo, the chord change decides where the lick starts; the contour then shapes the path
    // from there. Only a stand-alone lick picks its start to suit the contour.
    if (prevLastMidi !== undefined) weight = voiceLeadingWeight(Math.abs(midi(n.pitch) - prevLastMidi));
    weight *= registerWeight(box, n);
    return { item: n, weight };
  });
  return weightedChoice(rng, weighted);
}
