# 🗺️ Roadmap — Guitarmateur

> What to build next, prioritized by user value and implementation feasibility.
> Each item is sized small/medium/large.

## Immediate next (1–2 nightly cycles)

- **Social sharing: OG image + meta tags** — Add `og:image`, `og:title`, `og:description`, `og:url`, and `twitter:card` meta tags to `index.html`. Create a simple dark-themed OG image (SVG banner). Small.
- **PWA: proper icons** — Replace single SVG favicon with multi-size PNG icons (`192x192`, `512x512`), add `apple-touch-icon` link. Small.

## Short term (3–5 cycles)

- **Responsive/mobile layout** — The app is usable on desktop but the 320px min-width cards and SVG fretboard may overflow on small screens. Add `@media` breakpoints in `global.css`. Medium.
- **More scales** — Add harmonic minor, melodic minor, whole-tone, diminished. Each is one row in `SCALES` + one `defaultProgression` case. Small per scale.
- **More tunings** — Drop D, open G, DADGAD are common guitar tunings. Add to `TUNINGS` registry. Small.

## Medium term (6–10 cycles)

- **Practice journal / history** — Track which seeds were played, optional tempo progression over time. State already stores seeds; expose a simple practice log view. Medium.
- **Speed trainer** — Gradual tempo increase mode (start at 70%, ramp to target over N repetitions). Medium.
- **Backing track metronome** — Instead of just a metronome click, generate a simple root-5th drone or chord pad that changes with the progression. Medium.
- **Lick export (Tab/MusicXML)** — Allow copying the lick as plain ASCII tab or MusicXML for import into notation software. Small.

## Long term (10+ cycles)

- **Chord voicing picker** — Instead of just quality, allow choosing inversion/voicing per chord. The fretboard should show chord shapes, not just scale dots. Large.
- **Multi-position practice** — Practice transitions between two adjacent boxes. Large.
- **AudioWorklet scheduler** — Replace the `setInterval` lookahead scheduler with an `AudioWorklet` for lower-latency, more reliable timing. Large (needs careful fallback).
- **Progressive Web App enhancements** — Background sync, push notifications for practice reminders. Medium.
- **Analytics (opt-in, privacy-first)** — Count unique users without tracking; just a daily visit counter via the Vercel analytics integration. Small.

## Task-sizing discipline

| Size | Turns | ~Lines | Description |
|------|-------|--------|-------------|
| Small | 1–3 | 1–50 | One function change, config change, or small new file |
| Medium | 3–8 | 50–200 | New component or engine feature, some refactoring |
| Large | 8–15 | 200–500 | New subsystem or significant cross-layer changes |
