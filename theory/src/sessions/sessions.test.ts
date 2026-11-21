import { describe, expect, it } from 'vitest';
import { copyShape, emptyStrings } from '../i18n/copyShape';
import { LANGS } from '../i18n';
import { findLesson } from '../lessons';
import { soloWindow } from '../lessons/solo';
import { parseNote } from '../core/music';
import sitemap from '../../../public/sitemap.xml?raw';
import { mulberry32 } from '@shared/core/rng';
import {
  BLOCK_COPY_FIELDS,
  PARTS,
  SESSIONS,
  PATH_STAGES,
  STAGES,
  findSession,
  sessionBlocks,
  sessionNeighbours,
  sessionsOf,
  type Block,
  type ChordSpec,
  type DrillId,
  type Session,
  type SessionKey,
} from '.';
import { chordIn } from './chordSpec';
import { fixedBoxPhrase } from './boxEcho';
import { DRILLS, type DrillQuestion } from './drills';
import { fixedFillPlan } from './fill';
import { SONGS } from './songs';
import { defaultPattern, strumSteps } from './strum';
import { chordShape } from './voicing';

/** Concept IDs defined as headings (`## K3.4 …`) in docs/theory-knowledge. */
const knowledge = import.meta.glob('../../../docs/theory-knowledge/m*.md', {
  query: '?raw',
  import: 'default',
  eager: true,
}) as Record<string, string>;
const KNOWN_IDS = new Set(
  Object.values(knowledge).flatMap((md) => [...md.matchAll(/^##\s+(K\d+\.\d+)\b/gm)].map((m) => m[1]!)),
);

/** Block kinds that always strum chords; later kinds that strum (changeTap, fillBars, song, transpose) join here. */
const STRUMMING_KINDS: ReadonlySet<Block['kind']> = new Set(['strumAlong', 'chords', 'changeTap', 'fillBars', 'song', 'transpose']);

/** A drill strums when any of its questions (sound or comparison) holds a strummed event. */
function drillStrums(id: DrillId): boolean {
  const drill = DRILLS[id];
  if (!drill) return false;
  const rng = mulberry32(317);
  let prev: DrillQuestion | undefined;
  for (let i = 0; i < 20; i++) {
    prev = drill.next(rng, prev);
    if ([prev.sound, prev.compare].some((s) => s?.events.some((e) => e.strum))) return true;
  }
  return false;
}

const blockStrums = (b: Block): boolean =>
  STRUMMING_KINDS.has(b.kind) ||
  (b.kind === 'backingTrack' && (b.style === 'strum' || b.style === 'comp')) || ((b.kind === 'listen' || b.kind === 'reveal') && drillStrums(b.drill));

const sessionStrums = (s: Session): boolean => sessionBlocks(s).some(blockStrums);

describe('the strumSpeed rule', () => {
  const base = SESSIONS[0]!;
  const lesson: Block = { kind: 'lesson', key: 'l', lesson: 'fretboard', step: 'strings' };
  const only = (block: Block): Session => ({
    ...base,
    parts: { listen: [block], understand: [], play: [], challenge: [] },
  });

  it('counts strumAlong and chords blocks and strumming drills, not lessons', () => {
    expect(sessionStrums(only({ kind: 'chords', key: 'c', in: { tonic: 'G', mode: 'major' }, chords: [1] }))).toBe(true);
    expect(sessionStrums(only({ kind: 'reveal', key: 'r', drill: 'rootNote' }))).toBe(true);
    expect(sessionStrums(only({ kind: 'listen', key: 'f', drill: 'finished' }))).toBe(true);
    expect(sessionStrums(only({ kind: 'listen', key: 'cc', drill: 'chordCount' }))).toBe(true);
    expect(sessionStrums(only({ kind: 'listen', key: 'fof', drill: 'fourOrFive' }))).toBe(true);
    expect(sessionStrums(only({ kind: 'listen', key: 'mb', drill: 'minorBar' }))).toBe(true);
    expect(sessionStrums(only({ kind: 'listen', key: 'km', drill: 'keyMode' }))).toBe(true);
    expect(sessionStrums(only({ kind: 'listen', key: 's7', drill: 'seventh' }))).toBe(true);
    expect(sessionStrums(only({ kind: 'listen', key: 'm', drill: 'meter' }))).toBe(true);
    expect(sessionStrums(only({ kind: 'listen', key: 'sc', drill: 'sameChord' }))).toBe(true);
    expect(sessionStrums(only({ kind: 'listen', key: 'oc', drill: 'oddChord' }))).toBe(true);
    expect(sessionStrums(only({ kind: 'listen', key: 'pm', drill: 'pentaMode' }))).toBe(true);
    expect(sessionStrums(only({ kind: 'fillBars', key: 'fb', in: { tonic: 'G', mode: 'major' }, pool: [1, 4, 5], bars: 4, bpm: 80 }))).toBe(true);
    expect(sessionStrums(only({ kind: 'song', key: 's', in: { tonic: 'G', mode: 'major' }, song: 'frere-jacques', pool: [1], start: 'all' }))).toBe(true);
    expect(sessionStrums(only({ kind: 'transpose', key: 't', bars: [1, 4, 5, 1], tonics: ['G', 'D'] }))).toBe(true);
    expect(sessionStrums(only(lesson))).toBe(false);
  });
});

const playable = (key: SessionKey, spec: ChordSpec) => expect(() => chordShape(chordIn(key, spec).chord)).not.toThrow();

/** The rules a block of each kind must follow; a kind with no entry has none of its own. */
const BLOCK_CHECKS: { [K in Block['kind']]?: (block: Extract<Block, { kind: K }>, session: Session) => void } = {
  lesson: (b) => {
    const lesson = findLesson(b.lesson);
    expect(lesson, `lesson '${b.lesson}' not found`).toBeDefined();
    expect(lesson?.steps.find((s) => s.id === b.step), `step '${b.step}' in lesson '${b.lesson}' not found`).toBeDefined();
  },
  reveal: (b) => {
    expect(DRILLS[b.drill], `drill '${b.drill}' defined in DRILLS`).toBeDefined();
  },
  listen: (b, session) => {
    const drill = DRILLS[b.drill];
    expect(drill, `drill '${b.drill}' defined in DRILLS`).toBeDefined();
    for (const lang of LANGS) {
      const blockCopy = session.copy[lang].blocks[b.key];
      if (blockCopy && 'answers' in blockCopy) {
        expect(Object.keys(blockCopy.answers).sort()).toEqual([...drill!.answers].sort());
        expect(Object.keys(blockCopy.answers).length).toBeGreaterThanOrEqual(2);
      }
    }
  },
  chords: (b) => {
    for (const spec of b.chords) playable(b.in, spec);
  },
  strumAlong: (b) => {
    for (const spec of b.bars) playable(b.in, spec);
    expect(b.bars.length).toBeGreaterThanOrEqual(1);
    expect(b.bpm).toBeGreaterThanOrEqual(40);
    expect(b.bpm).toBeLessThanOrEqual(200);
    const beatsPerBar = b.beatsPerBar ?? 4;
    expect(() => strumSteps(b.bars.length, beatsPerBar, b.pattern ?? defaultPattern(beatsPerBar))).not.toThrow();
  },
  changeTap: (b) => {
    expect(b.pool.length).toBeGreaterThan(0);
    expect(b.bars).toBeGreaterThanOrEqual(4);
    expect(b.holds.length).toBeGreaterThan(0);
    for (const spec of b.pool) playable(b.in, spec);
  },
  fillBars: (b) => {
    const barCount = typeof b.bars === 'number' ? b.bars : b.bars.plan.length;
    expect(barCount).toBeGreaterThanOrEqual(3);
    expect(b.pool.length).toBeGreaterThanOrEqual(2);
    for (const spec of b.pool) playable(b.in, spec);
    if (typeof b.bars !== 'number') {
      const { plan, blanks } = b.bars;
      expect(() => fixedFillPlan(b.pool, plan)).not.toThrow();
      expect(blanks.length).toBeGreaterThan(0);
      expect(new Set(blanks).size).toBe(blanks.length);
      expect(blanks.every((bar) => Number.isInteger(bar) && bar >= 1 && bar <= barCount)).toBe(true);
    }
  },
  boxEcho: (b) => {
    const { firstPhrase } = b;
    if (!firstPhrase) return;
    const box = soloWindow(parseNote(b.tonic), b.scale ?? 'minorPentatonic');
    expect(firstPhrase).toHaveLength(b.notes);
    expect(() => fixedBoxPhrase(box, firstPhrase)).not.toThrow();
  },
  song: (b) => {
    expect(b.in.mode).toBe('major');
    expect(b.pool.length).toBeGreaterThan(0);
    const song = SONGS[b.song];
    expect(song, `song '${b.song}' defined in SONGS`).toBeDefined();
    const poolNumerals = b.pool.map((spec) => chordIn(b.in, spec).roman);
    for (const ref of song.chords) {
      if (ref !== '-') expect(poolNumerals, `song block '${b.key}' pool missing reference '${ref}'`).toContain(ref);
    }
  },
  backingTrack: (b) => {
    expect(b.bars.length).toBeGreaterThan(0);
    expect(b.bpm).toBeGreaterThanOrEqual(40);
    expect(b.bpm).toBeLessThanOrEqual(200);
    for (const tonic of [b.in.tonic, ...(b.keys ?? [])]) {
      for (const spec of b.bars) expect(chordIn({ ...b.in, tonic }, spec).symbol).toBeTruthy();
    }
  },
  transpose: (b) => {
    expect(b.tonics.length).toBeGreaterThanOrEqual(2);
    expect(b.bars.length).toBeGreaterThanOrEqual(2);
    for (const tonic of b.tonics) {
      for (const spec of b.bars) expect(() => chordIn({ tonic, mode: 'major' }, spec)).not.toThrow();
    }
  },
  melodyEcho: (b) => {
    // Fixed phrases use only degrees 1–8.
    for (const phrase of b.phrases ?? []) {
      expect(phrase.length).toBeGreaterThan(0);
      for (const deg of phrase) {
        expect(deg).toBeGreaterThanOrEqual(1);
        expect(deg).toBeLessThanOrEqual(8);
      }
    }
  },
};

describe('session registry', () => {
  it('defines stages in order', () => {
    expect(PATH_STAGES).toEqual({ accompany: ['A', 'B', 'C', 'D'], lead: ['E', 'F', 'G', 'H'] });
    expect(STAGES).toEqual(['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H']);
  });

  it('has unique, English, URL-safe slugs', () => {
    const slugs = SESSIONS.map((s) => s.slug);
    expect(new Set(slugs).size).toBe(slugs.length);
    for (const s of slugs) expect(s).toMatch(/^[a-z0-9]+(-[a-z0-9]+)*$/);
    expect(findSession('major-or-minor')).toBeDefined();
    expect(findSession('nope')).toBeUndefined();
  });

  it('links each session to the ones before and after it in SESSIONS', () => {
    const slugs = SESSIONS.map((s) => s.slug);
    expect(sessionNeighbours(slugs[0]!).prev).toBeUndefined();
    expect(sessionNeighbours(slugs.at(-1)!).next).toBeUndefined();
    slugs.forEach((slug, i) => {
      expect(sessionNeighbours(slug).prev?.slug).toBe(slugs[i - 1]);
      expect(sessionNeighbours(slug).next?.slug).toBe(slugs[i + 1]);
    });
    expect(sessionNeighbours('nope')).toEqual({});
  });

  it('filters sessions by path and optional stage', () => {
    expect(sessionsOf('accompany')).toEqual(SESSIONS.filter((s) => s.path === 'accompany'));
    expect(sessionsOf('accompany', 'A')).toEqual(SESSIONS.filter((s) => s.path === 'accompany' && s.stage === 'A'));
    expect(sessionsOf('accompany', 'B')).toEqual(SESSIONS.filter((s) => s.path === 'accompany' && s.stage === 'B'));
  });

  it('lists every session in public/sitemap.xml, in order', () => {
    const sessionUrls = [...sitemap.matchAll(/<loc>https:\/\/guitarmateur\.com\/theory\/s\/([^<]+)<\/loc>/g)]
      .map((m) => m[1]);
    expect(sessionUrls).toEqual(SESSIONS.map((s) => s.slug));
  });

  it('has 16 sessions: 4 in stage A, 5 in B, 4 in C, 3 in D, matching docs/theory-sessions.md in order', () => {
    expect(sessionsOf('accompany')).toHaveLength(16);
    expect(sessionsOf('accompany', 'A').map((s) => s.slug)).toEqual([
      'major-or-minor',
      'beat-and-bar',
      'find-the-root',
      'melody-by-ear',
    ]);
    expect(sessionsOf('accompany', 'B').map((s) => s.slug)).toEqual([
      'chord-family',
      'chord-changes',
      'one-four-five',
      'first-song',
      'change-key',
    ]);
    expect(sessionsOf('accompany', 'C').map((s) => s.slug)).toEqual([
      'the-six-chord',
      'minor-keys',
      'seventh-chords',
      'three-four',
    ]);
    expect(sessionsOf('accompany', 'D').map((s) => s.slug)).toEqual([
      'barre-chords',
      'outside-chords',
      'new-song',
    ]);
  });

  it('allows a part to have an empty block list', () => {
    const session16 = findSession('new-song')!;
    expect(session16).toBeDefined();
    expect(session16.parts.listen).toEqual([]);
    for (const part of PARTS) {
      expect(session16.copy.en.parts[part].title).toBeTruthy();
      expect(session16.copy.en.parts[part].body.length).toBeGreaterThan(0);
      expect(session16.copy.vi.parts[part].title).toBeTruthy();
      expect(session16.copy.vi.parts[part].body.length).toBeGreaterThan(0);
    }
  });

  describe.each(SESSIONS.map((s) => [s.slug, s] as const))('%s', (_slug, session) => {
    it('teaches only concepts that exist in docs/theory-knowledge', () => {
      expect(session.concepts.length).toBeGreaterThan(0);
      expect(session.concepts.filter((id) => !KNOWN_IDS.has(id))).toEqual([]);
    });

    it('vi has the same keys, list lengths and placeholders as en', () => {
      expect(copyShape(session.copy.vi)).toEqual(copyShape(session.copy.en));
    });

    it('has no empty string', () => {
      for (const lang of LANGS) expect(emptyStrings(session.copy[lang])).toEqual([]);
    });

    it('has unique block keys and complete copy for every block', () => {
      const blocks = sessionBlocks(session);
      const keys = blocks.map((b) => b.key);
      expect(new Set(keys).size).toBe(keys.length);

      for (const lang of LANGS) {
        const copyBlocks = session.copy[lang].blocks;
        expect(Object.keys(copyBlocks).sort()).toEqual([...keys].sort());

        for (const block of blocks) {
          const blockCopy = copyBlocks[block.key] as unknown as Record<string, unknown>;
          expect(blockCopy).toBeDefined();
          const requiredFields = BLOCK_COPY_FIELDS[block.kind];
          for (const field of requiredFields) {
            expect(blockCopy[field], `block '${block.key}' missing '${field}'`).toBeDefined();
          }
        }
      }
    });

    it("declares the 'strumSpeed' setting exactly when it strums", () => {
      expect(session.settings?.includes('strumSpeed') ?? false).toBe(sessionStrums(session));
    });

    it('has 3 check questions with 3 options and valid answer indexes', () => {
      expect(session.checkAnswers.length).toBe(3);
      for (const ans of session.checkAnswers) {
        expect(ans).toBeGreaterThanOrEqual(0);
        expect(ans).toBeLessThanOrEqual(2);
      }
      for (const lang of LANGS) {
        expect(session.copy[lang].check.length).toBe(3);
        for (const q of session.copy[lang].check) {
          expect(q.options.length).toBe(3);
        }
      }
    });

    it('has 2 to 4 canDo items', () => {
      for (const lang of LANGS) {
        expect(session.copy[lang].canDo.length).toBeGreaterThanOrEqual(2);
        expect(session.copy[lang].canDo.length).toBeLessThanOrEqual(4);
      }
    });

    if (session.earLevel !== undefined) {
      const level = session.earLevel;
      it('links to an Ear training level from 1 to 15', () => {
        expect(Number.isInteger(level)).toBe(true);
        expect(level).toBeGreaterThanOrEqual(1);
        expect(level).toBeLessThanOrEqual(15);
      });
    }

    if (session.practice) {
      const { in: key, bars } = session.practice;
      it('links to Practice with bars that all resolve to a chord in its key', () => {
        expect(bars.length).toBeGreaterThan(0);
        for (const spec of bars) expect(() => chordIn(key, spec)).not.toThrow();
      });
    }

    // One case per block that has rules to check, named by its key: a session only gets the
    // cases for the blocks it has.
    const checked = sessionBlocks(session).filter((b) => BLOCK_CHECKS[b.kind]);
    if (checked.length > 0) {
      it.each(checked.map((b) => [b.key, b.kind, b] as const))('block %s (%s)', (_key, _kind, block) => {
        BLOCK_CHECKS[block.kind]!(block as never, session);
      });
    }
  });
});
