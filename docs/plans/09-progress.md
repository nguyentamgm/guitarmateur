# Plan 09 — Progress Tracker

Living status doc for this project. **Update this file in the same PR that finishes a milestone
or checks off an acceptance-criteria item.** This is the single place to look to answer "where are
we right now" — don't rely on AGENTS.md or 00-overview.md for current status, they describe the
plan, not the state. For **what to build next, sliced into right-sized tasks**, see
[10-roadmap.md](10-roadmap.md).

Last updated: 2026-07-21 (PR #29 persist mix volumes + PR #30 tuning string labels + PR #31 7th target role + PR #32 tap-tempo; all CI gates green, 176 tests)

## Verify current status in one paste

Most of the green checks below are the CI gates. Re-confirm them yourself instead of trusting this
file's date — if this block passes, the "CI gate" boxes are genuinely true right now:

```bash
npm run typecheck && npm run lint && npm test && npm run build
```

Measured snapshot at last update (2026-07-17):

| Gate | Result |
|------|--------|
| `typecheck` | clean |
| `lint` | 0 errors, 2 warnings (`react-hooks/exhaustive-deps` in `src/ui/components/PracticeSection.tsx` — pre-existing, non-blocking) |
| `test` | **176 passed** across 15 test files (+18 tests from M5/M6, +2 from PR #29 schema migration)
| `build` | clean → `dist/` (~74 kB gzip JS) |

If a run diverges from this, the tracker is stale — fix the code or update the snapshot, whichever
is wrong.

> **M5 caveat — needs a manual browser pass.** The audio *logic* (`compileProgression`, the
> lookahead `Scheduler`/`drainDue`, Karplus-Strong pitch math, schema-v3 migration) is unit-tested,
> but audible playback — no drift over 2 min of looping, no autoplay warnings, Chrome/Firefox/mobile
> — can't be asserted headlessly. Those two plan-07 boxes stay unchecked until someone runs it in a
> real browser (see checklist in plan 07).

## Milestone status

| # | Milestone | Status | Shipped in |
|---|-----------|--------|------------|
| M1 | Walking skeleton (plans 01, 08) | ✅ Done | PR #1 `ffee9c5` |
| M2 | Scale explorer (plans 02, 03 + Step-1 UI) | ✅ Done | PR #4 `36a0ea9` |
| M3 | MVP practice loop / v1 launch (plan 04 lv.1–3, Steps 2–3 UI, plan 06) | ✅ Done | PR #5 `3a9286a` |
| M4 | Musicality (plan 04 lv.4–5, technique decoration) | ✅ Done | PR #6 `afeac56` |
| M5 | Audio — metronome, lick playback, loop, tempo (plan 07) | 🟡 Code complete — needs manual browser verification | PR #7 `93f13c8` |
| — | URL sharing (T5+T6) | ✅ Done | PR #17 `8d871f7` |
| — | PWA / offline (T7+T8) | ✅ Done | PR #18 `a9fd35a` |
| — | Tuning picker (T3) | ✅ Done | PR #19 `2c006da` |
| — | Export/import state as JSON file (survey #1) | ✅ Done | PR #20 `e717ef9` |
| — | Fix shared-link state clobber bug (survey #2) | ✅ Done | PR #21 `d61b6ba` |
| — | Fix bend technique on fret change (survey #3) | ✅ Done | PR #22 `3302b7b` |
| — | MixSlider volumes persisted in AppState (survey #1) | ✅ Done | PR #29 `ad048a9` |
| — | Tuning-aware fretboard string labels (survey #2) | ✅ Done | PR #30 `7785978` |
| — | 7th as selectable target role (survey #5) | ✅ Done | PR #31 `37d9554` |
| — | Tap-tempo button (survey #7) | ✅ Done | PR #32 `bc9a893` |
| — | Later/unscheduled (left-handed view, alt-tunings beyond drop-D, inter-lick voice leading) | ⬜ Not started | — |

**M5 is implemented (PR #7) and passes all four CI gates. Next task is T0 in
[10-roadmap.md](10-roadmap.md): a manual audio pass in a real browser to resolve the two open
plan-07 boxes and mark M5 ✅ Done. The task-decomposed backlog after that lives in plan 10.**

M5 implementation notes (deviations from plan 07, all deliberate):
- **2-bar licks reuse the 1-bar rhythm library** (tiled two bars deep in `lick/rhythm.ts`
  `buildRhythm`) instead of authoring a separate 2-bar pattern table — simpler and keeps it a
  data-assembly step, per the "data addition, no engine change" intent. `LickParams.bars` is
  optional (defaults to 1), so the persisted shape and public API are unchanged.
- **Count-in, loop, and the click/note gain sliders are ephemeral UI state** in
  `PlaybackControls`, not persisted. Only `tempoBpm` is persisted (schema v3), matching the plan's
  "new state" list.
- The `AudioContext` is created lazily inside the play button's handler (`useTransport` →
  `createEngine`), never at module load — the autoplay gate.

## Per-plan acceptance criteria

Checked = verified against the current codebase, not just "assumed done." When you finish a plan
item, verify it yourself before checking the box.

### Plan 01 — Tech stack & scaffolding
- [x] `npm run dev` shows the dark-themed header; `build`, `test`, `lint`, `typecheck` pass on a clean checkout.
- [x] Layer-boundary lint rule fails the build on a bad cross-layer import (`no-restricted-imports` in `eslint.config.js`).
- [x] No runtime deps beyond `react`/`react-dom` (verified in `package.json`).
- [x] Ready for plan 08's M1 deploy (static `dist/`).

### Plan 02 — Music core (`src/music/`)
- [x] No imports outside the package; fully deterministic.
- [x] Adding a scale/chord quality = one registry entry, zero engine edits.
- [x] All 12 offered tonics spell correctly in all v1 scales (tested).
- [x] Public API via `src/music/index.ts`.

### Plan 03 — Fretboard engine (`src/fretboard/`)
- [x] Zero shape tables in the codebase.
- [x] Golden-shape tests pass.
- [x] Invariant loops pass for both tunings.
- [x] Public API via `src/fretboard/index.ts`.

### Plan 04 — Lick engine (`src/lick/`)
- [x] `generateLick` is pure & deterministic; no `Math.random` (lint-enforced).
- [x] M3 shipped levels 1–3; M4 added stage 4 (technique decoration) + levels 4–5 without breaking
      the public API or persisted `LickParams` shape.
- [x] Invariant/statistical tests pass in CI.
- [x] Tab renderer can render every `LickNote` field (rhythm + technique glyphs).

### Plan 05 — UI (`src/ui/`)
- [x] No theory/fretboard/lick logic in `src/ui/` (layer lint enforces imports).
- [x] Visual match with the mockup's style.
- [x] Registry-driven pickers.
- [x] Milestone checklists pass; no console errors; clean `npm run build`.

### Plan 06 — State & persistence (`src/state/`)
- [x] No lick note arrays in localStorage — only seeds.
- [x] Reload reproduces identical licks.
- [x] Reducer & persistence importable/testable without React.
- [x] Migration path exercised by a real schema bump — v2→v3 (tempo + per-entry bars) is covered by
      `persistence.test.ts` ("migrates a v2 payload to v3 with default tempo and per-entry bars").

### Plan 07 — Audio (phase 2, `src/audio/`) — M5, code complete / manual pass pending
- [ ] Metronome + lick playback + progression loop work at 40–200 BPM without drift or glitches.
      *(Logic unit-tested — beat→sec compile, seamless loop wrap, lookahead scheduler — but audible
      drift/glitch behavior needs a real browser; unchecked until that manual pass.)*
- [~] All audio code behind the user-gesture gate — `AudioContext` is created only inside the play
      handler (`useTransport`→`createEngine`), never at module load (verified by call-site grep).
      "No console autoplay warnings" still needs eyes-on in a browser.
- [x] Schema v3 migration preserves existing user state (new fields defaulted) — tested.
- [x] Still zero runtime deps and zero network requests for audio assets — `package.json` unchanged
      (react/react-dom only); no `fetch`/URL in `src/audio` (verified by grep); pure synthesis.

### Plan 08 — CI & deployment
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

- When you finish a plan's acceptance criteria, check the box **only after verifying it** (run
  the tests/build yourself, don't just trust the plan doc's intent).
- When a milestone finishes, update the milestone table (status + PR/commit) and move the
  "Current HEAD" line.
- If a plan changes scope (e.g. M4 pulled a stage from M3), leave a one-line note under that
  plan's section rather than silently editing 00-overview.md's milestone description.
- `AGENTS.md`'s "Current status" line should always point at this file rather than restate it, so
  there's exactly one place to update per release.
