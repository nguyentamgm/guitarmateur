/**
 * When to offer "Install Guitarmateur": not on a first look, only once the learner is engaged
 * (a second visit, or after the first playback), and never again once dismissed or installed.
 * Remembered under its own localStorage key; storage failures only mean it is not remembered.
 */

export const INSTALL_STORAGE_KEY = 'guitarmateur-install';
/** Marks this browser session as counted, so a reload or a trip to Theory and back is not a new visit. */
const SESSION_KEY = 'guitarmateur-install-session';

export interface InstallMemory {
  /** Visits (browser sessions) so far, this one included. */
  readonly visits: number;
  /** Dismissed, installed, or the browser's own dialog answered. */
  readonly done: boolean;
}

const EMPTY: InstallMemory = { visits: 0, done: false };

/** Pure: whether to show the install offer now. */
export function shouldOfferInstall(memory: InstallMemory, playedThisVisit: boolean): boolean {
  return !memory.done && (memory.visits >= 2 || playedThisVisit);
}

function read(): InstallMemory {
  try {
    const parsed = JSON.parse(localStorage.getItem(INSTALL_STORAGE_KEY) ?? 'null') as Partial<InstallMemory> | null;
    if (!parsed || typeof parsed !== 'object') return EMPTY;
    const visits = typeof parsed.visits === 'number' && Number.isFinite(parsed.visits) ? Math.max(0, Math.floor(parsed.visits)) : 0;
    return { visits, done: parsed.done === true };
  } catch {
    return EMPTY;
  }
}

function write(memory: InstallMemory): void {
  try {
    localStorage.setItem(INSTALL_STORAGE_KEY, JSON.stringify(memory));
  } catch {
    // ignore — the offer just comes back next time
  }
}

/** True the first time it is asked in a browser session (or always, when sessionStorage is blocked). */
function newSession(): boolean {
  try {
    if (sessionStorage.getItem(SESSION_KEY)) return false;
    sessionStorage.setItem(SESSION_KEY, '1');
    return true;
  } catch {
    return true;
  }
}

let counted: InstallMemory | null = null;

/** Count this visit (once per browser session, however often it is called) and return the memory. */
export function recordVisit(): InstallMemory {
  if (!counted) {
    const before = read();
    counted = newSession() ? { ...before, visits: before.visits + 1 } : before;
    write(counted);
  }
  return counted;
}

/** Never offer again: dismissed or installed. */
export function rememberInstallDone(): InstallMemory {
  counted = { ...(counted ?? read()), done: true };
  write(counted);
  return counted;
}

/** Test hook: forget that this page load was counted; `newSession` also starts a new browser session. */
export function resetVisitCountForTests({ newSession = true } = {}): void {
  counted = null;
  if (newSession) sessionStorage.removeItem(SESSION_KEY);
}
