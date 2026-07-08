# Plan 06 — App State & Persistence (`src/state/`)

## Goals

One typed reducer driving the whole page, persisted to `localStorage` with an **explicit schema
version and migration path** — fixing the mockup's brittle parallel-array + raw-lick storage.
Pure TS (reducer & persistence are React-free; a thin `useAppState` hook adapts them to React).

## Design principles

1. **Licks are derived data.** State stores `LickParams` seeds per chord, never note arrays
   (plan 04's determinism contract). A `selector` computes actual licks on render, memoized by
   `(key, scale, positions, chord, next, params)`. Schema changes can therefore never strand
   stale licks — worst case a migration re-mints seeds.
2. **No parallel arrays.** The mockup kept `progression[]` + `licks[]` in lockstep by hand.
   Here each progression entry owns its lick params:

```ts
interface ProgressionEntry { id: string; chord: Chord; lickSeed: number }   // id: crypto.randomUUID()
```

## State shape (`appState.ts`)

```ts
interface AppState {
  schemaVersion: 2;                  // v1 was the mockup's ad-hoc payload
  tuningId: string;                  // 'standard' (no UI yet, but persisted honestly)
  key: { tonic: NoteName; scaleId: ScaleId };   // default: A minorPentatonic
  positions: number[];               // 1–2 selected position indices, default [recommended]
  progression: ProgressionEntry[];   // default: defaultProgression(key) with fresh seeds
  level: 1|2|3|4|5;                  // default 2
  targetRole: 'R'|'3'|'5';           // default 'R'
  resolveToNext: boolean;            // default false (M4)
  ui: {                              // NOT persisted
    advancedOpen: boolean; advRoot: NoteName; advQuality: QualityId;
    dragIndex: number | null;
  };
}
```

## Actions (reducer — pure; seeds minted from an injected `nextSeed: () => number`)

| Action | Behavior |
|---|---|
| `setKey(tonic)` / `setScale(scaleId)` | Update key; **replace progression** with `defaultProgression` (fresh seeds); reset positions to `[recommended]` (position indices are scale-relative and don't survive a scale change meaningfully). |
| `togglePosition(idx)` | Adjacent-combine/replace/min-1 semantics via `areAdjacent` (plan 03). Positions changing invalidates nothing — licks re-derive from the new merged box automatically. |
| `setLevel(n)` / `setTargetRole(r)` / `setResolveToNext(b)` | Set; licks re-derive. |
| `addChord(chord)` | Append `{id, chord, lickSeed: nextSeed()}`. |
| `removeChord(id)` / `clearProgression` / `resetProgression` | Obvious; reset uses fresh seeds. |
| `reorderChord(fromId, toIndex)` | Splice by id — no lockstep bookkeeping needed. |
| `rerollLick(id)` / `rerollAll` | Replace seed(s) with `nextSeed()`. |
| UI actions | `toggleAdvanced`, `setAdvRoot`, `setAdvQuality`, `dragStart`, `dragEnd`. |

`useAppState` wires the reducer with `nextSeed = () => Date.now() ^ (Math.random()*2**31)|0`
(non-deterministic on purpose at the app boundary; tests inject a counter).

## Persistence (`persistence.ts`)

- Key: `guitarmateur-state`. Payload: `AppState` minus `ui`, JSON.
- **Save**: effect subscribed to persisted fields; `try/catch`-wrapped `setItem` (quota/private
  mode ⇒ silent no-op).
- **Load** (once at startup): parse in try/catch ⇒ `migrate(raw): AppState`:
  - `migrate` is a chain keyed by `schemaVersion`; unknown/garbage ⇒ defaults.
  - **v1→v2 migration**: read the mockup's legacy key `penta-practice-v1` if present
    (`rootPc` number → spelled tonic via the conventional-spelling table, `scale: 'minor'|'blues'`
    → scaleId, `position|positions`, `progression` `{rootPc,type}` → spelled `Chord`s with fresh
    seeds; stored raw licks are discarded — they re-derive). Delete the legacy key after
    migrating.
  - Field validation with per-field default fallback: positions ⊆ valid indices & pass the
    adjacency rule, level in 1–5, scaleId/tuningId exist in registries (an entry removed in a
    future release must degrade to defaults, not crash).
- Write `schemaVersion` **inside the payload** (not the storage key) so future migrations chain.

## Derived-lick selector (`selectors.ts`)

```ts
licksForState(state): { entryId: string; lick: Lick }[]
```
Computes merged box once, then `generateLick` per entry with
`next = following entry's chord (wrapping) when resolveToNext`. Memoize with a simple
same-inputs cache (no library); generation is O(attempts × notes) and cheap, so correctness
beats cleverness here.

## Tests

- Reducer: every action; key/scale change resets progression+positions; reorder/remove by id;
  reroll changes only the intended seed; invariants (1 ≤ positions.length ≤ 2, adjacency holds)
  after every action in a 500-step seeded random action sequence.
- Persistence: round-trip equality (minus `ui`); corrupt JSON / wrong types / unknown scaleId ⇒
  defaults per field; **legacy v1 payload migrates** (fixture copied from the mockup's actual
  localStorage format); schemaVersion written.
- Selector: same state ⇒ same licks (determinism through the whole stack); changing one entry's
  seed changes only that entry's lick.

## Acceptance criteria

- [ ] No lick note arrays in localStorage — inspect the payload to confirm.
- [ ] Reload reproduces identical licks (seeds + determinism).
- [ ] A user coming from the old mockup preview keeps their key/scale/progression.
- [ ] Reducer & persistence importable and testable without React.
