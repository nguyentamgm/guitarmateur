import { describe, expect, it } from 'vitest';
import { note, pc, type Key } from '../music';
import { chordLabel, chordNotes, suggestedChords, toneRole, type Chord } from './chord';
import { romanNumeral } from './roman';

describe('chordNotes / toneRole', () => {
  it('B♭m7 has roles R, ♭3, 5, ♭7 spelled correctly', () => {
    const chord: Chord = { tonic: note('B', -1), quality: 'm7' };
    const notes = chordNotes(chord);
    expect(notes.map((n) => `${n.letter}${n.alter}`)).toEqual(['B-1', 'D-1', 'F0', 'A-1']);
    expect(toneRole(note('D', -1), chord)).toBe('3');
    expect(toneRole(note('F', 0), chord)).toBe('5');
    expect(toneRole(note('A', -1), chord)).toBe('7');
    expect(toneRole(note('C', 0), chord)).toBeNull();
  });

  it('toneRole does not throw on theoretical-key (double-flat) chord tonics', () => {
    // F𝄫 (F double-flat, pc 3) — transpose(F𝄫, m7) requires alter -3 and used to throw RangeError.
    // dom7 chord-tone pitch classes above pc 3: R=3, 3=7, 5=10, 7=1.
    const chord: Chord = { tonic: note('F', -2), quality: 'dom7' };
    expect(toneRole(note('F', -2), chord)).toBe('R'); // pc 3
    expect(toneRole(note('G', 0), chord)).toBe('3'); // pc 7
    expect(toneRole(note('C', -2), chord)).toBe('5'); // pc 10 (C𝄫)
    expect(toneRole(note('D', -1), chord)).toBe('7'); // pc 1
    expect(toneRole(note('A', 0), chord)).toBeNull(); // pc 9, not a chord tone
  });

  it('E7 (dominant) tones', () => {
    const chord: Chord = { tonic: note('E'), quality: 'dom7' };
    expect(chordNotes(chord).map((n) => n.letter)).toEqual(['E', 'G', 'B', 'D']);
  });

  it('chordLabel formats suffixes', () => {
    expect(chordLabel({ tonic: note('C'), quality: 'M' })).toBe('C');
    expect(chordLabel({ tonic: note('A'), quality: 'm' })).toBe('Am');
    expect(chordLabel({ tonic: note('E'), quality: 'dom7' })).toBe('E7');
    expect(chordLabel({ tonic: note('F'), quality: 'm7' })).toBe('Fm7');
    expect(chordLabel({ tonic: note('G'), quality: 'M7' })).toBe('Gmaj7');
  });
});

describe('suggestedChords', () => {
  it('A minor pentatonic: i iv V7 ♭III ♭VII ♭VI, all pcs distinct-consistent with A', () => {
    const key: Key = { tonic: note('A'), scaleId: 'minorPentatonic' };
    const s = suggestedChords(key);
    expect(s.map((x) => x.roman)).toEqual(['i', 'iv', 'V7', '♭III', '♭VII', '♭VI']);
    expect(pc(s[0]!.chord.tonic)).toBe(pc(note('A')));
  });

  it('C major pentatonic: I IV V7 ii vi', () => {
    const key: Key = { tonic: note('C'), scaleId: 'majorPentatonic' };
    const s = suggestedChords(key);
    expect(s.map((x) => x.roman)).toEqual(['I', 'IV', 'V7', 'ii', 'vi']);
  });
});

describe('romanNumeral matches suggestedChords for every offered tonic', () => {
  const tonics = [
    note('A'), note('B', -1), note('B'), note('C'), note('C', 1), note('D'),
    note('E', -1), note('E'), note('F'), note('F', 1), note('G'), note('G', 1),
  ];
  it.each(tonics)('%o', (tonic) => {
    for (const scaleId of ['minorPentatonic', 'majorPentatonic', 'blues'] as const) {
      const key: Key = { tonic, scaleId };
      for (const s of suggestedChords(key)) {
        expect(romanNumeral(key, s.chord)).toBe(s.roman);
      }
    }
  });
});
