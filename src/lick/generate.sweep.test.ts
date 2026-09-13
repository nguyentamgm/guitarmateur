import { describe, expect, it } from 'vitest';
import { TONICS, SCALE_IDS, defaultProgression, toneRole, type Chord, type Key, type ToneRole } from '../music';
import { TUNINGS, positions, mergedBox, type Box } from '../fretboard';
import { generateLick, type LickParams } from './index';
import { countUnplayableMoves } from './path';

/**
 * Bounded, engine-driven property sweep over the space the UI can actually reach: every scale,
 * a representative set of tonic spellings, every box and adjacent box pair, every level/role/
 * resolveToNext/bars combination, over the first two entries of the key's default progression.
 * Nothing here is hand-crafted — boxes and chords are built the same way the UI builds them.
 *
 * Violations are accumulated and asserted once per case (25 shown) rather than asserted inline:
 * a few million `expect` calls turn a ~10s sweep into a ~35s one, and the context-tagged messages
 * keep the diagnostics just as readable.
 */

/** Chase order `pickChordTone` (contour.ts) uses when the requested role has no box candidates. */
const ROLE_FALLBACK: ToneRole[] = ['3', '5', 'R'];

/** First role in that chain with at least one matching note in the box — what the landing note must be. */
function landingFallbackRole(box: Box, chord: Chord, role: ToneRole): ToneRole {
  const order = [role, ...ROLE_FALLBACK.filter((r) => r !== role)];
  for (const r of order) {
    if (box.notes.some((n) => toneRole(n.pitch, chord) === r)) return r;
  }
  throw new Error('fallback chain exhausted: no R/3/5/7 chord tone present in box');
}

// A natural, a flat, and a sharp spelling, plus one more natural — representative, not exhaustive.
const tonics = [
  TONICS.find((t) => t.letter === 'A' && t.alter === 0)!,
  TONICS.find((t) => t.letter === 'C' && t.alter === 0)!,
  TONICS.find((t) => t.letter === 'F' && t.alter === 1)!,
  TONICS.find((t) => t.letter === 'E' && t.alter === -1)!,
];

const levels: LickParams['level'][] = [1, 2, 3, 4, 5];
const roles: LickParams['targetRole'][] = ['R', '3', '5', '7'];

/** Every single box plus every adjacent pair, in minFret-sorted (display) order. */
function boxSelections(pos: ReturnType<typeof positions>): number[][] {
  const indices = pos.map((p) => p.index);
  const singles = indices.map((idx) => [idx]);
  const pairs = indices.slice(0, -1).map((idx, i) => [idx, indices[i + 1]!]);
  return [...singles, ...pairs];
}

function spelling(alter: number): string {
  return alter > 0 ? '#'.repeat(alter) : alter < 0 ? 'b'.repeat(-alter) : '';
}

describe('generateLick — property sweep across the UI parameter space', () => {
  for (const scaleId of SCALE_IDS) {
    for (const tonic of tonics) {
      const key: Key = { tonic, scaleId };
      const pos = positions(TUNINGS.standard, key);
      const progression = defaultProgression(key).slice(0, 2);
      const tonicLabel = `${tonic.letter}${spelling(tonic.alter)}`;

      for (const selection of boxSelections(pos)) {
        const box = mergedBox(pos, selection);
        const cells = new Set(box.notes.map((n) => `${n.string}:${n.fret}`));
        const label = `${scaleId} ${tonicLabel} box[${selection.join(',')}]`;

        it(label, { timeout: 60000 }, () => {
          const violations: string[] = [];
          const check = (ok: boolean, msg: string) => {
            if (!ok) violations.push(msg);
          };

          for (let e = 0; e < progression.length; e++) {
            const chord = progression[e]!;
            const next = progression[(e + 1) % progression.length]!;

            for (const level of levels) {
              for (const role of roles) {
                for (const resolveToNext of [false, true]) {
                  for (const bars of [1, 2] as const) {
                    const params: LickParams = { level, targetRole: role, resolveToNext, seed: 1, bars };
                    const lick = generateLick(box, chord, next, params);
                    const targetChord = resolveToNext ? next : chord;
                    const notes = lick.notes;
                    const ctx = `${label} e${e} lvl${level} role${role} rtn${resolveToNext} bars${bars}`;

                    check(notes.length > 0, `${ctx}: empty lick`);
                    check(lick.lengthBeats === bars * 4, `${ctx}: lengthBeats ${lick.lengthBeats}`);

                    let prevEnd = -Infinity;
                    for (let i = 0; i < notes.length; i++) {
                      const n = notes[i]!;
                      check(cells.has(`${n.string}:${n.fret}`), `${ctx}: note ${i} outside the box (${n.string}:${n.fret})`);
                      check(n.durationBeats > 0, `${ctx}: note ${i} duration ${n.durationBeats}`);
                      check(n.startBeat >= prevEnd - 1e-9, `${ctx}: note ${i} starts at ${n.startBeat}, overlapping the previous note's end ${prevEnd}`);
                      prevEnd = n.startBeat + n.durationBeats;

                      const isLast = i === notes.length - 1;
                      const expectedRole = toneRole(n.pitch, isLast ? targetChord : chord) ?? null;
                      check((n.role ?? null) === expectedRole, `${ctx}: note ${i} role ${String(n.role)} but toneRole says ${String(expectedRole)}`);

                      if (i > 0) {
                        const prev = notes[i - 1]!;
                        const dString = Math.abs(n.string - prev.string);
                        // Hardcoded independently of path.ts's LEVEL_CAPS table, so a regression that
                        // relaxes those caps still gets caught here.
                        const sameFretJump = n.fret === prev.fret && n.fret > 0 && dString >= 2;
                        check(!sameFretJump, `${ctx}: note ${i} is a same-fret string jump (${prev.string}:${prev.fret} -> ${n.string}:${n.fret})`);
                        if (level === 1 || level === 2) {
                          check(dString <= 1, `${ctx}: level ${level} moves across ${dString} strings (${prev.string}:${prev.fret} -> ${n.string}:${n.fret})`);
                        }
                      }
                    }

                    const last = notes[notes.length - 1]!;
                    check(
                      Math.abs(last.startBeat + last.durationBeats - lick.lengthBeats) < 0.001,
                      `${ctx}: lick ends at ${last.startBeat + last.durationBeats}, expected ${lick.lengthBeats}`,
                    );
                    const expectedLanding = landingFallbackRole(box, targetChord, role);
                    check(
                      last.role === expectedLanding,
                      `${ctx}: landing role ${String(last.role)} but the fallback chain expects ${expectedLanding}`,
                    );
                    const badMoves = countUnplayableMoves(notes, level);
                    check(badMoves === 0, `${ctx}: countUnplayableMoves = ${badMoves}`);
                  }
                }
              }
            }
          }

          expect(violations.slice(0, 25)).toEqual([]);
        });
      }
    }
  }
});
