# Progress Tracker

Living status doc for this project. **Update this file in the same PR that finishes a milestone
or checks off an acceptance-criteria item.** This is the single place to look to answer "where are
we right now" — don't rely on `AGENTS.md` or [`architecture.md`](architecture.md) for current
status, they describe the design, not the state. For **what to build next, sliced into
right-sized tasks**, see [`roadmap.md`](roadmap.md).

Last updated: 2026-07-28 (nightly improve: path.test.ts +28, contour.test.ts +18, harmony.test.ts +23; 69 new tests across 3 PRs)

## Verify current status in one paste

Most of the green checks below are the CI gates. Re-confirm them yourself instead of trusting this
file's date — if this block passes, the "CI gate" boxes are genuinely true right now:

```bash
npm run typecheck && npm run lint && npm test && npm run build
```

Measured snapshot at last update (2026-07-26):

| Gate | Result |
|------|--------|
| `typecheck` | clean |
| `lint` | 0 errors, 0 warnings |
| test | **273 passed** across 21 test files (+69 tests: path.ts +28, contour.ts +18, harmony.ts +23) |
| `build` | clean → `dist/` (~77 kB gzip JS) |

If a run diverges from this, the tracker is stale — fix the code or update the snapshot, whichever
is wrong.

> **M5 caveat — needs a manual browser pass.** The audio *logic* (`compileProgression`, the
> lookahead `Scheduler`/`drainDue`, Karplus-Strong pitch math, schema-v3 migration) is unit-tested,
> but audible playback can't be asserted headlessly. Those two boxes stay unchecked until someone
> runs the manual checklist in a real browser: no drift over 2 minutes of looping (compare against
> a phone metronome); playback works on Chrome + Firefox + one mobile Safari/Chrome; no console
> autoplay warnings; UI never blocks while playing.

## Milestone status

| # | Milestone | Status | Shipped in |
|---|-----------|--------|------------|
| M1 | Walking skeleton | ✅ Done | PR #1 `ffee9c5` |
| M2 | Scale explorer | ✅ Done | PR #4 `36a0ea9` |
| M3 | MVP practice loop / v1 launch | ✅ Done | PR #5 `3a9286a` |
| M4 | Musicality (technique decoration) | ✅ Done | PR #6 `afeac56` |
| M5 | Audio — metronome, lick playback, loop, tempo | 🟡 Code complete — needs manual browser verification | PR #7 `93f13c8` |
| — | URL sharing (T5+T6) | ✅ Done | PR #17 `8d871f7` |
| — | PWA / offline (T7+T8) | ✅ Done | PR #18 `a9fd35a` |
| — | Tuning picker (T3) | ✅ Done | PR #19 `2c006da` |
| — | Export/import state as JSON file (survey #1) | ✅ Done | PR #20 `e717ef9` |
| — | Fix shared-link state clobber bug (survey #2) | ✅ Done | PR #21 `d61b6ba` |
| — | Fix bend technique on fret change (survey #3) | ✅ Done | PR #22 `3302b7b` |
| — | Rhythm variety + lint fix (PR #43) | ✅ Done | PR #43 `68a162a` |
| — | Left-handed view (T4) | ✅ Done | PR #41 |
| — | Test chore + cleanup (PR #42) | ✅ Done | PR #42 |
| — | Later/unscheduled (alt-tunings beyond drop-D) | ⬜ Not started | — |

**M5 is implemented (PR #7) and passes all four CI gates. Next task is T0 in
[`roadmap.md`](roadmap.md): a manual audio pass in a real browser to resolve the two open boxes
above and mark M5 ✅ Done. The task-decomposed backlog after that lives in `roadmap.md`.**

M5 implementation notes (deviations from the original audio design, all deliberate):
- **2-bar licks reuse the 1-bar rhythm library** (tiled two bars deep in `lick/rhythm.ts`
  `buildRhythm`) instead of authoring a separate 2-bar pattern table — simpler and keeps it a
  data-assembly step. `LickParams.bars` is optional (defaults to 1), so the persisted shape and
  public API are unchanged.
- **Count-in, loop, and the click/note gain sliders are ephemeral UI state** in
  `PlaybackControls`, not persisted. Only `tempoBpm` is persisted (schema v3).
- The `AudioContext` is created lazily inside the play button's handler (`useTransport` →
  `createEngine`), never at module load — the autoplay gate.

## Per-area acceptance criteria

Checked = verified against the current codebase, not just "assumed done." When you finish an item,
verify it yourself before checking the box.

### Tech stack & scaffolding
- [x] `npm run dev` shows the dark-themed header; `build`, `test`, `lint`, `typecheck` pass on a clean checkout.
- [x] Layer-boundary lint rule fails the build on a bad cross-layer import (`no-restricted-imports` in `eslint.config.js`).
- [x] No runtime deps beyond `react`/`react-dom` (verified in `package.json`).
- [x] Ready for M1 deploy (static `dist/`).

### Music core (`src/music/`)
- [x] No imports outside the package; fully deterministic.
- [x] Adding a scale/chord quality = one registry entry, zero engine edits.
- [x] All 12 offered tonics spell correctly in all v1 scales (tested).
- [x] Public API via `src/music/index.ts`.

### Fretboard engine (`src/fretboard/`)
- [x] Zero shape tables in the codebase.
- [x] Golden-shape tests pass.
- [x] Invariant loops pass for both tunings.
- [x] Public API via `src/fretboard/index.ts`.

### Lick engine (`src/lick/`)
- [x] `generateLick` is pure & deterministic; no `Math.random` (lint-enforced).
- [x] M3 shipped levels 1–3; M4 added stage 4 (technique decoration) + levels 4–5 without breaking
      the public API or persisted `LickParams` shape.
- [x] Invariant/statistical tests pass in CI.
- [x] Tab renderer can render every `LickNote` field (rhythm + technique glyphs).

### UI (`src/ui/`)
- [x] No theory/fretboard/lick logic in `src/ui/` (layer lint enforces imports).
- [x] Visual match with the mockup's style.
- [x] Registry-driven pickers.
- [x] Milestone checklists pass; no console errors; clean `npm run build`.

### State & persistence (`src/state/`)
- [x] No lick note arrays in localStorage — only seeds.
- [x] Reload reproduces identical licks.
- [x] Reducer & persistence importable/testable without React.
- [x] Migration path exercised by a real schema bump — v2→v3 (tempo + per-entry bars) is covered by
      `persistence.test.ts` ("migrates a v2 payload to v3 with default tempo and per-entry bars").

### Audio (`src/audio/`) — M5, code complete / manual pass pending
- [ ] Metronome + lick playback + progression loop work at 40–200 BPM without drift or glitches.
      *(Logic unit-tested — beat→sec compile, seamless loop wrap, lookahead scheduler — but audible
      drift/glitch behavior needs a real browser; unchecked until that manual pass.)*
- [~] All audio code behind the user-gesture gate — `AudioContext` is created only inside the play
      handler (`useTransport`→`createEngine`), never at module load (verified by call-site grep).
      "No console autoplay warnings" still needs eyes-on in a browser.
- [x] Schema v3 migration preserves existing user state (new fields defaulted) — tested.
- [x] Still zero runtime deps and zero network requests for audio assets — `package.json` unchanged
      (react/react-dom only); no `fetch`/URL in `src/audio` (verified by grep); pure synthesis.

### CI & deployment
- [x] M1: skeleton live on guitarmateur.com; merge-to-`main` → production, zero manual steps.
- [x] CI blocks broken PRs (lint/type/test/build) — `.github/workflows/ci.yml`.
- [ ] Domain, redirects, HTTPS all re-verified per the checklist since M4 (spot-check periodically, not just at M1).

## Definition of done — v1 (= end of M3)

- [x] guitarmateur.com serves the app over HTTPS; www/http redirect.
- [x] Merge to `main` deploys automatically; CI gates PRs.
- [x] Keys spelled correctly across all 12 keys × 3 scales.
- [x] Positions generated algorithmically — no hardcoded shape tables.
- [x] Licks have rhythm, respect difficulty level, end on target chord tone; seed-reproducible.
- [x] State (incl. licks via seeds) survives reload; schema versioned with migration path.
- [x] Engine/state packages solidly unit-tested; `npm test` passes in CI.

**v1 shipped as of M3 (PR #5).** M4 is a post-v1 quality milestone on top of it.

## How to keep this file honest

- When you finish an item, check the box **only after verifying it** (run the tests/build
  yourself, don't just trust intent).
- When a milestone finishes, update the milestone table (status + PR/commit).
- `AGENTS.md`'s "Current status" line should always point at this file rather than restate it, so
  there's exactly one place to update per release.
