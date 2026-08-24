import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest';
import { act, createElement } from 'react';
import { createRoot } from 'react-dom/client';
import type { Lick } from '../lick';
import type { Action } from '../state';
import type { UseTransport } from './useTransport';

/**
 * The global shortcuts must stay out of the way of focused interactive controls:
 * a button owns Space (native activation), an input owns every printable key.
 * They must also ignore modified chords like Ctrl/Cmd+Space.
 */

/** One playable note is enough — `handleKeyDown` only calls play() when some lick has notes. */
function makeLicks(): Lick[] {
  return [
    {
      lengthBeats: 4,
      difficulty: 1,
      notes: [
        { string: 0, fret: 5, pitch: { letter: 'A', alter: 0, octave: 2 }, startBeat: 0, durationBeats: 1 },
      ],
    },
  ];
}

describe('KeyboardShortcuts', () => {
  let dispatch: ReturnType<typeof vi.fn<(action: Action) => void>>;
  let transport: UseTransport;
  let container: HTMLDivElement;
  let root: ReturnType<typeof createRoot>;
  let extra: HTMLElement | null;

  async function mount() {
    const { KeyboardShortcuts } = await import('./KeyboardShortcuts');
    container = document.createElement('div');
    document.body.appendChild(container);
    root = createRoot(container);
    await act(async () => {
      root.render(
        createElement(KeyboardShortcuts, {
          dispatch,
          transport,
          licks: makeLicks(),
          tempoBpm: 90,
          countIn: false,
          loop: false,
          swingEnabled: false,
          clickGain: 0.5,
          noteGain: 0.5,
        }),
      );
    });
  }

  /** Dispatch a real keydown from `from` (bubbles up to the window listener). */
  async function press(from: EventTarget, init: KeyboardEventInit) {
    await act(async () => {
      from.dispatchEvent(new KeyboardEvent('keydown', { bubbles: true, ...init }));
    });
  }

  beforeEach(() => {
    dispatch = vi.fn();
    transport = {
      supported: true,
      isPlaying: false,
      play: vi.fn(),
      stop: vi.fn(),
    } as unknown as UseTransport;
    extra = null;
  });

  afterEach(async () => {
    await act(async () => {
      root.unmount();
    });
    document.body.removeChild(container);
    if (extra) document.body.removeChild(extra);
    vi.restoreAllMocks();
  });

  it('Space on the body starts playback', async () => {
    await mount();
    await press(document.body, { code: 'Space' });
    expect(transport.play).toHaveBeenCalledOnce();
  });

  it('Space on a focused button is left to the button', async () => {
    await mount();
    const button = document.createElement('button');
    document.body.appendChild(button);
    extra = button;
    button.focus();

    await press(button, { code: 'Space' });

    expect(transport.play).not.toHaveBeenCalled();
    expect(transport.stop).not.toHaveBeenCalled();
  });

  it('r on the body rerolls', async () => {
    await mount();
    await press(document.body, { key: 'r' });
    expect(dispatch).toHaveBeenCalledWith({ type: 'rerollAll' });
  });

  it('3 on the body sets the level', async () => {
    await mount();
    await press(document.body, { key: '3' });
    expect(dispatch).toHaveBeenCalledWith({ type: 'setLevel', level: 3 });
  });

  it('Ctrl+Space does not trigger the play shortcut', async () => {
    await mount();
    await press(document.body, { code: 'Space', ctrlKey: true });
    expect(transport.play).not.toHaveBeenCalled();
  });

  it('r in a focused input is left to the input', async () => {
    await mount();
    const input = document.createElement('input');
    document.body.appendChild(input);
    extra = input;
    input.focus();

    await press(input, { key: 'r' });

    expect(dispatch).not.toHaveBeenCalled();
  });

  describe('OS key repeat', () => {
    it('a held Space does not toggle playback again', async () => {
      await mount();

      await press(document.body, { code: 'Space' });
      expect(transport.play).toHaveBeenCalledOnce();

      await press(document.body, { code: 'Space', repeat: true });

      expect(transport.play).toHaveBeenCalledOnce();
      expect(transport.stop).not.toHaveBeenCalled();
    });

    it('a held r does not reroll again', async () => {
      await mount();

      await press(document.body, { key: 'r' });
      expect(dispatch).toHaveBeenCalledExactlyOnceWith({ type: 'rerollAll' });

      await press(document.body, { key: 'r', repeat: true });

      expect(dispatch).toHaveBeenCalledExactlyOnceWith({ type: 'rerollAll' });
    });

    it('a held 3 does not set the level', async () => {
      await mount();
      await press(document.body, { key: '3', repeat: true });
      expect(dispatch).not.toHaveBeenCalled();
    });
  });
});
