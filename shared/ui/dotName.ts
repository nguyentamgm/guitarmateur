/** A neck dot's accessible name (shared/ui/Fretboard.tsx), from words each app passes in its language. */
import type { DotTone, FretDot } from './Fretboard';

/** The words a dot's accessible name is built from, in the app's language. */
export interface DotWords {
  fret(n: number): string;
  string(n: number): string;
  /** Said for the root (tone `home` / `homeMajor`, or degree 1), after its degree. */
  readonly root: string;
  /** Said for a tone that means something on its own: a chord tone, the target, a blue note. */
  readonly tones: Partial<Record<DotTone, string>>;
}

/**
 * A dot's accessible name, "A, fret 5, string 6, 1, root": its note (or, without one, the text it
 * shows), where it is, its degree (and "root"), then its tone and mark. Holds what the dot shows, so a voice
 * user can say it.
 */
export function dotName(d: FretDot, shown: string | undefined, w: DotWords): string {
  const root = d.tone === 'home' || d.tone === 'homeMajor' || d.degree === '1';
  const tone = [d.tone && w.tones[d.tone], d.mark].filter(Boolean).join(' ');
  return [d.name ?? shown, w.fret(d.fret), w.string(d.string), d.degree, root && w.root, tone].filter(Boolean).join(', ');
}
