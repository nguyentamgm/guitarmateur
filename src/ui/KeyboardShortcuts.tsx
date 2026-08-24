import { useEffect } from 'react';
import type { Action } from '../state';
import type { UseTransport } from './useTransport';
import type { Lick } from '../lick';

interface Props {
  dispatch: (action: Action) => void;
  transport: UseTransport;
  licks: Lick[];
  tempoBpm: number;
  countIn: boolean;
  loop: boolean;
  swingEnabled: boolean;
  clickGain: number;
  noteGain: number;
}

/** Global keyboard shortcuts — Space: play/stop, R: reroll, 1-5: set level. */
export function KeyboardShortcuts({ dispatch, transport, licks, tempoBpm, countIn, loop, swingEnabled, clickGain, noteGain }: Props) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as Element;
      if (e.metaKey || e.ctrlKey || e.altKey) return;
      // OS key repeat must not re-fire global shortcuts — holding R would re-roll the
      // progression many times per second (each dispatch mints fresh seeds) and holding
      // Space would rapidly toggle play/stop.
      if (e.repeat) return;
      // Buttons and links handle Space/Enter natively — hijacking those keys would
      // break keyboard activation of the focused control (WCAG 2.1.1).
      if (
        target.tagName === 'INPUT' ||
        target.tagName === 'TEXTAREA' ||
        target.tagName === 'SELECT' ||
        target.tagName === 'BUTTON' ||
        target.tagName === 'A'
      ) {
        return;
      }

      if (e.code === 'Space') {
        e.preventDefault();
        if (transport.isPlaying) {
          transport.stop();
        } else {
          const canPlay = licks.some((l) => l.notes.length > 0);
          if (canPlay) {
            transport.play(licks, { tempoBpm, countIn, loop, metronome: true, swing: swingEnabled ? 1 : 0, clickGain, noteGain });
          }
        }
      } else if (e.key === 'r' || e.key === 'R') {
        e.preventDefault();
        dispatch({ type: 'rerollAll' });
      } else if (e.key >= '1' && e.key <= '5') {
        dispatch({ type: 'setLevel', level: Number(e.key) as 1 | 2 | 3 | 4 | 5 });
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [dispatch, transport, licks, tempoBpm, countIn, loop, swingEnabled, clickGain, noteGain]);

  return null;
}
