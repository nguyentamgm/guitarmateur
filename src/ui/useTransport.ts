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
  /** The click / backing / note mix, 0..1, applied as playback starts. */
  clickGain?: number;
  backingGain?: number;
  noteGain?: number;
}

export interface UseTransport {
  supported: boolean;
  isPlaying: boolean;
  /** The currently-sounding note, or null when idle — drives card/tab highlighting. */
  position: Position | null;
  /** The bar being heard (0-based, a 2-bar chord counts twice), or null when idle or counting in. */
  bar: number | null;
  /** Active 1-based beat (1..4) during count-in; null once bar 1 starts or when stopped. */
  readonly countInBeat?: number | null;
  /** Index of the single card being looped, or null when playing the whole progression or idle. */
  cardIndex?: number | null;
  /** True during the learner's response pass in trade (call and response) mode. */
  isResponding?: boolean;
  play: (licks: Lick[], opts: PlayOptions) => void;
  stop: () => void;
  setClickGain: (value: number) => void;
  setBackingGain: (value: number) => void;
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
  const [countInBeat, setCountInBeat] = useState<number | null>(null);
  const [cardIndex, setCardIndex] = useState<number | null>(null);
  const [isResponding, setIsResponding] = useState(false);

  const ensureSequencer = useCallback((): Sequencer<PlayTag> | null => {
    if (!supported) return null;
    sequencerRef.current ??= new Sequencer<PlayTag>(getPlayer(), {
      onSound: (e) => {
        if (!e.tag) return;
        if ('countInBeat' in e.tag) {
          setCountInBeat(e.tag.countInBeat);
        } else if ('bar' in e.tag) {
          setCountInBeat(null);
          setBar(e.tag.bar);
          const resp = Boolean(e.tag.response);
          setIsResponding(resp);
          if (resp && e.tag.entryIndex !== undefined) {
            setPosition({ entryIndex: e.tag.entryIndex, noteIndex: -1 });
          }
        } else {
          setCountInBeat(null);
          setIsResponding(false);
          setPosition(e.tag);
        }
      },
      onEnd: () => {
        setIsPlaying(false);
        setPosition(null);
        setBar(null);
        setCountInBeat(null);
        setCardIndex(null);
        setIsResponding(false);
      },
    });
    return sequencerRef.current;
  }, [supported]);

  const play = useCallback(
    (licks: Lick[], opts: PlayOptions) => {
      const sequencer = ensureSequencer();
      if (!sequencer) return;
      const { loop = false, clickGain, backingGain, noteGain, ...compile } = opts;
      getPlayer().setLevels({ click: clickGain, backing: backingGain, note: noteGain });
      const activeLicks =
        compile.cardIndex !== undefined
          ? licks[compile.cardIndex]
            ? [licks[compile.cardIndex]!]
            : []
          : licks;
      if (
        activeLicks.length === 0 ||
        (activeLicks.every((l) => l.notes.length === 0) && (!compile.chords || compile.chords.length === 0))
      ) {
        sequencer.stop();
        setCountInBeat(null);
        return;
      }
      const passes = lickPasses(licks, compile, loop);
      sequencer.play(passes.first, loop || compile.trade ? passes.next : undefined);
      setIsPlaying(sequencer.isPlaying);
      setCardIndex(sequencer.isPlaying ? (compile.cardIndex ?? null) : null);
      setIsResponding(false);
      setCountInBeat(null);
    },
    [ensureSequencer],
  );

  const stop = useCallback(() => {
    sequencerRef.current?.stop();
    setIsPlaying(false);
    setPosition(null);
    setBar(null);
    setCountInBeat(null);
    setCardIndex(null);
    setIsResponding(false);
  }, []);

  const setClickGain = useCallback((value: number) => getPlayer().setLevels({ click: value }), []);
  const setBackingGain = useCallback((value: number) => getPlayer().setLevels({ backing: value }), []);
  const setNoteGain = useCallback((value: number) => getPlayer().setLevels({ note: value }), []);

  useEffect(() => {
    return () => {
      // The player is the page's (audioPlayer.ts): stop playing, but leave it to the clicked notes.
      sequencerRef.current?.stop();
      sequencerRef.current = null;
    };
  }, []);

  return { supported, isPlaying, position, bar, countInBeat, cardIndex, isResponding, play, stop, setClickGain, setBackingGain, setNoteGain };
}
