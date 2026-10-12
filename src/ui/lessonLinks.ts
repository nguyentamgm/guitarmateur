/**
 * The Theory lesson behind each Practice step, for its "Why?" link. Theory is a separate app (we
 * never import it): its paths are written here, and `lessonLinks.test.ts` reads Theory's lesson
 * files as text to check that each slug, step and title still exists.
 */

/** The lessons we link to; each has a `lesson.<slug>` title in the catalogs, as Theory titles it. */
export type LessonSlug = 'pentatonic-map' | 'pentatonic' | 'keys' | 'solo';

export interface LessonLink {
  readonly slug: LessonSlug;
  /** A step of that lesson to open at (its section id); the lesson's top when absent. */
  readonly step?: string;
}

export type PracticeStep = 'scalebox' | 'progression' | 'practice';

export const WHY: Readonly<Record<PracticeStep, readonly LessonLink[]>> = {
  // Scale and box: the five boxes, then joining them and playing them in any key.
  scalebox: [
    { slug: 'pentatonic-map', step: 'boxes' },
    { slug: 'pentatonic', step: 'boxes' },
  ],
  // Chord progression: which chords belong to a key, and the numbers that name them.
  progression: [{ slug: 'keys' }],
  // Licks: landing on a chord tone of each chord.
  practice: [{ slug: 'solo', step: 'tones' }],
};

export const lessonHref = ({ slug, step }: LessonLink): string =>
  `/theory/${slug}${step ? `#${step}` : ''}`;
