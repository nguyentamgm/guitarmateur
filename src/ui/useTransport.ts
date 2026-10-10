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

/** Full-volume defaults until a `play()` or a setter says otherwise (matches the reducer defaults). */
const DEFAULT_GAINS = { click: 0.6, note: 0.9 };

/**
 * React adapter for the audio `Transport`. The `AudioContext` (and thus the engine + transport) is
 * created lazily on the first `play()` call — which must originate from a user gesture per browser
 * autoplay policy. Everything is torn down on unmount.
 */
export function useTransport(muted = false): UseTransport {
  const supported = isAudioSupported();
  // The header's sound toggle mutes without touching the volume sliders: the gains set last are
  // remembered and come back when sound is turned on again.
  const mutedRef = useRef(muted);
  const gainsRef = useRef({ ...DEFAULT_GAINS });
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
      if (opts.clickGain !== undefined) gainsRef.current.click = opts.clickGain;
      if (opts.noteGain !== undefined) gainsRef.current.note = opts.noteGain;
      transport.play(licks, mutedRef.current ? { ...opts, clickGain: 0, noteGain: 0 } : opts);
      setIsPlaying(transport.isPlaying);
    },
    [ensureTransport],
  );

  const stop = useCallback(() => {
    transportRef.current?.stop();
    setIsPlaying(false);
  }, []);

  const setClickGain = useCallback((value: number) => {
    gainsRef.current.click = value;
    if (!mutedRef.current) transportRef.current?.setClickGain(value);
  }, []);
  const setNoteGain = useCallback((value: number) => {
    gainsRef.current.note = value;
    if (!mutedRef.current) transportRef.current?.setNoteGain(value);
  }, []);

  useEffect(() => {
    mutedRef.current = muted;
    transportRef.current?.setClickGain(muted ? 0 : gainsRef.current.click);
    transportRef.current?.setNoteGain(muted ? 0 : gainsRef.current.note);
  }, [muted]);

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
