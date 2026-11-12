import { describe, expect, it } from 'vitest';
import { copyShape, emptyStrings } from '../i18n/copyShape';
import { LANGS } from '../i18n';
import { findLesson } from '../lessons';
import sitemap from '../../../public/sitemap.xml?raw';
import {
  BLOCK_COPY_FIELDS,
  SESSIONS,
  STAGES,
  findSession,
  sessionBlocks,
  sessionNeighbours,
  sessionsOf,
} from '.';
import { chordIn } from './chordSpec';
import { DRILLS } from './drills';
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

describe('session registry', () => {
  it('reads the knowledge base', () => {
    expect(KNOWN_IDS.size).toBe(64);
  });

  it('defines stages in order', () => {
    expect(STAGES).toEqual(['A', 'B', 'C', 'D']);
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
  });
});
