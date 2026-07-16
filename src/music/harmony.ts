import { IV } from './interval';
import { transpose } from './pitch';
import type { Key } from './key';
import type { Chord } from './chord';

/**
 * Default starting progression for a key, one row per scale registry entry (see
 * docs/plans/06-state-and-persistence.md): minorPentatonic i–♭VII–♭VI–♭VII, majorPentatonic
 * I–V–vi–IV, blues I7–IV7–I7–V7. Qualities are chosen so `romanNumeral` reproduces these numerals
 * exactly (verified in harmony.test.ts).
 */
export function defaultProgression(key: Key): Chord[] {
  const t = key.tonic;

  if (key.scaleId === 'majorPentatonic') {
    return [
      { tonic: t, quality: 'M' },
      { tonic: transpose(t, IV.P5), quality: 'M' },
      { tonic: transpose(t, IV.M6), quality: 'm' },
      { tonic: transpose(t, IV.P4), quality: 'M' },
    ];
  }

  if (key.scaleId === 'blues') {
    return [
      { tonic: t, quality: 'dom7' },
      { tonic: transpose(t, IV.P4), quality: 'dom7' },
      { tonic: t, quality: 'dom7' },
      { tonic: transpose(t, IV.P5), quality: 'dom7' },
    ];
  }

  if (key.scaleId === 'major') {
    return [
      { tonic: t, quality: 'M7' },
      { tonic: transpose(t, IV.P4), quality: 'M7' },
      { tonic: transpose(t, IV.P5), quality: 'dom7' },
      { tonic: transpose(t, IV.M6), quality: 'm7' },
    ];
  }

  if (key.scaleId === 'dorian') {
    return [
      { tonic: t, quality: 'm7' },
      { tonic: transpose(t, IV.P4), quality: 'dom7' },
      { tonic: t, quality: 'm7' },
      { tonic: transpose(t, IV.m7), quality: 'M7' },
    ];
  }

  if (key.scaleId === 'mixolydian') {
    return [
      { tonic: t, quality: 'dom7' },
      { tonic: transpose(t, IV.m7), quality: 'M7' },
      { tonic: transpose(t, IV.P4), quality: 'M7' },
      { tonic: t, quality: 'dom7' },
    ];
  }

  if (key.scaleId === 'natural-minor') {
    return [
      { tonic: t, quality: 'm7' },
      { tonic: transpose(t, IV.m3), quality: 'M7' },
      { tonic: transpose(t, IV.m7), quality: 'M7' },
      { tonic: transpose(t, IV.P5), quality: 'm7' },
    ];
  }

  // minorPentatonic
  return [
    { tonic: t, quality: 'm' },
    { tonic: transpose(t, IV.m7), quality: 'M' },
    { tonic: transpose(t, IV.m6), quality: 'M' },
    { tonic: transpose(t, IV.m7), quality: 'M' },
  ];
}
