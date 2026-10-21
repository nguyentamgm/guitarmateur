/**
 * A neck's geometry, drawn for touch on a phone (#279): there, every neck spreads its strings and
 * keeps its dots a 40px tap apart (`neckGeometry`'s `touch`); wider screens draw it as before.
 */
import { useMemo, useSyncExternalStore } from 'react';
import { neckGeometry, type NeckGeometry, type NeckOptions } from './geometry';

/** Phone width: the site's narrow-screen breakpoint (560px, as in its CSS). */
const PHONE = '(max-width: 560px)';

const media = () => (typeof window !== 'undefined' && window.matchMedia ? window.matchMedia(PHONE) : null);

function subscribe(onChange: () => void): () => void {
  const m = media();
  m?.addEventListener('change', onChange);
  return () => m?.removeEventListener('change', onChange);
}

const isPhone = () => media()?.matches ?? false;

export function useNeckGeometry(frets: number, opts: Omit<NeckOptions, 'touch'> = {}): NeckGeometry {
  const touch = useSyncExternalStore(subscribe, isPhone, () => false);
  const { fretWidth, stringGap, from, dotRadius } = opts;
  return useMemo(
    () => neckGeometry(frets, { fretWidth, stringGap, from, dotRadius, touch }),
    [frets, fretWidth, stringGap, from, dotRadius, touch],
  );
}
