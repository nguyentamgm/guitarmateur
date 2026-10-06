/** Moving between chords with the least travel (K4.6): pure search over positions on the neck. */

/** Frets the hand travels around a loop of positions, back to the first one included. */
export function loopTravel(frets: readonly number[]): number {
  return frets.reduce((sum, f, i) => sum + Math.abs(f - frets[(i + 1) % frets.length]!), 0);
}

type Cost = readonly [travel: number, height: number];
const cheaper = (a: Cost, b: Cost) => a[0] < b[0] || (a[0] === b[0] && a[1] < b[1]);

/**
 * One option per chord of a loop, chosen so the hand travels least around it; ties go to the
 * lower position, then to the earlier option. `choices[i]` holds the places chord i can be played
 * (a barre voicing, a stacked shape, a target note…) and `at` says where each one sits: the fret
 * by default, or a pitch for a melody line. Dynamic programming, so a 12-bar loop is cheap. Empty
 * when a chord has no option.
 */
export function closestPath<V extends { readonly fret: number }>(choices: readonly (readonly V[])[]): V[];
export function closestPath<V>(choices: readonly (readonly V[])[], at: (v: V) => number): V[];
export function closestPath<V>(choices: readonly (readonly V[])[], at: (v: V) => number = (v) => (v as { fret: number }).fret): V[] {
  const n = choices.length;
  if (n === 0 || choices.some((c) => c.length === 0)) return [];
  let best: V[] = [];
  let bestCost: Cost = [Infinity, Infinity];
  for (const first of choices[0]!) {
    // rest[i][k]: the cheapest way from option k of chord i to the end and back round to `first`.
    const rest: Cost[][] = Array.from({ length: n }, () => []);
    rest[n - 1] = choices[n - 1]!.map((v) => (n === 1 ? [0, at(v)] : [Math.abs(at(v) - at(first)), at(v)]));
    for (let i = n - 2; i >= 1; i--) {
      rest[i] = choices[i]!.map((v) =>
        choices[i + 1]!.reduce<Cost>((min, w, k) => {
          const c: Cost = [Math.abs(at(v) - at(w)) + rest[i + 1]![k]![0], at(v) + rest[i + 1]![k]![1]];
          return cheaper(c, min) ? c : min;
        }, [Infinity, Infinity]),
      );
    }
    // Walk forward, taking the first option that keeps the optimum at each chord.
    const path = [first];
    let cost: Cost = [0, at(first)];
    for (let i = 1; i < n; i++) {
      const prev = at(path[i - 1]!);
      let pick = 0;
      let pickCost: Cost = [Infinity, Infinity];
      choices[i]!.forEach((v, k) => {
        const c: Cost = [Math.abs(prev - at(v)) + rest[i]![k]![0], rest[i]![k]![1]];
        if (cheaper(c, pickCost)) [pick, pickCost] = [k, c];
      });
      if (i === 1) cost = [pickCost[0], cost[1] + pickCost[1]];
      path.push(choices[i]![pick]!);
    }
    if (n === 1) cost = [0, at(first)];
    if (cheaper(cost, bestCost)) [best, bestCost] = [path, cost];
  }
  return best;
}
