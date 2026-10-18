/** Text for music values on this page: degrees, notes, keys (docs/glossary.md). */
import { format, type DegreeLabel, type Key } from '@shared/core/music';
import { degreeId, noteOf } from '../core/degrees';
import { fill, type UiStrings } from '../i18n';

/** A degree as the glossary writes it: real accidentals, ♭3 not b3. */
export const degreeText = (d: DegreeLabel): string => d.replaceAll('b', '♭').replaceAll('#', '♯');

/** A degree as the key spells it: the tritone is ♯4 in major, ♭5 in minor. */
export function degreeInKey(key: Key, d: DegreeLabel): string {
  const id = degreeId(d);
  return degreeText(id === '#4' && key.mode === 'minor' ? 'b5' : id);
}

/** The tritone's answer is one button: ♯4 / ♭5. */
export const answerText = (d: DegreeLabel): string =>
  degreeId(d) === '#4' ? '♯4/♭5' : degreeText(degreeId(d));

/** The degree's note, spelled from the key: E♭ for ♭3 in C. */
export const noteText = (key: Key, d: DegreeLabel): string => format(noteOf(key, d));

export const keyText = (ui: UiStrings, key: Key): string =>
  fill(ui.keyName, { tonic: format(key.tonic), mode: ui.modeName[key.mode] });
