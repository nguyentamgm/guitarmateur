import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { INSTALL_STORAGE_KEY, recordVisit, rememberInstallDone, resetVisitCountForTests, shouldOfferInstall } from './install';

beforeEach(() => {
  localStorage.clear();
  resetVisitCountForTests();
});
afterEach(() => localStorage.clear());

describe('install offer', () => {
  it('waits for engagement: a second visit, or a playback on the first', () => {
    expect(shouldOfferInstall({ visits: 1, done: false }, false)).toBe(false);
    expect(shouldOfferInstall({ visits: 1, done: false }, true)).toBe(true);
    expect(shouldOfferInstall({ visits: 2, done: false }, false)).toBe(true);
    expect(shouldOfferInstall({ visits: 5, done: true }, true)).toBe(false);
  });

  it('counts each page load once', () => {
    expect(recordVisit()).toEqual({ visits: 1, done: false });
    expect(recordVisit()).toEqual({ visits: 1, done: false }); // same load
    resetVisitCountForTests(); // next load
    expect(recordVisit()).toEqual({ visits: 2, done: false });
    expect(JSON.parse(localStorage.getItem(INSTALL_STORAGE_KEY)!)).toEqual({ visits: 2, done: false });
  });

  it('remembers a dismissal across visits', () => {
    recordVisit();
    rememberInstallDone();
    resetVisitCountForTests();
    expect(recordVisit()).toEqual({ visits: 2, done: true });
  });

  it('survives garbage and blocked storage', () => {
    localStorage.setItem(INSTALL_STORAGE_KEY, '{"visits":"lots","done":"yes"}');
    expect(recordVisit()).toEqual({ visits: 1, done: false });
    resetVisitCountForTests();
    localStorage.setItem(INSTALL_STORAGE_KEY, '{oops');
    expect(recordVisit()).toEqual({ visits: 1, done: false });
  });
});
