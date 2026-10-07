/**
 * What each scene of "Soloing over the changes" shows, derived from the core: the backing from
 * `progression()` / `twelveBar()` and `backingAt()`, the box from `positions()`, chord tones from
 * `chordToneDegree()`, the guide-tone line from `closestPath()`, ideas from `motif()` and
 * `landOn()`. The only typed data is which scale and style go with which backing.
 */
import { EIGHTHS_PER_BAR, type BackingStyle } from '../../core/audio';
import { STRINGS, byHomeFret, closestPath, neckNote, openMidi, pitchAtPos, positions, type NeckNote } from '../../core/fretboard';
import {
  MAJOR_KEY_TONICS,
  MINOR_KEY_TONICS,
  SCALES,
  bluesChord,
  chordSymbol,
  chordToneDegree,
  format,
  landOn,
  mod,
  motif,
  parseNote,
  pc,
  progression,
  scaleNotes,
  twelveBar,
  type Chord,
  type DegreeLabel,
  type LickNote,
  type NoteName,
  type ScaleId,
} from '../../core/music';

/** Frets drawn: box 1 never starts above fret 12. */
export const SOLO_FRETS = 15;

// --- The backings, shared by every step (K7.1, K7.3) ---

export type BackingId = 'blues' | 'pop' | 'rock' | 'jazz';
export const BACKING_IDS: readonly BackingId[] = ['blues', 'pop', 'rock', 'jazz'];

export interface BackingDef {
  readonly style: BackingStyle;
  /** The scale that fits: picked by the home (major or minor) and the style. */
  readonly scale: ScaleId;
  readonly tonic: NoteName;
  readonly bpm: number;
}

export const BACKINGS: Readonly<Record<BackingId, BackingDef>> = {
  blues: { style: 'shuffle', scale: 'minorBlues', tonic: parseNote('A'), bpm: 84 },
  pop: { style: 'strum', scale: 'majorPentatonic', tonic: parseNote('G'), bpm: 92 },
  rock: { style: 'rock', scale: 'minorPentatonic', tonic: parseNote('A'), bpm: 100 },
  jazz: { style: 'comp', scale: 'major', tonic: parseNote('C'), bpm: 104 },
};

/** Whether a backing's home is minor (its tonic is the minor i). */
const isMinor = (id: BackingId) => SCALES[BACKINGS[id].scale].quality === 'minor';

/** The keys to choose from, ordered by their root on string 6. */
export const backingKeys = (id: BackingId): NoteName[] => byHomeFret(isMinor(id) ? MINOR_KEY_TONICS : MAJOR_KEY_TONICS);

export interface BackingBar {
  readonly chord: Chord;
  readonly degree: string;
  readonly symbol: string;
}

/** One chord per bar: the 12-bar blues, I–V–vi–IV, i–VII–VI–VII, or ii–V–I. */
export function backingBars(id: BackingId, tonic: NoteName): BackingBar[] {
  const slots =
    id === 'blues'
      ? twelveBar().map((degree) => ({ chord: bluesChord(tonic, degree), roman: degree }))
      : progression(tonic, id === 'pop' ? 'I-V-vi-IV' : id === 'rock' ? 'i-VII-VI-VII' : 'ii-V-I');
  return slots.map((s) => ({ chord: s.chord, degree: s.roman, symbol: chordSymbol(s.chord) }));
}

// --- The box under the hand ---

export interface SoloNote extends NeckNote {
  readonly pitch: NoteName;
  /** Added to the pentatonic: the blues ♭5, or the 4 and 7 of the major scale. */
  readonly isAdded: boolean;
}

export interface SoloWindow {
  readonly tonic: NoteName;
  readonly scale: ScaleId;
  readonly minFret: number;
  readonly maxFret: number;
  /** Low to high in pitch. */
  readonly notes: readonly SoloNote[];
}

const pentatonicOf = (scale: ScaleId): ScaleId => (SCALES[scale].quality === 'minor' ? 'minorPentatonic' : 'majorPentatonic');

/**
 * Every note of the scale inside the frets of pentatonic box 1 (K3.4): the box itself for a
 * pentatonic, the box with the blue note for the blues scale, the box with the 4 and 7 filled in
 * for the major scale. One hand position, whatever the scale.
 */
export function soloWindow(tonic: NoteName, scale: ScaleId): SoloWindow {
  const box = positions({ tonic, scale: pentatonicOf(scale), notesPerString: 2 })[0]!;
  const context = scaleNotes(tonic, scale);
  const pcs = new Set(context.map(pc));
  const basePcs = new Set(scaleNotes(tonic, pentatonicOf(scale)).map(pc));
  const notes = STRINGS.flatMap((string) =>
    Array.from({ length: box.maxFret - box.minFret + 1 }, (_, k) => ({ string, fret: box.minFret + k }))
      .filter((p) => pcs.has(mod(openMidi(p.string) + p.fret, 12)))
      .map((p): SoloNote => {
        const pitch = pitchAtPos(p, context);
        return { ...neckNote(p, tonic, context), pitch, isAdded: !basePcs.has(pc(pitch)) };
      }),
  ).sort((a, b) => a.midi - b.midi);
  return { tonic, scale, minFret: box.minFret, maxFret: box.maxFret, notes };
}

export const backingWindow = (id: BackingId, tonic: NoteName): SoloWindow => soloWindow(tonic, BACKINGS[id].scale);

// --- Step 1: pick the scale from the key (K7.1, K7.3) ---

/** The other pentatonic on the same tonic: the "wrong" one to hear against the backing. */
export const wrongScale = (id: BackingId): ScaleId => (isMinor(id) ? 'majorPentatonic' : 'minorPentatonic');

/** Notes of the wrong scale that are not in the key at all: where it rubs. */
export function outsideNotes(id: BackingId, tonic: NoteName): string[] {
  const right = new Set(scaleNotes(tonic, isMinor(id) ? 'naturalMinor' : 'major').map(pc));
  return scaleNotes(tonic, wrongScale(id))
    .filter((n) => !right.has(pc(n)))
    .map(format);
}

// --- Step 2: chord tones light up (K7.2) ---

/** The note's role in the chord ('1', 'b3', '5', 'b7'…), or null when it is not a chord tone. */
export const toneIn = (note: SoloNote, chord: Chord): DegreeLabel | null => chordToneDegree(chord, note.pitch);

/** Unique chords of a backing, in order of first appearance. */
export function uniqueChords(bars: readonly BackingBar[]): BackingBar[] {
  return bars.filter((b, i) => bars.findIndex((x) => x.symbol === b.symbol) === i);
}

// --- Step 3: aim for the 3rd (K7.2) ---

/**
 * What to aim for when the chord changes, best first: the 3rd, then the 7th (the two "guide tones"
 * that tell one chord from the next), then the root, then the 5th (K7.2).
 */
const TARGET_RANK: readonly (readonly DegreeLabel[])[] = [['3', 'b3'], ['7', 'b7', 'bb7'], ['1'], ['5', 'b5', '#5']];

/** The notes of the box that are the best target the box has for a chord, and which degree that is. */
export function targets(window: SoloWindow, chord: Chord): { degree: DegreeLabel; notes: SoloNote[] } {
  for (const rank of TARGET_RANK) {
    const notes = window.notes.filter((n) => rank.includes(toneIn(n, chord) ?? ('' as DegreeLabel)));
    if (notes.length > 0) return { degree: toneIn(notes[0]!, chord)!, notes };
  }
  return { degree: '1', notes: [] };
}

export interface GuideNote {
  readonly bar: BackingBar;
  readonly note: SoloNote;
  readonly degree: DegreeLabel;
}

/** One target per bar, chosen so the line moves as little as it can (a guide-tone line). */
export function guideLine(window: SoloWindow, bars: readonly BackingBar[]): GuideNote[] {
  const picks = bars.map((b) => targets(window, b.chord));
  // The same search that keeps barre chords close (K4.6), on pitch instead of fret.
  return closestPath(
    picks.map((p) => p.notes),
    (n) => n.midi,
  ).map((note, i) => ({ bar: bars[i]!, note, degree: picks[i]!.degree }));
}

// --- Step 4: small idea, repeat, change the end (K7.4) ---

export interface PhraseNote extends LickNote {
  readonly note: SoloNote;
}

/** Bars of the backing in one "say it, say it again, change it, listen" group. */
export const PHRASE_BARS = 4;

export type PhraseRole = 'idea' | 'again' | 'change' | 'yours';
export const PHRASE_ROLES: readonly PhraseRole[] = ['idea', 'again', 'change', 'yours'];

/**
 * A phrase for every bar of the backing, in groups of four: the idea landing on a tone of its bar's
 * chord, the same idea again, the idea with its end moved to a different tone of the third bar's
 * chord, then an empty bar for the player's answer.
 */
export function phrase(window: SoloWindow, bars: readonly BackingBar[], random: () => number): PhraseNote[][] {
  const size = window.notes.length;
  const idea = motif(size, random);
  const fits = (chord: Chord) => (i: number) => toneIn(window.notes[i]!, chord) !== null;
  const out: PhraseNote[][] = [];
  for (let start = 0; start < bars.length; start += PHRASE_BARS) {
    const said = landOn(idea, size, fits(bars[start]!.chord));
    const changeBar = bars[Math.min(bars.length - 1, start + 2)]!;
    const changed = landOn(idea, size, fits(changeBar.chord), said.at(-1)!.index);
    const group = [said, said, changed, []];
    for (let k = 0; k < PHRASE_BARS && start + k < bars.length; k++) {
      out.push(group[k]!.map((x) => ({ ...x, note: window.notes[x.index]! })));
    }
  }
  return out;
}

export const phraseRole = (bar: number): PhraseRole => PHRASE_ROLES[bar % PHRASE_BARS]!;

// --- Step 5: hear it, play it back (K7.5) ---

/** The ear quiz stays in one place: A minor pentatonic, box 1 (frets 5–8). */
export const EAR_TONIC: NoteName = parseNote('A');
export const earWindow = (): SoloWindow => soloWindow(EAR_TONIC, 'minorPentatonic');
export const EAR_BPM = 90;

export interface EarNote extends SoloNote {
  /** Eighth of the bar it starts on, and how long it lasts, from `motif()`. */
  readonly at: number;
  readonly length: number;
}

/**
 * A 3–4 note idea from the box, with its rhythm. Never the same pitches as `previous`, so "next"
 * always asks something new.
 */
export function earQuestion(window: SoloWindow, random: () => number, previous?: readonly EarNote[]): EarNote[] {
  const same = (a: readonly EarNote[]) => previous !== undefined && a.length === previous.length && a.every((n, i) => n.midi === previous[i]!.midi);
  for (let tries = 0; ; tries++) {
    const q = motif(window.notes.length, random).map((l) => ({ ...window.notes[l.index]!, at: l.at, length: l.length }));
    if (!same(q) || tries > 20) return q;
  }
}

export type EarClick = { readonly kind: 'right' } | { readonly kind: 'wrong'; readonly direction: 'higher' | 'lower' };

/** A click while looking for note `found` of the idea: right, or which way the right note lies. */
export function judgeEar(question: readonly EarNote[], found: number, midi: number): EarClick {
  const want = question[found]!.midi;
  if (midi === want) return { kind: 'right' };
  return { kind: 'wrong', direction: want > midi ? 'higher' : 'lower' };
}

// --- Step 6: record it, hear it back (K7.6) ---

/** One note of a recorded take: what was clicked, and the eighth of the form it fell on. */
export interface TakeNote {
  /** Eighth over the whole form: bar × 8 + eighth. */
  readonly step: number;
  readonly note: SoloNote;
}

/** The take with one more note, kept in time order; a second click on the same note and eighth is ignored. */
export function recordNote(take: readonly TakeNote[], note: SoloNote, step: number): TakeNote[] {
  if (take.some((t) => t.step === step && t.note.midi === note.midi)) return [...take];
  return [...take, { step, note }].sort((a, b) => a.step - b.step);
}

export const barOf = (t: TakeNote): number => Math.floor(t.step / EIGHTHS_PER_BAR);

/**
 * How the take met each bar's chord: the first note played in the bar is the landing note. 'tone'
 * when it is a note of the chord (with its degree), 'off' when not, 'rest' when the bar was empty.
 */
export type BarLanding =
  | { readonly kind: 'rest' }
  | { readonly kind: 'tone'; readonly degree: DegreeLabel; readonly note: TakeNote }
  | { readonly kind: 'off'; readonly note: TakeNote };

export function landings(take: readonly TakeNote[], bars: readonly BackingBar[]): BarLanding[] {
  return bars.map((bar, i) => {
    const first = take.find((t) => barOf(t) === i);
    if (!first) return { kind: 'rest' };
    const degree = toneIn(first.note, bar.chord);
    return degree ? { kind: 'tone', degree, note: first } : { kind: 'off', note: first };
  });
}

export interface TakeSummary {
  /** Bars whose first note was a chord tone, of the bars with any note. */
  readonly landed: number;
  readonly played: number;
  /** Notes that were a tone of the chord under them, of all notes. */
  readonly tones: number;
  readonly notes: number;
}

export function takeSummary(take: readonly TakeNote[], bars: readonly BackingBar[]): TakeSummary {
  const marks = landings(take, bars);
  return {
    landed: marks.filter((m) => m.kind === 'tone').length,
    played: marks.filter((m) => m.kind !== 'rest').length,
    tones: take.filter((t) => toneIn(t.note, bars[barOf(t)]!.chord) !== null).length,
    notes: take.length,
  };
}
