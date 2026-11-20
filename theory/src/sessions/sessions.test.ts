import { describe, expect, it } from 'vitest';
import { copyShape, emptyStrings } from '../i18n/copyShape';
import { LANGS } from '../i18n';
import { findLesson } from '../lessons';
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
  type DrillId,
  type Session,
} from '.';
import { chordIn } from './chordSpec';
import { DRILLS, type DrillQuestion } from './drills';
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
  STRUMMING_KINDS.has(b.kind) || ((b.kind === 'listen' || b.kind === 'reveal') && drillStrums(b.drill));

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
    expect(sessionStrums(only({ kind: 'fillBars', key: 'fb', in: { tonic: 'G', mode: 'major' }, pool: [1, 4, 5], bars: 4, bpm: 80 }))).toBe(true);
    expect(sessionStrums(only({ kind: 'song', key: 's', in: { tonic: 'G', mode: 'major' }, song: 'frere-jacques', pool: [1], start: 'all' }))).toBe(true);
    expect(sessionStrums(only({ kind: 'transpose', key: 't', bars: [1, 4, 5, 1], tonics: ['G', 'D'] }))).toBe(true);
    expect(sessionStrums(only(lesson))).toBe(false);
  });
});

describe('session registry', () => {
  it('reads the knowledge base', () => {
    expect(KNOWN_IDS.size).toBe(64);
  });

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
    expect(sessionsOf('accompany').map((s) => s.slug)).toEqual([
      'major-or-minor',
      'beat-and-bar',
      'find-the-root',
      'melody-by-ear',
      'chord-family',
      'chord-changes',
      'one-four-five',
      'first-song',
      'change-key',
      'the-six-chord',
      'minor-keys',
      'seventh-chords',
      'three-four',
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

    it('resolves lesson blocks to an existing lesson and step', () => {
      const lessonBlocks = sessionBlocks(session).filter((b) => b.kind === 'lesson');
      for (const b of lessonBlocks) {
        const lesson = findLesson(b.lesson);
        expect(lesson, `lesson '${b.lesson}' not found`).toBeDefined();
        const step = lesson?.steps.find((s) => s.id === b.step);
        expect(step, `step '${b.step}' in lesson '${b.lesson}' not found`).toBeDefined();
      }
    });

    it('every listen and reveal block names a drill that exists in DRILLS, and listen answers match drill answers', () => {
      const blocks = sessionBlocks(session);
      const drillBlocks = blocks.filter((b) => b.kind === 'listen' || b.kind === 'reveal');
      for (const b of drillBlocks) {
        const drill = DRILLS[b.drill];
        expect(drill, `drill '${b.drill}' defined in DRILLS`).toBeDefined();
        if (b.kind === 'listen') {
          for (const lang of LANGS) {
            const blockCopy = session.copy[lang].blocks[b.key];
            if (blockCopy && 'answers' in blockCopy) {
              expect(Object.keys(blockCopy.answers).sort()).toEqual([...drill!.answers].sort());
            }
          }
        }
      }
    });

    it("declares the 'strumSpeed' setting exactly when it strums", () => {
      expect(session.settings?.includes('strumSpeed') ?? false).toBe(sessionStrums(session));
    });

    it('earLevel, when set, is an integer from 1 to 15', () => {
      if (session.earLevel !== undefined) {
        expect(Number.isInteger(session.earLevel)).toBe(true);
        expect(session.earLevel).toBeGreaterThanOrEqual(1);
        expect(session.earLevel).toBeLessThanOrEqual(15);
      }
    });

    it('practice, when set, has bars that all resolve to a chord in its key', () => {
      if (session.practice) {
        const { in: key, bars } = session.practice;
        expect(bars.length).toBeGreaterThan(0);
        for (const spec of bars) expect(() => chordIn(key, spec)).not.toThrow();
      }
    });

    it('every chord of every chords and strumAlong block gets a shape without throwing', () => {
      const blocks = sessionBlocks(session);
      for (const b of blocks) {
        if (b.kind === 'chords') {
          for (const spec of b.chords) {
            expect(() => chordShape(chordIn(b.in, spec).chord)).not.toThrow();
          }
        } else if (b.kind === 'strumAlong') {
          for (const spec of b.bars) {
            expect(() => chordShape(chordIn(b.in, spec).chord)).not.toThrow();
          }
        }
      }
    });

    it('every strumAlong block has a valid pattern, bpm between 40 and 200, and at least one bar', () => {
      const blocks = sessionBlocks(session);
      const strumBlocks = blocks.filter((b) => b.kind === 'strumAlong');
      for (const b of strumBlocks) {
        expect(b.bars.length).toBeGreaterThanOrEqual(1);
        expect(b.bpm).toBeGreaterThanOrEqual(40);
        expect(b.bpm).toBeLessThanOrEqual(200);
        const beatsPerBar = b.beatsPerBar ?? 4;
        const pattern = b.pattern ?? defaultPattern(beatsPerBar);
        expect(() => strumSteps(b.bars.length, beatsPerBar, pattern)).not.toThrow();
      }
    });

    it('every changeTap block has a non-empty pool, bars >= 4 and non-empty holds', () => {
      const blocks = sessionBlocks(session);
      const changeTapBlocks = blocks.filter((b) => b.kind === 'changeTap');
      for (const b of changeTapBlocks) {
        expect(b.pool.length).toBeGreaterThan(0);
        expect(b.bars).toBeGreaterThanOrEqual(4);
        expect(b.holds.length).toBeGreaterThan(0);
        for (const spec of b.pool) {
          expect(() => chordShape(chordIn(b.in, spec).chord)).not.toThrow();
        }
      }
    });

    it('every fillBars block has bars >= 3 and a pool of at least 2', () => {
      const blocks = sessionBlocks(session);
      const fillBarsBlocks = blocks.filter((b) => b.kind === 'fillBars');
      for (const b of fillBarsBlocks) {
        expect(b.bars).toBeGreaterThanOrEqual(3);
        expect(b.pool.length).toBeGreaterThanOrEqual(2);
        for (const spec of b.pool) {
          expect(() => chordShape(chordIn(b.in, spec).chord)).not.toThrow();
        }
      }
    });

    it('every song block has a major key, non-empty pool, valid song in SONGS, and every reference numeral in pool', () => {
      const blocks = sessionBlocks(session);
      const songBlocks = blocks.filter((b) => b.kind === 'song');
      for (const b of songBlocks) {
        expect(b.in.mode).toBe('major');
        expect(b.pool.length).toBeGreaterThan(0);
        const song = SONGS[b.song];
        expect(song, `song '${b.song}' defined in SONGS`).toBeDefined();
        const poolNumerals = b.pool.map((spec) => chordIn(b.in, spec).roman);
        for (const ref of song.chords) {
          if (ref === '-') continue;
          expect(poolNumerals, `song block '${b.key}' pool missing reference '${ref}'`).toContain(ref);
        }
      }
    });

    it('every transpose block has tonics >= 2 and bars >= 2', () => {
      const blocks = sessionBlocks(session);
      const transposeBlocks = blocks.filter((b) => b.kind === 'transpose');
      for (const b of transposeBlocks) {
        expect(b.tonics.length).toBeGreaterThanOrEqual(2);
        expect(b.bars.length).toBeGreaterThanOrEqual(2);
        for (const tonic of b.tonics) {
          for (const spec of b.bars) {
            expect(() => chordIn({ tonic, mode: 'major' }, spec)).not.toThrow();
          }
        }
      }
    });

    it('has at least 2 answers for listen blocks', () => {
      const listenBlocks = sessionBlocks(session).filter((b) => b.kind === 'listen');
      for (const b of listenBlocks) {
        for (const lang of LANGS) {
          const blockCopy = session.copy[lang].blocks[b.key];
          if (blockCopy && 'answers' in blockCopy) {
            expect(Object.keys(blockCopy.answers).length).toBeGreaterThanOrEqual(2);
          }
        }
      }
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

    it("every melodyEcho block's fixed phrases use only degrees 1–8", () => {
      const blocks = sessionBlocks(session);
      const echoBlocks = blocks.filter((b) => b.kind === 'melodyEcho');
      for (const b of echoBlocks) {
        if (b.phrases) {
          for (const phrase of b.phrases) {
            expect(phrase.length).toBeGreaterThan(0);
            for (const deg of phrase) {
              expect(deg).toBeGreaterThanOrEqual(1);
              expect(deg).toBeLessThanOrEqual(8);
            }
          }
        }
      }
    });
  });
});
