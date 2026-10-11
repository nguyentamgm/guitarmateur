import { useCallback, useEffect, useRef, useState } from 'react';
import { Sequencer, isAudioSupported } from '@shared/core/audio';
import type { Lick } from '../lick';
import { lickPasses, type CompileOptions, type NoteTag } from '../audio';
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
export function useTransport(muted = false): UseTransport {
  const supported = isAudioSupported();
  const sequencerRef = useRef<Sequencer<NoteTag> | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [position, setPosition] = useState<Position | null>(null);

  const ensureSequencer = useCallback((): Sequencer<NoteTag> | null => {
    if (!supported) return null;
    sequencerRef.current ??= new Sequencer<NoteTag>(getPlayer(), {
      onSound: (e) => {
        if (e.kind === 'note' && e.tag) setPosition(e.tag);
      },
      onEnd: () => {
        setIsPlaying(false);
        setPosition(null);
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
  }, []);

  const setClickGain = useCallback((value: number) => getPlayer().setLevels({ click: value }), []);
  const setNoteGain = useCallback((value: number) => getPlayer().setLevels({ note: value }), []);

  // The header's sound toggle: the player stays, its sound goes; the mix is untouched.
  useEffect(() => {
    getPlayer().setEnabled(!muted);
  }, [muted]);

  useEffect(() => {
    return () => {
      // The player is the page's (audioPlayer.ts): stop playing, but leave it to the clicked notes.
      sequencerRef.current?.stop();
      sequencerRef.current = null;
    };
  }, []);

  return { supported, isPlaying, position, play, stop, setClickGain, setNoteGain };
}
