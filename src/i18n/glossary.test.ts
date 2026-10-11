/**
 * Practice's catalogs against docs/glossary.md: no string uses a word the glossary says to avoid.
 * Practice's wording predates the glossary, so today's misses are a baseline that may only shrink
 * (issue #175 rewrites them): a new miss fails, and so does a baseline entry that no longer happens.
 */
import { describe, expect, it } from 'vitest';
import glossary from '../../docs/glossary.md?raw';
import { avoidRules, findAvoided } from '@shared/i18n/glossary';
import { MESSAGES } from './locales';
import type { LocaleId } from './types';

const rules = avoidRules(glossary);

/** `key: term` for each miss today, per locale. To be emptied by #175. */
const BASELINE: Readonly<Record<LocaleId, readonly string[]>> = {
  en: [],
  vi: [
    'app.playAlongNote: nhạc nền',
    'app.subtitle: âm giai',
    'app.subtitle: nốt hợp âm',
    'app.subtitle: tiến trình',
    'app.subtitle: nhạc nền',
    'app.title: ngũ cung',
    'legend.blueNote: nốt blue',
    'legend.chordTone: nốt hợp âm',
    'legend.root: nốt gốc',
    'legend.root: gốc',
    'legend.scaleNote: âm giai',
    'legend.target: mục tiêu',
    'playback.play: tiến trình',
    'playback.tempo: nhịp độ',
    'playback.tempoBpmAria: nhịp độ',
    'practice.level.4: đảo phách',
    'practice.target: mục tiêu',
    'practice.targetBadge: mục tiêu',
    'practice.targetBadgeRedirect: mục tiêu',
    'progression.empty: tiến trình',
    'progression.grid: tiến trình',
    'progression.progression: tiến trình',
    'progression.root: nốt gốc',
    'progression.root: gốc',
    'progression.stepKicker: tiến trình',
    'role.R: gốc',
    'scale.blues: âm giai',
    'scale.major-blues: blues trưởng',
    'scale.majorPentatonic: ngũ cung',
    'scale.minorPentatonic: ngũ cung',
    'scale.natural-minor: thứ tự nhiên',
    'scalebox.scale: âm giai',
    'scalebox.stepKicker: âm giai',
  ],
};

function misses(locale: LocaleId): string[] {
  return Object.entries(MESSAGES[locale])
    .flatMap(([key, text]) => findAvoided(String(text), rules, locale, key))
    .map((m) => `${m.where}: ${m.term}`);
}

describe('Practice copy follows docs/glossary.md', () => {
  it.each(['en', 'vi'] as const)('%s: no avoided word beyond the baseline, and the baseline only shrinks', (locale) => {
    expect(misses(locale)).toEqual(BASELINE[locale]);
  });
});
