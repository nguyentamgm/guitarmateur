import { useCallback, useEffect, useRef, useState } from 'react';
import type { Lick } from '../lick';
import {
  Transport,
  createEngine,
  isAudioSupported,
  type AudioEngine,
  type PlayOptions,
  type Position,
} from '../audio';

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
export function useTransport(): UseTransport {
  const supported = isAudioSupported();
  const engineRef = useRef<AudioEngine | null>(null);
  const transportRef = useRef<Transport | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [position, setPosition] = useState<Position | null>(null);

  const ensureTransport = useCallback((): Transport | null => {
    if (!supported) return null;
    if (!transportRef.current) {
      const engine = createEngine();
      engineRef.current = engine;
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
    return () => {
      transportRef.current?.stop();
      void engineRef.current?.ctx.close();
      transportRef.current = null;
      engineRef.current = null;
    };
  }, []);

  return { supported, isPlaying, position, play, stop, setClickGain, setNoteGain };
}
