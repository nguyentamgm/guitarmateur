/** App-wide state shared by every page: language, sound, navigation. */
import { createContext, useContext } from 'react';
import type { Player } from '../core/audio';
import type { Lang, UiStrings } from '../i18n';

export interface TheoryContext {
  readonly lang: Lang;
  readonly ui: UiStrings;
  setLang(lang: Lang): void;
  readonly player: Player;
  readonly soundOn: boolean;
  setSoundOn(on: boolean): void;
  /** Client-side navigation to a path under /theory. */
  navigate(href: string): void;
}

export const Ctx = createContext<TheoryContext | null>(null);

export function useTheory(): TheoryContext {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error('useTheory() outside <App>');
  return ctx;
}
