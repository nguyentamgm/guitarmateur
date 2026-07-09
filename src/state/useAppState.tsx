import { useEffect, useReducer } from 'react';
import { defaultNextSeed, defaultState, reducer, type Action, type AppState } from './appState';
import { loadState, saveState } from './persistence';

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
        return loadState() ?? defaultState(defaultNextSeed);
      } catch {
        // Fallback for SSR / test environments where browser APIs may not exist
        return defaultState(defaultNextSeed);
      }
    })(),
  );

  useEffect(() => {
    saveState(state);
  }, [state]);

  return [state, dispatch];
}
