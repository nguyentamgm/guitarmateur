import { useRef, useState } from 'react';
import { useAppState, encodeState, exportStateToJson, importStateFromJson } from '../state';
import { theme, font } from './theme';
import { ScalePositionSection } from './components/ScalePositionSection';
import { ProgressionSection } from './components/ProgressionSection';
import { PracticeSection } from './components/PracticeSection';
import { InstallPrompt } from './components/InstallPrompt';
import { ErrorBoundary } from './ErrorBoundary';

/**
 * App shell: header + the three practice steps. State is provided by `useAppState` and threaded
 * down to sections — each section is presentational apart from reading its slice of state.
 */
export function App() {
  const [state, dispatch] = useAppState();
  const [copied, setCopied] = useState(false);
  const [importStatus, setImportStatus] = useState<'idle' | 'ok' | 'err'>('idle');
  const fileInputRef = useRef<HTMLInputElement>(null);

  function handleShare() {
    const encoded = encodeState(state);
    const url = `${window.location.origin}${window.location.pathname}?s=${encodeURIComponent(encoded)}`;
    navigator.clipboard.writeText(url).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }

  function handleExport() {
    const json = exportStateToJson(state);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'guitarmateur-practice.json';
    a.click();
    URL.revokeObjectURL(url);
  }

  function handleImportClick() {
    fileInputRef.current?.click();
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const text = reader.result;
      if (typeof text !== 'string') {
        setImportStatus('err');
        setTimeout(() => setImportStatus('idle'), 2500);
        return;
      }
      const imported = importStateFromJson(text);
      if (!imported) {
        setImportStatus('err');
        setTimeout(() => setImportStatus('idle'), 2500);
      } else {
        dispatch({ type: 'SET_STATE', payload: imported });
        setImportStatus('ok');
        setTimeout(() => setImportStatus('idle'), 2000);
      }
    };
    reader.readAsText(file);
    // Reset so re-selecting the same file triggers onChange again
    e.target.value = '';
  }

  const btnStyle: React.CSSProperties = {
    background: '#2a2e2b',
    color: theme.accent,
    border: `1px solid ${theme.border}`,
    borderRadius: 20,
    padding: '4px 14px',
    fontSize: 12,
    fontFamily: font.mono,
    cursor: 'pointer',
    letterSpacing: '.05em',
  };

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
        <div style={{ marginTop: 14, display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          <button onClick={handleShare} style={btnStyle}>
            {copied ? 'Copied!' : 'Share'}
          </button>
          <button onClick={handleExport} style={btnStyle}>
            Export
          </button>
          <button onClick={handleImportClick} style={btnStyle}>
            {importStatus === 'ok' ? 'Loaded!' : importStatus === 'err' ? 'Invalid file' : 'Import'}
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept=".json"
            style={{ display: 'none' }}
            onChange={handleFileChange}
          />
        </div>
      </header>

      <ErrorBoundary>
        <ScalePositionSection state={state} dispatch={dispatch} />
        <ProgressionSection state={state} dispatch={dispatch} />
        <PracticeSection state={state} dispatch={dispatch} />
        <InstallPrompt />
      </ErrorBoundary>
    </div>
  );
}
