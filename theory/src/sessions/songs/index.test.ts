import { describe, expect, it } from 'vitest';
import { SONGS, type SongId } from './index';
import { slotBeats, slotsPerBar } from './parse';

const CHORD_TONES: Readonly<Record<string, ReadonlySet<number>>> = {
  I: new Set([1, 3, 5]),
  IV: new Set([4, 6, 1]),
  V: new Set([5, 7, 2]),
};

describe('SONGS registry', () => {
  const songIds = Object.keys(SONGS) as SongId[];

  it('contains exactly the eight songs from docs/theory-sessions.md', () => {
    expect(songIds.sort()).toEqual([
      'amazing-grace',
      'frere-jacques',
      'happy-birthday',
      'jingle-bells',
      'london-bridge',
      'mary-lamb',
      'ode-to-joy',
      'twinkle',
    ]);
  });

  it('every song parses and has the expected slot count: 4/4 → bars × 2, 3/4 → bars', () => {
    for (const id of songIds) {
      const song = SONGS[id];
      expect(song).toBeDefined();
      expect(song.bars).toBeGreaterThan(0);
      expect(song.notes.length).toBeGreaterThan(0);

      const expectedSlots =
        song.beatsPerBar === 4 ? song.bars * 2 : song.bars;
      expect(song.chords.length).toBe(expectedSlots);
      expect(song.chords.length).toBe(song.bars * slotsPerBar(song.beatsPerBar));
    }
  });

  it('satisfies the chord-tone guard: slots with reference I/IV/V and a melody note at slot start are chord tones in >= 60%', () => {
    for (const id of songIds) {
      const song = SONGS[id];
      const beatsInSlot = slotBeats(song.beatsPerBar);
      let examinedSlots = 0;
      let chordToneMatches = 0;

      for (let s = 0; s < song.chords.length; s++) {
        const ref = song.chords[s]!;
        if (!['I', 'IV', 'V'].includes(ref)) continue;

        const slotStart = s * beatsInSlot;
        const noteAtStart = song.notes.find((n) => Math.abs(n.at - slotStart) < 1e-4);
        if (!noteAtStart) continue;

        examinedSlots++;
        const tones = CHORD_TONES[ref]!;
        if (tones.has(noteAtStart.degree)) {
          chordToneMatches++;
        }
      }

      expect(
        examinedSlots,
        `Song "${id}" has no examined slots with reference I/IV/V and start note`,
      ).toBeGreaterThan(0);

      const ratio = chordToneMatches / examinedSlots;
      expect(
        ratio,
        `Song "${id}" chord tone ratio ${ratio.toFixed(2)} (${chordToneMatches}/${examinedSlots}) is below 60%`,
      ).toBeGreaterThanOrEqual(0.6);
    }
  });
});
