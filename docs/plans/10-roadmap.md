# Plan 10 — Roadmap & Task Discipline

The forward plan and *how we size work*. Plans 01–08 say **how each layer is designed**; this doc
says **what to do next and in what increments**. [09-progress.md](09-progress.md) says **where we
are**. Start here when picking up new work.

## Why this doc exists

The original milestone model (M1–M5 in [00-overview.md](00-overview.md)) sized each milestone as
"ship a whole subsystem." That worked while the app was small but broke down at **M5 (audio)**: one
milestone bundled a schema migration + a 4-module audio engine + lick-engine changes + a UI controls
bar + highlighting + tests + docs. Built in one pass it was hard to review, hard to verify, and hit
avoidable snags (a build-breaking tooling constraint discovered late; a schema bump that quietly
broke existing tests). None of that was necessary — the work is naturally 4–5 independent slices.

**The fix is not more detail. It's smaller units.** Layer specs stay as reference; execution happens
in right-sized tasks defined below.

## What a right-sized task is

One task = one PR = one concern, and at the end of it **CI is green and something is demoable or
verifiable**. Concretely, a task is right-sized when:

- It touches **one concern** (a schema field, one engine module, one UI control) — not "all of audio."
- It can be **built and verified in a single focused session**, roughly a diff you can review in
  10–15 minutes.
- It ends with **`npm run typecheck && npm run lint && npm test && npm run build` green** — never a
  half-migrated state that only compiles after the *next* task.
- It states **what it does NOT do** (scope fence), so it can't quietly grow.
- It has an **exit check**: the test(s) added, and the one thing you can see/hear/run to believe it.

If a task can't meet those, it's a milestone — slice it (recipe below) before starting.

## How to slice a milestone

1. **Data/state first, alone.** Schema/registry changes + migration + their tests ship as their own
   task. They unblock everything and are the easiest to get wrong silently — isolate them.
2. **Pure engine next, no UI.** Build the layer's pure functions with unit tests. Nothing rendered
   yet; correctness is provable in `npm test`.
3. **Thinnest visible slice.** Wire the smallest end-to-end thing a user can see/hear (e.g. a single
   play button that only clicks a metronome). Prove the wiring works.
4. **Widen in increments.** Each remaining feature (loop, count-in, highlighting, multi-bar) is its
   own small task on top of the working slice.
5. **Polish/docs last.** Copy changes, tracker updates, acceptance-box checks.

Each numbered step is a separate PR. Steps 2–5 each keep CI green on their own.

### Worked example — how M5 *should* have shipped

| Slice | Task | Demoable at end |
|-------|------|-----------------|
| 1 | Schema v3: `tempoBpm` + per-entry `bars` + v2→v3 migration + tests | reload preserves state; tests green |
| 2 | `src/audio/` pure core: `compile` + `scheduler`/`drainDue` + `voices` pitch math + tests | `npm test` proves timing/loop/delay math |
| 3 | Metronome-only playback: engine + transport + a play button that clicks | you *hear* a count at the set tempo |
| 4 | Lick + progression playback + card/tab highlighting | notes play; current note lights up |
| 5 | Loop + count-in + mix sliders + multi-bar (`bars×4`) generation | full plan-07 feature set |

Slices 3–5 are each independently mergeable. (M5 shipped as one PR (#7); future milestones follow
this table's shape instead.)

## Live backlog

Ordered by dependency then value. Check a box when its PR merges; keep this list the single forward
plan. Most items are already task-sized — proof that the *unscheduled* work was fine; only the big
milestones needed slicing.

### Finish M5
- [ ] **T0 — Manual audio verification.** Run the app in Chrome + Firefox + one mobile browser: no
  drift over 2 min of looping, no console autoplay warnings, UI stays responsive while playing. Then
  check the two open boxes in [09-progress.md](09-progress.md) plan-07 section, or file bugs as
  follow-up tasks. *Out of scope:* new features. *Exit:* both boxes resolved.

### 7-note scales & modes (engine already supports them)
- [x] **T1 — Registry + tests.** Add dorian/mixolydian/etc. to `src/music/scales.ts` and a harmony
  row each; add spelling tests across 12 tonics. Pure data, no UI. *Exit:* new scales pass the same
  spelling/box tests as the pentatonics. (PR #12, merged)
- [x] **T2 — Picker exposure.** Surface the new scales in the Step-1 scale picker (registry-driven —
  likely near-zero UI code). *Exit:* selecting one renders correct notes on the fretboard.
  (PR #12, merged)

### Alternate tunings UI (drop-D already in the tuning registry)
- [ ] **T3 — Tuning picker.** A picker wired to the existing `TUNINGS` registry; persist the choice
  (already in schema). *Exit:* switching to drop-D re-maps the fretboard/boxes correctly.

### Left-handed view
- [ ] **T4 — Mirror toggle.** A persisted preference that mirrors the fretboard + tab renderers.
  Presentational only — no engine changes. *Exit:* toggle flips the view; tests for the mirror
  transform.

### Preset sharing via URL
- [ ] **T5 — Encode.** Serialize the persisted state slice to a URL param (versioned, migration-
  aware). *Exit:* a "copy link" action produces a URL; unit test round-trips encode→decode.
- [ ] **T6 — Decode on load.** Hydrate from the URL param on startup, falling back to localStorage.
  *Exit:* opening a shared link reproduces the sender's key/scale/progression.

### PWA / offline
- [ ] **T7 — Manifest + icons.** Web app manifest and icons; installable. *Exit:* Lighthouse PWA
  install criteria pass.
- [ ] **T8 — Service worker.** Cache the static build for offline use (build-time, no runtime deps).
  *Exit:* app loads with the network throttled to offline.

## Repo gotchas (things that cost time — check before you start)

The TS config is strict in ways that bite mid-task. Know these up front:

- **`erasableSyntaxOnly`** is on → **no TypeScript-only runtime syntax**: no constructor parameter
  properties (`constructor(private x: T)`), no `enum`, no namespaces. Declare class fields explicitly
  and assign in the body. (This broke the M5 build late — `tsc --noEmit` passes but `vite build`
  fails, so run the *build*, not just typecheck, before you call a task done.)
- **`verbatimModuleSyntax`** is on → type-only imports must use `import type`.
- **`noUncheckedIndexedAccess`** is on → `arr[i]` is `T | undefined`; guard or `!` deliberately.
- **Determinism / no `Math.random` in `src/lick`** is lint-enforced — use the seeded RNG.
- **Layer imports** are lint-enforced (see [eslint.config.js](../../eslint.config.js)); the fix for a
  blocked import is to move logic down a layer, not relax the rule.
- **Always run all four gates** (`typecheck lint test build`) before marking a task done — they catch
  different failures (the build catches erasable-syntax; tests catch schema-bump breakage).
