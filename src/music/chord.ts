import { IV, type Interval } from './interval';
import { format, pc, transpose, type NoteName } from './pitch';
import type { Key } from './key';

export type ToneRole = 'R' | '3' | '5' | '7';
export type QualityId = 'm' | 'M' | 'dom7' | 'm7' | 'M7';

export interface Chord {
  tonic: NoteName;
  quality: QualityId;
}

export interface ChordEntry {
  chord: Chord;
  roman?: string;
}

export const CHORD_QUALITIES: Record<QualityId, { name: string; intervals: Interval[] }> = {
  m:    { name: 'minor', intervals: [IV.P1, IV.m3, IV.P5] },
  M:    { name: 'major', intervals: [IV.P1, IV.M3, IV.P5] },
  dom7: { name: 'dom7',  intervals: [IV.P1, IV.M3, IV.P5, IV.m7] },
  m7:   { name: 'min7',  intervals: [IV.P1, IV.m3, IV.P5, IV.m7] },
  M7:   { name: 'maj7',  intervals: [IV.P1, IV.M3, IV.P5, IV.M7] },
};

const ROLE_ORDER: ToneRole[] = ['R', '3', '5', '7'];

export function chordNotes(chord: Chord): NoteName[] {
  return CHORD_QUALITIES[chord.quality].intervals.map((iv) => transpose(chord.tonic, iv));
}

export function toneRole(note: NoteName, chord: Chord): ToneRole | null {
  const notePc = pc(note);
  const { intervals } = CHORD_QUALITIES[chord.quality];
  for (let i = 0; i < intervals.length; i++) {
    if (pc(transpose(chord.tonic, intervals[i]!)) === notePc) {
      return ROLE_ORDER[i] ?? null;
    }
  }
  return null;
}

export function chordLabel(chord: Chord): string {
  const suffix: Record<QualityId, string> = {
    m: 'm', M: '', dom7: '7', m7: 'm7', M7: 'maj7',
  };
  return format(chord.tonic) + suffix[chord.quality];
}

export function suggestedChords(key: Key): { chord: Chord; label: string; roman: string }[] {
  const t = key.tonic;
  const make = (root: NoteName, quality: QualityId, roman: string) => {
    const chord: Chord = { tonic: root, quality };
    return { chord, label: chordLabel(chord), roman };
  };

  if (key.scaleId === 'majorPentatonic') {
    return [
      make(t,                   'M',    'I'),
      make(transpose(t, IV.P4), 'M',    'IV'),
      make(transpose(t, IV.P5), 'dom7', 'V7'),
      make(transpose(t, IV.M2), 'm',    'ii'),
      make(transpose(t, IV.M6), 'm',    'vi'),
    ];
  }

  if (key.scaleId === 'major') {
    return [
      make(t,                   'M7',    'I'),
      make(transpose(t, IV.M2), 'm7',    'ii'),
      make(transpose(t, IV.M3), 'm7',    'iii'),
      make(transpose(t, IV.P4), 'M7',    'IV'),
      make(transpose(t, IV.P5), 'dom7',  'V'),
      make(transpose(t, IV.M6), 'm7',    'vi'),
    ];
  }

  if (key.scaleId === 'dorian') {
    return [
      make(t,                   'm7',   'i'),
      make(transpose(t, IV.P4), 'dom7', 'IV'),
      make(transpose(t, IV.m7), 'M7',   '♭VII'),
    ];
  }

  if (key.scaleId === 'mixolydian') {
    return [
      make(t,                   'dom7', 'I'),
      make(transpose(t, IV.m7), 'M7',   '♭VII'),
      make(transpose(t, IV.m3), 'M7',   '♭III'),
    ];
  }

  if (key.scaleId === 'natural-minor') {
    return [
      make(t,                   'm7',  'i'),
      make(transpose(t, IV.m3), 'M7',  '♭III'),
      make(transpose(t, IV.m7), 'M7',  '♭VII'),
      make(transpose(t, IV.P5), 'm7',  'v'),
    ];
  }

  // minorPentatonic + blues
  return [
    make(t,                   'm',    'i'),
    make(transpose(t, IV.P4), 'm',    'iv'),
    make(transpose(t, IV.P5), 'dom7', 'V7'),
    make(transpose(t, IV.m3), 'M',    '♭III'),
    make(transpose(t, IV.m7), 'M',    '♭VII'),
    make(transpose(t, IV.m6), 'M',    '♭VI'),
  ];
}
