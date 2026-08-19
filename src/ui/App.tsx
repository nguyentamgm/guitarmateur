import { useRef, useState } from 'react';
import { useAppState, encodeState, exportStateToJson, importStateFromJson } from '../state';
import { theme, font } from './theme';
import { ScalePositionSection } from './components/ScalePositionSection';
import { ProgressionSection } from './components/ProgressionSection';
import { PracticeSection } from './components/PracticeSection';
import { InstallPrompt } from './components/InstallPrompt';
import { ErrorBoundary } from './ErrorBoundary';
import { useT } from './useT';

function legacyCopy(url: string, onCopied: () => void, copyPrompt: string): void {
  const ta = document.createElement('textarea');
  ta.value = url;
  ta.style.position = 'fixed';
  ta.style.opacity = '0';
  ta.readOnly = true;
  document.body.appendChild(ta);
  ta.select();
  let ok = false;
  try {
    ok = document.execCommand('copy');
  } catch {
    // execCommand is deprecated; ignore errors
  }
  document.body.removeChild(ta);
  if (ok) {
    onCopied();
  } else {
    window.prompt(copyPrompt, url);
  }
}

/**
 * App shell: header + the three practice steps. State is provided by `useAppState` and threaded
 * down to sections — each section is presentational apart from reading its slice of state.
 */
export function App() {
  const [state, dispatch] = useAppState();
  const t = useT(state.language);
  const [copied, setCopied] = useState(false);
  const [importStatus, setImportStatus] = useState<'idle' | 'ok' | 'err'>('idle');
  const fileInputRef = useRef<HTMLInputElement>(null);

  function handleShare() {
    const encoded = encodeState(state);
    const url = `${window.location.origin}${window.location.pathname}?s=${encodeURIComponent(encoded)}`;
    const onCopied = () => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    };
    if (navigator.clipboard?.writeText) {
      navigator.clipboard
        .writeText(url)
        .then(onCopied)
        .catch(() => legacyCopy(url, onCopied, t('common.copyLinkPrompt')));
    } else {
      legacyCopy(url, onCopied, t('common.copyLinkPrompt'));
    }
  }

  function handleExport() {
    const json = exportStateToJson(state);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'guitarmateur-practice.json';
    // Firefox ignores downloads on anchors that are not in the document, and revoking the
    // object URL synchronously after click() can abort the download before it starts.
    // Append, click, detach, then revoke on the next macrotask.
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    setTimeout(() => URL.revokeObjectURL(url), 0);
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
          {t('app.kicker')}
        </div>
        <h1 style={{ fontSize: 30, fontWeight: 700, margin: '8px 0 6px', letterSpacing: '-0.01em' }}>
          {t('app.title')}
        </h1>
        <p style={{ margin: 0, color: theme.muted, fontSize: 15, maxWidth: 620, lineHeight: 1.5 }}>
          {t('app.subtitle')}
        </p>
        <p style={{ margin: '10px 0 0', color: theme.subtle, fontSize: 12.5 }}>
          {t('app.playAlongNote')}
        </p>
        <div style={{ marginTop: 14, display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          <button onClick={handleShare} style={btnStyle}>
            {copied ? t('common.shareCopied') : t('common.share')}
          </button>
          <button onClick={handleExport} style={btnStyle}>
            {t('common.export')}
          </button>
          <button onClick={handleImportClick} style={btnStyle}>
            {importStatus === 'ok'
              ? t('common.importLoaded')
              : importStatus === 'err'
                ? t('common.importInvalid')
                : t('common.import')}
          </button>
          <button
            onClick={() => dispatch({ type: 'setLeftHanded', value: !state.leftHanded })}
            style={{
              ...btnStyle,
              borderColor: state.leftHanded ? theme.accent : theme.border,
            }}
          >
            {state.leftHanded ? t('common.normal') : t('common.leftHanded')}
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

      <ErrorBoundary t={t}>
        <ScalePositionSection state={state} dispatch={dispatch} />
        <ProgressionSection state={state} dispatch={dispatch} />
        <PracticeSection state={state} dispatch={dispatch} />
        <InstallPrompt language={state.language} />
      </ErrorBoundary>
    </div>
  );
}
