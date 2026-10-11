/**
 * What both tab views share (Theory's ui/Tab.tsx, Practice's TabStaff), next to their look in
 * fretboard.css (`.tab`): the width of a number's box, and keeping the note being played in view
 * when a long tab scrolls sideways.
 */
import { useEffect, type RefObject } from 'react';

/** Width of a number's box (`.tabnum rect`), in tab units: wider for technique text such as '10b12'. */
export const tabBoxWidth = (text: string): number => Math.max(20, 8 + 8.5 * text.length);

/**
 * Scroll `scroller` sideways so the span `[left, right]` (in the SVG's units, `width` wide in all)
 * is in view; nothing when it already is, or when nothing is playing (`span` null). A mirrored tab
 * (`transform: scaleX(-1)` on the scroller) needs nothing special: the transform does not change
 * the layout `scrollLeft` counts in.
 */
export function useKeepInView(scroller: RefObject<HTMLElement | null>, span: readonly [number, number] | null, width: number): void {
  const left = span?.[0];
  const right = span?.[1];
  useEffect(() => {
    const el = scroller.current;
    if (left === undefined || right === undefined || !el || el.scrollWidth <= el.clientWidth) return;
    const scale = el.scrollWidth / width;
    const l = left * scale;
    const r = right * scale;
    if (l < el.scrollLeft || r > el.scrollLeft + el.clientWidth) el.scrollLeft = Math.max(0, l - el.clientWidth / 3);
  }, [scroller, left, right, width]);
}
