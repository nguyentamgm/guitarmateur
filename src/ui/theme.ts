/**
 * Design tokens — the one dark theme from the mockup (`Pentatonic Practice.dc.html`).
 * Single source of truth for colors/typography; components read from here rather than
 * hardcoding hex values. No Tailwind, no CSS-in-JS runtime (see AGENTS.md).
 */
export const color = {
  /** Page background. */
  bg: '#0c0e0d',
  /** Raised surface (cards). */
  surface: '#151917',
  /** Higher surface / inset. */
  surfaceRaised: '#1c211e',
  /** Borders / dividers. */
  border: '#2a302c',
  /** Primary text. */
  text: '#e8ece9',
  /** Secondary text (subtitles). */
  textMuted: '#9aa19b',
  /** Tertiary text (kicker, labels). */
  textDim: '#7e857f',
  /** Faint text (fine print). */
  textFaint: '#6b726c',
  /** Accent — links, active states, the "lime". */
  accent: '#c3f04b',
  /** Accent hover / bright. */
  accentBright: '#d4ff57',
} as const;

export const font = {
  sans: "-apple-system, BlinkMacSystemFont, 'Helvetica Neue', Helvetica, Arial, sans-serif",
  mono: "'JetBrains Mono', ui-monospace, SFMono-Regular, Menlo, monospace",
} as const;

export type Color = keyof typeof color;
