import { describe, expect, it } from 'vitest';
import { act, createElement } from 'react';
import { createRoot } from 'react-dom/client';
import type { UseTransport } from '../useTransport';

/**
 * Regression tests for the tempo number input. `setTempo` clamps to [MIN_BPM, MAX_BPM], so
 * committing on every keystroke made the field fight the user: typing "150" one digit at a
 * time went 1 → 40, then 405 → 200, and 150 could never be entered by hand.
 */

const noop = () => {};

/** Minimal `UseTransport` stub — the controls only need `supported` to render the bar. */
const transport: UseTransport = {
  supported: true,
  isPlaying: false,
  position: null,
  bar: null,
  play: noop,
  stop: noop,
  setClickGain: noop,
  setBackingGain: noop,
  setNoteGain: noop,
};

/** Native value setter, so React's input value tracker sees the programmatic change. */
const setInputValue = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value')!.set!;

/** Type `text` into `input` the way a user would: set the value, then fire `input`. */
async function type(input: HTMLInputElement, text: string): Promise<void> {
  await act(async () => {
    setInputValue.call(input, text);
    input.dispatchEvent(new Event('input', { bubbles: true }));
  });
}

async function mount(override?: Partial<UseTransport>): Promise<{
  container: HTMLDivElement;
  tempoField: HTMLInputElement;
  tempoSlider: HTMLInputElement;
  calls: number[];
  blurTempoField: () => Promise<void>;
  unmount: () => Promise<void>;
}> {
  const { PlaybackControls } = await import('./PlaybackControls');
  const calls: number[] = [];
  const container = document.createElement('div');
  document.body.appendChild(container);
  const root = createRoot(container);
  await act(async () => {
    root.render(
      createElement(PlaybackControls, {
        licks: [],
        tempoBpm: 90,
        onTempoChange: (bpm: number) => { calls.push(bpm); },
        transport: { ...transport, ...override },
        countIn: false,
        loop: false,
        onCountInChange: noop,
        onLoopChange: noop,
        swingEnabled: false,
        onSwingChange: noop,
        clickGain: 0.6,
        noteGain: 0.9,
        onClickGainChange: noop,
        onNoteGainChange: noop,
        language: 'en',
      }),
    );
  });
  const tempoField = container.querySelector<HTMLInputElement>('input[type="number"]')!;
  const tempoSlider = container.querySelector<HTMLInputElement>('input[type="range"]')!;
  return {
    container,
    tempoField,
    tempoSlider,
    calls,
    blurTempoField: async () => {
      await act(async () => {
        tempoField.dispatchEvent(new FocusEvent('focusout', { bubbles: true }));
      });
    },
    unmount: async () => {
      await act(async () => {
        root.unmount();
      });
      document.body.removeChild(container);
    },
  };
}

describe('PlaybackControls tempo field', () => {
  it('commits once, with the full value, when a BPM is typed digit by digit', async () => {
    const { tempoField, calls, unmount } = await mount();
    await type(tempoField, '1');
    await type(tempoField, '15');
    await type(tempoField, '150');
    expect(calls).toEqual([150]);
    await unmount();
  });

  it('still commits the tempo from the range slider', async () => {
    const { tempoSlider, calls, unmount } = await mount();
    await type(tempoSlider, '120');
    expect(calls).toContain(120);
    await unmount();
  });

  it('normalises a partial, out-of-range entry back to the committed tempo on blur', async () => {
    const { tempoField, blurTempoField, unmount } = await mount();
    await type(tempoField, '1');
    await blurTempoField();
    expect(tempoField.value).toBe('90');
    await unmount();
  });
});

describe('PlaybackControls visual count-in', () => {
  it('renders beats 1..4 with the active beat highlighted during count-in, and hides when null or undefined', async () => {
    const active = await mount({ isPlaying: true, countInBeat: 3 });
    const counter = active.container.querySelector('.transport-countin');
    expect(counter).not.toBeNull();
    expect(counter!.getAttribute('aria-label')).toBe('Count-in beat 3');
    const beats = [...counter!.querySelectorAll('[data-countin-beat]')];
    expect(beats.map((b) => b.textContent)).toEqual(['1', '2', '3', '4']);
    expect(beats.map((b) => b.getAttribute('data-active'))).toEqual([null, null, 'true', null]);
    await active.unmount();

    const withNull = await mount({ isPlaying: true, countInBeat: null });
    expect(withNull.container.querySelector('.transport-countin')).toBeNull();
    await withNull.unmount();

    const withUndefined = await mount({ isPlaying: true });
    expect(withUndefined.container.querySelector('.transport-countin')).toBeNull();
    await withUndefined.unmount();
  });
});
