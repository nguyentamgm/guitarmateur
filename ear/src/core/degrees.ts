/** Degrees in a key, their spelled notes and pitches (docs/ear.md "Music rules"). */
import {
  INTERVAL_TABLE,
  SCALES,
  interval,
  midi,
  mod,
  pc,
  spellMidi,
  transpose,
  type DegreeLabel,
  type Key,
  type Mode,
  type NoteName,
} from '@shared/core/music';

/** The scale a mode's diatonic degrees come from. */
const MODE_SCALE = { major: 'major', minor: 'naturalMinor' } as const;

/** The degrees of a mode's scale, tonic first: major 1–7, natural minor 1 2 b3 4 5 b6 b7. */
export function diatonicDegrees(mode: Mode): readonly DegreeLabel[] {
  return SCALES[MODE_SCALE[mode]].formula;
}

const IN_SCALE = new Set([...diatonicDegrees('major'), ...diatonicDegrees('minor')]);

/**
 * The 12 degrees in chromatic order, one label per semitone: the major or minor scale's label,
 * else the table's first ('#4', which also answers for 'b5').
 */
export const DEGREES: readonly { label: DegreeLabel; semitones: number }[] = Array.from({ length: 12 }, (_, s) => {
  const same = INTERVAL_TABLE.filter((d) => d.semitones === s);
  return same.find((d) => IN_SCALE.has(d.label)) ?? same[0]!;
});

/** The degree id of any label within the octave: 'b5' → '#4', '#5' → 'b6', '1' → '1'. */
export function degreeId(label: DegreeLabel): DegreeLabel {
  return DEGREES[mod(interval(label).semitones, 12)]!.label;
}

/** The tritone is spelled #4 in major (it leads up to 5) and b5 in minor (it falls to 4). */
const spelling = (mode: Mode, degree: DegreeLabel): DegreeLabel => {
  const id = degreeId(degree);
  return id === '#4' && mode === 'minor' ? 'b5' : id;
};

/** The degree's note spelled from the key; a double accidental becomes its single-accidental enharmonic. */
export function noteOf(key: Key, degree: DegreeLabel): NoteName {
  const n = transpose(key.tonic, interval(spelling(key.mode, degree)));
  if (Math.abs(n.alter) < 2) return n;
  const { letter, alter } = spellMidi(pc(n), n.alter < 0 ? 'flat' : 'sharp');
  return { letter, alter };
}

/** MIDI number of the degree above the tonic sounding in scientific `octave` (C4 = 60). */
export function midiOf(key: Key, degree: DegreeLabel, octave: number): number {
  return midi({ ...key.tonic, octave }) + interval(degree).semitones;
}

/** A preset's stable id; its name is UI copy and lives in i18n. */
export type PresetId = 'triad' | 'majorPentatonic' | 'minorPentatonic' | 'blues' | 'scale' | 'chromatic';

/** Each preset's degree ids in a mode, or null when the mode does not offer it. */
const PRESETS: Readonly<Record<PresetId, (mode: Mode) => readonly DegreeLabel[] | null>> = {
  triad: (mode) => diatonicDegrees(mode).filter((_, i) => i === 0 || i === 2 || i === 4),
  majorPentatonic: (mode) => (mode === 'major' ? SCALES.majorPentatonic.formula : null),
  minorPentatonic: (mode) => (mode === 'minor' ? SCALES.minorPentatonic.formula : null),
  // The minor pentatonic plus b5, in both modes: over a major key it is the rock/blues sound.
  blues: () => SCALES.minorBlues.formula.map(degreeId),
  scale: diatonicDegrees,
  chromatic: () => DEGREES.map((d) => d.label),
};

export const PRESET_IDS = Object.keys(PRESETS) as PresetId[];

export function presetDegrees(id: PresetId, mode: Mode): readonly DegreeLabel[] | null {
  return PRESETS[id](mode);
}

/** The presets a mode offers, in PRESET_IDS order. */
export function presetsFor(mode: Mode): PresetId[] {
  return PRESET_IDS.filter((id) => PRESETS[id](mode) !== null);
}

/** A quiz needs at least two possible answers. */
export const MIN_DEGREES = 2;

/** Turn a degree on or off; returns degree ids in chromatic order, never removing one below MIN_DEGREES. */
export function toggleDegree(on: readonly DegreeLabel[], degree: DegreeLabel): DegreeLabel[] {
  const set = new Set(on.map(degreeId));
  const id = degreeId(degree);
  if (!set.has(id)) set.add(id);
  else if (set.size > MIN_DEGREES) set.delete(id);
  return DEGREES.map((d) => d.label).filter((l) => set.has(l));
}
