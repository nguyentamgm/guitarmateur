/** The trainer's keyboard shortcuts (#221): which key does what. Pure, so it is tested alone. */
import type { DegreeLabel } from '@shared/core/music';

export type Shortcut =
  /** Space / Enter: Start, then Next. */
  | { readonly type: 'primary' }
  | { readonly type: 'replayNote' }
  | { readonly type: 'replayContext' }
  | { readonly type: 'playTonic' }
  | { readonly type: 'answer'; readonly degree: DegreeLabel };

/** Digit → degree id; with Shift, a half step lower. Shift+1 and Shift+4 name no degree. */
const DIGIT: Readonly<Record<string, DegreeLabel>> = {
  1: '1',
  2: '2',
  3: '3',
  4: '4',
  5: '5',
  6: '6',
  7: '7',
};
const LOWERED: Readonly<Record<string, DegreeLabel>> = {
  2: 'b2',
  3: 'b3',
  5: '#4',
  6: 'b6',
  7: 'b7',
};

export interface KeyPress {
  readonly key: string;
  /** The physical key ('Digit3', 'Numpad3', 'Space'): Shift+3 is '#' on one layout and '§' on another. */
  readonly code: string;
  readonly shiftKey: boolean;
}

export function shortcut(e: KeyPress): Shortcut | null {
  if (e.code === 'Space' || e.key === ' ' || e.key === 'Enter') return { type: 'primary' };
  const digit =
    /^(?:Digit|Numpad)([0-9])$/.exec(e.code)?.[1] ?? (/^[0-9]$/.test(e.key) ? e.key : null);
  if (digit !== null) {
    const degree = (e.shiftKey ? LOWERED : DIGIT)[digit];
    return degree ? { type: 'answer', degree } : null;
  }
  switch (e.key.toLowerCase()) {
    case 'r':
      return { type: 'replayNote' };
    case 'k':
      return { type: 'replayContext' };
    case 't':
      return { type: 'playTonic' };
    default:
      return null;
  }
}

/** Where a key belongs to the focused control, not to the page: typing, or activating a button. */
export function ownedByTarget(target: EventTarget | null, s: Shortcut): boolean {
  if (!(target instanceof Element)) return false;
  const tag = target.tagName;
  if (
    tag === 'INPUT' ||
    tag === 'TEXTAREA' ||
    tag === 'SELECT' ||
    (target as HTMLElement).isContentEditable
  )
    return true;
  // Buttons, links and summaries take Space / Enter themselves (WCAG 2.1.1).
  const activates =
    tag === 'BUTTON' ||
    tag === 'A' ||
    tag === 'SUMMARY' ||
    target.getAttribute('role') === 'button';
  return activates && s.type === 'primary';
}
