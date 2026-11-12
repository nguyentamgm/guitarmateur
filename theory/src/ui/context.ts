/** App-wide state shared by every page: language, the player, navigation, quiz progress. */
import { createContext, useContext } from 'react';
import type { Player } from '../core/audio';
import type { Lang, UiStrings } from '../i18n';
import type { Progress, QuizId } from './progress';
import type { SessionTicks } from './sessionProgress';

export interface TheoryContext {
  readonly lang: Lang;
  readonly ui: UiStrings;
  setLang(lang: Lang): void;
  readonly player: Player;
  /** Client-side navigation to a path under /theory; a `#step` scrolls to that step. */
  navigate(href: string): void;
  /** Record one settled quiz question: right on the first try or not. Stable across renders. */
  recordQuiz(id: QuizId, right: boolean): void;
  /** Toggle one "I can do this" tick for a session. Stable across renders. */
  toggleSessionTick(slug: string, index: number): void;
}

export const Ctx = createContext<TheoryContext | null>(null);

/**
 * Stored quiz progress, apart from `Ctx` so that recording an answer re-renders only the pages
 * that show progress, not every scene on a lesson page.
 */
export const ProgressCtx = createContext<Progress>({});
export const useProgress = (): Progress => useContext(ProgressCtx);

/**
 * Stored session ticks ("I can do this"), apart from `Ctx` so that ticking a box
 * re-renders only the components that display session ticks or completion.
 */
export const SessionTicksCtx = createContext<SessionTicks>({});
export const useSessionTicks = (): SessionTicks => useContext(SessionTicksCtx);

export function useTheory(): TheoryContext {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error('useTheory() outside <App>');
  return ctx;
}
