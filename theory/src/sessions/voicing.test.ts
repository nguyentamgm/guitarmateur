import { describe, expect, it } from 'vitest';
import { openVoicing } from '../core/fretboard';
import { chordNotes, parseNote, pc, type Chord } from '../core/music';
import { OPEN_SHAPE_CHORDS, chordShape, shapeMidis } from './voicing';

describe('sessions chordShape and voicings', () => {
  it('every chord of OPEN_SHAPE_CHORDS has an open voicing', () => {
    for (const c of OPEN_SHAPE_CHORDS) {
      const v = openVoicing(c);
      expect(v, `Expected open voicing for ${c.root.letter}${c.id}`).not.toBeNull();
    }
  });

  it('Em is open with 6 notes and lowest midi 40; E major differs in exactly one note one fret higher', () => {
    const emChord: Chord = { root: parseNote('E'), id: 'minor' };
    const eChord: Chord = { root: parseNote('E'), id: 'major' };

    const em = chordShape(emChord);
    const e = chordShape(eChord);

    expect(em.barreFret).toBeNull();
    expect(em.notes).toHaveLength(6);
    expect(shapeMidis(em)[0]).toBe(40);

    expect(e.barreFret).toBeNull();
    expect(e.notes).toHaveLength(6);

    // E major differs from Em in exactly one note, one fret higher (the 3rd: G -> G#)
    let diffCount = 0;
    for (let i = 0; i < 6; i++) {
      const emNote = em.notes[i]!;
      const eNote = e.notes[i]!;
      expect(emNote.string).toBe(eNote.string);
      if (emNote.fret !== eNote.fret) {
        diffCount++;
        expect(eNote.fret).toBe(emNote.fret + 1);
        expect(eNote.midi).toBe(emNote.midi + 1);
      }
    }
    expect(diffCount).toBe(1);
  });

  it('assigns the lowest barre fret >= 1 for non-open chords', () => {
    const fMajor = chordShape({ root: parseNote('F'), id: 'major' });
    expect(fMajor.barreFret).toBe(1);

    const bbMajor = chordShape({ root: parseNote('Bb'), id: 'major' });
    expect(bbMajor.barreFret).toBe(1);

    const bMinor = chordShape({ root: parseNote('B'), id: 'minor' });
    expect(bMinor.barreFret).toBe(2);

    const cMinor = chordShape({ root: parseNote('C'), id: 'minor' });
    expect(cMinor.barreFret).toBe(3);

    const ebMajor = chordShape({ root: parseNote('Eb'), id: 'major' });
    expect(ebMajor.barreFret).toBe(6);
  });

  it('verifies chord tones, root as lowest note, and presence of root and 3rd for all test chords', () => {
    const testChords: Chord[] = [
      { root: parseNote('E'), id: 'minor' },
      { root: parseNote('E'), id: 'major' },
      { root: parseNote('F'), id: 'major' },
      { root: parseNote('Bb'), id: 'major' },
      { root: parseNote('B'), id: 'minor' },
      { root: parseNote('C'), id: 'minor' },
      { root: parseNote('Eb'), id: 'major' },
    ];

    for (const c of testChords) {
      const shape = chordShape(c);
      const midis = shapeMidis(shape);
      const cNotes = chordNotes(c);
      const chordPcs = new Set(cNotes.map(pc));
      const rootPc = pc(c.root);

      // Root is lowest note
      expect(midis[0]! % 12).toBe(rootPc);
      expect(midis[0]).toBe(Math.min(...midis));

      // Each note of shapeMidis() is a note of the chord
      for (const m of midis) {
        expect(chordPcs.has(m % 12)).toBe(true);
      }

      // Root and 3rd are present
      const degrees = new Set(shape.notes.map((n) => n.degree));
      expect(degrees.has('1')).toBe(true);
      const hasThird = degrees.has('3') || degrees.has('b3');
      expect(hasThird).toBe(true);
    }
  });
});
