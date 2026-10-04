/** Chord registry (K4.1–K4.4). Formulas follow docs/theory-knowledge/m4-chords.md, errata applied. */
import { degreeOf, interval, transpose, type DegreeLabel } from './interval';
import { format, pc, type NoteName } from './pitch';

export type ChordId =
  | 'major'
  | 'minor'
  | 'aug'
  | 'dim'
  | 'sus4'
  | 'sus2'
  | 'power'
  | 'maj7'
  | 'm7'
  | 'dom7'
  | 'aug7'
  | 'm7b5'
  | 'dim7'
  | 'maj9'
  | 'm9'
  | 'dom9'
  | 'm11'
  | 'dom11'
  | 'add2';

export interface ChordDef {
  readonly formula: readonly DegreeLabel[];
  /** Symbol suffix after the root: '' → C, 'm7' → Cm7. */
  readonly suffix: string;
}

export const CHORDS: Readonly<Record<ChordId, ChordDef>> = {
  major: { formula: ['1', '3', '5'], suffix: '' },
  minor: { formula: ['1', 'b3', '5'], suffix: 'm' },
  aug: { formula: ['1', '3', '#5'], suffix: '+' },
  dim: { formula: ['1', 'b3', 'b5'], suffix: '°' },
  sus4: { formula: ['1', '4', '5'], suffix: 'sus4' },
  sus2: { formula: ['1', '2', '5'], suffix: 'sus2' },
  power: { formula: ['1', '5'], suffix: '5' },
  maj7: { formula: ['1', '3', '5', '7'], suffix: 'maj7' },
  m7: { formula: ['1', 'b3', '5', 'b7'], suffix: 'm7' },
  dom7: { formula: ['1', '3', '5', 'b7'], suffix: '7' },
  aug7: { formula: ['1', '3', '#5', 'b7'], suffix: '+7' },
  m7b5: { formula: ['1', 'b3', 'b5', 'b7'], suffix: 'm7♭5' },
  dim7: { formula: ['1', 'b3', 'b5', 'bb7'], suffix: '°7' },
  maj9: { formula: ['1', '3', '5', '7', '9'], suffix: 'maj9' },
  m9: { formula: ['1', 'b3', '5', 'b7', '9'], suffix: 'm9' },
  dom9: { formula: ['1', '3', '5', 'b7', '9'], suffix: '9' },
  m11: { formula: ['1', 'b3', '5', 'b7', '9', '11'], suffix: 'm11' },
  dom11: { formula: ['1', '3', '5', 'b7', '9', '11'], suffix: '11' },
  add2: { formula: ['1', '2', '3', '5'], suffix: 'add2' },
};

export const CHORD_IDS = Object.keys(CHORDS) as ChordId[];

export interface Chord {
  readonly root: NoteName;
  readonly id: ChordId;
}

export function chordNotes(chord: Chord): NoteName[] {
  return CHORDS[chord.id].formula.map((d) => transpose(chord.root, interval(d)));
}

/** 'C', 'Dm7', 'B♭maj7', 'F♯m7♭5'. */
export function chordSymbol(chord: Chord): string {
  return format(chord.root) + CHORDS[chord.id].suffix;
}

/**
 * The role of a note in a chord as its degree label from the formula ('1', 'b3', '5', 'b7'…),
 * or null when the note is not a chord tone. Compares pitch classes so an enharmonic spelling
 * still finds its role, then reports the formula's own label.
 */
export function chordToneDegree(chord: Chord, n: NoteName): DegreeLabel | null {
  const target = pc(n);
  const notes = chordNotes(chord);
  const i = notes.findIndex((x) => pc(x) === target);
  return i < 0 ? null : CHORDS[chord.id].formula[i]!;
}

/** Identify a chord from its root and notes (by interval set). Returns null if unknown. */
export function identifyChord(root: NoteName, notes: readonly NoteName[]): ChordId | null {
  const key = (labels: readonly string[]) => [...labels].sort().join(',');
  const wanted = key(notes.map((n) => degreeOf(root, n)));
  return CHORD_IDS.find((id) => key(CHORDS[id].formula.map(simple)) === wanted) ?? null;
}

/** Fold compound degrees into one octave for identification ('9' → '2'). */
function simple(label: DegreeLabel): DegreeLabel {
  const m = /^(\D*)(\d+)$/.exec(label)!;
  const n = Number(m[2]);
  return `${m[1]}${n > 7 ? n - 7 : n}`;
}
