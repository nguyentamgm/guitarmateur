import { act, createElement } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { Player } from '@shared/core/audio';
import type { Answer } from '../core/stats';
import { DEFAULT_DATA, loadEar, storeAnswer, type EarData } from '../store/store';
import { App } from './App';

const player: Player = {
  enabled: true,
  setEnabled: () => {},
  now: () => Date.now() / 1000,
  pluck: () => {},
  mute: () => {},
  tone: () => {},
  click: () => {},
  setLevels: () => {},
  hold: () => ({ stop: () => {} }),
  cancel: () => {},
};

let host: HTMLDivElement;
let root: Root;
const NOW = new Date(2026, 9, 14, 12).getTime();

beforeEach(() => {
  vi.useFakeTimers();
  vi.setSystemTime(NOW);
  localStorage.clear();
  localStorage.setItem('gm.lang', 'en');
  host = document.createElement('div');
  document.body.append(host);
  root = createRoot(host);
});

afterEach(() => {
  act(() => root.unmount());
  host.remove();
  vi.useRealTimers();
});

/** Store answers as the trainer does, `daysAgo` before today. */
function answered(list: [Answer, number][]): EarData {
  let d = DEFAULT_DATA;
  for (const [a, daysAgo] of list) d = storeAnswer(d, a, NOW - daysAgo * 86_400_000);
  return d;
}
const major = (degree: string, answer: string): Answer => ({ mode: 'major', degree, answer });
const times = <T,>(n: number, x: T): T[] => Array<T>(n).fill(x);

const render = () => act(() => root.render(createElement(App, { player })));
const card = () => host.querySelector('.stats')!;
const text = (sel: string) => [...card().querySelectorAll(sel)].map((e) => e.textContent);
const button = (t: string) =>
  [...card().querySelectorAll<HTMLButtonElement>('button')].find((b) => b.textContent === t)!;
const click = (el: HTMLElement) => act(() => el.click());

describe('the stats card', () => {
  it('before the first answer: a short empty state, not zeros, and no reset', () => {
    render();
    expect(card().querySelector('h2')!.textContent).toBe('Your ear');
    expect(card().querySelector('.stats-empty')!.textContent).toMatch(
      /^No major questions answered yet/,
    );
    expect(card().querySelector('.bars-acc')).toBeNull();
    expect(button('Reset stats')).toBeUndefined();
  });

  it('shows what the store holds: totals, accuracy per degree, mix-ups, the last 14 days', () => {
    answered([
      ...times<[Answer, number]>(5, [major('b3', '3'), 0]),
      ...times<[Answer, number]>(3, [major('b3', 'b3'), 1]),
      ...times<[Answer, number]>(4, [major('5', '5'), 0]),
      [major('6', '5'), 3],
      [major('6', '5'), 3],
      [major('2', '1'), 13],
      [major('1', '1'), 14],
    ]);
    render();
    const s = loadEar().stats.major;
    expect(s.degrees.b3).toEqual({ asked: 8, right: 3 });
    // 16 questions, 8 right (3 ♭3, 4 5, 1 1); the best run: the three ♭3s, then the four 5s.
    expect(card().querySelector('.stats-totals')!.textContent).toBe(
      '16 questions · 8 right first try (50%) · best streak 7',
    );
    expect(text('.acc-label')).toEqual([
      '1 · 100% of 1',
      '2 · 0% of 1',
      '♭3 · 38% of 8',
      '5 · 100% of 4',
      '6 · 0% of 2',
    ]);
    expect([...card().querySelectorAll('.acc-bar')].map((b) => b.className)).toEqual([
      'acc-bar good',
      'acc-bar weak',
      'acc-bar weak',
      'acc-bar good',
      'acc-bar weak',
    ]);
    expect(text('.mixups li > span')).toEqual([
      'You hear ♭3 as 3: 5 times',
      'You hear 6 as 5: 2 times',
      'You hear 2 as 1: 1 times',
    ]);
    const days = [...card().querySelectorAll('.days li')].map((li) =>
      li.getAttribute('aria-label'),
    );
    expect(days).toHaveLength(14);
    expect(days[13]).toBe('Oct 14: 9 questions, 4 right');
    expect(days[12]).toBe('Oct 13: 3 questions, 3 right');
    expect(days[0]).toBe('Oct 1: 1 questions, 0 right');
  });

  it("keeps major and minor apart, on two tabs; the first shown is the key's mode", () => {
    answered([[{ mode: 'minor', degree: 'b3', answer: '3' }, 0]]);
    render();
    expect(card().querySelector('.stats-empty')).not.toBeNull();
    click(
      [...card().querySelectorAll<HTMLElement>('[role="radio"]')].find(
        (b) => b.textContent === 'Minor',
      )!,
    );
    expect(text('.acc-label')).toEqual(['♭3 · 0% of 1']);
  });

  it('"Practise these" sets the degrees to 1 and the pair', () => {
    answered([[major('6', '5'), 0]]);
    render();
    const practise = button('Practise these');
    expect(practise.getAttribute('aria-label')).toBe('Practise these: 1, 5, 6');
    click(practise);
    expect(loadEar().settings.degrees).toEqual(['1', '5', '6']);
    expect(host.querySelector('.trainer-key')!.textContent).toBe('A major · 3 degrees');
  });

  it('"Practise weak notes" is saved', () => {
    render();
    click(
      [...card().querySelectorAll<HTMLElement>('[aria-label="Practise weak notes"] button')].find(
        (b) => b.textContent === 'On',
      )!,
    );
    expect(loadEar().settings.weakNotes).toBe(true);
  });

  it('reset asks first; it clears both modes and keeps the settings', () => {
    answered([
      [major('1', '1'), 0],
      [{ mode: 'minor', degree: '1', answer: '1' }, 0],
    ]);
    localStorage.setItem(
      'gm.ear',
      JSON.stringify({ ...loadEar(), settings: { ...loadEar().settings, bpm: 120 } }),
    );
    render();
    click(button('Reset stats'));
    expect(card().querySelector('.stats-confirm')!.textContent).toMatch(
      /^Clear the stats of both major and minor\?/,
    );
    click(button('Keep them'));
    expect(loadEar().stats.major.degrees['1']).toEqual({ asked: 1, right: 1 });
    click(button('Reset stats'));
    click(button('Clear them'));
    expect(loadEar().stats.major.degrees).toEqual({});
    expect(loadEar().stats.minor.degrees).toEqual({});
    expect(loadEar().settings.bpm).toBe(120);
    expect(card().querySelector('.stats-empty')).not.toBeNull();
  });

  it('counts a question answered on the page', () => {
    // The page keeps its first player: render once, with one that logs.
    const pluck: number[] = [];
    act(() =>
      root.render(createElement(App, { player: { ...player, pluck: (m) => pluck.push(m) } })),
    );
    click(
      [...host.querySelectorAll<HTMLButtonElement>('button')].find(
        (b) => b.textContent === 'Start',
      )!,
    );
    act(() => vi.advanceTimersByTime(5600));
    const degree = { 0: '1', 4: '3', 7: '5' }[(((pluck.at(-1)! - 57) % 12) + 12) % 12]!;
    click(host.querySelector<HTMLButtonElement>(`.cell[data-degree="${degree}"]`)!);
    expect(card().querySelector('.stats-totals')!.textContent).toBe(
      '1 questions · 1 right first try (100%) · best streak 1',
    );
  });
});
