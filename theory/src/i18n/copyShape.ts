/**
 * Compare two language versions of the same copy: every string path with the placeholders it
 * uses. Used by tests to prove vi and en have the same keys, steps and `{placeholders}`.
 */
export type CopyShape = Record<string, string[]>;

export function copyShape(value: unknown, path = ''): CopyShape {
  if (typeof value === 'string') {
    return { [path]: [...value.matchAll(/\{(\w+)\}/g)].map((m) => m[1]!).sort() };
  }
  if (Array.isArray(value)) {
    return Object.assign({}, ...value.map((v, i) => copyShape(v, `${path}[${i}]`))) as CopyShape;
  }
  if (value !== null && typeof value === 'object') {
    return Object.assign(
      {},
      ...Object.entries(value).map(([k, v]) => copyShape(v, path ? `${path}.${k}` : k)),
    ) as CopyShape;
  }
  return { [path]: [`<${typeof value}>`] };
}

/** Paths whose string is empty or only whitespace. */
export function emptyStrings(value: unknown, path = ''): string[] {
  if (typeof value === 'string') return value.trim() === '' ? [path] : [];
  if (Array.isArray(value)) return value.flatMap((v, i) => emptyStrings(v, `${path}[${i}]`));
  if (value !== null && typeof value === 'object') {
    return Object.entries(value).flatMap(([k, v]) => emptyStrings(v, path ? `${path}.${k}` : k));
  }
  return [];
}
