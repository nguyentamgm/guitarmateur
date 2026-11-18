export interface SongNote {
  readonly at: number;
  readonly degree: number;
  readonly octave: number;
  readonly length: number;
}

export interface SongDef {
  readonly id: string;
  readonly title: string;
  readonly beatsPerBar: 3 | 4;
  readonly bpm?: number;
  readonly melody: string;
  readonly chords: string;
  readonly accept?: Readonly<Record<number, readonly string[]>>;
}

export interface Song {
  readonly id: string;
  readonly title: string;
  readonly beatsPerBar: 3 | 4;
  readonly bars: number;
  readonly bpm: number;
  readonly notes: readonly SongNote[];
  readonly chords: readonly string[];
  readonly accept?: Readonly<Record<number, readonly string[]>>;
}

export function slotsPerBar(beatsPerBar: 3 | 4): number {
  return beatsPerBar === 4 ? 2 : 1;
}

export function slotBeats(beatsPerBar: 3 | 4): number {
  return beatsPerBar === 4 ? 2 : 3;
}

const REST_RE = /^_(?::(\d+(?:\.\d+)?|\.\d+))?$/;
const NOTE_RE = /^([1-7])([,'])?(?::(\d+(?:\.\d+)?|\.\d+))?$/;
const CHORD_TOKEN_RE = /^(?:-|[b♭]?[IViv]+(?:o|7)?)$/;

export function parseSong(def: SongDef): Song {
  const barStrings = def.melody
    .split('|')
    .map((s) => s.trim())
    .filter((s) => s.length > 0);

  if (barStrings.length === 0) {
    throw new Error(`Melody in song "${def.id}" has no bars.`);
  }

  const bars = barStrings.length;
  const notes: SongNote[] = [];
  let currentTime = 0;

  for (let barIndex = 0; barIndex < bars; barIndex++) {
    const barStr = barStrings[barIndex]!;
    const tokens = barStr.split(/\s+/).filter((t) => t.length > 0);
    let barDuration = 0;

    for (const token of tokens) {
      const restMatch = REST_RE.exec(token);
      if (restMatch) {
        const length = restMatch[1] !== undefined ? parseFloat(restMatch[1]) : 1;
        barDuration += length;
        currentTime += length;
        continue;
      }

      const noteMatch = NOTE_RE.exec(token);
      if (noteMatch) {
        const degree = parseInt(noteMatch[1]!, 10);
        const octave = noteMatch[2] === ',' ? -1 : noteMatch[2] === "'" ? 1 : 0;
        const length = noteMatch[3] !== undefined ? parseFloat(noteMatch[3]) : 1;
        notes.push({
          at: currentTime,
          degree,
          octave,
          length,
        });
        barDuration += length;
        currentTime += length;
        continue;
      }

      throw new Error(`Unknown melody token "${token}" in bar ${barIndex + 1} of song "${def.id}".`);
    }

    if (Math.abs(barDuration - def.beatsPerBar) > 1e-4) {
      throw new Error(
        `Bar ${barIndex + 1} of song "${def.id}" duration ${barDuration} does not equal beatsPerBar ${def.beatsPerBar}.`,
      );
    }
  }

  const chordTokens = def.chords
    .replace(/\|/g, ' | ')
    .trim()
    .split(/\s+/)
    .filter((t) => t.length > 0 && t !== '|');

  const expectedSlots = bars * slotsPerBar(def.beatsPerBar);
  if (chordTokens.length !== expectedSlots) {
    throw new Error(
      `Song "${def.id}" chord-token count ${chordTokens.length} ≠ bars × slotsPerBar (${bars} × ${slotsPerBar(def.beatsPerBar)} = ${expectedSlots}).`,
    );
  }

  for (let i = 0; i < chordTokens.length; i++) {
    const token = chordTokens[i]!;
    if (!CHORD_TOKEN_RE.test(token)) {
      throw new Error(`Unknown chord token "${token}" at slot ${i} in song "${def.id}".`);
    }
  }

  return {
    id: def.id,
    title: def.title,
    beatsPerBar: def.beatsPerBar,
    bars,
    bpm: def.bpm ?? 80,
    notes,
    chords: chordTokens,
    accept: def.accept,
  };
}
