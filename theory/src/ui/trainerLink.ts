/**
 * A link that opens the practice app (guitarmateur.com/) on a key and a chord progression, so a
 * learner can practise licks over what a lesson just taught. It writes the practice app's share
 * format (`/?s=v1:` + base64 JSON) by hand; the two apps share no code. Only `key` and
 * `progression` are sent: the practice app fills every other setting with its defaults.
 */
import { pc, type Chord, type ChordId, type NoteName, type ScaleId } from '../core/music';

/** The practice app's names for the scales it knows. */
const SCALE_IDS: Readonly<Partial<Record<ScaleId, string>>> = {
  major: 'major',
  naturalMinor: 'natural-minor',
  majorPentatonic: 'majorPentatonic',
  minorPentatonic: 'minorPentatonic',
  minorBlues: 'blues',
  majorBlues: 'major-blues',
};

/** The practice app's chord types; any other chord means no link. */
const QUALITIES: Readonly<Partial<Record<ChordId, string>>> = { major: 'M', minor: 'm', dom7: 'dom7', m7: 'm7', maj7: 'M7' };

/** The practice app accepts exactly these 12 key spellings (A B♭ B C C♯ D E♭ E F F♯ G G♯), by pitch class. */
const KEY_SPELLING: readonly NoteName[] = (
  [
    ['C', 0],
    ['C', 1],
    ['D', 0],
    ['E', -1],
    ['E', 0],
    ['F', 0],
    ['F', 1],
    ['G', 0],
    ['G', 1],
    ['A', 0],
    ['B', -1],
    ['B', 0],
  ] as const
).map(([letter, alter]) => ({ letter, alter }));

export interface TrainerKey {
  readonly tonic: NoteName;
  readonly scale: ScaleId;
}

/** The link, or null when the scale or a chord is one the practice app does not have. */
export function trainerLink(key: TrainerKey, chords: readonly Chord[]): string | null {
  const scaleId = SCALE_IDS[key.scale];
  if (!scaleId || chords.length === 0) return null;
  const progression = [];
  for (const [i, c] of chords.entries()) {
    const quality = QUALITIES[c.id];
    if (!quality) return null;
    progression.push({ id: `theory-${i + 1}`, lickSeed: i + 1, bars: 1, chord: { tonic: { letter: c.root.letter, alter: c.root.alter }, quality } });
  }
  const tonic = KEY_SPELLING[pc(key.tonic)]!;
  const json = JSON.stringify({ key: { tonic, scaleId }, progression });
  return `/?s=${encodeURIComponent(`v1:${btoa(encodeURIComponent(json))}`)}`;
}
