# 🎸 Progress — Guitarmateur

> Live milestone status and acceptance criteria. Updated after each nightly improve run.

## Current status: Core engine complete, polish ongoing

**Last updated:** 2025-07-30

### What's shipping

All core layers are built, tested, and deployed:

| Layer | Status | Tests | Notes |
|-------|--------|-------|-------|
| `music/` | ✅ Complete | 102 | Pitch, scales, chords, harmony, roman numerals |
| `fretboard/` | ✅ Complete | 35 | Neck, positions, tuning, merge, recommend |
| `lick/` | ✅ Complete | 104 | Model, rhythm, contour, path, techniques, generate, score, RNG |
| `audio/` | ✅ Complete | 44 | Engine, scheduler, voices, transport, compile, dev tools |
| `state/` | ✅ Complete | 51 | App state, persistence (w/ migration), share/export, selectors |
| `ui/` | ✅ Complete | 3 | Components: fretboard, tab, playback, progression, legend, error boundary |

**Total tests:** 339 passing (25 test files)

### Acceptance criteria

- [x] User can pick a key and scale (minor pentatonic, major pentatonic, blues, major, dorian, mixolydian, natural minor, major blues)
- [x] Fretboard renders scale positions with correct pitch spelling
- [x] Chord progression builder with drag reorder, add/remove, suggested chords per scale
- [x] Lick generation: deterministic (seeded), difficulty levels 1–5, contour-driven, rhythm patterns, techniques (hammer, pull, slide, bend), scored
- [x] Audio playback: metronome, tempo slider, swing, count-in, loop, click/note mix levels
- [x] Tab staff SVG rendering with duration glyphs and technique articulation
- [x] State persistence in localStorage with schema migration (v1→v6)
- [x] Import/export/share via JSON and encoded URL params (`?s=`)
- [x] Left-handed mode
- [x] PWA support: service worker (cache-first assets), manifest, install prompt
- [x] Error boundary with retry
- [x] CI pipeline: lint → typecheck → test → build (all pass)
- [x] Social sharing: OG meta tags and OG image (PR #58)
- [x] Progress/roadmap docs available (PR #57)

### Known issues

- No mobile-responsive optimization beyond basic wrapping
