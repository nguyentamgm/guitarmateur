import { useCallback, useEffect, useRef, useState } from 'react';
import { Sequencer, isAudioSupported } from '@shared/core/audio';
import type { Lick } from '../lick';
import { lickPasses, type CompileOptions, type NoteTag, type PlayTag } from '../audio';
import { getPlayer } from './audioPlayer';

/** Which chord card and which of its notes is sounding. */
export type Position = NoteTag;

/** PlayOptions omits CompileOptions' `repeats`: playback is one pass, or endless passes with `loop`. */
export interface PlayOptions extends Omit<CompileOptions, 'repeats'> {
  /** Repeat the progression until stopped. */
  loop?: boolean;
  /** The click / note mix, 0..1, applied as playback starts. */
  clickGain?: number;
  noteGain?: number;
}

export interface UseTransport {
  supported: boolean;
  isPlaying: boolean;
  /** The currently-sounding note, or null when idle — drives card/tab highlighting. */
  position: Position | null;
  /** The bar being heard (0-based, a 2-bar chord counts twice), or null when idle or counting in. */
  bar: number | null;
  play: (licks: Lick[], opts: PlayOptions) => void;
  stop: () => void;
  setClickGain: (value: number) => void;
  setNoteGain: (value: number) => void;
}

/**
 * Lick playback on the shared guitar sound: the page's player (`audioPlayer.ts`) and the shared
 * `Sequencer`, fed passes by `lickPasses`. The AudioContext is created on the first `play()`, which
 * must come from a user gesture per browser autoplay policy. Playback stops on unmount.
 */
export function useTransport(): UseTransport {
  const supported = isAudioSupported();
  const sequencerRef = useRef<Sequencer<PlayTag> | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [position, setPosition] = useState<Position | null>(null);
  const [bar, setBar] = useState<number | null>(null);

  const ensureSequencer = useCallback((): Sequencer<PlayTag> | null => {
    if (!supported) return null;
    sequencerRef.current ??= new Sequencer<PlayTag>(getPlayer(), {
      onSound: (e) => {
        if (!e.tag) return;
        if ('bar' in e.tag) setBar(e.tag.bar);
        else setPosition(e.tag);
      },
      onEnd: () => {
        setIsPlaying(false);
        setPosition(null);
        setBar(null);
      },
    });
    return sequencerRef.current;
  }, [supported]);

  const play = useCallback(
    (licks: Lick[], opts: PlayOptions) => {
      const sequencer = ensureSequencer();
      if (!sequencer) return;
      const { loop = false, clickGain, noteGain, ...compile } = opts;
      getPlayer().setLevels({ click: clickGain, note: noteGain });
      if (licks.every((l) => l.notes.length === 0)) {
        sequencer.stop();
        return;
      }
      const passes = lickPasses(licks, compile, loop);
      sequencer.play(passes.first, loop ? passes.next : undefined);
      setIsPlaying(sequencer.isPlaying);
    },
    [ensureSequencer],
  );

  const stop = useCallback(() => {
    sequencerRef.current?.stop();
    setIsPlaying(false);
    setBar(null);
  }, []);

  const setClickGain = useCallback((value: number) => getPlayer().setLevels({ click: value }), []);
  const setNoteGain = useCallback((value: number) => getPlayer().setLevels({ note: value }), []);

  useEffect(() => {
    return () => {
      // The player is the page's (audioPlayer.ts): stop playing, but leave it to the clicked notes.
      sequencerRef.current?.stop();
      sequencerRef.current = null;
    };
  }, []);

  return { supported, isPlaying, position, bar, play, stop, setClickGain, setNoteGain };
}
