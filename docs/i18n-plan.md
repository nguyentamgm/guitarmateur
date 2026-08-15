# Guitarmateur — Multi-language (i18n) feature: definition & task breakdown

Status: **proposal, nothing implemented.** Survey done against `main` @ `1af974b`.
Target: English + Vietnamese shipped by us; other locales contributed by the community.
Horizon: ~4 weeks, 14 small independently-mergeable PRs.

---

## 1. Survey summary

### 1.1 Where user-facing text lives today

All copy is hard-coded English inside JSX, `aria-label`/`title` attributes, and a handful of pure
label helpers. Nothing is data-driven from a catalog; there is no i18n scaffolding of any kind.

| File | Approx. strings | Notes |
|---|---|---|
| `src/ui/App.tsx` | 13 | Header kicker/H1/two paragraphs, `Share`/`Copied!`, `Export`, `Import`/`Loaded!`/`Invalid file`, `Left-handed`/`Normal`, `window.prompt('Copy this link:')` (`App.tsx:28`) |
| `src/ui/components/ScalePositionSection.tsx` | 12 | `Step 1 · Scale & Box`, `Tuning`, `Key`, `Scale`, `Boxes`, `Box {n}`, `REC`, `frets {a}–{b}`, `— frets {a}–{b} (combined)` (`:21`), legend `root` / `scale note`, mini-diagram title `Box {n}, {range}` |
| `src/ui/components/ProgressionSection.tsx` | 16 | `Step 2 · Chord Progression`, `Suggestions`, `+ {chord}`, `Advanced: pick any chord` / `Hide advanced adder`, `Toggle advanced chord adder`, `Root`, `Quality`, `Add {chord}`, `Progression`, `Reset to default`, `Clear all`, empty state, **plurals** at `:157` / `:158` (`{n} bar{s}`), `Remove {chord}` |
| `src/ui/components/PracticeSection.tsx` | 21 | `Step 3 · Practice Licks`, `Level`, 5 × level descriptions (`:49–55`), `Level {n}` aria, `Target`, `Land on next chord` (label + aria), `↻ Regenerate`, empty state, 5 legend labels, `{chord} — {role} highlighting`, `Lick`, `Lick for {chord}`, `Regenerate lick for {chord}` |
| `src/ui/components/PlaybackControls.tsx` | 18 | Audio-unavailable notice, `Play progression`/`Stop playback`, `Tempo`, `Tempo (BPM)`, `Tempo BPM value`, `BPM`, `Count-in`/`Swing`/`Loop`/`Tap` + their 4 arias, `Click`/`Notes` + `{label} volume` |
| `src/ui/labels.ts` | 7 | `roleLabel` → `Root`/`3rd`/`5th`/`7th`; `targetBadgeText` → `target · {target} → {actual} ({note})`; `decorationLegendEntries` → `{interval} (blue note)`; `durationGlyph` (glyphs, not prose) |
| `src/ui/components/InstallPrompt.tsx` | 3 | `Install Guitarmateur`, `Install`, `Dismiss` |
| `src/ui/ErrorBoundary.tsx` | 3 | `Something went wrong`, error paragraph, `Reload` |
| `src/ui/components/TabStaff.tsx` | 1 | `aria-label={title ?? 'empty lick'}` (`:55`) |
| `src/ui/components/FretboardDiagram.tsx` | 0 | Title comes in as a prop; the only text nodes are string letters and fret numbers |
| `src/ui/components/Legend.tsx` / `primitives.tsx` | 0 | Fully prop-driven — no copy of their own. Good: no work needed |

**≈ 94 UI strings across 10 files.** Roughly 18 of them are `aria-label`/`title` (counted above);
they matter as much as visible copy and are easy to forget.

### 1.2 Display names that live in the engines (not in `ui/`)

These are data fields on engine registries, read directly by components:

| Source | Count | Values |
|---|---|---|
| `src/music/scales.ts` → `ScaleDef.name` | 8 | `Minor Pentatonic`, `Major Pentatonic`, `Blues Scale`, `Major`, `Dorian`, `Mixolydian`, `Natural Minor`, `Major Blues` — read at `ScalePositionSection.tsx:19,54` |
| `src/music/chord.ts` → `CHORD_QUALITIES[].name` | 5 | `minor`, `major`, `dom7`, `min7`, `maj7` — read at `ProgressionSection.tsx:79–83` |
| `src/fretboard/tuning.ts` → `Tuning.name` | 2 | `Standard`, `Drop D` — read at `ScalePositionSection.tsx:31–35` |

**15 engine display names.** Total catalog ≈ **110 keys**.

### 1.3 Text that is *notation*, not prose — must NOT be translated

Deliberate call, and the contributor guide must say so explicitly:

- **Spelled note names** — `format()` in `src/music/pitch.ts` (`C`, `B♭`, `F♯`). Correct spelling is a
  stated hard invariant (`docs/architecture.md:124`).
- **Chord labels** — `chordLabel()` suffixes `m` / `` / `7` / `m7` / `maj7` (`src/music/chord.ts:41`).
- **Roman numerals** — `romanNumeral()` (`♭VII`, `V7`), and the hard-coded `roman` strings in
  `suggestedChords()`.
- **Interval labels** — `intervalLabel()` (`♭3`, `♭5`) in `src/ui/labels.ts`.
- **Duration glyphs** — `durationGlyph()` (`1½`, `¼`).
- **Fret numbers, string letters, tab digits, transport glyphs** (`▶`, `■`, `↻`, `×`).

The one seam worth leaving open: some locales *do* rename note letters (Romance-language solfège
`Do/Ré/Mi`, German `H` for B). Plan for a UI-level hook, identity-mapped for `en`/`vi` (see T9).

### 1.4 What complicates i18n here

1. **Templates are built by string concatenation in components.** e.g.
   `ScalePositionSection.tsx:21` builds `${tonic} ${scaleName} — frets X–Y (combined)` and
   `labels.ts:88` builds `target · Root → 3rd (D)`. Word order differs in Vietnamese
   (`Ngũ cung Thứ La` ≈ "A Minor Pentatonic" reversed), so these must become whole-sentence keys
   with placeholders, not concatenation.
2. **Two real plural sites**, both in `ProgressionSection.tsx:157–158`: `bar` / `bars`.
   Vietnamese has no plural inflection; a community locale might need `few`/`many`.
3. **`src/ui/labels.ts` is pure and unit-tested by design** (its header comment explains why). Its
   functions must stay pure — they take a `t` argument rather than reaching for a context.
4. **Existing tests assert English literals** and will need updating in the same PR that moves each
   string: `App.test.tsx:20–21` (`Fretboard Trainer`, `Pentatonic Practice`), `:168,:200`
   (`Copied!`); `ScalePositionSection.test.tsx:40,46,47,53` (`♭5 (blue note)`);
   `labels.test.ts:57–88` (`target · Root (D)` etc.).
5. **`SET_STATE` replaces the whole state object** (`appState.ts:236`) — the JSON-import path would
   otherwise wipe the user's language. One-line fix, but it must be deliberate.
6. **Share/export payloads are field-by-field allowlists** in `share.ts` and `persistence.ts` —
   three near-duplicate destructurings that all need a decision about `language`.
7. **No dates anywhere in the app.** Numbers are only BPM, fret numbers, level, bar and box counts.
   So `Intl.DateTimeFormat`/`NumberFormat` are not needed — see §2.7.
8. **Static SPA, no SSR** — `index.html` (`<title>`, `og:*`, `twitter:*`, `<html lang="en">`) and
   `public/manifest.json` are served identically to everyone. Localizing them is out of scope for
   v1; only `document.title` and `document.documentElement.lang` can be updated client-side.
9. **`noUncheckedIndexedAccess` is on** — a naive `messages[key]` is `string | undefined`, which
   actually helps: it forces the fallback path to be written.
10. **`resolveJsonModule` is currently off** in `tsconfig.app.json` — needed for JSON locale files.

---

## 2. Design decision

### 2.1 Hand-rolled, no new runtime dependency

**Decision: hand-rolled `src/i18n/` module (~150 lines + tests). No library.**

Rationale against the constraints:

- Runtime deps are `react` + `react-dom` only (`docs/architecture.md:66`). `react-i18next` pulls
  `i18next` + `react-i18next` (~40 KB gz) plus a plugin ecosystem; `@formatjs/intl` is bigger still.
- We need three things: key → string lookup, `{placeholder}` interpolation, and plural selection.
  Plural selection is free and correct for every language via **`Intl.PluralRules`**, which is in
  every browser we support and is already how `Intl` is used nowhere-else-but-available. That is
  the only genuinely hard part of i18n, and the platform already ships it.
- We do **not** need: lazy namespaces, backend connectors, ICU message syntax, context/gender,
  RTL support (both launch locales are LTR), or date/relative-time formatting (no dates exist).
- A library would also fight the layer rule: `i18next` instances are ambient singletons, whereas the
  design below keeps translation a pure function plus one React context in `ui/`.

Cost of hand-rolling: no ICU nesting, no gender/select. Accepted; if a community locale ever needs
ICU-grade messages we can revisit with a written justification then.

### 2.2 Where it lives, and how the layer rule constrains it

New leaf layer, sibling of `music/`, importing **nothing** from the app:

```
ui → state → (lick → fretboard → music)      audio → lick/state
ui, state → i18n                              i18n imports nothing
```

- `src/i18n/**/*.ts` — pure TypeScript, **never imports react** and never imports another layer.
- `src/music`, `src/fretboard`, `src/lick`, `src/audio` **may not import `i18n`**. This is the
  load-bearing decision: **engines never translate.** They stay locale-free pure functions that
  return *ids* (`ScaleId`, `QualityId`, `TuningId`, `ToneRole`) and *notation* (`format`,
  `chordLabel`, `romanNumeral`). Anything else would make engine output depend on ambient locale
  state, breaking determinism and the "reusable from a CLI" property.
- `src/state` may import `i18n` **for types + the `LocaleId` validator only** (it stores the
  preference; it never renders).
- The React binding (`I18nProvider`, `useT()`) lives in `src/ui/i18n/` — the only layer allowed to
  import react.

ESLint (`eslint.config.js`) gets one new block for `src/i18n/**/*.ts` and `**/i18n/**` added to the
forbidden groups of `music`/`fretboard`/`lick`/`audio`. `docs/architecture.md` §"Layers & the
dependency rule" and the repo-layout tree get the same update.

**Engine display names**: `ScaleDef.name`, `CHORD_QUALITIES[].name`, `Tuning.name` **stay** as the
canonical English developer-facing label (they're used in engine tests and read well in the
registry). The UI stops reading them and reads `t('scale.minorPentatonic')` instead. A drift test in
`src/i18n/locales.test.ts` asserts `SCALES[id].name === en[`scale.${id}`]` for every id, so the
registry and the `en` catalog can never disagree. Alternative considered — delete the `name` fields
outright — rejected: it churns three engine public APIs and their tests for no functional gain.

### 2.3 Module API (types only)

```ts
// src/i18n/types.ts
export type LocaleId = 'en' | 'vi';                  // widened by each community PR

export interface LocaleMeta {
  id: LocaleId;
  /** Endonym — the language's own name. Never translated: 'English', 'Tiếng Việt'. */
  endonym: string;
  /** BCP-47 tag handed to Intl.PluralRules and <html lang>. */
  tag: string;
  /** Credit line shown in docs/about; free-form. */
  contributors?: string[];
}

/** The `en` catalog is the schema: every other locale must supply exactly these keys. */
export type TranslationKey = keyof typeof import('./locales/en.json');
export type Messages = Record<TranslationKey, string>;

export type ParamValue = string | number;
export type Params = Readonly<Record<string, ParamValue>>;

/** Bound to one locale; never throws, never renders a raw key when `en` has the key. */
export type Translate = (key: TranslationKey, params?: Params) => string;

// src/i18n/translate.ts
export function createTranslator(
  locale: LocaleId,
  messages: Partial<Messages>,
  fallback: Messages,          // always the `en` catalog
): Translate;

// src/i18n/plural.ts  — thin Intl.PluralRules wrapper, cached per tag
export function pluralCategory(tag: string, count: number): Intl.LDMLPluralRule;

// src/i18n/detect.ts  — pure; the browser boundary passes navigator.languages in
export function detectLocale(preferred: readonly string[]): LocaleId;

// src/i18n/validate.ts
export interface LocaleReport {
  missing: string[];            // in `en`, absent here
  unknown: string[];            // here, not in `en`
  placeholderMismatch: { key: string; expected: string[]; actual: string[] }[];
  missingPluralForms: string[]; // e.g. 'progression.bars' needs `.few` for pl-PL
}
export function validateLocale(tag: string, candidate: Record<string, string>, reference: Messages): LocaleReport;

// src/i18n/index.ts
export const LOCALES: Readonly<Record<LocaleId, LocaleMeta>>;
export const MESSAGES: Readonly<Record<LocaleId, Partial<Messages>>>;
export const DEFAULT_LOCALE: LocaleId; // 'en'
export function isLocaleId(x: unknown): x is LocaleId;
```

React binding, in `ui/`:

```ts
// src/ui/i18n/context.ts   (no JSX → plain .ts)
export const I18nContext: React.Context<Translate>;
export function useT(): Translate;

// src/ui/i18n/I18nProvider.tsx
export function I18nProvider(props: { locale: LocaleId; children: React.ReactNode }): React.ReactElement;
```

`useT()` is what components call. `src/ui/labels.ts` keeps its purity: its functions gain a `t`
parameter (`roleLabel(role, t)`, `targetBadgeText(role, landing, tonic, t)`,
`decorationLegendEntries(scaleId, t)`) so `labels.test.ts` can pass a fake translator.

### 2.4 Locale file format (the contributor contract)

**One flat JSON file per locale: `src/i18n/locales/<id>.json`.** Flat dotted keys, sorted
alphabetically, values are plain strings. No nesting, no comments, no code.

```jsonc
// src/i18n/locales/en.json  (excerpt)
{
  "app.subtitle": "Visualize the scale, target the chord tones under your progression, and generate simple licks to solo over your backing track.",
  "app.title": "Pentatonic Practice",
  "common.share": "Share",
  "common.shareCopied": "Copied!",
  "practice.level.2": "Quarters + paired 8ths",
  "progression.bars.one": "{count} bar",
  "progression.bars.other": "{count} bars",
  "progression.barsToggle": "{chord} spans {bars} — click to toggle",
  "quality.dom7": "dom7",
  "scale.minorPentatonic": "Minor Pentatonic",
  "scalebox.title": "{tonic} {scale}",
  "scalebox.titleCombined": "{tonic} {scale} — frets {min}–{max} (combined)",
  "tuning.standard": "Standard"
}
```

Conventions, all enforced by the parity test:

- **Key namespaces**: `app.*`, `common.*`, `scalebox.*`, `progression.*`, `practice.*`,
  `playback.*`, `legend.*`, `error.*`, `install.*`, plus the music namespaces `scale.*`,
  `quality.*`, `tuning.*`, `role.*`, `note.*`.
- **Interpolation**: `{name}` placeholders. A translation must use exactly the same placeholder set
  as `en` — order may change freely (that's the whole point).
- **Plurals**: keys ending `.one` / `.other` / `.zero` / `.two` / `.few` / `.many`. A locale must
  supply exactly the categories `Intl.PluralRules(tag).resolvedOptions().pluralCategories` lists —
  Vietnamese supplies only `.other`, Polish would need `.one/.few/.many/.other`.
- **Do-not-translate list** documented in the guide: note names, chord suffixes, roman numerals,
  interval labels, fret/tab digits, transport glyphs, product name "Guitarmateur".

**Why JSON and not TS**: a non-developer contributor can copy `en.json`, translate the right-hand
side in any text editor, and open a PR. Vite/`resolveJsonModule` imports it with zero runtime cost.
Typing still works: `src/i18n/locales/index.ts` does
`import vi from './vi.json'; ... vi satisfies Partial<Messages>` and `TranslationKey` is derived
from `en.json`, so every `t('...')` call site is key-checked by `tsc`.

**Known trade-off (accept and document)**: with `resolveJsonModule`, TS widens JSON values to
`string`, so placeholder *names* can't be type-checked per key — `t('scalebox.title', { tonic })`
with a typo'd param compiles. Mitigation: (a) `validateLocale` checks placeholder parity between
locales in CI; (b) in DEV, `createTranslator` `console.warn`s on an unresolved `{placeholder}`;
(c) only ~10 keys interpolate, and each gets a unit test. Making params type-safe would require
locale files to be `as const` TS — rejected, because it puts contributors in front of a `.ts` file.

**Discovery**: `src/i18n/locales/index.ts` uses `import.meta.glob('./*.json', { eager: true })` to
build `MESSAGES`, so adding a locale is: drop in the JSON, add one member to the `LocaleId` union,
add one `LocaleMeta` row. Three edits, one of them mechanical.

### 2.5 Validation of community locales (never trusted)

Three independent gates, all of them CI-blocking via existing `npm test` / `npm run typecheck`:

1. **`tsc`** — `satisfies Partial<Messages>` in `locales/index.ts` rejects unknown keys with a
   compile error, and `TranslationKey` keeps call sites honest.
2. **`src/i18n/locales.test.ts`** — iterates *every* file the glob finds and asserts a clean
   `LocaleReport`: no missing keys, no unknown keys, no placeholder mismatch, correct plural
   categories for the locale's tag, plus the `SCALES`/`CHORD_QUALITIES`/`TUNINGS` drift check. The
   failure message names the offending keys, so a contributor can fix it without reading code.
3. **Runtime fallback** — `createTranslator` falls back to `en` for any key the active locale
   lacks (and `console.warn`s in DEV only). A locale that goes stale after we add a key degrades to
   mixed-language, never to a blank or a raw key string.

Deliberate non-goal: no "translation completeness %" UI, no crowd platform. Missing keys simply
render English.

### 2.6 Persistence, migration, and the share/import traps

`AppState` gains `language: LocaleId` → **`schemaVersion: 7`**, following the exact pattern of
`leftHanded` (added in v6):

- `appState.ts` — `language: LocaleId` field, `defaultState(nextSeed, language: LocaleId = 'en')`,
  new action `{ type: 'setLanguage'; language: LocaleId }`.
- `persistence.ts` — `migrate(raw, language?: LocaleId)`: `isLocaleId(r.language) ? r.language
  : (language ?? DEFAULT_LOCALE)`, mirroring the existing `// Added in schema vN` comments. Include
  `language` in the `saveState` allowlist. `migrate` stays pure — no `navigator` access.
- `persistence.ts` — `loadState()` is the browser boundary: it reads the persisted language first
  (so an existing preference wins), else `detectLocale(navigator.languages)`, and passes that into
  both `decodeState(raw, language)` and `migrate(raw, language)`.
- **`language` is excluded from `encodeState` / `exportStateToJson`.** A shared link or an exported
  file is *practice state*, not a device preference — opening a friend's link must not switch your
  UI language. This is why `migrate` takes the language as a parameter.
- **`SET_STATE` must preserve it**: `case 'SET_STATE': return { ...action.payload, language:
  state.language };` — otherwise the JSON-import path in `App.tsx:92` resets the user's language.
- Legacy v1–v6 payloads have no `language` → detection runs → existing users on a Vietnamese
  browser get Vietnamese on their next visit; everyone else keeps English.

### 2.7 Detection, picker, formatting, and document metadata

- **Detection** (`detectLocale`, pure, client-side only): walk `navigator.languages` in order,
  match on exact tag then on the primary subtag (`vi-VN` → `vi`), fall back to `en`. No
  `Accept-Language`, no server, no IP geolocation — the app is static.
- **Picker**: a pill group in the `App.tsx` header button row, alongside Share/Export/Import,
  rendering `LOCALES` with **endonyms** (`English`, `Tiếng Việt`) — never translated, so a user who
  landed in the wrong language can still recognize their own. Dispatches `setLanguage`. Explicit
  choice beats detection permanently, because it's persisted.
- **`<html lang>`**: `I18nProvider` sets `document.documentElement.lang = LOCALES[locale].tag` in an
  effect. `document.title` set from `t('meta.title')` in the same effect.
- **Numbers**: **not** localized. Every number in this app is musical notation or a control value
  (BPM, fret, level, bar count, box number) and must stay Latin digits — `Intl.NumberFormat` would
  render Eastern Arabic digits in `ar` inside guitar tab, which is wrong. `String(n)` everywhere;
  documented as a rule in the contributor guide.
- **Dates**: none exist. No `Intl.DateTimeFormat`.
- **RTL**: not needed (`en`, `vi` are LTR). No `dir` handling, no logical-property CSS refactor. If
  an RTL locale is ever contributed, that's its own feature — noted in the guide as currently
  unsupported.

### 2.8 Bundling

All locales are imported eagerly and bundled. At ~110 short keys a locale is ~4–6 KB raw / ~1.5–2 KB
gzipped; two locales are noise next to React. Eager keeps the PWA fully offline (`public/sw.js` is
cache-first on assets but only precaches the `/` shell — a lazily-fetched locale chunk would not be
in cache on first offline load) and keeps `t()` synchronous, which avoids loading states in every
component.

Revisit threshold, written down now so it isn't argued later: **when the locale count reaches 4 or
the combined catalog exceeds ~20 KB gzipped**, switch to non-eager `import.meta.glob` + an async
load in `I18nProvider` that renders `en` until the chunk resolves, and add the active locale chunk
to the SW install precache. Captured as deferred task T14.

---

## 3. Task breakdown

14 tasks. Each is one logical change, independently mergeable, CI-green on its own
(lint → typecheck → test → build). Task N+1 assumes only N..1 merged. Sizes are
`src lines + test lines`, excluding pure JSON translation content.

---

### T1 — i18n core module (translator, plurals, detection, validator)
**Size: M** (~180 src + ~200 test)
**Layers/files**: new `src/i18n/{types,translate,plural,detect,validate}.ts` + colocated tests;
`eslint.config.js`; `docs/architecture.md`.

**Scope**: the engine of the feature, with **zero app coupling** — no component changes, no catalog
yet. Tests drive it with a fixture catalog defined inline.

**Steps**
1. `types.ts` — `LocaleId` (`'en'` only for now), `LocaleMeta`, `Params`, `Translate`, `Messages`
   as a generic `Record<string, string>` shape (bound to `en.json` in T2).
2. `translate.ts` — `createTranslator(locale, messages, fallback)`: lookup → fallback → (never)
   raw key; `{name}` interpolation via a single regex replace; plural-suffix resolution when
   `params.count` is present; DEV-only `console.warn` for missing key / unresolved placeholder.
3. `plural.ts` — `pluralCategory(tag, count)` over a memoized `Intl.PluralRules` cache.
4. `detect.ts` — `detectLocale(preferred)`, exact tag → primary subtag → `'en'`.
5. `validate.ts` — `validateLocale()` returning `LocaleReport` (missing / unknown /
   placeholderMismatch / missingPluralForms).
6. `eslint.config.js` — new block forbidding react + every other layer inside `src/i18n/**/*.ts`;
   add `**/i18n/**` to the forbidden groups for `music`, `fretboard`, `lick`, `audio`.
7. `docs/architecture.md` — add `i18n/` to the repo-layout tree and the dependency-rule block.

**Acceptance**
- `npm run lint|typecheck|test|build` all green; new tests cover: interpolation incl. repeated and
  reordered placeholders; missing key → fallback string; missing key in both → the key itself;
  plural selection for `en` (1/2/0) and `vi` (all → `other`); `detectLocale` for `['vi-VN','en']`,
  `['en-GB']`, `['fr']`, `[]`; `validateLocale` reporting each of the four defect classes.
- A deliberate `import { SCALES } from '../music'` inside `src/i18n/` fails `npm run lint`
  (verify manually, don't commit).
- No behaviour change in the app; bundle size unchanged (module is unreferenced, tree-shaken).

---

### T2 — English catalog + typed key union + registry + parity test
**Size: M** (~90 src + ~120 test + ~110 JSON keys)
**Layers/files**: `src/i18n/locales/en.json`, `src/i18n/locales/index.ts`, `src/i18n/index.ts`,
`src/i18n/locales.test.ts`, `tsconfig.app.json`.

**Scope**: the single source of truth for keys. Strings are copied **verbatim** from today's
components so T4–T8 are pure substitutions with zero copy changes.

**Steps**
1. `tsconfig.app.json` — add `"resolveJsonModule": true`.
2. `en.json` — all ~110 keys per §2.4, transcribed from the survey table in §1.1–1.2, sorted.
   Convert the concatenated templates into whole-sentence keys with placeholders
   (`scalebox.titleCombined`, `practice.targetBadge`, `progression.barsToggle`, …).
3. `locales/index.ts` — `import.meta.glob('./*.json', { eager: true })` → `MESSAGES`, plus the
   `LOCALES` meta table (one row: `en`).
4. `types.ts` — bind `TranslationKey = keyof typeof en`, `Messages = Record<TranslationKey, string>`.
5. `index.ts` barrel — `LOCALES`, `MESSAGES`, `DEFAULT_LOCALE`, `isLocaleId`, `createTranslator`,
   `detectLocale`, `validateLocale`, types.
6. `locales.test.ts` — for every discovered locale: clean `LocaleReport` vs `en`; plural categories
   match the tag; **drift check** `SCALES[id].name === en['scale.' + id]` for all 8 scale ids, same
   for the 5 qualities and 2 tunings; and every key is reachable (no orphan namespace).

**Acceptance**
- CI green. `en.json` key count matches the survey (~110) and every value is byte-identical to the
  literal it will replace.
- Deleting one key from `en.json` fails `typecheck` at a call site (after T4) and fails
  `locales.test.ts` drift assertions for the music namespaces today.
- Still no runtime behaviour change.

---

### T3 — `language` in AppState: schema v7, migration, detection wiring
**Size: M** (~70 src + ~140 test)
**Layers/files**: `src/state/{appState,persistence,share,useAppState}.*` + their tests.

**Scope**: persistence only. Nothing renders differently yet.

**Steps**
1. `appState.ts` — `schemaVersion: 7`, `language: LocaleId`, `defaultState(nextSeed, language = 'en')`,
   action `setLanguage`, reducer case, and `SET_STATE` → `{ ...action.payload, language: state.language }`.
2. `persistence.ts` — `migrate(raw, language?)` with the `// Added in schema v7` comment in the
   house style; `language` added to the `saveState` allowlist; `loadState()` reads the stored
   language, else `detectLocale(navigator.languages ?? [navigator.language])`, and threads it into
   `decodeState` / `migrate`.
3. `share.ts` — `decodeState(raw, language?)` passes through; `language` deliberately **absent**
   from `encodeState` and `exportStateToJson` payloads (comment explaining why).
4. `useAppState.tsx` — unchanged apart from the `defaultState` fallback picking up detection.

**Acceptance**
- Tests: v6 payload (no `language`) + detected `vi` → state has `vi`; v6 payload + no detection →
  `en`; persisted `vi` survives a save/load round-trip; a garbage `language` value falls back;
  `encodeState`/`exportStateToJson` output contains no `language` key; importing a JSON file while
  in `vi` keeps `vi`; opening a share URL while in `vi` keeps `vi`.
- Existing `persistence.test.ts` / `share.test.ts` / `appState.test.ts` updated for v7, all green.

---

### T4 — React binding + first component migrated (`App.tsx`)
**Size: M** (~90 src + ~60 test)
**Layers/files**: new `src/ui/i18n/{context.ts,I18nProvider.tsx}`; `src/ui/App.tsx`; `App.test.tsx`.

**Scope**: prove the whole pipeline end-to-end on the header, still English-only.

**Steps**
1. `context.ts` — `I18nContext` (default: an `en`-bound translator) + `useT()`.
2. `I18nProvider.tsx` — memoizes `createTranslator(locale, MESSAGES[locale], MESSAGES.en)`; effect
   sets `document.documentElement.lang` and `document.title`.
3. `App.tsx` — wrap the tree in `<I18nProvider locale={state.language}>`; replace all 13 literals
   (incl. the `window.prompt` copy string) with `t(...)`.
4. `App.test.tsx` — assert against `en.json` values rather than inline literals (import the catalog
   in the test), and add a case rendering with `language: 'vi'`-shaped fake messages to prove the
   provider actually switches output.

**Acceptance**
- No English literal remains in `App.tsx` (visible text or aria/title).
- `document.documentElement.lang === 'en'` after mount.
- `App.test.tsx` green without hard-coded copy.

---

### T5 — Extract `ScalePositionSection` + `Legend` usage + `decorationLegendEntries`
**Size: M** (~70 src + ~60 test)
**Files**: `ScalePositionSection.tsx`, `src/ui/labels.ts`, `labels.test.ts`,
`ScalePositionSection.test.tsx`.

**Steps**
1. Replace the 12 literals with `t()`; build the diagram title from `scalebox.title` /
   `scalebox.titleCombined` with `{tonic}` `{scale}` `{min}` `{max}` placeholders — **no more
   string concatenation**.
2. Scale-name pill and tuning-name pill read `t('scale.' + id)` / `t('tuning.' + id)` (typed via a
   small `scaleKey(id): TranslationKey` helper so the template literal stays type-safe).
3. `decorationLegendEntries(scaleId, t)` — signature gains `t`; keeps its purity and its existing
   registry-driven behaviour (`legend.blueNote` with an `{interval}` placeholder).
4. Update `labels.test.ts` + `ScalePositionSection.test.tsx` to a fake/`en` translator.

**Acceptance**: no literals left in the file; `♭5 (blue note)` / `♭3 (blue note)` behaviour
preserved (assert via the `en` catalog); interval glyphs still produced by `intervalLabel` and not
translated.

---

### T6 — Extract `ProgressionSection` (including the plural path)
**Size: M** (~80 src + ~70 test)
**Files**: `ProgressionSection.tsx`, `src/i18n/locales/en.json` (plural keys already present from
T2), new/updated tests.

**Steps**
1. Replace the 16 literals with `t()`.
2. Route `{n} bar{s}` through the plural mechanism: `t('progression.bars', { count: entry.bars })`
   resolving `progression.bars.one` / `.other`; the aria label composes it via
   `t('progression.barsToggle', { chord, bars })`.
3. Add a focused test that the aria-label reads `"Am spans 1 bar — click to toggle"` for 1 and
   `"…spans 2 bars…"` for 2, driven through the real `en` catalog.

**Acceptance**: both plural forms correct in `en`; the same call renders correctly under a
single-form locale (unit-tested with a `vi`-shaped fixture supplying only `.other`).

---

### T7 — Extract `PracticeSection` + the remaining `labels.ts` functions
**Size: M** (~110 src + ~90 test)
**Files**: `PracticeSection.tsx`, `src/ui/labels.ts`, `labels.test.ts`.

**Steps**
1. Replace the 21 literals with `t()`, including the 5 level descriptions
   (`practice.level.1..5`) and the 5 legend labels.
2. `roleLabel(role, t)` → `t('role.R' | 'role.3' | 'role.5' | 'role.7')`.
3. `targetBadgeText(targetRole, landing, chordTonic, t)` → one key
   `practice.targetBadge` (`"target · {target} ({note})"`) plus
   `practice.targetBadgeRedirect` (`"target · {target} → {actual} ({note})"`), preserving the
   documented landing-note semantics in the existing doc comment.
4. Card titles: `practice.diagramTitle` / `practice.lickTitle` / `practice.rerollAria` with
   `{chord}` `{role}` placeholders.

**Acceptance**: `labels.test.ts` cases from `:57–88` all pass with identical rendered output under
`en`; the `B♭`-in-D-minor-pentatonic regression case still asserts the landing note, not the root.

---

### T8 — Extract `PlaybackControls`, `InstallPrompt`, `ErrorBoundary`, `TabStaff` fallback
**Size: M** (~90 src + ~40 test)
**Files**: those four components + `ErrorBoundary.test.tsx`.

**Steps**
1. `PlaybackControls` — 18 literals incl. every `aria-label`; `MixSlider` takes a `label: string`
   already-translated by its caller plus an `ariaLabel` built from `playback.mixVolume`.
2. `InstallPrompt` — 3 literals; keep the product name "Guitarmateur" untranslated inside the
   `install.title` value.
3. `ErrorBoundary` — 3 literals. It's a class component and **cannot use hooks**: give it a
   `t` prop supplied by `App.tsx`, defaulting to an `en`-bound translator so a crash inside the
   provider still renders readable text.
4. `TabStaff` — `aria-label={title ?? t('tab.emptyLick')}`.

**Acceptance**: `src/ui/**/*.tsx` contains no remaining prose literal (spot-checked; enforced in
T13); `ErrorBoundary.test.tsx` green; audio-unavailable notice still renders when
`transport.supported` is false.

---

### T9 — Music-term localization: scale / quality / tuning names + note-letter hook
**Size: M** (~80 src + ~90 test)
**Files**: `src/ui/labels.ts`, `src/i18n/locales/en.json`, `ScalePositionSection.tsx`,
`ProgressionSection.tsx`, `locales.test.ts`, `docs/architecture.md`.

**Scope**: finish the engines-never-translate boundary and open the one seam locales may need.

**Steps**
1. Confirm/complete the `scale.*` (8), `quality.*` (5), `tuning.*` (2) key sets and that **no
   component reads `.name` from an engine registry any more** (grep gate in the test).
2. Add the drift test from T2 as a hard assertion over all three registries.
3. Add `note.letter.{A..G}` keys (identity in `en`) and a UI helper
   `noteLabel(n: NoteName, t): string` = `t('note.letter.' + n.letter) + accidental glyph`, used
   wherever `format()` output is *displayed* — pickers, titles, badges. `format()` itself stays
   untouched in `src/music/pitch.ts` (still the canonical spelling used by engines, tests, share
   payloads and tab).
4. Document the rule in `docs/architecture.md`: engines return ids and notation; only `ui/` names
   things.

**Acceptance**: `en` and (later) `vi` map letters to themselves, so rendered output is byte-identical
to today; a fixture locale mapping `C→Do` proves the hook works end-to-end in a unit test;
`grep -rn "\.name" src/ui` returns no engine-registry reads.

---

### T10 — Vietnamese locale
**Size: M** (~15 src + ~40 test + ~110 translated JSON values)
**Files**: `src/i18n/locales/vi.json`, `src/i18n/types.ts` (union), `src/i18n/locales/index.ts`
(meta row), tests.

**Steps**
1. `LocaleId = 'en' | 'vi'`; `LocaleMeta` row `{ id: 'vi', endonym: 'Tiếng Việt', tag: 'vi' }`.
2. `vi.json` — full translation. Music terms: `Ngũ cung Thứ`, `Ngũ cung Trưởng`, `Âm giai Blues`,
   `Trưởng`, `Dorian`, `Mixolydian`, `Thứ tự nhiên`, `Blues Trưởng`; chord qualities and tuning
   names likewise; note letters stay `A–G` (standard in Vietnamese guitar teaching); plurals supply
   `.other` only.
3. Tests: `locales.test.ts` now validates two locales automatically; add a smoke test rendering
   `App` with `language: 'vi'` and asserting a known Vietnamese string appears.

**Acceptance**: `validateLocale('vi', …)` clean; no `en` fallback warnings when rendering the whole
app in `vi` (assert zero DEV warnings in the smoke test); a `vi-VN` browser with no stored state
gets Vietnamese on first load (detection test from T3 now resolves to a real locale).

---

### T11 — Language picker + title/lang sync
**Size: S/M** (~60 src + ~50 test)
**Files**: `src/ui/App.tsx`, `src/ui/components/LanguagePicker.tsx` (new), `App.test.tsx`.

**Steps**
1. `LanguagePicker` — pill group over `LOCALES`, labels are endonyms, `aria-label` from
   `common.language`, dispatches `setLanguage`.
2. Place it in the header button row next to Import/Left-handed.
3. Ensure `I18nProvider`'s effect updates `document.documentElement.lang` and `document.title` when
   the language changes.

**Acceptance**: clicking `Tiếng Việt` re-renders the app in Vietnamese, sets `<html lang="vi">`,
persists across reload (localStorage assertion), and does not alter the share URL payload.

---

### T12 — Contributor guide for adding a language
**Size: M** (docs only, ~180 lines)
**Files**: `docs/i18n.md` (new), `README.md` (Contributing section), `AGENTS.md` (one pointer line),
`docs/architecture.md` (link).

**Scope**: the artifact that makes community locales actually happen. Written for a non-developer.

**Steps** — the guide contains:
1. Five-step recipe: fork → copy `src/i18n/locales/en.json` to `<tag>.json` → translate the values
   → add your language to the two lists in `types.ts` / `locales/index.ts` (with the exact lines to
   copy) → open a PR.
2. Key-naming and namespace reference table.
3. **Do-not-translate list** (note names, chord suffixes, roman numerals, interval labels, tab
   digits, transport glyphs, "Guitarmateur").
4. Placeholder rules with a worked reordering example, and the plural-category rules with a Polish
   example.
5. How to check your work: `npm ci && npm test` — plus a transcript of what a failing
   `locales.test.ts` report looks like and how to read it.
6. Explicit current limitations: no RTL support, no localized `index.html`/`manifest.json`, digits
   are never localized.
7. Credit: `LocaleMeta.contributors`.

**Acceptance**: a reviewer who has never touched the repo can follow it start-to-finish; every file
path and command in it is verified to exist; `npm run lint|typecheck|test|build` unaffected.

---

### T13 — Lint guard against new hard-coded UI copy
**Size: S** (~30 config + ~20 test)
**Files**: `eslint.config.js`, any stragglers it surfaces.

**Steps**
1. Add a `no-restricted-syntax` rule for `src/ui/**/*.tsx` flagging `JSXText` nodes containing
   letters, and `JSXAttribute[name.name=/^(aria-label|title|placeholder)$/] > Literal`.
2. Allow the notation glyph set (`▶ ■ ↻ × · —` and digits) via the rule's regex, not via
   per-line disables.
3. Fix or explicitly `eslint-disable-next-line` (with a reason comment) whatever it finds.

**Acceptance**: `npm run lint` fails on a newly added `<div>Hello</div>` in `src/ui/` (verify
manually); passes on the current tree; zero new warnings.

---

### T14 — (Deferred) lazy locale loading
**Size: M** (~80 src + ~60 test)
**Trigger**: ≥4 locales, or combined catalogs >20 KB gzipped. **Do not do this early.**

**Steps**: non-eager `import.meta.glob`; `I18nProvider` renders `en` while the active chunk loads;
add the active locale chunk to the `public/sw.js` install precache so offline still works; test the
loading and failure paths.

**Acceptance**: initial JS bundle drops by the size of the non-active catalogs; switching language
shows no flash of untranslated content beyond one frame; offline reload in a non-`en` locale still
renders that locale.

---

## 4. Rollout plan

Four weeks, merge order = task order. No task depends on anything beyond its predecessor, so a
week can slip without blocking the next PR's review.

**Week 1 — Foundation (invisible to users): T1 → T2 → T3.**
The i18n module, the English catalog, and the persisted `language` field with detection land
without changing a single pixel. If we stop here, nothing is worse than today. Highest-review-value
week: this is where the API and the key schema get argued about, cheaply.

**Week 2 — Extraction, part 1: T4 → T5 → T6.**
`App`, `ScalePositionSection`, `ProgressionSection` move to `t()`. T4 is the risk point (React
binding + first migration); review it carefully, the rest are mechanical. Plurals get proven in T6.

**Week 3 — Extraction, part 2 + music terms: T7 → T8 → T9.**
`PracticeSection`, `labels.ts`, playback and the small components. T9 closes the
engines-never-translate boundary and adds the note-letter seam. **End of week 3 the app is fully
key-driven and still 100% English** — a safe place to pause indefinitely.

**Week 4 — Ship Vietnamese + open the door: T10 → T11 → T12 → T13.**
`vi.json`, the picker, the contributor guide, and the lint guard that keeps the tree clean after
we stop paying attention. T13 last on purpose: it can only pass once T4–T8 are done.

**Deferred**: T14, gated on locale count.

**Suggested checkpoints**
- After T3: confirm the key-schema and `LocaleId` union shape before ~110 keys get written against
  it (cheapest moment to change your mind).
- After T9: decide whether to ship `vi` immediately or sit on the English-only key-driven build.
- After T12: announce the contributor guide (README + an issue labelled `good first issue:
  translation`) — that's the actual growth mechanism for locale #3.

**Risks and mitigations**
- *Copy drift during extraction* — mitigated by transcribing verbatim into `en.json` in T2 and
  substituting mechanically afterwards; any wording improvement is a separate PR.
- *A community locale rotting after we add a key* — runtime `en` fallback plus a CI report that
  names the missing keys; never a blank UI.
- *Scope creep into localized SEO/`index.html`* — explicitly out of scope for v1; would need
  prerendering or Vercel rewrites, which is its own feature.
