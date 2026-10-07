import { describe, expect, it } from 'vitest';
import { midiAt } from '../../core/fretboard';
import { chordNotes, format, parseNote, pc } from '../../core/music';
import {
  KEYS_FRETS,
  KEY_CHOICES,
  LEAD_INS,
  approachLoop,
  family,
  homePentatonic,
  homeQuestion,
  judgeHome,
  loopViews,
  progressionViews,
  pullViews,
  quality,
  relativeChords,
  relativeLoop,
  scaleRow,
  stackIndices,
  type ChordView,
} from './scenes';

const n = parseNote;
const syms = (path: readonly ChordView[]) => path.map((v) => v.symbol);
const romans = (path: readonly ChordView[]) => path.map((v) => v.roman);

/** Every chord tone sounds, the root is the lowest note, and nothing falls off the drawn neck. */
function playable(v: ChordView) {
  const sounding = new Set(v.notes.map((x) => midiAt(x) % 12));
  for (const t of chordNotes(v.chord)) expect(sounding.has(pc(t)), `${v.symbol} has ${format(t)}`).toBe(true);
  const lowest = v.notes.reduce((a, b) => (midiAt(b) < midiAt(a) ? b : a));
  expect(midiAt(lowest) % 12, `${v.symbol} root in the bass`).toBe(pc(v.chord.root));
  for (const x of v.notes) expect(x.fret).toBeLessThanOrEqual(KEYS_FRETS);
  for (const x of v.notes) expect(x.fret).toBeGreaterThanOrEqual(0);
}

/** A seeded random in [0, 1), so quiz tests are repeatable. */
function seeded(seed: number) {
  let s = seed;
  return () => {
    s = (s * 1103515245 + 12345) % 2147483648;
    return s / 2147483648;
  };
}

describe('step 1: the chord family (K5.2)', () => {
  it('stacks every other scale note, wrapping round the scale', () => {
    expect(stackIndices(1, 3)).toEqual([0, 2, 4]);
    expect(stackIndices(6, 3)).toEqual([5, 0, 2]);
    expect(stackIndices(7, 4)).toEqual([6, 1, 3, 5]);
    const g = scaleRow(n('G'));
    expect(stackIndices(7, 3).map((i) => format(g[i]!))).toEqual(['F♯', 'A', 'C']);
  });

  it('builds the seven chords of G, triads and sevenths, with their qualities', () => {
    const triads = family(n('G'), 3);
    expect(syms(triads)).toEqual(['G', 'Am', 'Bm', 'C', 'D', 'Em', 'F♯°']);
    expect(triads.map((v) => quality(v.chord.id))).toEqual(['major', 'minor', 'minor', 'major', 'major', 'minor', 'dim']);
    const sevenths = family(n('G'), 4);
    expect(syms(sevenths)).toEqual(['Gmaj7', 'Am7', 'Bm7', 'Cmaj7', 'D7', 'Em7', 'F♯m7♭5']);
    expect(sevenths.map((v) => quality(v.chord.id))).toEqual(['major', 'minor', 'minor', 'major', 'major', 'minor', 'dim']);
  });

  it('voices every chord of every key, the diminished triad stacked from its root', () => {
    for (const k of KEY_CHOICES) {
      for (const size of [3, 4] as const) {
        const chords = family(k, size);
        expect(chords, format(k)).toHaveLength(7);
        chords.forEach(playable);
      }
      const dim = family(k, 3)[6]!;
      expect(dim.shape).toBeNull();
      expect(dim.notes).toHaveLength(3);
      // A stacked chord sits where its lowest note is: the first finger.
      expect(dim.fret).toBe(Math.min(...dim.notes.map((x) => x.fret)));
    }
  });
});

describe('step 2: numbers, not names (K5.3)', () => {
  it('keeps the numerals and changes the names with the key', () => {
    const inG = progressionViews(n('G'), 'I-V-vi-IV');
    const inA = progressionViews(n('A'), 'I-V-vi-IV');
    expect(syms(inG)).toEqual(['G', 'D', 'Em', 'C']);
    expect(syms(inA)).toEqual(['A', 'E', 'F♯m', 'D']);
    expect(romans(inA)).toEqual(romans(inG));
    // The key decides where the hand sits: the I chord stays in the E shape at its home fret.
    expect([inG[0]!.shape, inG[0]!.fret]).toEqual(['E', 3]);
    expect([inA[0]!.shape, inA[0]!.fret]).toEqual(['E', 5]);
    const fromVi = progressionViews(n('G'), 'vi-IV-I-V');
    expect([fromVi[2]!.shape, fromVi[2]!.fret]).toEqual(['E', 3]);
    expect(romans(progressionViews(n('Eb'), 'ii-V-I'))).toEqual(['ii7', 'V7', 'Imaj7', 'Imaj7']);
  });

  it('plays the I chord the same way both times in ii–V–I', () => {
    const path = progressionViews(n('C'), 'ii-V-I');
    expect(path[2]!.notes).toEqual(path[3]!.notes);
  });

  it('keeps a loop in one area of the neck', () => {
    for (const k of KEY_CHOICES) {
      const path = progressionViews(k, 'I-V-vi-IV');
      path.forEach(playable);
      const frets = path.map((v) => v.fret);
      expect(Math.max(...frets) - Math.min(...frets), format(k)).toBeLessThanOrEqual(5);
    }
  });
});

describe('step 3: which chord is home? (K5.1)', () => {
  it('asks in a major key with a lead-in that stops on V7 or IV, and offers the I among four chords', () => {
    const random = seeded(7);
    let q = homeQuestion(random);
    const stops = new Set<string>();
    for (let i = 0; i < 40; i++) {
      const stop = romans(q.lead).at(-1)!;
      stops.add(stop);
      expect(q.mode).toBe('major');
      expect(LEAD_INS.major.some((l) => l.length === q.lead.length)).toBe(true);
      expect(q.choices).toHaveLength(4);
      expect(q.choices.filter((v) => judgeHome(v) === 'right')).toHaveLength(1);
      expect(new Set(romans(q.choices)).size).toBe(4);
      // Never the chord the lead-in stops on, never the diminished chord.
      expect(romans(q.choices).filter((r) => r === stop.replace('7', '') || r === 'vii°')).toEqual([]);
      [...q.lead, ...q.choices].forEach(playable);
      // The lead-in is voiced on its own, whatever the answers are; each answer sits near where it stops.
      expect(q.lead).toEqual(loopViews(q.lead));
      for (const v of q.choices) expect(Math.abs(v.fret - q.lead.at(-1)!.fret)).toBeLessThanOrEqual(6);
      const next = homeQuestion(random, 'major', q);
      expect(pc(next.tonic)).not.toBe(pc(q.tonic));
      q = next;
    }
    expect(stops).toEqual(new Set(['V7', 'IV']));
  });

  it('asks in a minor key: the lead-in starts on i and stops on VII or v, with no V7', () => {
    const random = seeded(11);
    let q = homeQuestion(random, 'minor');
    const keys = new Set<string>();
    for (let i = 0; i < 60; i++) {
      keys.add(format(q.tonic));
      expect(q.mode).toBe('minor');
      expect(romans(q.lead)[0]).toBe('i');
      expect(['VII', 'v']).toContain(romans(q.lead).at(-1));
      expect(q.lead.every((v) => v.chord.id === 'major' || v.chord.id === 'minor')).toBe(true);
      expect(q.choices.filter((v) => judgeHome(v, 'minor') === 'right').map((v) => v.chord)).toEqual([{ root: q.tonic, id: 'minor' }]);
      expect(new Set(romans(q.choices)).size).toBe(4);
      expect(romans(q.choices).filter((r) => r === romans(q.lead).at(-1) || r === 'ii°')).toEqual([]);
      [...q.lead, ...q.choices].forEach(playable);
      const next = homeQuestion(random, 'minor', q);
      expect(pc(next.tonic)).not.toBe(pc(q.tonic));
      q = next;
    }
    // Every minor key comes up, spelled from the core: E♭ minor, not D♯ minor.
    expect(keys.size).toBe(12);
    expect(keys.has('E♭')).toBe(true);
  });

  it('names the relative key\'s home as the near miss: vi in major, III in minor', () => {
    const at = (roman: string) => ({ chord: { root: n('C'), id: 'major' as const }, roman });
    expect(judgeHome(at('I'))).toBe('right');
    expect(judgeHome(at('vi'))).toBe('relative');
    expect(judgeHome(at('IV'))).toBe('away');
    expect(judgeHome(at('i'), 'minor')).toBe('right');
    expect(judgeHome(at('III'), 'minor')).toBe('relative');
    expect(judgeHome(at('I'), 'minor')).toBe('away');
    expect(judgeHome(at('VI'), 'minor')).toBe('away');
  });
});

describe('step 4: V wants to go home, and ii–V–I (K5.5)', () => {
  it('plays I IV V7 I', () => {
    expect(syms(pullViews(n('C')))).toEqual(['C', 'F', 'G7', 'C']);
    expect(romans(pullViews(n('Bb')))).toEqual(['I', 'IV', 'V7', 'I']);
  });

  it('inserts the ii–V of the target just before it', () => {
    expect(syms(approachLoop(n('C'), 'off'))).toEqual(['C', 'Am', 'F', 'C']);
    expect(syms(approachLoop(n('C'), 'IV'))).toEqual(['C', 'Am', 'Gm7', 'C7', 'F', 'C']);
    expect(romans(approachLoop(n('C'), 'IV'))).toEqual(['I', 'vi', 'ii7/IV', 'V7/IV', 'IV', 'I']);
    expect(syms(approachLoop(n('C'), 'I'))).toEqual(['Dm7', 'G7', 'C', 'Am', 'F', 'C']);
    expect(romans(approachLoop(n('G'), 'I'))).toEqual(['ii7', 'V7', 'I', 'vi', 'IV', 'I']);
    expect(syms(approachLoop(n('Eb'), 'IV'))).toEqual(['E♭', 'Cm', 'B♭m7', 'E♭7', 'A♭', 'E♭']);
    for (const k of KEY_CHOICES) approachLoop(k, 'IV').forEach(playable);
  });
});

describe('step 5: same chords, two homes (K5.6, K2.8, K3.7)', () => {
  it('gives every chord of C both numerals', () => {
    const rows = relativeChords(n('C'));
    expect(rows.map((r) => r.symbol)).toEqual(['C', 'Dm', 'Em', 'F', 'G', 'Am', 'B°']);
    expect(rows.map((r) => r.major)).toEqual(['I', 'ii', 'iii', 'IV', 'V', 'vi', 'vii°']);
    expect(rows.map((r) => r.minor)).toEqual(['III', 'iv', 'v', 'VI', 'VII', 'i', 'ii°']);
  });

  it('plays a loop that lands on each home, from the same chords', () => {
    expect(syms(relativeLoop(n('C'), 'major'))).toEqual(['C', 'G', 'Am', 'F']);
    expect(syms(relativeLoop(n('C'), 'minor'))).toEqual(['Am', 'G', 'F', 'G']);
    expect(syms(relativeLoop(n('G'), 'minor'))).toEqual(['Em', 'D', 'C', 'D']);
    for (const k of KEY_CHOICES) {
      const set = new Set(relativeChords(k).map((r) => r.symbol));
      for (const v of [...relativeLoop(k, 'major'), ...relativeLoop(k, 'minor')]) expect(set.has(v.symbol), `${v.symbol} in ${format(k)}`).toBe(true);
    }
  });

  it('shows the same five notes either way, with the root moved', () => {
    for (const k of KEY_CHOICES) {
      const major = homePentatonic(k, 'major');
      const minor = homePentatonic(k, 'minor');
      expect(minor.map((d) => `${d.string}:${d.fret}`).sort()).toEqual(major.map((d) => `${d.string}:${d.fret}`).sort());
      expect(new Set(major.filter((d) => d.root).map((d) => d.name))).toEqual(new Set([format(k)]));
    }
    expect(new Set(homePentatonic(n('C'), 'minor').filter((d) => d.root).map((d) => d.name))).toEqual(new Set(['A']));
  });
});

describe('voicing a loop', () => {
  it('returns one view per chord, in order', () => {
    const slots = family(n('D'), 3).slice(0, 3);
    expect(syms(loopViews(slots))).toEqual(['D', 'Em', 'F♯m']);
  });
});
