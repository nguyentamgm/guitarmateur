/**
 * The shape every lesson takes. A lesson is data: its steps, the concept IDs it teaches
 * (docs/theory-knowledge) and its copy in every language. Scenes are drawn by theory/src/ui.
 */
import type { Lang } from '../i18n';

/** A concept ID from docs/theory-knowledge, e.g. 'K3.4'. */
export type ConceptId = `K${number}.${number}`;

export interface StepCopy {
  readonly title: string;
  readonly body: readonly string[];
  /** The one sentence to remember. */
  readonly takeaway: string;
  /** One thing to do on the guitar or on the page. */
  readonly tryIt: string;
}

export interface NotYetItem {
  readonly title: string;
  readonly why: string;
}

export interface LessonCopy<StepId extends string, SceneCopy> {
  readonly title: string;
  /** One line for the contents page. */
  readonly summary: string;
  readonly lead: string;
  readonly steps: Readonly<Record<StepId, StepCopy>>;
  /** Labels, buttons and captions of the lesson's scenes. */
  readonly scene: SceneCopy;
  readonly notYetTitle: string;
  readonly notYetIntro: string;
  readonly notYet: readonly NotYetItem[];
}

export interface LessonStep<StepId extends string> {
  readonly id: StepId;
  readonly concepts: readonly ConceptId[];
}

export interface Lesson<StepId extends string = string, SceneCopy = unknown> {
  /** English, URL-safe: /theory/<slug>. */
  readonly slug: string;
  readonly steps: readonly LessonStep<StepId>[];
  readonly copy: Readonly<Record<Lang, LessonCopy<StepId, SceneCopy>>>;
}

/** Every concept a lesson teaches, in step order, without repeats. */
export function lessonConcepts(lesson: Lesson): ConceptId[] {
  return [...new Set(lesson.steps.flatMap((s) => s.concepts))];
}
