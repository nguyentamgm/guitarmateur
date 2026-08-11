/**
 * Pure text for UI labels. Kept out of the components so it can be unit-tested directly — the
 * components themselves only get smoke-tested (see `App.test.tsx`), and a label that quietly names
 * the wrong note is exactly the kind of bug a smoke test never catches.
 */

import { format, SCALES, type Interval, type NoteName, type Pitch, type ScaleId, type ToneRole } from '../music';

/** Diatonic (major-scale) semitone count for each letter degree, octave included. */
const DIATONIC_SEMITONES = [0, 2, 4, 5, 7, 9, 11, 12];

/**
 * Diatonic interval name for an interval, with accidentals relative to the major scale: P1 → '1',
 * m3 → '♭3', d5 → '♭5', M7 → '7', P8 → '8'. Used for labels like the legend's blue-note entry,
 * which must name the actual added tone of whichever decorated scale is selected (blues ♭5,
 * major blues ♭3) rather than a hardcoded one.
 */
export function intervalLabel(iv: Interval): string {
  const major = DIATONIC_SEMITONES[iv.degrees] ?? iv.semitones;
  const diff = iv.semitones - major;
  const acc = diff > 0 ? '♯'.repeat(diff) : diff < 0 ? '♭'.repeat(-diff) : '';
  return `${acc}${iv.degrees + 1}`;
}

/**
 * Legend entries for a scale's added ("blue note") tones. Registry-driven so every decorated scale
 * is explained — the blues ♭5 and the major-blues ♭3 both render with the dashed decoration ring,
 * and each must be named by its own interval, not a hardcoded one.
 */
export function decorationLegendEntries(scaleId: ScaleId): { type: 'decoration'; label: string }[] {
  const dec = SCALES[scaleId].decoration;
  if (!dec) return [];
  return dec.addedIntervals.map((iv) => ({ type: 'decoration' as const, label: `${intervalLabel(iv)} (blue note)` }));
}

/**
 * Duration glyphs as compact beat-fraction text (1 = quarter, ½ = eighth, 2 = half, ¼ = sixteenth)
 * rather than musical noteheads — legible at 11px across platforms/fonts. Covers every duration the
 * rhythm engine can emit (q/h/e/s/de/dq in `src/lick/rhythm.ts`).
 */
export function durationGlyph(beats: number): string {
  const table: Record<string, string> = { '2': '2', '1.5': '1½', '1': '1', '0.75': '¾', '0.5': '½', '0.25': '¼' };
  return table[String(beats)] ?? String(beats);
}

/** Human-readable name for a chord-tone role. */
export function roleLabel(role: ToneRole): string {
  switch (role) {
    case 'R':
      return 'Root';
    case '3':
      return '3rd';
    case '5':
      return '5th';
    case '7':
      return '7th';
  }
}

/** The note a lick ends on, as far as the badge is concerned. */
export interface LandingNote {
  pitch: Pitch;
  /** Its role in the chord, absent when the lick had to land on a non-chord tone. */
  role?: ToneRole;
}

/**
 * Text for a lick card's target badge: which chord tone was asked for, which one the lick actually
 * lands on when those differ, and — in brackets — the note it lands on.
 *
 * The bracketed note is the landing note, *not* the chord root. The two coincide whenever the
 * target role is the Root and the box contains it, which is most of the time and is why naming the
 * chord root here looked correct for so long. It stops being correct the moment `pickChordTone`
 * falls back: B♭ in D minor pentatonic has no root to land on (the scale omits scale degrees 2 and
 * 6), so the lick lands on the 3rd, D — and a badge reading "Root → 3rd (B♭)" says the 3rd is B♭.
 */
export function targetBadgeText(
  targetRole: ToneRole,
  landing: LandingNote | undefined,
  chordTonic: NoteName,
): string {
  const target = roleLabel(targetRole);
  const actual = landing?.role ? roleLabel(landing.role) : undefined;
  const arrow = actual && actual !== target ? ` → ${actual}` : '';
  // A landing note with no role still names itself honestly; only a card with no lick at all has
  // nothing to point at, and there the chord's own root is the best available stand-in.
  const note = format(landing?.pitch ?? chordTonic);
  return `target · ${target}${arrow} (${note})`;
}
