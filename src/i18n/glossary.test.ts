/**
 * Practice's catalogs against docs/glossary.md: no string uses a word the glossary says to avoid.
 * Practice's wording predates the glossary, so today's misses are a baseline that may only shrink
 * (issue #175 rewrites them): a new miss fails, and so does a baseline entry that no longer happens.
 */
import { describe, expect, it } from 'vitest';
import glossary from '../../docs/glossary.md?raw';
import { avoidRules, findAvoided } from '@shared/i18n/glossary';
import { MESSAGES } from './locales';

const rules = avoidRules(glossary);

/**
 * `key: term`, one entry per occurrence, sorted, of each locale's misses today. To be emptied by
 * #175. A locale not listed (a new language) must have none.
 */
const BASELINE: Readonly<Partial<Record<string, readonly string[]>>> = {
  vi: [
    'app.playAlongNote: nhạc nền',
    'app.subtitle: nhạc nền',
    'app.subtitle: nốt hợp âm',
    'app.subtitle: âm giai',
    'app.title: ngũ cung',
    'legend.blueNote: nốt blue',
    'legend.chordTone: nốt hợp âm',
    'legend.root: nốt gốc',
    'legend.scaleNote: âm giai',
    'playback.tempo: nhịp độ',
    'playback.tempoBpmAria: nhịp độ',
    'practice.level.4: đảo phách',
    'progression.progression: tiến trình hợp âm',
    'progression.root: nốt gốc',
    'progression.stepKicker: tiến trình hợp âm',
    'scale.blues: âm giai',
    'scale.major-blues: blues trưởng',
    'scale.majorPentatonic: ngũ cung',
    'scale.minorPentatonic: ngũ cung',
    'scale.natural-minor: thứ tự nhiên',
    'scalebox.scale: âm giai',
    'scalebox.stepKicker: âm giai',
  ],
};

/** Every occurrence of an avoided word in a catalog, sorted, so the order of rules does not matter. */
function misses(locale: string): string[] {
  const catalog: Readonly<Record<string, unknown>> = MESSAGES[locale as keyof typeof MESSAGES] ?? {};
  return Object.entries(catalog)
    .flatMap(([key, text]) => findAvoided(String(text), rules, locale, key))
    .map((m) => `${m.where}: ${m.term}`)
    .sort();
}

describe('Practice copy follows docs/glossary.md', () => {
  it.each(Object.keys(MESSAGES))('%s: no avoided word beyond the baseline, and the baseline only shrinks', (locale) => {
    expect(misses(locale)).toEqual([...(BASELINE[locale] ?? [])].sort());
  });
});
