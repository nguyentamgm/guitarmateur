import { useAppState } from '../state';
import { theme, font } from './theme';
import { ScalePositionSection } from './components/ScalePositionSection';
import { ProgressionSection } from './components/ProgressionSection';
import { PracticeSection } from './components/PracticeSection';

/**
 * App shell: header + the three practice steps. State is provided by `useAppState` and threaded
 * down to sections — each section is presentational apart from reading its slice of state.
 */
export function App() {
  const [state, dispatch] = useAppState();

  return (
    <div style={{ maxWidth: 1080, margin: '0 auto', padding: '30px 20px 70px' }}>
      <header style={{ marginBottom: 34 }}>
        <div
          style={{
            fontSize: 12,
            letterSpacing: '.18em',
            textTransform: 'uppercase',
            color: theme.muted,
            fontWeight: 600,
            fontFamily: font.mono,
          }}
        >
          Fretboard Trainer
        </div>
        <h1 style={{ fontSize: 30, fontWeight: 700, margin: '8px 0 6px', letterSpacing: '-0.01em' }}>
          Pentatonic Practice
        </h1>
        <p style={{ margin: 0, color: theme.muted, fontSize: 15, maxWidth: 620, lineHeight: 1.5 }}>
          Visualize the scale, target the chord tones under your progression, and generate simple
          licks to solo over your backing track.
        </p>
        <p style={{ margin: '10px 0 0', color: theme.subtle, fontSize: 12.5 }}>
          Play along in the browser, or cue your own backing track and solo over it.
        </p>
      </header>

      <ScalePositionSection state={state} dispatch={dispatch} />
      <ProgressionSection state={state} dispatch={dispatch} />
      <PracticeSection state={state} dispatch={dispatch} />
    </div>
  );
}
