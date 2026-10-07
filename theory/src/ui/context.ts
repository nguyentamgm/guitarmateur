/** App-wide state shared by every page: language, sound, navigation, quiz progress. */
import { createContext, useContext } from 'react';
import type { Player } from '../core/audio';
import type { Lang, UiStrings } from '../i18n';
import type { Progress, QuizId } from './progress';

export interface TheoryContext {
  readonly lang: Lang;
  readonly ui: UiStrings;
  setLang(lang: Lang): void;
  readonly player: Player;
  readonly soundOn: boolean;
  setSoundOn(on: boolean): void;
  /** Client-side navigation to a path under /theory; a `#step` scrolls to that step. */
  navigate(href: string): void;
  /** Record one settled quiz question: right on the first try or not. Stable across renders. */
  recordQuiz(id: QuizId, right: boolean): void;
}

export const Ctx = createContext<TheoryContext | null>(null);

/**
 * Stored quiz progress, apart from `Ctx` so that recording an answer re-renders only the pages
 * that show progress, not every scene on a lesson page.
 */
export const ProgressCtx = createContext<Progress>({});
export const useProgress = (): Progress => useContext(ProgressCtx);

export function useTheory(): TheoryContext {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error('useTheory() outside <App>');
  return ctx;
}
