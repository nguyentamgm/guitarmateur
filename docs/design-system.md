# Design System

Shared visual language and UI primitives for Guitarmateur across **Practice** (`src/`), **Theory** (`theory/`), and **Ear training** (`ear/`).

## 1. Philosophy

- **Zero runtime styling cost**: plain CSS stylesheets plus CSS custom properties defined in [`shared/ui/tokens.css`](../shared/ui/tokens.css) (no Tailwind, no CSS-in-JS).
- **Light & dark automatic**: themes follow `prefers-color-scheme: dark`; setting `data-theme="light"` on `<html>` forces light mode.
- **Per-app accent**: Theory uses the default blue accent; Practice and Ear training set `data-app="practice"` on `<html>` to switch `--accent` / `--neck-accent` to lime.
- **Zero copy in `shared/ui/`**: ESLint (`eslint.config.js`) rejects literal JSX text and literal `aria-label` / `title` / `placeholder` / `alt` attributes in `shared/ui/**/*.tsx`. Callers pass translated strings from their own `i18n`.

## 2. CSS import order

Every app entry (`src/main.tsx`, `theory/src/main.tsx`, `ear/src/main.tsx`) imports shared CSS once, in order, before its own stylesheet:

```ts
import '@shared/ui/tokens.css';
import '@shared/ui/base.css';
import '@shared/ui/controls.css';
import '@shared/ui/fretboard.css';
import './ui/<app>.css';
```

Each `index.html` loads `Bricolage Grotesque`, `Be Vietnam Pro`, and `JetBrains Mono` from Google Fonts and declares light/dark `<meta name="theme-color">` tags.

For inline styles in Practice (`src/ui/`), read CSS variables via [`src/ui/theme.ts`](../src/ui/theme.ts) (`theme`, `font`) instead of hardcoding values. SVG paint should be passed via `style` rather than `fill`/`stroke` presentation attributes so `var(...)` resolves uniformly.

## 3. Design tokens (`shared/ui/tokens.css`)

### Surfaces & ink

| Token | Light | Dark | Role |
| --- | --- | --- | --- |
| `--bg` | `#e9edf0` | `#0e1317` | Page background & recessed controls |
| `--surface` | `#f6f8f9` | `#151c22` | Cards (`.board`), floating panels |
| `--ink` | `#121a21` | `#e5eaee` | Primary text |
| `--muted` | `#54606b` | `#94a1ac` | Secondary text, uppercase labels |
| `--line` | `#c9d1d8` | `#26313a` | Hairline borders, dividers |

### Accents & semantic contrast pairs

| Token | Light (Theory / Practice) | Dark (Theory / Practice) | Role & contrast rule |
| --- | --- | --- | --- |
| `--accent` | `#2958d3` / `#446d0d` | `#5a8bff` / `#c3f04b` | Primary action, links, active bar, right/done indicator (≥ 4.5:1 on `--bg`/`--surface`) |
| `--accent-ink` | `#ffffff` / `#ffffff` | `#06102a` / `#0c0e0d` | Text on `--accent` fill |
| `--neck-accent` | `#2f64f0` / `#b5e04a` | `#5a8bff` / `#c3f04b` | Active dots/frames on dark `--wood` |
| `--neck-accent-ink` | `#ffffff` / `#18210a` | `#06102a` / `#0c0e0d` | Text on `--neck-accent` dot fill |
| `--amber` | `#e0951a` | `#f1b13c` | Warning/miss fills, borders, SVG strokes, and text on dark `--wood` (pair fills with `--amber-ink`) |
| `--amber-ink` | `#1e1407` | `#1e1407` | Text on `--amber` fill |
| `--amber-text` | `#965600` | `#f1b13c` | Amber foreground text/glyphs on light `--bg` / `--surface` (4.92:1 on `--bg`, 5.43:1 on `--surface`) |

> **Warning/miss color rule**: Ear training and Theory never use red for wrong answers — use `--amber` for fills/borders and `--amber-text` for foreground text on `--bg`/`--surface`.

### Fretboard tokens

`--wood`, `--wood-edge`, `--fret`, `--nut`, `--string`, `--inlay`, `--dot`, `--dot-ink`, `--fretnum` (plus dynamic `--neck-text` computed by [`Fretboard.tsx`](../shared/ui/Fretboard.tsx) from `NeckGeometry.textScale`).

### Typography, spacing, radii & elevation

| Category | Tokens | Notes |
| --- | --- | --- |
| **Fonts** | `--f-display`, `--f-body`, `--f-mono` | Display for headings/brand; body for prose/text chips; mono for BPM, frets, tab, Roman numerals, uppercase labels |
| **Type scale** | `--t-label` (`0.78rem`), `--t-chip` (`0.82rem`), `--t-small` (`0.88rem`), `--t-body` (`16px`) | Headings `h1`–`h3` scaled in `base.css` |
| **Spacing** | `--s-1` (`4px`), `--s-2` (`6px`), `--s-3` (`10px`), `--s-4` (`14px`), `--s-5` (`18px`), `--s-6` (`24px`) | Use for gaps and padding |
| **Radii** | `--r-chip` (`7px`), `--r-btn` (`8px`), `--r-panel` (`12px`), `--r-board` (`14px`) | Match component hierarchy |
| **Elevation** | `--shadow-float` | Floating overlays (e.g. sticky bars) |

## 4. Shared UI inventory (`shared/ui/`)

| File | Exports / CSS classes | Purpose |
| --- | --- | --- |
| [`base.css`](../shared/ui/base.css) | `body`, `h1`–`h3`, `a`, `.eyebrow`, `.muted`, `.small`, `:focus-visible`, `.sr-only` | Base typography, focus ring, reduced-motion reset |
| [`controls.tsx`](../shared/ui/controls.tsx) & [`controls.css`](../shared/ui/controls.css) | `RadioGroup`, `Chip`, `ChipGroup`, `OnOff`, `KeyPicker`, `Takeaways`, `Button`, `Slider`, `Toggle`; `.board`, `.controls`, `.hit` | Accessible interactive controls (roving `tabIndex`, arrow navigation, `:hover`, `:active`, `:disabled` / `[aria-disabled='true']`) |
| [`SiteHeader.tsx`](../shared/ui/SiteHeader.tsx) | `SiteHeader` (`.site-top`, `.topbar`, `.topnav`, `.navlink`, `.navsep`) | Shared top navigation and language switcher |
| [`BarGrid.tsx`](../shared/ui/BarGrid.tsx) | `BarGrid` (`.bars`) | 4-bars-per-line chord progression SVG |
| [`Fretboard.tsx`](../shared/ui/Fretboard.tsx), [`PositionFrame.tsx`](../shared/ui/PositionFrame.tsx), [`fretboard.css`](../shared/ui/fretboard.css) | `Fretboard`, `PositionFrame`, `.tab*` classes | Interactive guitar neck, box overlays, and tab staff styling |
| [`useNeckGeometry.ts`](../shared/ui/useNeckGeometry.ts) & [`geometry.ts`](../shared/ui/geometry.ts) | `useNeckGeometry`, `neckGeometry` | Responsive fretboard layout and touch target scaling |

## 5. Accessibility & responsive standards

- **Contrast**: ≥ 4.5:1 for normal text on `--bg`/`--surface`; ≥ 3:1 for dimmed/non-text UI (`fretboard.css` adds a `--dot` stroke ring on `.dot.dim` dots to preserve 3:1 on `--wood`).
- **Keyboard & ARIA**: radio controls (`ChipGroup`, `KeyPicker`, `SiteHeader` language selector) use `role="radiogroup"` with roving `tabIndex` and arrow-key navigation; `Toggle` uses `role="switch"` and `aria-checked`; `Fretboard` exposes one Tab stop and arrow navigation across dots.
- **Reduced motion**: `base.css` disables transitions/animations under `@media (prefers-reduced-motion: reduce)`.
- **Breakpoints**:
  - `560px` (`@media (max-width: 560px)`): primary phone breakpoint. `controls.css` enforces ≥ `40px` tap targets on `.chip`, `.btn`, `.finder button`, `.hit`, `.toggle`, header links, and range inputs; `useNeckGeometry` switches necks to touch spacing (`TOUCH_STRING_GAP = 40`).
  - `640px` (`@media (max-width: 640px)`): compact layout breakpoint used in `theory.css` for multi-column toolbars/grids that need room slightly above phone width.

## 6. Rules for changes

1. Never hardcode hex/rgb/rgba colors outside `shared/ui/tokens.css`.
2. Use `--amber-text` (not `--amber`) whenever amber text or glyphs sit on `--bg` or `--surface`.
3. Reuse `shared/ui/controls.tsx` and `shared/ui/tokens.css` variables (`--s-*`, `--r-*`, `--t-*`, `--shadow-float`) instead of inventing new CSS custom properties in app stylesheets.
4. Keep new layout/control breakpoints aligned to `560px` (phone) or `640px` (compact).
