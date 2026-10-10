import { useCallback, useEffect, useRef, useState } from 'react';
import type { Lick } from '../lick';
import {
  Transport,
  isAudioSupported,
  setMuted,
  type AudioEngine,
  type PlayOptions,
  type Position,
} from '../audio';
import { getEngine, peekEngine } from './audioEngine';

export interface UseTransport {
  supported: boolean;
  isPlaying: boolean;
  /** The currently-sounding note, or null when idle — drives card/tab highlighting. */
  position: Position | null;
  play: (licks: Lick[], opts: PlayOptions) => void;
  stop: () => void;
  setClickGain: (value: number) => void;
  setNoteGain: (value: number) => void;
}

/**
 * React adapter for the audio `Transport`. The `AudioContext` (and thus the engine + transport) is
 * created lazily on the first `play()` call — which must originate from a user gesture per browser
 * autoplay policy. Everything is torn down on unmount.
 */
export function useTransport(muted = false): UseTransport {
  const supported = isAudioSupported();
  // The header's sound toggle mutes the engine's master output, so the click/note mix (the
  // volume sliders) is untouched and comes back as it was.
  const mutedRef = useRef(muted);
  const engineRef = useRef<AudioEngine | null>(null);
  const transportRef = useRef<Transport | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [position, setPosition] = useState<Position | null>(null);

  const ensureTransport = useCallback((): Transport | null => {
    if (!supported) return null;
    if (!transportRef.current) {
      const engine = getEngine();
      engineRef.current = engine;
      if (mutedRef.current) setMuted(engine, true);
      transportRef.current = new Transport(engine, {
        onPosition: (pos) => setPosition(pos),
        onStop: () => setIsPlaying(false),
      });
    }
    return transportRef.current;
  }, [supported]);

  const play = useCallback(
    (licks: Lick[], opts: PlayOptions) => {
      const transport = ensureTransport();
      if (!transport) return;
      transport.play(licks, opts);
      setIsPlaying(transport.isPlaying);
    },
    [ensureTransport],
  );

  const stop = useCallback(() => {
    transportRef.current?.stop();
    setIsPlaying(false);
  }, []);

  const setClickGain = useCallback((value: number) => transportRef.current?.setClickGain(value), []);
  const setNoteGain = useCallback((value: number) => transportRef.current?.setNoteGain(value), []);

  useEffect(() => {
    mutedRef.current = muted;
    // The engine may exist already from a note clicked on a neck: mute that too.
    const engine = engineRef.current ?? peekEngine();
    if (engine) setMuted(engine, muted);
  }, [muted]);

  useEffect(() => {
    return () => {
      // The engine is the page's (audioEngine.ts): stop playing, but leave it to the clicked notes.
      transportRef.current?.stop();
      transportRef.current = null;
      engineRef.current = null;
    };
  }, []);

  return { supported, isPlaying, position, play, stop, setClickGain, setNoteGain };
}
