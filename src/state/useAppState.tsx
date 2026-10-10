import { useEffect, useReducer, useRef } from 'react';
import { defaultNextSeed, defaultState, reducer, type Action, type AppState } from './appState';
import type { LocaleId } from '../i18n';
import { LANG_STORAGE_KEY, linkLanguage, loadLanguage, loadState, saveLanguage, saveState } from './persistence';

/**
 * `.tsx` (not `.ts`) is deliberate: the layer-boundary ESLint rule bans importing React from
 * `src/state/**\/*.ts`, so the one file that adapts the pure reducer to React lives here instead.
 */
export function useAppState(): [AppState, (action: Action) => void] {
  // A link's ?lang= is for this visit: not remembered until the language changes. Read before
  // loadState() takes it off the address.
  const linkLang = useRef(linkLanguage());
  // On a link visit, the language remembered before it (read before this visit saves any state).
  const remembered = useRef<LocaleId | null>(null);
  if (linkLang.current && !remembered.current) remembered.current = loadLanguage();
  // Compute initial state outside useReducer to simplify debugging and avoid
  // SSR/lazy-initializer issues in jsdom test environments.
  const [state, dispatch] = useReducer(
    (s: AppState, a: Action) => reducer(s, a, defaultNextSeed),
    (() => {
      try {
        // loadState() resolves the language itself (a link's ?lang=, the shared preference, else detection).
        return loadState() ?? defaultState(defaultNextSeed, linkLang.current ?? loadLanguage());
      } catch {
        // Fallback for SSR / test environments where browser APIs may not exist
        return defaultState(defaultNextSeed);
      }
    })(),
  );

  useEffect(() => {
    saveState(state);
  }, [state]);

  // The language is shared with Theory: save it when it changes, and follow a change in another tab.
  useEffect(() => {
    if (state.language === linkLang.current) {
      // Pin the remembered language, so the link's one (which the saved state also holds) is
      // never carried over to gm.lang on a later visit.
      if (remembered.current) saveLanguage(remembered.current);
      return;
    }
    linkLang.current = null;
    saveLanguage(state.language);
  }, [state.language]);
  useEffect(() => {
    const onStorage = (e: StorageEvent) => {
      if (e.key !== LANG_STORAGE_KEY && e.key !== null) return;
      const language = loadLanguage();
      dispatch({ type: 'setLanguage', language });
    };
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, []);

  return [state, dispatch];
}
