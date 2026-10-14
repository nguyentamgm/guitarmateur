/**
 * Deep links (#225): `/ear?key=A&mode=minor&notes=blues` opens with those settings. `notes=` is a
 * preset (`minor-pentatonic`, `blues`…) or a list of degrees (`1,b3,4,5,b7`). Anything unknown is
 * ignored. Pure: the page saves what comes out and takes the parameters off the address.
 */
import { parseNote, pc, type DegreeLabel, type Mode, type NoteName } from '@shared/core/music';
import { DEGREES, MIN_DEGREES, degreeId, presetDegrees, type PresetId } from '../core/degrees';
import type { EarSettings } from '../store/settings';
import { tonicsOf, withMode } from './editSettings';

/** The query parameters a link may set; the page drops them once read. */
export const LINK_PARAMS = ['key', 'mode', 'notes'] as const;

/** Preset names in a link: kebab-case, as Practice writes them; the ids themselves also work. */
const PRESET_NAMES: Readonly<Record<string, PresetId>> = {
  triad: 'triad',
  'root-3rd-5th': 'triad',
  'major-pentatonic': 'majorPentatonic',
  'minor-pentatonic': 'minorPentatonic',
  blues: 'blues',
  scale: 'scale',
  all: 'chromatic',
  chromatic: 'chromatic',
};

const presetOfName = (v: string): PresetId | null => {
  const k = v.trim().toLowerCase();
  return (
    PRESET_NAMES[k] ?? Object.values(PRESET_NAMES).find((id) => id.toLowerCase() === k) ?? null
  );
};

/** A tonic in the mode's own spelling: A# major is B♭ major. Null when it is not a note. */
function tonicIn(mode: Mode, text: string): NoteName | null {
  let n: NoteName;
  try {
    n = parseNote(text.charAt(0).toUpperCase() + text.slice(1));
  } catch {
    return null;
  }
  return tonicsOf(mode).find((t) => pc(t) === pc(n)) ?? null;
}

/** A list of degrees, by any label within the octave ('b5' or '#4'); null if fewer than two are valid. */
function degreesOfList(v: string): DegreeLabel[] | null {
  const ids = new Set<DegreeLabel>();
  for (const part of v.split(',')) {
    const label = part.trim().replace('♭', 'b').replace('♯', '#');
    if (!label) continue;
    try {
      ids.add(degreeId(label));
    } catch {
      // not a degree: ignored
    }
  }
  const out = DEGREES.map((d) => d.label).filter((l) => ids.has(l));
  return out.length >= MIN_DEGREES ? out : null;
}

/**
 * The settings a link asks for, on top of `s`, or null when it sets nothing. The mode first (a
 * preset follows it, as switching mode on the page does), then the key in that mode, then the
 * notes: a preset the mode offers, or a list of at least two degrees.
 */
export function settingsFromLink(search: string, s: EarSettings): EarSettings | null {
  const q = new URLSearchParams(search);
  let next = s;
  const mode = q.get('mode')?.toLowerCase();
  if (mode === 'major' || mode === 'minor') next = withMode(next, mode);
  const key = q.get('key');
  const tonic = key ? tonicIn(next.key.mode, key) : null;
  if (tonic) next = { ...next, key: { tonic, mode: next.key.mode } };
  const notes = q.get('notes');
  if (notes) {
    const preset = presetOfName(notes);
    const degrees = preset ? presetDegrees(preset, next.key.mode) : degreesOfList(notes);
    if (degrees) next = { ...next, degrees: [...degrees] };
  }
  return next === s ? null : next;
}
