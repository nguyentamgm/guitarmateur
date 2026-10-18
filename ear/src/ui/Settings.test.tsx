import { act, createElement } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { Player } from '@shared/core/audio';
import { droneNotes } from '../core/context';
import { loadEar } from '../store/store';
import { App } from './App';

const log: string[] = [];
const player: Player = {
  enabled: true,
  setEnabled: () => {},
  now: () => Date.now() / 1000,
  pluck: (m) => log.push(`pluck ${m}`),
  mute: () => {},
  tone: (m) => log.push(`tone ${m}`),
  click: () => {},
  setLevels: (l) => log.push(`levels ${JSON.stringify(l)}`),
  hold: (m) => (log.push(`hold ${m.join(' ')}`), { stop: () => log.push('stop hold') }),
  cancel: () => log.push('cancel'),
};

let host: HTMLDivElement;
let root: Root;

beforeEach(() => {
  vi.useFakeTimers();
  localStorage.clear();
  localStorage.setItem('gm.lang', 'en');
  log.length = 0;
  host = document.createElement('div');
  document.body.append(host);
  root = createRoot(host);
});

afterEach(() => {
  act(() => root.unmount());
  host.remove();
  vi.useRealTimers();
});

/**
 * The old trainer screen opens from a link into it (Practice's), until #257 removes it: an empty
 * `?key=` changes no setting.
 */
const OLD_TRAINER = '/ear?key=';
const render = () => {
  window.history.replaceState(null, '', OLD_TRAINER);
  act(() => root.render(createElement(App, { player })));
};
const settings = () => host.querySelector('.settings')!;
/** A chip of the labelled group in the settings card. */
const chip = (group: string, text: string) =>
  [...settings().querySelectorAll<HTMLElement>(`[aria-label="${group}"] button`)].find(
    (b) => b.textContent === text,
  )!;
const click = (el: HTMLElement) => act(() => el.click());
const stored = () => loadEar().settings;
const trainerKey = () => host.querySelector('.trainer-key')!.textContent;
const status = () => host.querySelector('.trainer-status')!.textContent;
const slide = (label: string, value: number) => {
  const input = [...settings().querySelectorAll<HTMLInputElement>('input[type="range"]')].find(
    (i) => document.getElementById(i.getAttribute('aria-labelledby')!)!.textContent === label,
  )!;
  act(() => {
    const set = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value')!.set!;
    set.call(input, String(value));
    input.dispatchEvent(new Event('input', { bubbles: true }));
  });
};

describe('the settings card', () => {
  it('shows the stored settings: the preset, the degrees on, the key, every choice', () => {
    render();
    expect(settings().querySelector('summary')!.textContent).toBe('Settings');
    expect(chip('Presets', 'Root, 3rd, 5th').getAttribute('aria-checked')).toBe('true');
    const on = [
      ...settings().querySelectorAll('[aria-label="Degrees"] button[aria-pressed="true"]'),
    ];
    expect(on.map((b) => b.textContent)).toEqual(['1', '3', '5']);
    expect(settings().querySelector('.finder [aria-checked="true"]')!.textContent).toBe('A 5');
    for (const [group, text] of [
      ['Major or minor', 'Major'],
      ['New key', 'never'],
      ['Before each question', 'Full cadence'],
      ['Drone', 'Off'],
      ['Range', 'Above the root'],
      ['Sound', 'Guitar'],
      ['Resolve to 1', 'On'],
      ['Next question automatically', 'Off'],
    ]) {
      expect(chip(group!, text!).getAttribute('aria-checked'), group).toBe('true');
    }
  });

  it('a preset sets the degrees; a degree toggles, never below two; each change is saved', () => {
    render();
    click(chip('Presets', 'Major pentatonic'));
    expect(stored().degrees).toEqual(['1', '2', '3', '5', '6']);
    expect(trainerKey()).toBe('A major · Major pentatonic');
    click(chip('Degrees', '♭3'));
    expect(stored().degrees).toEqual(['1', '2', 'b3', '3', '5', '6']);
    expect(trainerKey()).toBe('A major · 6 degrees');
    expect(chip('Presets', 'Major pentatonic').getAttribute('aria-checked')).toBe('false');
    click(chip('Presets', 'Root, 3rd, 5th'));
    click(chip('Degrees', '1'));
    click(chip('Degrees', '3'));
    expect(stored().degrees).toEqual(['3', '5']);
    click(chip('Degrees', '5'));
    expect(stored().degrees).toEqual(['3', '5']);
  });

  it('the key, major or minor, and a new key every N', () => {
    render();
    click(
      [...settings().querySelectorAll<HTMLElement>('.finder button')].find(
        (b) => b.textContent === 'D♭ 9',
      )!,
    );
    expect(trainerKey()).toBe('D♭ major · Root, 3rd, 5th');
    click(chip('Major or minor', 'Minor'));
    // The same pitch, spelled as the minor keys spell it; root 3rd 5th becomes 1 ♭3 5.
    expect(trainerKey()).toBe('C♯ minor · Root, 3rd, 5th');
    expect(stored().degrees).toEqual(['1', 'b3', '5']);
    click(chip('New key', 'every 10'));
    expect(stored().keyChange).toBe(10);
  });

  it('before each question, tempo, drone, range, sound, resolution, auto-next', () => {
    render();
    click(chip('Before each question', 'Short cadence'));
    expect(stored()).toMatchObject({ context: 'everyQuestion', cadenceForm: 'short' });
    click(chip('Before each question', 'Drone only'));
    expect(stored().context).toBe('droneOnly');
    slide('Cadence tempo', 120);
    expect(stored().bpm).toBe(120);
    click(chip('Drone', 'With each question'));
    expect(stored().drone).toBe('question');
    slide('Drone level', 40);
    expect(stored().droneLevel).toBe(0.4);
    click(chip('Range', 'Two octaves'));
    click(chip('Sound', 'Clean tone'));
    click(chip('Resolve to 1', 'Off'));
    click(chip('Next question automatically', 'On'));
    expect(stored()).toMatchObject({
      register: 'twoOctaves',
      sound: 'clean',
      resolution: false,
      autoNext: true,
    });
  });

  it('a reload keeps them all', () => {
    render();
    click(chip('Presets', 'All 12 degrees'));
    click(chip('Sound', 'Clean tone'));
    slide('Cadence tempo', 75);
    act(() => root.unmount());
    root = createRoot(host);
    render();
    expect(trainerKey()).toBe('A major · All 12 degrees');
    expect(chip('Sound', 'Clean tone').getAttribute('aria-checked')).toBe('true');
    expect(settings().querySelector('.slider output')!.textContent).toBe('75 BPM');
  });
});

describe('settings while a question is on', () => {
  const start = () => {
    click(
      [...host.querySelectorAll<HTMLButtonElement>('button')].find(
        (b) => b.textContent === 'Start',
      )!,
    );
    act(() => vi.advanceTimersByTime(5600));
    expect(status()).toBe('Which degree was that?');
  };

  it('another degree on or off keeps the question; the sound changes from the next note', () => {
    render();
    start();
    log.length = 0;
    click(chip('Degrees', '♭7'));
    click(chip('Sound', 'Clean tone'));
    expect(status()).toBe('Which degree was that?');
    expect(log.filter((l) => !l.startsWith('levels'))).toEqual([]);
    click(
      [...host.querySelectorAll<HTMLButtonElement>('button')].find(
        (b) => b.textContent === 'Replay note',
      )!,
    );
    expect(log.at(-1)).toMatch(/^tone /);
  });

  it('a new key plays the cadence again, in it', () => {
    render();
    start();
    click(
      [...settings().querySelectorAll<HTMLElement>('.finder button')].find(
        (b) => b.textContent === 'E 0',
      )!,
    );
    expect(status()).toBe('Hear the key…');
    expect(trainerKey()).toBe('E major · Root, 3rd, 5th');
  });

  it("the drone turned on starts now, on the key's 1 and 5", () => {
    render();
    start();
    log.length = 0;
    click(chip('Drone', 'Continuous'));
    expect(log).toEqual([`hold ${droneNotes(stored().key).join(' ')}`]);
  });
});
