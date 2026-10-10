/**
 * A link that opens the practice app (guitarmateur.com/) on a key and a chord progression, so a
 * learner can practise licks over what a lesson just taught. It writes the practice app's share
 * format (`/?s=v1:` + base64 JSON) by hand; the two apps share no code. Starting from the practice
 * app's own saved settings (same origin, its own key), it replaces only the key, the progression
 * and, when given, the tempo, so the learner's tuning, left-handed view and volumes survive.
 * The lesson's language rides along as `&lang=`, outside the shared state: the practice app opens
 * in it, whatever language it was last used in.
 */
import { sameNote, type Chord, type ChordId, type NoteName, type ScaleId } from '../core/music';
import type { Lang } from '../i18n';
import { PRACTICE_STATE_KEY } from '@shared/i18n/language';
import { browserStorage, type KeyValue } from '../platform/storage';

/** The practice app's names for Theory's scales; null = it has no such scale. */
const SCALE_IDS: Readonly<Record<ScaleId, string | null>> = {
  major: 'major',
  naturalMinor: 'natural-minor',
  majorPentatonic: 'majorPentatonic',
  minorPentatonic: 'minorPentatonic',
  minorBlues: 'blues',
  majorBlues: 'major-blues',
};

/** The practice app's chord types; any other chord means no link. */
const QUALITIES: Readonly<Partial<Record<ChordId, string>>> = { major: 'M', minor: 'm', dom7: 'dom7', m7: 'm7', maj7: 'M7' };

/** The only key spellings the practice app accepts: A B♭ B C C♯ D E♭ E F F♯ G G♯. */
const KEY_SPELLINGS: readonly NoteName[] = (
  [
    ['A', 0],
    ['B', -1],
    ['B', 0],
    ['C', 0],
    ['C', 1],
    ['D', 0],
    ['E', -1],
    ['E', 0],
    ['F', 0],
    ['F', 1],
    ['G', 0],
    ['G', 1],
  ] as const
).map(([letter, alter]) => ({ letter, alter }));

/** Where the practice app keeps its settings in this browser. */
export const PRACTICE_STORAGE_KEY = PRACTICE_STATE_KEY;

export interface TrainerKey {
  readonly tonic: NoteName;
  readonly scale: ScaleId;
}

export interface TrainerOptions {
  /** The practice app's saved state, as stored; its other settings are kept. */
  readonly saved?: unknown;
  readonly tempoBpm?: number;
  /** The lesson's language: the practice app opens in it. */
  readonly lang?: Lang;
}

/** The practice app's saved state, or undefined. Never throws. */
export function readPracticeState(storage: KeyValue | null = browserStorage()): unknown {
  try {
    const raw = storage?.getItem(PRACTICE_STORAGE_KEY);
    return raw ? JSON.parse(raw) : undefined;
  } catch {
    return undefined;
  }
}

/**
 * The link, or null when the practice app cannot show it: a scale or chord it lacks, or a key it
 * cannot spell (D♭ and A♭ major would turn into C♯ and G♯ with chords spelled in flats).
 * Repeated chords in a row become one two-bar card, as the practice app counts them.
 */
export function trainerLink(key: TrainerKey, chords: readonly Chord[], opts: TrainerOptions = {}): string | null {
  const scaleId = SCALE_IDS[key.scale];
  const tonic = KEY_SPELLINGS.find((k) => sameNote(k, key.tonic));
  if (!scaleId || !tonic || chords.length === 0) return null;

  const progression: { id: string; lickSeed: number; bars: 1 | 2; chord: { tonic: NoteName; quality: string } }[] = [];
  for (const c of chords) {
    const quality = QUALITIES[c.id];
    if (!quality) return null;
    const prev = progression.at(-1);
    const same = prev && prev.bars === 1 && prev.chord.quality === quality && sameNote(prev.chord.tonic, c.root);
    if (same) prev.bars = 2;
    else progression.push({ id: `theory-${progression.length + 1}`, lickSeed: progression.length + 1, bars: 1, chord: { tonic: { letter: c.root.letter, alter: c.root.alter }, quality } });
  }

  const saved = opts.saved && typeof opts.saved === 'object' && !Array.isArray(opts.saved) ? (opts.saved as Record<string, unknown>) : {};
  // Positions depend on the key: drop them so the practice app recommends one for the new key.
  // The language is not practice state (the practice app ignores it in a share payload): it goes
  // in its own `lang` parameter instead.
  const dropped = new Set(['positions', 'language']);
  const state: Record<string, unknown> = { ...Object.fromEntries(Object.entries(saved).filter(([k]) => !dropped.has(k))), key: { tonic, scaleId }, progression };
  if (opts.tempoBpm !== undefined) state.tempoBpm = opts.tempoBpm;
  const lang = opts.lang ? `&lang=${opts.lang}` : '';
  return `/?s=${encodeURIComponent(`v1:${btoa(encodeURIComponent(JSON.stringify(state)))}`)}${lang}`;
}
