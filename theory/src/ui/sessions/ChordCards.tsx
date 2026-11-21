import type { Chord, DegreeLabel } from '../../core/music';
import { chordIn } from '../../sessions/chordSpec';
import { strummed } from '../../sessions/sound';
import type { ChordSpec, SessionKey } from '../../sessions/types';
import { chordShape, shapeMidis, upperVoicing } from '../../sessions/voicing';
import { BarreBar } from '../BarreBar';
import { useTheory } from '../context';
import { Button } from '../controls';
import { Fretboard, type FretDot } from '../Fretboard';
import { useNeckGeometry } from '../geometry';
import { degreeText, posKey } from '../keys';
import { playSound } from './playSound';
import { useSessionStrumSpeed } from './sessionSettingsContext';
import { STRUM_SPREADS } from './strumSpeed';

export function ChordCard({
  chord,
  roman,
  upperDegrees,
}: {
  chord: Chord;
  roman?: string;
  upperDegrees?: readonly [DegreeLabel, DegreeLabel, DegreeLabel];
}) {
  const { player, ui } = useTheory();
  const speed = useSessionStrumSpeed();
  const shape = upperDegrees ? upperVoicing(chord, upperDegrees) : chordShape(chord);
  const fretCount = Math.max(
    shape.barreFret !== null ? shape.barreFret + 3 : 4,
    ...shape.notes.map((n) => n.fret),
  );
  const g = useNeckGeometry(fretCount, { fretWidth: 72 });

  const dots: FretDot[] = shape.notes.map((n) => ({
    key: posKey(n),
    string: n.string,
    fret: n.fret,
    midi: n.midi,
    label: degreeText(n.degree),
    name: upperDegrees ? n.name : undefined,
    degree: upperDegrees ? degreeText(n.degree) : undefined,
    tone: n.degree === '1' ? 'home' : 'plain',
  }));

  const strum = () => {
    playSound(
      player,
      {
        bpm: 80,
        events: [strummed(shapeMidis(shape), 0, 2)],
      },
      { strumSpreadSec: STRUM_SPREADS[speed] },
    );
  };

  return (
    <div className="board">
      <div className="quiz">
        <button
          type="button"
          className="power-symbol"
          style={{
            background: 'none',
            border: 'none',
            padding: 0,
            cursor: 'pointer',
            textAlign: 'left',
          }}
          onClick={strum}
        >
          <span>{shape.symbol}</span>
          {roman ? (
            <span className="muted" style={{ fontSize: '1.1rem', marginLeft: 8 }}>
              {roman}
            </span>
          ) : null}
        </button>
        <Button onClick={strum}>{ui.session.strum}</Button>
      </div>
      <Fretboard geometry={g} dots={dots} label={shape.symbol}>
        {shape.barreFret !== null && (
          <BarreBar g={g} view={{ shape: shape.barreShape ?? null, fret: shape.barreFret }} />
        )}
        {shape.muted.map((s) => (
          <text key={s} className="mutex" x={g.x(0)} y={g.y(s)}>
            {ui.session.mutedMark}
          </text>
        ))}
      </Fretboard>
    </div>
  );
}

export function ChordCards({
  in: sessionKey,
  chords,
  upperDegrees,
}: {
  in: SessionKey;
  chords: readonly ChordSpec[];
  upperDegrees?: readonly [DegreeLabel, DegreeLabel, DegreeLabel];
}) {
  return (
    <>
      {chords.map((spec, i) => {
        const specChord = chordIn(sessionKey, spec);
        return (
          <ChordCard
            key={i}
            chord={specChord.chord}
            roman={specChord.roman}
            upperDegrees={upperDegrees}
          />
        );
      })}
    </>
  );
}
