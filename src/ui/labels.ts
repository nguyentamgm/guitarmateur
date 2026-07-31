/**
 * Pure text for UI labels. Kept out of the components so it can be unit-tested directly — the
 * components themselves only get smoke-tested (see `App.test.tsx`), and a label that quietly names
 * the wrong note is exactly the kind of bug a smoke test never catches.
 */

import { format, type NoteName, type Pitch, type ToneRole } from '../music';

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
