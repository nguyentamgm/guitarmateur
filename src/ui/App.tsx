import { theme, font } from './theme';
import { ScalePositionSection } from './components/ScalePositionSection';

/**
 * App shell: header + the practice steps. M2 ships Step 1 (scale & position explorer). Steps 2–3
 * (progression, practice cards) arrive with M3.
 */
export function App() {
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
          No audio here — cue up your own YouTube backing track and play along.
        </p>
      </header>

      <ScalePositionSection />
    </div>
  );
}
