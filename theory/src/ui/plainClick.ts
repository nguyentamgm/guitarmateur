import type { MouseEvent } from 'react';

/** A plain left click, with no modifier: the app takes it; anything else (new tab…) the browser keeps. */
export function isPlainClick(e: MouseEvent<HTMLAnchorElement>): boolean {
  return !e.defaultPrevented && e.button === 0 && !e.metaKey && !e.ctrlKey && !e.shiftKey && !e.altKey;
}
