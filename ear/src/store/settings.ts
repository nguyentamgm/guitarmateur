/** The trainer's settings: their defaults, and reading them back from storage field by field. */
import {
  MAJOR_KEY_TONICS,
  MINOR_KEY_TONICS,
  sameNote,
  type DegreeLabel,
  type Key,
  type NoteName,
} from '@shared/core/music';
import { clampBpm } from '@shared/core/rhythm';
import { DEGREES, MIN_DEGREES, presetDegrees } from '../core/degrees';
import { KEY_CHANGE_EVERY, REGISTERS, type KeyChange } from '../core/questions';
import { CONTEXT_POLICIES, type SessionSettings } from '../core/session';

/** The voice of the question and the walk home: the guitar pluck, or a plain tone. The cadence is always guitar. */
export type Sound = 'guitar' | 'clean';
export const SOUNDS: readonly Sound[] = ['guitar', 'clean'];

export interface EarSettings extends SessionSettings {
  /** The degrees asked, as ids in chromatic order. */
  readonly degrees: readonly DegreeLabel[];
  /** The cadence's tempo; the walk home follows it. */
  readonly bpm: number;
  readonly sound: Sound;
}

/** A major (Practice opens on A too), root 3rd 5th, the cadence before every question, 90 BPM. */
export const DEFAULT_SETTINGS: EarSettings = {
  key: { tonic: MAJOR_KEY_TONICS.find((t) => t.letter === 'A' && t.alter === 0)!, mode: 'major' },
  degrees: presetDegrees('triad', 'major')!,
  register: 'above',
  keyChange: 'fixed',
  context: 'everyQuestion',
  resolution: true,
  drone: false,
  autoNext: false,
  bpm: 90,
  sound: 'guitar',
};

const isOneOf = <T>(list: readonly T[], v: unknown): v is T => list.includes(v as T);
const DEGREE_IDS = DEGREES.map((d) => d.label);

/** A stored key: a mode and one of that mode's 12 tonics, spelled as the core spells it. */
function readKey(v: unknown): Key | null {
  if (!v || typeof v !== 'object') return null;
  const { tonic, mode } = v as Record<string, unknown>;
  if ((mode !== 'major' && mode !== 'minor') || !tonic || typeof tonic !== 'object') return null;
  const tonics = mode === 'major' ? MAJOR_KEY_TONICS : MINOR_KEY_TONICS;
  const found = tonics.find((t) => sameNote(t, tonic as NoteName));
  return found ? { tonic: found, mode } : null;
}

/** Stored degree ids, kept in chromatic order once each, or null when fewer than MIN_DEGREES are valid. */
function readDegrees(v: unknown): DegreeLabel[] | null {
  if (!Array.isArray(v)) return null;
  const ids = DEGREE_IDS.filter((d) => v.includes(d));
  return ids.length >= MIN_DEGREES ? ids : null;
}

const KEY_CHANGES: readonly KeyChange[] = ['fixed', ...KEY_CHANGE_EVERY];

/** Stored settings, each field checked on its own: a missing or broken one takes its default. */
export function readSettings(v: unknown): EarSettings {
  const r = v && typeof v === 'object' ? (v as Record<string, unknown>) : {};
  const d = DEFAULT_SETTINGS;
  const bool = (x: unknown, fallback: boolean) => (typeof x === 'boolean' ? x : fallback);
  return {
    key: readKey(r.key) ?? d.key,
    degrees: readDegrees(r.degrees) ?? d.degrees,
    register: isOneOf(REGISTERS, r.register) ? r.register : d.register,
    keyChange: isOneOf(KEY_CHANGES, r.keyChange) ? r.keyChange : d.keyChange,
    context: isOneOf(CONTEXT_POLICIES, r.context) ? r.context : d.context,
    resolution: bool(r.resolution, d.resolution),
    drone: bool(r.drone, d.drone),
    autoNext: bool(r.autoNext, d.autoNext),
    bpm: typeof r.bpm === 'number' && Number.isFinite(r.bpm) ? clampBpm(r.bpm) : d.bpm,
    sound: isOneOf(SOUNDS, r.sound) ? r.sound : d.sound,
  };
}
