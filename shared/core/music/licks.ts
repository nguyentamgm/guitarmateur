/**
 * Small melodic ideas for soloing (K7.4): a few neighbouring scale notes with a rhythm, and ways
 * to bend an idea to a chord. Notes are indexes into a list of scale notes sorted by pitch (the
 * notes under the hand), so the same idea works in any box and any key. Generated, never typed in.
 */

/** Eighth notes in a bar of 4/4. */
export const LICK_EIGHTHS = 8;

export interface LickNote {
  /** Index into the pitch-ordered scale notes. */
  readonly index: number;
  /** Eighth of the bar it starts on, 0–7. */
  readonly at: number;
  /** How long it lasts, in eighths. */
  readonly length: number;
}

const pick = <T>(items: readonly T[], random: () => number): T => items[Math.min(items.length - 1, Math.floor(random() * items.length))]!;

/**
 * An idea of 3 or 4 notes over `size` scale notes: steps mostly, now and then a skip of one note,
 * turning back at the edge of the range. It starts on beat 1 or just after it and the last note is
 * held into beat 4, so every idea leaves a little space before the next bar. `start` fixes the
 * first note (to carry on from an earlier idea); otherwise it is picked in the middle of the range.
 */
export function motif(size: number, random: () => number, start?: number): LickNote[] {
  const count = pick([3, 4], random);
  // Onsets: a gap of one or two eighths between notes, the last no later than the "and" of 3.
  const gaps = Array.from({ length: count - 1 }, () => pick([1, 1, 2], random));
  const first = pick([0, 0, 1], random);
  while (first + gaps.reduce((a, b) => a + b, 0) > 5) gaps[gaps.indexOf(2)] = 1;
  const onsets = gaps.reduce((on, g) => [...on, on.at(-1)! + g], [first]);

  let dir = random() < 0.5 ? 1 : -1;
  const middle = Math.floor(size / 3) + Math.floor(random() * Math.max(1, size / 3));
  let index = start === undefined ? middle : Math.min(size - 1, Math.max(0, start));
  const indexes = [index];
  for (let i = 1; i < count; i++) {
    const step = random() < 0.25 ? 2 : 1;
    if (index + dir * step < 0 || index + dir * step >= size) dir = -dir;
    index = Math.min(size - 1, Math.max(0, index + dir * step));
    indexes.push(index);
  }
  return onsets.map((at, i) => {
    const next = onsets[i + 1];
    const length = next === undefined ? Math.min(LICK_EIGHTHS - at, Math.max(2, 6 - at)) : next - at;
    return { index: indexes[i]!, at, length };
  });
}

/**
 * The idea with its last note moved to the nearest note that `fits` (a chord tone, K7.2), other
 * than `avoid` and never the note just before it, so the line still moves at the end. A tie goes
 * the way the line was already moving. Unchanged when nothing fits.
 */
export function landOn(lick: readonly LickNote[], size: number, fits: (index: number) => boolean, avoid?: number): LickNote[] {
  const last = lick.at(-1);
  if (!last) return [...lick];
  const before = lick.at(-2)?.index;
  const dir = last.index >= (before ?? last.index) ? 1 : -1;
  for (let d = 0; d < size; d++) {
    for (const index of [last.index + dir * d, last.index - dir * d]) {
      if (index >= 0 && index < size && index !== avoid && index !== before && fits(index)) return [...lick.slice(0, -1), { ...last, index }];
    }
  }
  return [...lick];
}
