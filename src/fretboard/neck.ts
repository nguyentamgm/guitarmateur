import { midi, pc, pitchAt, scaleNoteNames, type Key, type NoteName, type Pitch, type PitchClass } from '../music';
import { SCALES } from '../music';
import type { Tuning } from './tuning';

export interface FretNote {
  /** Index into `tuning.strings` (0 = lowest-pitched). */
  string: number;
  /** 0 = open string. */
  fret: number;
  /** Absolute pitch, spelled in the scale's context. */
  pitch: Pitch;
  /** 1-based index into the scale's interval list. */
  degree: number;
  isTonic: boolean;
  /** Added tone of a decorated scale (e.g. the blues ♭5). */
  isDecoration: boolean;
}

const mod = (n: number, m: number): number => ((n % m) + m) % m;

/** Map each scale pitch class to its spelled name (and 1-based degree) for the given key. */
export function scaleSpelling(key: Key): Map<PitchClass, { name: NoteName; degree: number }> {
  const map = new Map<PitchClass, { name: NoteName; degree: number }>();
  scaleNoteNames(key).forEach((name, i) => map.set(pc(name), { name, degree: i + 1 }));
  return map;
}

/** Which pitch classes are the decorated (added) tones of this scale (e.g. the blues ♭5). */
export function decorationPcs(key: Key): Set<PitchClass> {
  const def = SCALES[key.scaleId];
  if (!def.decoration) return new Set();
  const tonicPc = pc(key.tonic);
  return new Set(def.decoration.addedIntervals.map((iv) => mod(tonicPc + iv.semitones, 12)));
}

/** Every scale note on the neck (spelled), from open to `maxFret`. Non-scale notes are not emitted. */
export function scaleNotesOnNeck(tuning: Tuning, key: Key, maxFret = 22): FretNote[] {
  const spelling = scaleSpelling(key);
  const decPcs = decorationPcs(key);
  const out: FretNote[] = [];
  for (let s = 0; s < tuning.strings.length; s++) {
    const openMidi = midi(tuning.strings[s]!);
    for (let fret = 0; fret <= maxFret; fret++) {
      const m = openMidi + fret;
      const entry = spelling.get(mod(m, 12));
      if (!entry) continue;
      out.push({
        string: s,
        fret,
        pitch: pitchAt(entry.name, m),
        degree: entry.degree,
        isTonic: entry.degree === 1,
        isDecoration: decPcs.has(mod(m, 12)),
      });
    }
  }
  return out;
}
