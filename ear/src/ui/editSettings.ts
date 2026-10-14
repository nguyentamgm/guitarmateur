/** Settings edits that change more than one field (the settings card, #222). Pure. */
import {
  MAJOR_KEY_TONICS,
  MINOR_KEY_TONICS,
  mod,
  pc,
  type DegreeLabel,
  type Key,
  type Mode,
  type NoteName,
} from '@shared/core/music';
import { degreeId, presetDegrees, presetsFor, type PresetId } from '../core/degrees';
import type { EarSettings } from '../store/settings';

/** The 12 tonics a mode offers, around the circle of fifths. */
export const tonicsOf = (mode: Mode): readonly NoteName[] =>
  mode === 'major' ? MAJOR_KEY_TONICS : MINOR_KEY_TONICS;

/** The fret of a tonic on the low E string, 0–11: where the hand goes. */
export const lowEFret = (tonic: NoteName): number => mod(pc(tonic) - 4, 12);

const sameSet = (a: readonly DegreeLabel[], b: readonly DegreeLabel[]) =>
  [...new Set(a.map(degreeId))].sort().join() === [...new Set(b.map(degreeId))].sort().join();

/** The preset `degrees` are in `mode`, if any. */
export function presetOf(mode: Mode, degrees: readonly DegreeLabel[]): PresetId | null {
  return presetsFor(mode).find((p) => sameSet(presetDegrees(p, mode)!, degrees)) ?? null;
}

/** The same preset in the other mode: the pentatonics swap, the others stay. */
const COUNTERPART: Partial<Record<PresetId, PresetId>> = {
  majorPentatonic: 'minorPentatonic',
  minorPentatonic: 'majorPentatonic',
};

/**
 * Major ↔ minor: the tonic keeps its pitch class (D♭ major → C♯ minor), spelled as the new mode
 * spells it; a preset becomes the same preset in the new mode (root 3rd 5th: 1 3 5 → 1 ♭3 5), and
 * a hand-picked set of degrees stays as it is.
 */
export function withMode(s: EarSettings, mode: Mode): EarSettings {
  if (s.key.mode === mode) return s;
  const tonic = tonicsOf(mode).find((t) => pc(t) === pc(s.key.tonic))!;
  const key: Key = { tonic, mode };
  const preset = presetOf(s.key.mode, s.degrees);
  const target = preset && (presetDegrees(preset, mode) ? preset : COUNTERPART[preset]);
  return { ...s, key, degrees: target ? presetDegrees(target, mode)! : s.degrees };
}

/** What plays before each question, as the card offers it: the cadence's two forms, or one of the other policies. */
export type Before = 'full' | 'short' | 'keyChange' | 'droneOnly';
export const BEFORE: readonly Before[] = ['full', 'short', 'keyChange', 'droneOnly'];

export const beforeOf = (s: EarSettings): Before =>
  s.context === 'everyQuestion' ? s.cadenceForm : s.context;

export function withBefore(s: EarSettings, before: Before): EarSettings {
  if (before === 'full' || before === 'short')
    return { ...s, context: 'everyQuestion', cadenceForm: before };
  return { ...s, context: before };
}
