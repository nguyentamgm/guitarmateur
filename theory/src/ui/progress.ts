/**
 * Quiz progress across lessons: one record per quiz, kept in Theory's own localStorage key (never
 * the practice app's). Pure functions plus a storage boundary that never throws, like `lang.ts`.
 * The review page ranks quizzes with `nextReview()`.
 */

/** Every quiz that records progress, in curriculum order: the lesson and the step it lives in. */
export const QUIZZES = [
  { id: 'fretboard-root', slug: 'fretboard', step: 'home' },
  { id: 'pentatonic-shape', slug: 'pentatonic', step: 'choose' },
  { id: 'blues-bend', slug: 'blues', step: 'bends' },
  { id: 'chords-build', slug: 'chords', step: 'build' },
  { id: 'barre-find', slug: 'barre', step: 'find' },
  { id: 'keys-home', slug: 'keys', step: 'home' },
] as const;

export type QuizId = (typeof QUIZZES)[number]['id'];
export const QUIZ_IDS: readonly QuizId[] = QUIZZES.map((q) => q.id);

/** Answers kept for accuracy: recent form counts, not a bad first week. */
export const RECENT = 20;
/** Below this recent accuracy a quiz needs work. */
export const WEAK_BELOW = 0.8;
/** A quiz not practised for this many days is due again. */
export const STALE_DAYS = 7;
const DAY_MS = 24 * 60 * 60 * 1000;

export interface QuizRecord {
  readonly right: number;
  readonly total: number;
  /** The current run of right answers, across visits. */
  readonly streak: number;
  readonly bestStreak: number;
  /** Last answers, oldest first, at most RECENT: true = right. */
  readonly recent: readonly boolean[];
  /** Time of the last answer, ms since the epoch. */
  readonly lastAt: number;
}

export type Progress = Readonly<Partial<Record<QuizId, QuizRecord>>>;

/** Add one answer to a quiz's record. */
export function recordAnswer(progress: Progress, id: QuizId, right: boolean, now: number): Progress {
  const r = progress[id];
  const streak = right ? (r?.streak ?? 0) + 1 : 0;
  return {
    ...progress,
    [id]: {
      right: (r?.right ?? 0) + (right ? 1 : 0),
      total: (r?.total ?? 0) + 1,
      streak,
      bestStreak: Math.max(r?.bestStreak ?? 0, streak),
      recent: [...(r?.recent ?? []), right].slice(-RECENT),
      lastAt: now,
    },
  };
}

/** Share of the recent answers that were right, 0–1; null before the first answer. */
export function accuracy(r: QuizRecord | undefined): number | null {
  if (!r || r.recent.length === 0) return null;
  return r.recent.filter(Boolean).length / r.recent.length;
}

export const daysSince = (r: QuizRecord, now: number): number => Math.max(0, Math.floor((now - r.lastAt) / DAY_MS));

/** Why a quiz is where it is in the review order. */
export type ReviewReason = 'new' | 'weak' | 'stale' | 'fresh';

export interface ReviewItem {
  readonly id: QuizId;
  readonly reason: ReviewReason;
  readonly record: QuizRecord | undefined;
}

const RANK: Readonly<Record<ReviewReason, number>> = { new: 0, weak: 1, stale: 2, fresh: 3 };

export function reasonOf(r: QuizRecord | undefined, now: number): ReviewReason {
  const acc = accuracy(r);
  if (!r || acc === null) return 'new';
  if (acc < WEAK_BELOW) return 'weak';
  return daysSince(r, now) >= STALE_DAYS ? 'stale' : 'fresh';
}

/**
 * Every quiz, the one to do next first: never tried (in curriculum order), then weak (lowest
 * accuracy first), then due again (longest ago first), then the rest (longest ago first).
 */
export function nextReview(progress: Progress, now: number): ReviewItem[] {
  const items = QUIZ_IDS.map((id, order) => ({ id, order, record: progress[id], reason: reasonOf(progress[id], now) }));
  const key = (i: (typeof items)[number]): number => {
    if (i.reason === 'new') return i.order;
    if (i.reason === 'weak') return accuracy(i.record)!;
    return i.record!.lastAt;
  };
  return items
    .sort((a, b) => RANK[a.reason] - RANK[b.reason] || key(a) - key(b))
    .map(({ id, reason, record }) => ({ id, reason, record }));
}

// --- Storage ---

export const PROGRESS_STORAGE_KEY = 'theory.progress';

type KeyValue = Pick<Storage, 'getItem' | 'setItem'>;

function defaultStorage(): KeyValue | null {
  try {
    return typeof localStorage === 'undefined' ? null : localStorage;
  } catch {
    return null; // Accessing localStorage itself throws when site data is blocked.
  }
}

const isCount = (v: unknown): v is number => typeof v === 'number' && Number.isInteger(v) && v >= 0;

/** A stored record, or null if any field is missing or impossible. */
function readRecord(v: unknown): QuizRecord | null {
  if (!v || typeof v !== 'object') return null;
  const r = v as Record<string, unknown>;
  const { right, total, streak, bestStreak, recent, lastAt } = r;
  if (!isCount(right) || !isCount(total) || !isCount(streak) || !isCount(bestStreak) || right > total) return null;
  if (!Array.isArray(recent) || !recent.every((x) => typeof x === 'boolean')) return null;
  if (typeof lastAt !== 'number' || !Number.isFinite(lastAt)) return null;
  return { right, total, streak, bestStreak, recent: recent.slice(-RECENT), lastAt };
}

/** Stored progress; unknown quizzes and broken records are dropped. Never throws. */
export function loadProgress(storage: KeyValue | null = defaultStorage()): Progress {
  try {
    const raw = storage?.getItem(PROGRESS_STORAGE_KEY);
    if (!raw) return {};
    const parsed: unknown = JSON.parse(raw);
    if (!parsed || typeof parsed !== 'object') return {};
    const out: Partial<Record<QuizId, QuizRecord>> = {};
    for (const id of QUIZ_IDS) {
      const r = readRecord((parsed as Record<string, unknown>)[id]);
      if (r) out[id] = r;
    }
    return out;
  } catch {
    return {};
  }
}

/** Remember progress. A storage failure only means it is not remembered. */
export function saveProgress(progress: Progress, storage: KeyValue | null = defaultStorage()): void {
  try {
    storage?.setItem(PROGRESS_STORAGE_KEY, JSON.stringify(progress));
  } catch {
    // Private mode, full or blocked storage: progress lasts for this visit only.
  }
}
