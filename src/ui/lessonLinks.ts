/**
 * The Theory lesson behind each Practice step, for its "Why?" link. Theory is a separate app that
 * Practice never imports: its paths are written here and its titles are in our catalogs
 * (`lesson.*`). `lessonLinks.test.ts`, the one file allowed to import Theory's lessons, checks that
 * each slug, step and title still matches.
 */
import type { LocaleId } from '../i18n';

/** The lessons we link to; each has a `lesson.<slug>` title in the catalogs, as Theory titles it. */
export type LessonSlug = 'pentatonic-map' | 'pentatonic' | 'keys' | 'solo';

export interface LessonLink {
  readonly slug: LessonSlug;
  /** A step of that lesson to open at (its section id); the lesson's top when absent. */
  readonly step?: string;
}

export type PracticeStep = 'scalebox' | 'progression' | 'practice';

export const WHY: Readonly<Record<PracticeStep, readonly LessonLink[]>> = {
  // Scale and box: the five boxes, then joining two of them, as two boxes picked here are.
  scalebox: [
    { slug: 'pentatonic-map', step: 'boxes' },
    { slug: 'pentatonic', step: 'connect' },
  ],
  // Chord progression: which chords belong to a key, and the numbers that name them.
  progression: [{ slug: 'keys' }],
  // Licks: landing on a chord tone of each chord.
  practice: [{ slug: 'solo', step: 'tones' }],
};

/** The lesson's address. `?lang=` opens it in the page's language, even one a link set for this visit. */
export const lessonHref = ({ slug, step }: LessonLink, lang: LocaleId): string =>
  `/theory/${slug}?lang=${lang}${step ? `#${step}` : ''}`;
