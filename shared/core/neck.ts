/**
 * The neck's strings, as both apps number them: 1 = thinnest (high E), 6 = thickest, matching tab.
 * Pure TypeScript.
 */

export type StringNumber = 1 | 2 | 3 | 4 | 5 | 6;
/** Low to high, the order a neck is drawn bottom-up and a pick crosses them. */
export const STRINGS: readonly StringNumber[] = [6, 5, 4, 3, 2, 1];

/** A name per string, as tab labels them. */
export type StringNames = Readonly<Record<StringNumber, string>>;

/** Standard tuning: 'e' for the thinnest string, capitals elsewhere. */
export const STANDARD_STRING_NAMES: StringNames = { 1: 'e', 2: 'B', 3: 'G', 4: 'D', 5: 'A', 6: 'E' };

/** Drop D: the thickest string a whole tone down. */
export const DROP_D_STRING_NAMES: StringNames = { ...STANDARD_STRING_NAMES, 6: 'D' };
