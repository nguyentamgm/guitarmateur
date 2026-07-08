/**
 * Design tokens — the one dark theme from the mockup (`Pentatonic Practice.dc.html`).
 * Single source of truth for colors/typography; components read from here rather than hardcoding
 * hex values. No Tailwind, no CSS-in-JS runtime (see AGENTS.md).
 */
export const theme = {
  bg: '#0c0e0d',
  panel: '#151917',
  card: '#1c211e',
  border: '#2a302c',
  text: '#e8ece9',
  muted: '#7e857f',
  subtle: '#575d58',
  line: '#3a413c',
  faintStroke: '#4a514c',
  accent: '#c3f04b',
  accentBright: '#d4ff57',
  accentText: '#0c0e0d',
  /** Translucent accent tint for selected surfaces. */
  accentTint: 'rgba(195,240,75,0.06)',
} as const;

export const font = {
  sans: "-apple-system, BlinkMacSystemFont, 'Helvetica Neue', Helvetica, Arial, sans-serif",
  mono: "'JetBrains Mono', ui-monospace, SFMono-Regular, Menlo, monospace",
} as const;

export type ThemeColor = keyof typeof theme;
