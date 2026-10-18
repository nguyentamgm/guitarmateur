/** The keyboard shortcuts of a beginner level's question: which key does what. Pure, so it is tested alone. */

export interface KeyPress {
  readonly key: string;
  /** The physical key ('Digit3', 'Numpad3', 'Space'): Shift+3 is '#' on one layout and '§' on another. */
  readonly code: string;
  readonly shiftKey: boolean;
}

/** A beginner level's question screen (docs/ear-levels.md "Question screen"). */
export type LevelShortcut =
  /** Space. */
  | { readonly type: 'replay' }
  /** Enter. */
  | { readonly type: 'next' }
  /** The `index`th answer button, from 0. */
  | { readonly type: 'answer'; readonly index: number };

/**
 * Space plays again, Enter goes on; 1 to 6 pick an answer by its place, and with two answers the
 * left and right arrows pick the left and right one. Null for any other key, or an answer the
 * screen does not have.
 */
export function levelShortcut(e: KeyPress, answers: number): LevelShortcut | null {
  if (e.code === 'Space' || e.key === ' ') return { type: 'replay' };
  if (e.key === 'Enter') return { type: 'next' };
  const digit =
    /^(?:Digit|Numpad)([1-6])$/.exec(e.code)?.[1] ?? (/^[1-6]$/.test(e.key) ? e.key : null);
  let index = digit === null ? -1 : Number(digit) - 1;
  if (answers === 2 && e.key === 'ArrowLeft') index = 0;
  if (answers === 2 && e.key === 'ArrowRight') index = 1;
  return index >= 0 && index < answers ? { type: 'answer', index } : null;
}

/** A control the player types into: every key belongs to it. */
function typesInto(target: Element): boolean {
  const tag = target.tagName;
  return (
    tag === 'INPUT' ||
    tag === 'TEXTAREA' ||
    tag === 'SELECT' ||
    (target as HTMLElement).isContentEditable
  );
}

/** Buttons, links and summaries take Space / Enter themselves (WCAG 2.1.1). */
function activatesOnKey(target: Element): boolean {
  const tag = target.tagName;
  return (
    tag === 'BUTTON' ||
    tag === 'A' ||
    tag === 'SUMMARY' ||
    target.getAttribute('role') === 'button'
  );
}

/**
 * Where a key belongs to the focused control, not to the page: typing, or Space and Enter on a
 * button, which press that button.
 */
export function levelKeyOwnedByTarget(target: EventTarget | null, s: LevelShortcut): boolean {
  if (!(target instanceof Element)) return false;
  return typesInto(target) || (activatesOnKey(target) && s.type !== 'answer');
}
