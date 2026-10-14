/**
 * Stats math (docs/ear.md "Storage"): pure functions over the stats the store keeps. Only the
 * first answer to a question counts ("right first try"), and each mode keeps its own stats, since
 * ♭3 is in the scale in minor and outside it in major.
 */
import type { DegreeLabel, Mode } from '@shared/core/music';
import { DEGREES, degreeId } from './degrees';

export interface Count {
  readonly asked: number;
  /** Right first try. */
  readonly right: number;
}

export interface DayCount extends Count {
  /** The local date, 'YYYY-MM-DD'. */
  readonly day: string;
}

export interface ModeStats {
  /** By degree id: how often it was asked, and how often answered right first try. */
  readonly degrees: Readonly<Partial<Record<DegreeLabel, Count>>>;
  /** Wrong first answers, by degree asked, then degree answered: "♭3 heard as 3" is mixups.b3['3']. */
  readonly mixups: Readonly<
    Partial<Record<DegreeLabel, Readonly<Partial<Record<DegreeLabel, number>>>>>
  >;
  /** Questions per local day, oldest first, the last DAYS_KEPT days only. */
  readonly days: readonly DayCount[];
  /** Right first try in a row, up to the last answer. */
  readonly streak: number;
  readonly bestStreak: number;
}

export type Stats = Readonly<Record<Mode, ModeStats>>;

/** Days of per-day counts kept, today included. */
export const DAYS_KEPT = 30;

export const EMPTY_MODE_STATS: ModeStats = {
  degrees: {},
  mixups: {},
  days: [],
  streak: 0,
  bestStreak: 0,
};
export const EMPTY_STATS: Stats = { major: EMPTY_MODE_STATS, minor: EMPTY_MODE_STATS };

const DAY_MS = 24 * 60 * 60 * 1000;
const pad = (n: number) => String(n).padStart(2, '0');

/** The local date of `time` (ms since the epoch), 'YYYY-MM-DD'. */
export function localDay(time: number): string {
  const d = new Date(time);
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

/** Whole days from date `a` to date `b` ('YYYY-MM-DD'), whatever the time zone. */
export function daysBetween(a: string, b: string): number {
  const utc = (day: string) => {
    const [y, m, d] = day.split('-').map(Number);
    return Date.UTC(y!, m! - 1, d!);
  };
  return Math.round((utc(b) - utc(a)) / DAY_MS);
}

/** The days within DAYS_KEPT of `today` (today and the 29 before it), oldest first. */
export function trimDays(days: readonly DayCount[], today: string): DayCount[] {
  return days.filter((d) => {
    const ago = daysBetween(d.day, today);
    return ago >= 0 && ago < DAYS_KEPT;
  });
}

const add = (c: Count | undefined, right: boolean): Count => ({
  asked: (c?.asked ?? 0) + 1,
  right: (c?.right ?? 0) + (right ? 1 : 0),
});

export interface Answer {
  readonly mode: Mode;
  /** The degree asked. */
  readonly degree: DegreeLabel;
  /** The first answer given. */
  readonly answer: DegreeLabel;
}

/** Count one question's first answer on local date `today`. */
export function recordAnswer(stats: Stats, { mode, degree, answer }: Answer, today: string): Stats {
  const s = stats[mode];
  const asked = degreeId(degree);
  const given = degreeId(answer);
  const right = asked === given;
  const days = trimDays(s.days, today);
  const last = days[days.length - 1];
  const streak = right ? s.streak + 1 : 0;
  const mixups = right
    ? s.mixups
    : {
        ...s.mixups,
        [asked]: { ...s.mixups[asked], [given]: (s.mixups[asked]?.[given] ?? 0) + 1 },
      };
  return {
    ...stats,
    [mode]: {
      degrees: { ...s.degrees, [asked]: add(s.degrees[asked], right) },
      mixups,
      days:
        last?.day === today
          ? [...days.slice(0, -1), { day: today, ...add(last, right) }]
          : [...days, { day: today, ...add(undefined, right) }],
      streak,
      bestStreak: Math.max(s.bestStreak, streak),
    },
  };
}

/** Share right first try, 0–1; null before the first question. */
export function accuracy(c: Count | undefined): number | null {
  return c && c.asked > 0 ? c.right / c.asked : null;
}

/** All questions of a mode. */
export function totals(s: ModeStats): Count {
  return Object.values(s.degrees).reduce<Count>(
    (t, c) => ({ asked: t.asked + (c?.asked ?? 0), right: t.right + (c?.right ?? 0) }),
    { asked: 0, right: 0 },
  );
}

export interface Mixup {
  /** The degree asked… */
  readonly degree: DegreeLabel;
  /** …heard as this one. */
  readonly heardAs: DegreeLabel;
  readonly count: number;
}

const ORDER = new Map(DEGREES.map((d, i) => [d.label, i]));

/** The `n` most frequent mix-ups, most first; ties in chromatic order of the degree asked, then heard. */
export function topMixups(s: ModeStats, n = 3): Mixup[] {
  const all = Object.entries(s.mixups).flatMap(([degree, heard]) =>
    Object.entries(heard ?? {}).map(([heardAs, count]) => ({ degree, heardAs, count: count ?? 0 })),
  );
  return all
    .filter((m) => m.count > 0)
    .sort(
      (a, b) =>
        b.count - a.count ||
        ORDER.get(a.degree)! - ORDER.get(b.degree)! ||
        ORDER.get(a.heardAs)! - ORDER.get(b.heardAs)!,
    )
    .slice(0, n);
}
