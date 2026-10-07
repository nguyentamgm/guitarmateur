/**
 * Quiz progress across lessons: one record per quiz, kept in Theory's own localStorage key (never
 * the practice app's). Pure functions plus a storage boundary that never throws, like `lang.ts`.
 * The review page ranks quizzes with `nextReview()`.
 */
import { browserStorage, type KeyValue } from './storage';

/** Every quiz that records progress, in curriculum order: the lesson and the step it lives in. */
export const QUIZZES = [
  { id: 'fretboard-root', slug: 'fretboard', step: 'home' },
  { id: 'pentatonic-shape', slug: 'pentatonic', step: 'choose' },
  { id: 'blues-bend', slug: 'blues', step: 'bends' },
  { id: 'chords-build', slug: 'chords', step: 'build' },
  { id: 'barre-find', slug: 'barre', step: 'find' },
  { id: 'keys-home', slug: 'keys', step: 'home' },
  { id: 'solo-ear', slug: 'solo', step: 'ear' },
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

/** Calendar days between the last answer and `now`, in local time: 0 = today, 1 = yesterday. */
export function daysSince(r: QuizRecord, now: number): number {
  const midnight = (t: number) => {
    const d = new Date(t);
    return Date.UTC(d.getFullYear(), d.getMonth(), d.getDate());
  };
  return Math.max(0, Math.round((midnight(now) - midnight(r.lastAt)) / DAY_MS));
}

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


const isCount = (v: unknown): v is number => typeof v === 'number' && Number.isInteger(v) && v >= 0;

/** A stored record, or null if any field is missing or impossible. */
function readRecord(v: unknown): QuizRecord | null {
  if (!v || typeof v !== 'object') return null;
  const r = v as Record<string, unknown>;
  const { right, total, streak, bestStreak, recent, lastAt } = r;
  if (!isCount(right) || !isCount(total) || !isCount(streak) || !isCount(bestStreak)) return null;
  if (right > total || streak > bestStreak || bestStreak > right) return null;
  if (!Array.isArray(recent) || recent.length > Math.min(total, RECENT) || !recent.every((x) => typeof x === 'boolean')) return null;
  if (typeof lastAt !== 'number' || !Number.isFinite(lastAt)) return null;
  return { right, total, streak, bestStreak, recent, lastAt };
}

/** The stored object as is, or an empty one. */
function readRaw(storage: KeyValue | null): Record<string, unknown> {
  try {
    const raw = storage?.getItem(PROGRESS_STORAGE_KEY);
    const parsed: unknown = raw ? JSON.parse(raw) : null;
    return parsed && typeof parsed === 'object' && !Array.isArray(parsed) ? (parsed as Record<string, unknown>) : {};
  } catch {
    return {};
  }
}

/** Stored progress; unknown quizzes and broken records are left out. Never throws. */
export function loadProgress(storage: KeyValue | null = browserStorage()): Progress {
  const raw = readRaw(storage);
  const out: Partial<Record<QuizId, QuizRecord>> = {};
  for (const id of QUIZ_IDS) {
    const r = readRecord(raw[id]);
    if (r) out[id] = r;
  }
  return out;
}

/**
 * Add one answer straight to storage and return the new progress. It reads storage first, so
 * answers saved meanwhile by another tab are kept, and it leaves entries this build does not know
 * (a quiz from a newer version) untouched. A storage failure only means it is not remembered.
 */
export function storeAnswer(id: QuizId, right: boolean, now: number, storage: KeyValue | null = browserStorage()): Progress {
  const next = recordAnswer(loadProgress(storage), id, right, now);
  try {
    storage?.setItem(PROGRESS_STORAGE_KEY, JSON.stringify({ ...readRaw(storage), [id]: next[id] }));
  } catch {
    // Private mode, full or blocked storage: progress lasts for this visit only.
  }
  return next;
}
