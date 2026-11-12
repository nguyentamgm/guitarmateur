import {
  barreOptions,
  midiAt,
  openVoicing,
  pitchAtPos,
  type BarreShape,
  type FretPos,
  type StringNumber,
} from '../core/fretboard';
import {
  chordNotes,
  chordSymbol,
  chordToneDegree,
  format,
  parseNote,
  sameNote,
  type Chord,
  type ChordId,
  type DegreeLabel,
} from '../core/music';

export interface ShapeNote extends FretPos {
  readonly midi: number;
  readonly degree: DegreeLabel;
  readonly name: string;
}

export interface Shape {
  readonly chord: Chord;
  readonly symbol: string;
  readonly notes: readonly ShapeNote[]; // low string first (string 6 → 1)
  readonly muted: readonly StringNumber[];
  readonly barreFret: number | null; // null for an open shape
  readonly barreShape?: BarreShape | null;
}

/** The chords a beginner plays as open chords, by name; their shapes still come from openVoicing(). */
export const OPEN_SHAPE_CHORDS: readonly Chord[] = [
  // major: C, A, G, E, D
  ['C', 'major'],
  ['A', 'major'],
  ['G', 'major'],
  ['E', 'major'],
  ['D', 'major'],
  // minor: A, E, D
  ['A', 'minor'],
  ['E', 'minor'],
  ['D', 'minor'],
  // dom7: A, G, E, D, B
  ['A', 'dom7'],
  ['G', 'dom7'],
  ['E', 'dom7'],
  ['D', 'dom7'],
  ['B', 'dom7'],
].map(([r, id]) => ({ root: parseNote(r!), id: id as ChordId }));

function shapeNote(pos: FretPos, chord: Chord): ShapeNote {
  const context = chordNotes(chord);
  const pitch = pitchAtPos(pos, context);
  const degree = chordToneDegree(chord, pitch);
  if (!degree) {
    throw new Error(`Note at string ${pos.string} fret ${pos.fret} is not a chord tone of ${chordSymbol(chord)}`);
  }
  return {
    ...pos,
    midi: midiAt(pos),
    degree,
    name: format(pitch),
  };
}

export function chordShape(chord: Chord): Shape {
  const isOpen = OPEN_SHAPE_CHORDS.some((c) => c.id === chord.id && sameNote(c.root, chord.root));
  if (isOpen) {
    const v = openVoicing(chord);
    if (v) {
      return {
        chord,
        symbol: chordSymbol(chord),
        notes: v.notes.map((p) => shapeNote(p, chord)),
        muted: v.muted,
        barreFret: null,
        barreShape: null,
      };
    }
  }

  const options = barreOptions(chord).filter((v) => v.fret >= 1);
  if (options.length > 0) {
    const best = options.reduce((min, o) => (o.fret < min.fret ? o : min));
    return {
      chord,
      symbol: chordSymbol(chord),
      notes: best.notes.map((p) => shapeNote(p, chord)),
      muted: best.muted,
      barreFret: best.fret,
      barreShape: best.shape,
    };
  }

  throw new Error(`No chord shape found for ${chordSymbol(chord)}`);
}

/** The notes' midi, low to high (string 6 → 1). */
export const shapeMidis = (s: Shape): number[] => s.notes.map((n) => n.midi);
