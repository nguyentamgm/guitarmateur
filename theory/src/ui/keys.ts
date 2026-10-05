/** Small formatting helpers shared by the lesson scenes. */
import type { FretPos } from '../core/fretboard';
import type { DegreeLabel } from '../core/music';

/** React key and `FretDot.key` of a position: '6:5'. Neck and tab share it to light up together. */
export const posKey = (p: FretPos): string => `${p.string}:${p.fret}`;

/** '+3', '−2', '0' (a real minus sign). */
export const signed = (n: number): string => (n > 0 ? `+${n}` : n < 0 ? `−${-n}` : '0');

/** 'b3' → '♭3', '#4' → '♯4'. */
export const degreeText = (d: DegreeLabel): string => d.replaceAll('b', '♭').replaceAll('#', '♯');
