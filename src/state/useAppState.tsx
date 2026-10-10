import { useEffect, useReducer } from 'react';
import { defaultNextSeed, defaultState, reducer, type Action, type AppState } from './appState';
import { LANG_STORAGE_KEY, initialLanguage, loadLanguage, loadState, saveLanguage, saveState } from './persistence';

/**
 * `.tsx` (not `.ts`) is deliberate: the layer-boundary ESLint rule bans importing React from
 * `src/state/**\/*.ts`, so the one file that adapts the pure reducer to React lives here instead.
 */
export function useAppState(): [AppState, (action: Action) => void] {
  // Compute initial state outside useReducer to simplify debugging and avoid
  // SSR/lazy-initializer issues in jsdom test environments.
  const [state, dispatch] = useReducer(
    (s: AppState, a: Action) => reducer(s, a, defaultNextSeed),
    (() => {
      try {
        // loadState() resolves the language itself (a link's ?lang=, the shared preference, else detection).
        return loadState() ?? defaultState(defaultNextSeed, initialLanguage());
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
