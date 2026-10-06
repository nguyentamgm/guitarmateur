/** Moving between chords with the least travel (K4.6): pure search over positions on the neck. */

/** Frets the hand travels around a loop of positions, back to the first one included. */
export function loopTravel(frets: readonly number[]): number {
  return frets.reduce((sum, f, i) => sum + Math.abs(f - frets[(i + 1) % frets.length]!), 0);
}

/**
 * One option per chord of a loop, chosen so the hand travels least around it; ties go to the
 * lower position. `choices[i]` holds the places chord i can be played (a barre voicing, a
 * stacked shape…), each with the fret the hand sits at. Exhaustive, so keep loops to a handful
 * of chords with a few options each. Empty when a chord has no option.
 */
export function closestPath<V extends { readonly fret: number }>(choices: readonly (readonly V[])[]): V[] {
  let best: V[] = [];
  let bestCost = Infinity;
  const picked: V[] = [];
  const walk = (i: number) => {
    if (i === choices.length) {
      const frets = picked.map((v) => v.fret);
      const cost = loopTravel(frets) * 100 + frets.reduce((a, b) => a + b, 0);
      if (cost < bestCost) [best, bestCost] = [[...picked], cost];
      return;
    }
    for (const v of choices[i]!) {
      picked.push(v);
      walk(i + 1);
      picked.pop();
    }
  };
  if (choices.length > 0) walk(0);
  return best;
}
