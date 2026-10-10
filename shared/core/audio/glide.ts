/**
 * Pitch over time for one plucked note (K6.3, K6.4): a bend, a hammer-on or pull-off, a slide, a
 * vibrato. Pure data in seconds and semitones from the plucked pitch. The player turns it into
 * `playbackRate` changes on the same string sound, so the second note of a hammer-on is not picked
 * again; lessons draw the same points as a pitch curve.
 */

export interface PitchPoint {
  /** Seconds after the pluck. */
  readonly t: number;
  /** Semitones above (or below) the plucked pitch. */
  readonly semis: number;
  /** How the pitch gets here from the previous point: jump, or glide in a straight line. */
  readonly ramp: 'step' | 'linear';
}

export type Glide = readonly PitchPoint[];

/** Playback rate that raises a sound by `semis` semitones. */
export const rateOf = (semis: number): number => Math.pow(2, semis / 12);

/** The pitch, in semitones, at time `t`. Before the first point and after the last, it holds. */
export function semisAt(glide: Glide, t: number): number {
  let value = 0;
  for (let i = 0; i < glide.length; i++) {
    const p = glide[i]!;
    if (t < p.t) {
      if (p.ramp === 'step' || i === 0) return value;
      const prev = glide[i - 1]!;
      return prev.semis + ((p.semis - prev.semis) * (t - prev.t)) / (p.t - prev.t);
    }
    value = p.semis;
  }
  return value;
}

/** Last point's time: how long the movement lasts. */
export const glideEnd = (glide: Glide): number => glide.reduce((m, p) => Math.max(m, p.t), 0);

const hold = (t: number, semis: number): PitchPoint => ({ t, semis, ramp: 'step' });
const to = (t: number, semis: number): PitchPoint => ({ t, semis, ramp: 'linear' });

/** Pick, wait `at` seconds, push the string up `semis` over `rise` seconds and stay there. */
export function bend(semis: number, at = 0.12, rise = 0.16): Glide {
  return [hold(0, 0), hold(at, 0), to(at + rise, semis)];
}

/** A bend that comes back down to the fretted pitch after holding for `stay` seconds. */
export function bendRelease(semis: number, at = 0.12, rise = 0.16, stay = 0.3, fall = 0.14): Glide {
  return [...bend(semis, at, rise), hold(at + rise + stay, semis), to(at + rise + stay + fall, 0)];
}

/** Hammer-on (semis > 0) or pull-off (semis < 0): the pitch jumps without a new pick. */
export function legato(semis: number, at: number): Glide {
  return [hold(0, 0), hold(at, semis)];
}

/** Slide `semis` frets along the string, starting at `at`, taking `time` seconds. */
export function slide(semis: number, at: number, time = 0.1): Glide {
  return [hold(0, 0), hold(at, 0), to(at + time, semis)];
}

/** Vibrato: an even wobble of ±`depth` semitones, `rate` times a second, from `start` for `length` seconds. */
export function vibrato(start: number, length: number, depth = 0.35, rate = 5.5): Glide {
  const points: PitchPoint[] = [hold(0, 0), hold(start, 0)];
  const steps = Math.max(1, Math.round(length * rate * 4));
  for (let i = 1; i <= steps; i++) {
    const t = (i / steps) * length;
    points.push(to(start + t, depth * Math.sin(2 * Math.PI * rate * t)));
  }
  return points;
}
