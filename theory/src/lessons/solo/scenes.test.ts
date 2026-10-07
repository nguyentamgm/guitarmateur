import { describe, expect, it } from 'vitest';
import { EIGHTHS_PER_BAR, seededRandom } from '../../core/audio';
import { LICK_EIGHTHS, chordNotes, format, parseNote, pc, scaleNotes } from '../../core/music';
import {
  BACKINGS,
  BACKING_IDS,
  PHRASE_BARS,
  SOLO_FRETS,
  backingBars,
  backingKeys,
  backingWindow,
  guideLine,
  outsideNotes,
  phrase,
  phraseRole,
  soloWindow,
  targets,
  toneIn,
  uniqueChords,
  wrongScale,
  type BackingId,
  earQuestion,
  earWindow,
  judgeEar,
} from './scenes';

const n = parseNote;
const names = (xs: readonly { name: string }[]) => xs.map((x) => x.name);
const every = (fn: (id: BackingId, tonic: ReturnType<typeof n>) => void) => {
  for (const id of BACKING_IDS) for (const k of backingKeys(id)) fn(id, k);
};

function seeded(seed: number) {
  let s = seed;
  return () => (s = (s * 1103515245 + 12345) % 2147483648) / 2147483648;
}

describe('the backings (K7.1, K5.3, K5.4)', () => {
  it('plays the 12-bar blues, I–V–vi–IV, i–VII–VI–VII and ii–V–I', () => {
    expect(backingBars('blues', n('A')).map((b) => b.symbol)).toEqual(['A7', 'A7', 'A7', 'A7', 'D7', 'D7', 'A7', 'A7', 'E7', 'D7', 'A7', 'A7']);
    expect(backingBars('pop', n('G')).map((b) => b.symbol)).toEqual(['G', 'D', 'Em', 'C']);
    expect(backingBars('rock', n('A')).map((b) => b.symbol)).toEqual(['Am', 'G', 'F', 'G']);
    expect(backingBars('jazz', n('C')).map((b) => b.symbol)).toEqual(['Dm7', 'G7', 'Cmaj7', 'Cmaj7']);
    expect(backingBars('jazz', n('C')).map((b) => b.degree)).toEqual(['ii7', 'V7', 'Imaj7', 'Imaj7']);
  });

  it('offers twelve keys, major or minor by the home, each default among them', () => {
    for (const id of BACKING_IDS) {
      expect(backingKeys(id)).toHaveLength(12);
      expect(backingKeys(id).some((k) => pc(k) === pc(BACKINGS[id].tonic))).toBe(true);
    }
    expect(backingKeys('rock').map(format)).toContain('F♯');
    expect(backingKeys('pop').map(format)).toContain('B♭');
  });
});

describe('step 1: the scale under the hand (K7.1, K3.4)', () => {
  it('is pentatonic box 1, with the blue note or the 4 and 7 filled in', () => {
    expect(names(backingWindow('rock', n('A')).notes)).toEqual(['A', 'C', 'D', 'E', 'G', 'A', 'C', 'D', 'E', 'G', 'A', 'C']);
    const blues = backingWindow('blues', n('A'));
    expect(names(blues.notes.filter((x) => x.isAdded))).toEqual(['E♭', 'E♭']);
    const jazz = backingWindow('jazz', n('C'));
    expect([jazz.minFret, jazz.maxFret]).toEqual([5, 8]);
    expect(new Set(names(jazz.notes.filter((x) => x.isAdded)))).toEqual(new Set(['F', 'B']));
  });

  it('stays in one hand position, every note of the scale and nothing else', () => {
    every((id, k) => {
      const w = backingWindow(id, k);
      expect(w.maxFret - w.minFret, `${id} ${format(k)}`).toBeLessThanOrEqual(4);
      expect(w.maxFret).toBeLessThanOrEqual(SOLO_FRETS);
      const scale = new Set(scaleNotes(k, BACKINGS[id].scale).map(pc));
      for (const x of w.notes) expect(scale.has(pc(x.pitch))).toBe(true);
      expect(new Set(w.notes.map((x) => pc(x.pitch)))).toEqual(scale);
      for (let i = 1; i < w.notes.length; i++) expect(w.notes[i]!.midi).toBeGreaterThan(w.notes[i - 1]!.midi);
    });
  });

  it('names the wrong pentatonic and the notes where it rubs', () => {
    expect(wrongScale('rock')).toBe('majorPentatonic');
    expect(wrongScale('pop')).toBe('minorPentatonic');
    expect(outsideNotes('rock', n('A'))).toEqual(['C♯', 'F♯']);
    expect(outsideNotes('pop', n('G'))).toEqual(['B♭', 'F']);
    expect(outsideNotes('jazz', n('C'))).toEqual(['E♭', 'B♭']);
    expect(names(soloWindow(n('A'), 'majorPentatonic').notes).slice(0, 2)).toEqual(['F♯', 'A']);
  });
});

describe('step 2: chord tones light up (K7.2)', () => {
  it('reads each note of the box as a degree of the chord, or not a chord tone', () => {
    const w = backingWindow('blues', n('A'));
    const d7 = backingBars('blues', n('A'))[4]!.chord;
    const lit = w.notes.filter((x) => toneIn(x, d7));
    expect(new Set(lit.map((x) => `${x.name}=${toneIn(x, d7)}`))).toEqual(new Set(['A=5', 'C=b7', 'D=1']));
  });

  it('lights some chord tone of every chord in every key', () => {
    every((id, k) => {
      const w = backingWindow(id, k);
      for (const b of backingBars(id, k)) expect(w.notes.some((x) => toneIn(x, b.chord)), `${b.symbol} in ${id}`).toBe(true);
    });
  });

  it('lists each chord once', () => {
    expect(uniqueChords(backingBars('blues', n('A'))).map((b) => b.symbol)).toEqual(['A7', 'D7', 'E7']);
    expect(uniqueChords(backingBars('rock', n('A'))).map((b) => b.symbol)).toEqual(['Am', 'G', 'F']);
  });
});

describe('step 3: aim for the 3rd (K7.2)', () => {
  it('aims for the 3rd, else the 7th, else the root', () => {
    const jazz = backingWindow('jazz', n('C'));
    expect(guideLine(jazz, backingBars('jazz', n('C'))).map((g) => `${g.note.name}:${g.degree}`)).toEqual(['F:b3', 'B:3', 'E:3', 'E:3']);
    // The blues box has no C♯, F♯ or G♯: the line falls back to each chord's ♭7.
    const blues = guideLine(backingWindow('blues', n('A')), backingBars('blues', n('A')));
    expect([...new Set(blues.map((g) => `${g.bar.symbol}:${g.note.name}:${g.degree}`))]).toEqual(['A7:G:b7', 'D7:C:b7', 'E7:D:b7']);
    // A triad has no 7th: D in G major pentatonic has no F♯, so its root.
    expect(targets(backingWindow('pop', n('G')), backingBars('pop', n('G'))[1]!.chord).degree).toBe('1');
  });

  it('moves as little as it can, and repeats a target while the chord holds', () => {
    every((id, k) => {
      const line = guideLine(backingWindow(id, k), backingBars(id, k));
      for (let i = 1; i < line.length; i++) {
        expect(chordNotes(line[i]!.bar.chord).some((t) => pc(t) === pc(line[i]!.note.pitch))).toBe(true);
        if (line[i]!.bar.symbol === line[i - 1]!.bar.symbol) expect(line[i]!.note).toEqual(line[i - 1]!.note);
        expect(Math.abs(line[i]!.note.midi - line[i - 1]!.note.midi), `${id} ${format(k)}`).toBeLessThanOrEqual(7);
      }
    });
  });
});

describe('step 4: say it, say it again, change it (K7.4)', () => {
  it('builds groups of four bars: idea, the same again, a new ending, then space', () => {
    const random = seeded(5);
    every((id, k) => {
      const w = backingWindow(id, k);
      const bars = backingBars(id, k);
      const p = phrase(w, bars, random);
      expect(p).toHaveLength(bars.length);
      for (let g = 0; g < bars.length; g += PHRASE_BARS) {
        const [idea, again, change, yours] = p.slice(g, g + 4);
        expect(again).toEqual(idea);
        expect(yours).toEqual([]);
        expect(change!.map((x) => x.at)).toEqual(idea!.map((x) => x.at));
        expect(change!.slice(0, -1)).toEqual(idea!.slice(0, -1));
        expect(change!.at(-1)!.index).not.toBe(idea!.at(-1)!.index);
        for (const bar of [idea!, change!]) expect(bar.at(-1)!.index).not.toBe(bar.at(-2)!.index);
        expect(toneIn(idea!.at(-1)!.note, bars[g]!.chord), `${id} ${format(k)} lands`).not.toBeNull();
        expect(toneIn(change!.at(-1)!.note, bars[g + 2]!.chord), `${id} ${format(k)} changes`).not.toBeNull();
      }
    });
    expect([0, 1, 2, 3, 4].map(phraseRole)).toEqual(['idea', 'again', 'change', 'yours', 'idea']);
    // Ideas are timed in the same eighths the backing plays.
    expect(LICK_EIGHTHS).toBe(EIGHTHS_PER_BAR);
  });
});

describe('step 5: hear it, play it back (K7.5)', () => {
  const box = earWindow();

  it('asks in A minor pentatonic, box 1 at frets 5–8', () => {
    expect([box.minFret, box.maxFret]).toEqual([5, 8]);
    expect(new Set(box.notes.map((n) => n.name))).toEqual(new Set(['A', 'C', 'D', 'E', 'G']));
  });

  it('asks 3 or 4 notes from the box, with a rhythm inside one bar', () => {
    const random = seededRandom(7);
    for (let i = 0; i < 200; i++) {
      const q = earQuestion(box, random);
      expect([3, 4]).toContain(q.length);
      for (const n of q) {
        expect(box.notes.some((b) => b.midi === n.midi && b.string === n.string && b.fret === n.fret)).toBe(true);
        expect(n.at + n.length).toBeLessThanOrEqual(LICK_EIGHTHS);
      }
      q.slice(1).forEach((n, k) => expect(n.at).toBeGreaterThan(q[k]!.at));
    }
  });

  it('never asks the same idea twice in a row', () => {
    const random = seededRandom(3);
    let q = earQuestion(box, random);
    for (let i = 0; i < 100; i++) {
      const next = earQuestion(box, random, q);
      expect(next.map((n) => n.midi)).not.toEqual(q.map((n) => n.midi));
      q = next;
    }
  });

  it('says which way the next note lies after a wrong click', () => {
    const q = earQuestion(box, seededRandom(11));
    const want = q[1]!.midi;
    expect(judgeEar(q, 1, want)).toEqual({ kind: 'right' });
    expect(judgeEar(q, 1, want - 2)).toEqual({ kind: 'wrong', direction: 'higher' });
    expect(judgeEar(q, 1, want + 3)).toEqual({ kind: 'wrong', direction: 'lower' });
  });
});
