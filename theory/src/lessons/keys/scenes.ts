/**
 * What each scene of "Keys and progressions" shows, derived from the core: the chords of a key from
 * `diatonicChords()`, progressions from `progression()`, the ii–V from `twoFive()`, the voicings
 * from `barreOptions()` (or `stackShape()` for a diminished triad, which has no barre shape) and
 * `closestPath()`. The only typed lists are scale degrees.
 */
import {
  allPositions,
  barreOptions,
  barreVoicing,
  byHomeFret,
  closestPath,
  homeFret,
  midiAt,
  neckNote,
  stackShape,
  type BarreShape,
  type FretPos,
} from '../../core/fretboard';
import {
  CHORDS,
  MAJOR_KEY_TONICS,
  chordNotes,
  chordSymbol,
  diatonicChords,
  format,
  parseNote,
  progression,
  relativeKey,
  sameNote,
  scaleNotes,
  twoFive,
  type Chord,
  type ChordId,
  type DegreeLabel,
  type Mode,
  type NoteName,
  type ProgressionId,
} from '../../core/music';

/** Frets drawn: an E-shape barre at fret 12 reaches 14. */
export const KEYS_FRETS = 15;
/** Highest barre (or stacked root) a voicing may use. */
const MAX_FRET = KEYS_FRETS - 3;
/** The 12 major keys, ordered by their root on string 6. */
export const KEY_CHOICES: readonly NoteName[] = byHomeFret(MAJOR_KEY_TONICS);

/** A chord with its roman numeral in the key being played. */
export interface Slot {
  readonly chord: Chord;
  readonly roman: string;
}

export interface ChordNote extends FretPos {
  readonly midi: number;
  readonly degree: DegreeLabel;
  readonly name: string;
}

export interface ChordView extends Slot {
  readonly symbol: string;
  /** The barre shape, or null for a chord stacked one note per string from its root. */
  readonly shape: BarreShape | null;
  /** Barre fret, or the lowest fret of a stacked chord: where the first finger sits. */
  readonly fret: number;
  /** Low string to high. */
  readonly notes: readonly ChordNote[];
}

interface Place {
  readonly notes: readonly FretPos[];
  readonly shape: BarreShape | null;
  readonly fret: number;
}

/**
 * Where a chord can be played: its barre shapes in both octaves, or, for a quality with no
 * barre shape (the diminished triad), the chord stacked up from its root on string 6 or 5.
 */
function places(chord: Chord): Place[] {
  const barres = barreOptions(chord, MAX_FRET);
  if (barres.length > 0) return barres.map((v) => ({ notes: v.notes, shape: v.shape, fret: v.fret }));
  const size = Math.min(4, CHORDS[chord.id].formula.length) as 3 | 4;
  return ([6, 5] as const).flatMap((string) => {
    const home = homeFret(chord.root, string);
    return [home, home + 12]
      .filter((fret) => fret <= MAX_FRET)
      .map((fret) => stackShape({ string, fret }, chord, size))
      .filter((notes): notes is FretPos[] => notes !== null)
      .map((notes) => ({ notes, shape: null, fret: Math.min(...notes.map((x) => x.fret)) }));
  });
}

function toView(slot: Slot, place: Place): ChordView {
  const context = chordNotes(slot.chord);
  return {
    ...slot,
    symbol: chordSymbol(slot.chord),
    shape: place.shape,
    fret: place.fret,
    notes: place.notes.map((p) => neckNote(p, slot.chord.root, context)),
  };
}

const isTonic = (s: Slot) => /^(I|i)(maj7|7)?$/.test(s.roman);

/**
 * Voicings for chords played as a loop, chosen so the hand travels least (K4.6). The home chord
 * (the first I or i, else the first chord) stays in the E shape at its home fret, so the key
 * decides where the hand sits; the other chords gather round it.
 */
export function loopViews(slots: readonly Slot[]): ChordView[] {
  const anchor = Math.max(0, slots.findIndex(isTonic));
  const choices = slots.map((s, i) => {
    const all = places(s.chord);
    const home = i === anchor ? barreVoicing(s.chord, 'E') : null;
    return home ? all.filter((p) => p.shape === 'E' && p.fret === home.fret) : all;
  });
  return closestPath(choices).map((p, i) => toView(slots[i]!, p));
}

/** Each chord where it sits nearest `fret` (ties to the lower one): answers placed by the hand. */
export function viewsNear(slots: readonly Slot[], fret: number): ChordView[] {
  return slots.map((s) => {
    const best = places(s.chord).reduce((a, b) => {
      const da = Math.abs(a.fret - fret);
      const db = Math.abs(b.fret - fret);
      return db < da || (db === da && b.fret < a.fret) ? b : a;
    });
    return toView(s, best);
  });
}

export type Quality = 'major' | 'minor' | 'dim';

/** The colour family of a chord: diminished if it has a ♭5, minor if a ♭3, otherwise major. */
export function quality(id: ChordId): Quality {
  const formula = CHORDS[id].formula;
  if (formula.includes('b5')) return 'dim';
  return formula.includes('b3') ? 'minor' : 'major';
}

const majorChords = (tonic: NoteName, size: 3 | 4 = 3) => diatonicChords({ tonic, mode: 'major' }, size);

// --- Step 1: the chord family (K5.2) ---

export type Size = 3 | 4;
export const FAMILY_TONIC: NoteName = parseNote('G');

export const scaleRow = (tonic: NoteName): NoteName[] => scaleNotes(tonic, 'major');

/** Positions in the scale row the chord on `degree` (1..7) takes: every other note, wrapping. */
export function stackIndices(degree: number, size: Size): number[] {
  return Array.from({ length: size }, (_, k) => (degree - 1 + 2 * k) % 7);
}

/** The seven chords of a major key, voiced close together. */
export const family = (tonic: NoteName, size: Size): ChordView[] => loopViews(majorChords(tonic, size));

// --- Step 2: numbers, not names (K5.3) ---

export const NUMBER_PROGRESSIONS: readonly ProgressionId[] = ['I-V-vi-IV', 'I-IV-V', 'vi-IV-I-V', 'ii-V-I'];
export const NUMBERS_TONIC: NoteName = parseNote('G');

export const progressionViews = (tonic: NoteName, id: ProgressionId): ChordView[] => loopViews(progression(tonic, id));

// --- Step 3: which chord is home? (K5.1) ---

/** Lead-ins by scale degree; each stops on V, played as V7. */
export const LEAD_INS: readonly (readonly number[])[] = [
  [1, 4, 5],
  [1, 6, 4, 5],
  [1, 6, 2, 5],
  [1, 2, 5],
  [4, 5],
  [2, 5],
];
/** The other answers offered beside I: not V (the lead-in stops there) and not vii°. */
const DECOYS: readonly number[] = [2, 3, 4, 6];

export interface HomeQuestion {
  readonly tonic: NoteName;
  readonly lead: readonly ChordView[];
  /** Four chords of the key, the I among them, in random order. */
  readonly choices: readonly ChordView[];
}

const pick = <T>(items: readonly T[], random: () => number): T => items[Math.min(items.length - 1, Math.floor(random() * items.length))]!;

function shuffle<T>(items: readonly T[], random: () => number): T[] {
  const out = [...items];
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.min(i, Math.floor(random() * (i + 1)));
    [out[i], out[j]] = [out[j]!, out[i]!];
  }
  return out;
}

export function homeQuestion(random: () => number, previous?: HomeQuestion): HomeQuestion {
  const keys = previous ? KEY_CHOICES.filter((k) => !sameNote(k, previous.tonic)) : KEY_CHOICES;
  const tonic = pick(keys, random);
  const triads = majorChords(tonic);
  const v7 = majorChords(tonic, 4)[4]!;
  const lead = pick(LEAD_INS, random).map((d) => (d === 5 ? v7 : triads[d - 1]!));
  const decoys = shuffle(DECOYS, random).slice(0, 3);
  const choices = shuffle([1, ...decoys], random).map((d) => triads[d - 1]!);
  const leadViews = loopViews(lead);
  return { tonic, lead: leadViews, choices: viewsNear(choices, leadViews.at(-1)!.fret) };
}

export type HomeResult = 'right' | 'vi' | 'away';

/** The I is home. The vi is the near miss: it shares two notes with the I (a "deceptive" ending). */
export const judgeHome = (choice: Slot): HomeResult => (choice.roman === 'I' ? 'right' : choice.roman === 'vi' ? 'vi' : 'away');

// --- Step 4: V wants to go home, and ii–V–I (K5.5) ---

export const TWO_FIVE_TONIC: NoteName = parseNote('C');

/** I IV V7 I: the scene plays the first three ("stop on V7") or all four ("resolve"). */
export function pullViews(tonic: NoteName): ChordView[] {
  const triads = majorChords(tonic);
  return loopViews([triads[0]!, triads[3]!, majorChords(tonic, 4)[4]!, triads[0]!]);
}

/** I vi IV I: no V, so nothing pulls yet. */
export const BASE_LOOP: readonly number[] = [1, 6, 4, 1];
export type Approach = 'off' | 'I' | 'IV';
export const APPROACHES: readonly Approach[] = ['off', 'I', 'IV'];

/**
 * The base loop with the ii–V of `target` played just before it: into I, the key's own ii7 V7;
 * into IV, the ii7 and V7 of the IV chord, written ii7/IV and V7/IV.
 */
export function approachLoop(tonic: NoteName, target: Approach): ChordView[] {
  const triads = majorChords(tonic);
  const slots: Slot[] = BASE_LOOP.map((d) => triads[d - 1]!);
  if (target !== 'off') {
    const at = slots.findIndex((s) => s.roman === target);
    const [ii, v] = twoFive(slots[at]!.chord.root);
    const of = target === 'I' ? '' : `/${target}`;
    slots.splice(at, 0, { chord: ii, roman: `ii7${of}` }, { chord: v, roman: `V7${of}` });
  }
  return loopViews(slots);
}

// --- Step 5: same chords, two homes (K5.6, K2.8, K3.7) ---

export const RELATIVE_TONIC: NoteName = parseNote('C');

export interface RelativeChord {
  readonly chord: Chord;
  readonly symbol: string;
  /** Its numeral in the major key, and in the relative minor key. */
  readonly major: string;
  readonly minor: string;
}

/** The chords of a major key in scale order, each with both numerals: vi becomes i, I becomes III. */
export function relativeChords(tonic: NoteName): RelativeChord[] {
  const minor = diatonicChords(relativeKey({ tonic, mode: 'major' }));
  return majorChords(tonic).map((d) => ({
    chord: d.chord,
    symbol: chordSymbol(d.chord),
    major: d.roman,
    minor: minor.find((m) => sameNote(m.chord.root, d.chord.root))!.roman,
  }));
}

/** The home of each side: the major tonic, or its relative minor. */
export const homeTonic = (tonic: NoteName, home: Mode): NoteName => (home === 'major' ? tonic : relativeKey({ tonic, mode: 'major' }).tonic);

/** I–V–vi–IV lands on the major home; i–VII–VI–VII on the minor one. Same chords. */
export const relativeLoop = (tonic: NoteName, home: Mode): ChordView[] =>
  progressionViews(homeTonic(tonic, home), home === 'major' ? 'I-V-vi-IV' : 'i-VII-VI-VII');

export interface ScaleDot extends FretPos {
  readonly midi: number;
  readonly name: string;
  readonly root: boolean;
}

/** The pentatonic to solo with over that home, across the neck: same five notes either way (K3.3, K3.7). */
export function homePentatonic(tonic: NoteName, home: Mode): ScaleDot[] {
  const root = homeTonic(tonic, home);
  return scaleNotes(root, home === 'major' ? 'majorPentatonic' : 'minorPentatonic').flatMap((name) =>
    allPositions(name, KEYS_FRETS).map((p) => ({ ...p, midi: midiAt(p), name: format(name), root: sameNote(name, root) })),
  );
}
