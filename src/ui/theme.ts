/**
 * Design tokens for inline styles: CSS variables from the shared look (shared/ui/tokens.css), so
 * Practice follows light/dark like Theory and only its accent (lime, `data-app="practice"` on
 * <html>) differs. Components read from here rather than hardcoding colours. SVG paint goes in
 * `style` (not the `fill`/`stroke` attributes), where every browser resolves `var()`.
 */
export const theme = {
  bg: 'var(--bg)',
  panel: 'var(--surface)',
  card: 'var(--bg)',
  border: 'var(--line)',
  text: 'var(--ink)',
  muted: 'var(--muted)',
  subtle: 'var(--muted)',
  line: 'var(--line)',
  faintStroke: 'var(--fret)',
  accent: 'var(--accent)',
  accentText: 'var(--accent-ink)',
  /** Translucent accent tint for selected surfaces. */
  accentTint: 'color-mix(in srgb, var(--accent) 10%, transparent)',
} as const;

export const font = {
  /** Labels and text. */
  sans: 'var(--f-body)',
  /** Numbers only: BPM, frets, tab, roman numerals. */
  mono: 'var(--f-mono)',
} as const;
