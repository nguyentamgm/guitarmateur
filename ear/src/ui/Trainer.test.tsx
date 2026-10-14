import { act, createElement } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { Player } from '@shared/core/audio';
import { EAR_STORAGE_KEY, loadEar } from '../store/store';
import { App } from './App';

/** A player whose audio clock moves with the fake timers; it logs what it is asked to play. */
function fakePlayer(audio = true) {
  const played: string[] = [];
  const player: Player = {
    enabled: true,
    setEnabled: () => {},
    now: () => (audio ? Date.now() / 1000 : null),
    pluck: (midi) => played.push(`pluck ${midi}`),
    mute: () => {},
    tone: (midi) => played.push(`tone ${midi}`),
    click: () => played.push('click'),
    setLevels: () => {},
    hold: () => ({ stop: () => {} }),
    cancel: () => played.push('cancel'),
  };
  return { player, played };
}

let host: HTMLDivElement;
let root: Root;

beforeEach(() => {
  vi.useFakeTimers();
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

const render = (player: Player) => act(() => root.render(createElement(App, { player })));
const status = () => host.querySelector('.trainer-status')!.textContent;
const button = (text: string) =>
  [...host.querySelectorAll<HTMLButtonElement>('button')].find((b) =>
    b.textContent!.startsWith(text),
  )!;
/** A cell by its degree as shown: '♭3' → the cell of b3. */
const cell = (degree: string) =>
  host.querySelector<HTMLButtonElement>(
    `.cell[data-degree="${degree.replace('♭', 'b').replace('♯', '#')}"]`,
  )!;
/** A control the session ignores right now: aria-disabled, so it keeps the focus. */
const off = (b: HTMLButtonElement) => b.getAttribute('aria-disabled') === 'true';
const click = (b: HTMLButtonElement) => act(() => b.click());
/** Let the audio clock run `sec` seconds. */
const wait = (sec: number) => act(() => vi.advanceTimersByTime(sec * 1000));

/** Start, and wait through the cadence (90 BPM: 6 beats) and the note (2 beats). */
function startAndListen() {
  click(button('Start'));
  expect(status()).toBe('Hear the key…');
  wait(4.1);
  expect(status()).toBe('Listen…');
  wait(1.5);
  expect(status()).toBe('Which degree was that?');
}

/** The degree asked: the note the player plucked last, from A (MIDI 57 or 69). */
function asked(played: string[]): string {
  const midi = Number(
    played
      .filter((p) => p.startsWith('pluck'))
      .at(-1)!
      .split(' ')[1],
  );
  return { 0: '1', 4: '3', 7: '5' }[(((midi - 57) % 12) + 12) % 12]!;
}

describe('the trainer card', () => {
  it('idle: the key and preset, Start, the strip with the active degrees on, replays off', () => {
    render(fakePlayer().player);
    expect(host.querySelector('.trainer-key')!.textContent).toBe('A major · Root, 3rd, 5th');
    expect(status()).toBe(
      'Press Start: a cadence sets the key, then one note sounds. Name its degree.',
    );
    expect(off(button('Hear the key'))).toBe(true);
    expect(off(button('Next'))).toBe(true);
    const cells = [...host.querySelectorAll<HTMLButtonElement>('.cell')];
    expect(cells.map((c) => c.querySelector('.cell-dot')!.textContent)).toEqual([
      '1',
      '♭2',
      '2',
      '♭3',
      '3',
      '4',
      '♯4/♭5',
      '5',
      '♭6',
      '6',
      '♭7',
      '7',
    ]);
    // Named by the label shown (for voice control), then as spoken (for a screen reader).
    expect(cells.filter((c) => !c.disabled).map((c) => c.getAttribute('aria-label'))).toEqual([
      '1 (one), fret 0',
      '3 (three), fret 4',
      '5 (five), fret 7',
    ]);
    expect(cell('♭3').getAttribute('aria-label')).toBe('♭3 (flat three), fret 3');
    expect(cell('♯4').getAttribute('aria-label')).toBe('♯4/♭5 (sharp four or flat five), fret 6');
    // The scale's notes stand out; ♭3 is outside A major.
    expect(cell('2').classList.contains('in')).toBe(true);
    expect(cell('♭3').classList.contains('out')).toBe(true);
  });

  it('listening, waiting, then right: the walk home, the score, Next', () => {
    const { player, played } = fakePlayer();
    render(player);
    startAndListen();
    expect(button('Stop')).toBeDefined();
    expect(off(button('Replay note'))).toBe(false);
    const degree = asked(played);
    click(cell(degree));
    const note = { '1': 'A', '3': 'C♯', '5': 'E' }[degree];
    expect(status()).toBe(`Right: ${degree} is ${note} in A major.`);
    expect(cell(degree).classList.contains('right')).toBe(true);
    expect(host.querySelector('.trainer-score')!.textContent).toBe(
      'Right first try 1 of 1 · 1 in a row',
    );
    expect(off(button('Next'))).toBe(true);
    wait(3);
    expect(off(button('Next'))).toBe(false);
    expect(host.querySelector('.trainer-compare')!.textContent).toBe(
      'Tap any degree to hear it, then press Next.',
    );
    // Stored: right first try, in the major stats.
    expect(loadEar().stats.major.degrees[degree]).toEqual({ asked: 1, right: 1 });
  });

  it('wrong: what you picked and what it was, both to hear; only the first answer counts', () => {
    const { player, played } = fakePlayer();
    render(player);
    startAndListen();
    const degree = asked(played);
    const wrong = degree === '5' ? '3' : '5';
    click(cell(wrong));
    const name = { '1': 'A', '3': 'C♯', '5': 'E' };
    expect(status()).toBe(
      `You picked ${wrong} (${name[wrong]}). It was ${degree} (${name[degree as '1']}).`,
    );
    expect(cell(wrong).classList.contains('picked')).toBe(true);
    expect(cell(degree).classList.contains('right')).toBe(true);
    expect(host.querySelector('.trainer-score')!.textContent).toBe(
      'Right first try 0 of 1 · 0 in a row',
    );
    // The comparison (3 beats) and the walk home, then review.
    wait(6);
    expect(button(`Hear ${wrong}`)).toBeDefined();
    expect(button(`Hear ${degree}`)).toBeDefined();
    // In review, a cell plays its note: the score stays.
    played.length = 0;
    click(cell(degree));
    expect(played).toEqual(['cancel', expect.stringMatching(/^pluck /)]);
    expect(host.querySelector('.trainer-score')!.textContent).toBe(
      'Right first try 0 of 1 · 0 in a row',
    );
    const stored = loadEar().stats.major;
    expect(stored.degrees[degree]).toEqual({ asked: 1, right: 0 });
    expect(stored.mixups[degree]).toEqual({ [wrong]: 1 });
  });

  it('review → Next asks the next question, with the cadence again', () => {
    const { player, played } = fakePlayer();
    render(player);
    startAndListen();
    click(cell(asked(played)));
    wait(3);
    click(button('Next'));
    expect(status()).toBe('Hear the key…');
    expect(off(button('Next'))).toBe(true);
  });

  it('Stop goes back to idle', () => {
    render(fakePlayer().player);
    startAndListen();
    click(button('Stop'));
    expect(button('Start')).toBeDefined();
    expect(status()).toMatch(/^Press Start/);
  });

  it('without audio, says so instead of running a silent quiz', () => {
    render(fakePlayer(false).player);
    click(button('Start'));
    expect(status()).toMatch(/^Sound could not start in this browser/);
    expect(button('Start')).toBeDefined();
  });

  it('shows another preset and key from the stored settings, in Vietnamese', () => {
    localStorage.setItem('gm.lang', 'vi');
    localStorage.setItem(
      EAR_STORAGE_KEY,
      JSON.stringify({
        version: 1,
        settings: {
          key: { tonic: { letter: 'E', alter: 0 }, mode: 'minor' },
          degrees: ['1', 'b3', '4', '5', 'b7'],
        },
      }),
    );
    render(fakePlayer().player);
    expect(host.querySelector('.trainer-key')!.textContent).toBe('E thứ · Minor pentatonic');
    // In minor the tritone's cell still reads ♯4/♭5; ♭3 is now in the scale.
    expect(cell('♭3').classList.contains('in')).toBe(true);
    expect(cell('♭3').disabled).toBe(false);
  });
});

/** A key pressed on whatever has the focus, as a browser sends it. */
function key(k: string, code: string, init: KeyboardEventInit = {}) {
  const target = document.activeElement ?? document.body;
  act(() => {
    target.dispatchEvent(
      new KeyboardEvent('keydown', { key: k, code, bubbles: true, cancelable: true, ...init }),
    );
  });
}

describe('the keyboard alone', () => {
  it('runs a whole session: Space starts, a digit answers, focus goes to Next, Space again', () => {
    const { player, played } = fakePlayer();
    render(player);
    (document.activeElement as HTMLElement | null)?.blur();
    key(' ', 'Space');
    expect(status()).toBe('Hear the key…');
    // The focus left the Start button (now Stop): the card has it, so Space is not Stop.
    expect(document.activeElement).toBe(host.querySelector('.trainer'));
    wait(5.6);
    expect(status()).toBe('Which degree was that?');
    const degree = asked(played);
    key(degree, `Digit${degree}`);
    expect(status()).toMatch(/^Right: /);
    // The focus stays on the strip, on the cell answered.
    expect(document.activeElement).toBe(cell(degree));
    wait(3);
    expect(document.activeElement).toBe(button('Next'));
    // Enter on the focused Next is the button's own click.
    act(() => button('Next').click());
    expect(status()).toBe('Hear the key…');
    // From the card, Space does nothing while the key plays.
    key(' ', 'Space');
    expect(status()).toBe('Hear the key…');
  });

  it('R, K and T replay while waiting; a degree that is off, a repeat or a modifier does nothing', () => {
    const { player, played } = fakePlayer();
    render(player);
    startAndListen();
    for (const [k, code] of [
      ['r', 'KeyR'],
      ['k', 'KeyK'],
      ['t', 'KeyT'],
    ] as const) {
      played.length = 0;
      key(k, code);
      expect(played[0], k).toBe('cancel');
      expect(played.length, k).toBeGreaterThan(1);
    }
    key('2', 'Digit2');
    key('3', 'Digit3', { repeat: true });
    key('3', 'Digit3', { ctrlKey: true });
    expect(status()).toBe('Which degree was that?');
  });

  it('Shift + digit answers the lowered degree', () => {
    localStorage.setItem(
      EAR_STORAGE_KEY,
      JSON.stringify({ version: 1, settings: { degrees: ['1', 'b3', '3', '5'] } }),
    );
    const { player } = fakePlayer();
    render(player);
    startAndListen();
    key('#', 'Digit3', { shiftKey: true });
    expect(status()).toMatch(/^(Right: ♭3|You picked ♭3)/);
    expect(document.activeElement).toBe(cell('♭3'));
  });

  it('lists the shortcuts', () => {
    render(fakePlayer().player);
    const panel = host.querySelector('.trainer-keys')!;
    expect(panel.querySelector('summary')!.textContent).toBe('Keyboard shortcuts');
    expect([...panel.querySelectorAll('kbd')].map((k) => k.textContent)).toEqual([
      'Space / Enter',
      'R',
      'K',
      'T',
      '1–7',
      'Shift + 2 3 5 6 7',
    ]);
  });
});
