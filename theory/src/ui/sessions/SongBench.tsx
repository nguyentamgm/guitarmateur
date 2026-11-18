import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { Player } from '../../core/audio';
import { beatSeconds, strumDelays } from '../../core/rhythm';
import { fill } from '../../i18n';
import { chordIn } from '../../sessions/chordSpec';
import {
  SONGS,
  judgeSong,
  noteMidi,
  numeralSpec,
  slotBeats,
  slotsPerBar,
  type Song,
} from '../../sessions/songs';
import type { Block, SongCopy } from '../../sessions/types';
import { chordShape, shapeMidis } from '../../sessions/voicing';
import { useTheory } from '../context';
import { Button, ChipGroup } from '../controls';
import { useClock } from '../useClock';
import { useSessionStrumSpeed } from './sessionSettingsContext';
import { STRUM_SPREADS } from './strumSpeed';

export type SongBlock = Extract<Block, { kind: 'song' }>;

export function SongBench({ block, copy }: { block: SongBlock; copy: SongCopy }) {
  const { player, ui } = useTheory();
  const speed = useSessionStrumSpeed();
  const spread = STRUM_SPREADS[speed];

  const song: Song = SONGS[block.song];

  const [tonic, setTonic] = useState(block.in.tonic);
  useEffect(() => {
    setTonic(block.in.tonic);
  }, [block.in.tonic]);

  const currentKey = useMemo(() => ({ tonic, mode: block.in.mode }), [tonic, block.in.mode]);

  const currentKeyRef = useRef(currentKey);
  currentKeyRef.current = currentKey;

  const spreadRef = useRef(spread);
  spreadRef.current = spread;

  // Initialize picks based on block.start ('all' -> starts all on 'I', 'none' -> empty)
  const initialPicks = useMemo((): readonly (string | null)[] => {
    return song.chords.map((chord) => {
      if (chord === '-') return null;
      return block.start === 'all' ? 'I' : null;
    });
  }, [block.start, song.chords]);

  const [picks, setPicks] = useState<readonly (string | null)[]>(initialPicks);
  const [selectedSlot, setSelectedSlot] = useState<number | null>(() => {
    const firstNonEmpty = song.chords.findIndex((c) => c !== '-');
    return firstNonEmpty >= 0 ? firstNonEmpty : null;
  });
  const [marks, setMarks] = useState<readonly boolean[] | null>(null);
  const [caption, setCaption] = useState('');
  const [playMode, setPlayMode] = useState<'both' | 'tune'>('both');

  const picksRef = useRef(picks);
  picksRef.current = picks;

  const playModeRef = useRef(playMode);
  playModeRef.current = playMode;

  const totalSteps = song.bars * song.beatsPerBar * 2;
  const bpm = block.bpm ?? song.bpm;
  const stepDuration = beatSeconds(bpm) / 2;
  const slotBeatsCount = slotBeats(song.beatsPerBar);
  const stepsPerSlot = slotBeatsCount * 2;

  const onStep = useCallback(
    (stepIndex: number, delay: number) => {
      const stepBeat = stepIndex * 0.5;

      // 1. Melody notes at this eighth step
      for (const note of song.notes) {
        if (Math.abs(note.at - stepBeat) < 0.01) {
          const midi = noteMidi(currentKeyRef.current.tonic, note);
          const lengthSec = beatSeconds(bpm) * note.length * 0.95;
          player.pluck(midi, delay, lengthSec);
        }
      }

      // 2. Chord strum at the start of each slot
      if (playModeRef.current === 'both' && stepIndex % stepsPerSlot === 0) {
        const slotIdx = Math.floor(stepIndex / stepsPerSlot);
        const pickedNumeral = picksRef.current[slotIdx];
        if (pickedNumeral && pickedNumeral !== '-') {
          try {
            const spec = numeralSpec(pickedNumeral);
            const chord = chordIn(currentKeyRef.current, spec);
            const shape = chordShape(chord.chord);
            const midis = shapeMidis(shape);
            for (const s of strumDelays(midis, 'down', spreadRef.current)) {
              player.pluck(s.item, delay + s.delay, beatSeconds(bpm) * slotBeatsCount * 0.95);
            }
          } catch {
            // Ignore unknown or unparseable chord during playback
          }
        }
      }
    },
    [bpm, player, song.notes, stepsPerSlot, slotBeatsCount],
  );

  const clock = useClock(totalSteps, stepDuration, onStep, false);

  // Reset when block key or song changes
  useEffect(() => {
    setPicks(initialPicks);
    const firstNonEmpty = song.chords.findIndex((c) => c !== '-');
    setSelectedSlot(firstNonEmpty >= 0 ? firstNonEmpty : null);
    setMarks(null);
    setCaption('');
    clock.stop();
    player.cancel();
  }, [block.key, block.song, initialPicks, song.chords]); // eslint-disable-line react-hooks/exhaustive-deps

  const activeSlot = clock.current !== null ? Math.floor(clock.current / stepsPerSlot) : null;

  // Strum helper for clicking chord chips
  const strumChord = useCallback(
    (midis: readonly number[], p: Player) => {
      for (const s of strumDelays(midis, 'down', spread)) {
        p.pluck(s.item, s.delay, beatSeconds(bpm));
      }
    },
    [bpm, spread],
  );

  const handlePickChord = useCallback(
    (specRoman: string, midis: readonly number[]) => {
      if (selectedSlot === null || song.chords[selectedSlot] === '-') return;

      const newPicks = [...picks];
      newPicks[selectedSlot] = specRoman;
      setPicks(newPicks);
      setMarks(null);
      setCaption('');

      strumChord(midis, player);

      // Advance to next non-'-' slot
      let next = selectedSlot + 1;
      while (next < song.chords.length && song.chords[next] === '-') {
        next++;
      }
      if (next < song.chords.length) {
        setSelectedSlot(next);
      }
    },
    [picks, player, selectedSlot, song.chords, strumChord],
  );

  const handleTogglePlay = useCallback(
    (mode: 'both' | 'tune') => {
      if (clock.playing) {
        clock.stop();
        player.cancel();
        if (playMode !== mode) {
          setPlayMode(mode);
          clock.toggle();
        }
      } else {
        setPlayMode(mode);
        clock.toggle();
      }
    },
    [clock, playMode, player],
  );

  const handleCheck = useCallback(() => {
    const results = judgeSong(song, picks);
    setMarks(results);
    const right = results.filter(Boolean).length;
    const total = results.length;
    if (right === total) {
      setCaption(copy.allRight);
    } else {
      setCaption(fill(copy.result, { right, total }));
    }
  }, [copy.allRight, copy.result, picks, song]);

  const handleShowAnswer = useCallback(() => {
    const answers = song.chords.map((c) => (c === '-' ? null : c));
    setPicks(answers);
    const results = judgeSong(song, answers);
    setMarks(results);
    setCaption(copy.allRight);
  }, [copy.allRight, song]);

  const poolChords = useMemo(() => {
    return block.pool.map((spec) => {
      const chord = chordIn(currentKey, spec);
      const shape = chordShape(chord.chord);
      const midis = shapeMidis(shape);
      return {
        roman: chord.roman,
        symbol: chord.symbol,
        midis,
      };
    });
  }, [block.pool, currentKey]);

  // Layout: lines of 4 bars
  const totalBars = song.bars;
  const barsPerLine = 4;
  const totalLines = Math.ceil(totalBars / barsPerLine);
  const slotsInBar = slotsPerBar(song.beatsPerBar);

  return (
    <div className="board song-bench">
      {block.keys && (
        <div className="controls">
          <ChipGroup<string>
            label={ui.session.key}
            items={block.keys.map((k) => ({ value: k, text: k }))}
            value={tonic}
            onChange={setTonic}
          />
        </div>
      )}

      <div className="controls">
        <Button onClick={() => handleTogglePlay('both')}>
          {clock.playing && playMode === 'both' ? ui.session.stop : ui.session.play}
        </Button>
        <Button onClick={() => handleTogglePlay('tune')}>
          {clock.playing && playMode === 'tune' ? ui.session.stop : ui.session.playTune}
        </Button>
      </div>

      <div className="song-grid" role="group" aria-label={song.title}>
        {Array.from({ length: totalLines }, (_, lineIdx) => {
          const startBar = lineIdx * barsPerLine;
          const endBar = Math.min(startBar + barsPerLine, totalBars);
          return (
            <div key={lineIdx} className="song-line">
              {Array.from({ length: endBar - startBar }, (_, bOffset) => {
                const barIdx = startBar + bOffset;
                return (
                  <div key={barIdx} className="song-bar">
                    {Array.from({ length: slotsInBar }, (_, slotInBar) => {
                      const slotIdx = barIdx * slotsInBar + slotInBar;
                      const refChord = song.chords[slotIdx];
                      const isChordless = refChord === '-';
                      const pickedNumeral = picks[slotIdx];
                      const isSelected = selectedSlot === slotIdx;
                      const isCurrent = activeSlot === slotIdx;
                      const mark = marks ? marks[slotIdx] : null;

                      let chordSymbol = '';
                      if (pickedNumeral && pickedNumeral !== '-') {
                        try {
                          chordSymbol = chordIn(
                            currentKey,
                            numeralSpec(pickedNumeral),
                          ).symbol;
                        } catch {
                          chordSymbol = '';
                        }
                      }

                      let slotLabel = `${fill(ui.session.barLabel, { n: barIdx + 1 })}`;
                      if (isChordless) {
                        slotLabel += `: ${ui.session.noChord}`;
                      } else if (pickedNumeral) {
                        slotLabel += `: ${pickedNumeral} ${chordSymbol}`;
                      } else {
                        slotLabel += `: ${ui.session.slotEmpty}`;
                      }

                      if (mark === true) {
                        slotLabel += `, ${ui.session.slotRight}`;
                      } else if (mark === false) {
                        slotLabel += `, ${ui.session.slotWrong}`;
                      }

                      return (
                        <button
                          key={slotIdx}
                          type="button"
                          className={`song-slot ${isSelected ? 'selected' : ''} ${
                            isCurrent ? 'current' : ''
                          } ${mark !== null ? (mark ? 'right' : 'wrong') : ''}`}
                          disabled={isChordless}
                          aria-pressed={!isChordless ? isSelected : undefined}
                          aria-label={slotLabel}
                          onClick={() => setSelectedSlot(slotIdx)}
                        >
                          {isChordless ? (
                            <span className="slot-empty">—</span>
                          ) : pickedNumeral ? (
                            <span className="slot-chord">
                              <span className="slot-numeral">{pickedNumeral}</span>
                              <span className="slot-symbol">{chordSymbol}</span>
                            </span>
                          ) : (
                            <span className="slot-empty">·</span>
                          )}
                          {mark !== null && (
                            <span
                              className={`slot-mark ${mark ? 'right' : 'wrong'}`}
                              aria-hidden="true"
                            >
                              {mark ? '✓' : '✗'}
                            </span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                );
              })}
            </div>
          );
        })}
      </div>

      <div className="song-chord-chips" role="group" aria-label={copy.ask}>
        {poolChords.map((chord) => (
          <button
            key={chord.roman}
            type="button"
            className="chip song-chord-chip"
            onClick={() => handlePickChord(chord.roman, chord.midis)}
            aria-label={`${chord.roman} ${chord.symbol}`}
          >
            <strong>{chord.roman}</strong> {chord.symbol}
          </button>
        ))}
      </div>

      <div className="controls song-actions">
        <Button onClick={handleCheck}>{ui.session.check}</Button>
        <Button onClick={handleShowAnswer}>{ui.session.showAnswerAll}</Button>
      </div>

      {caption && (
        <p className="song-feedback" role="status">
          {caption}
        </p>
      )}
    </div>
  );
}
