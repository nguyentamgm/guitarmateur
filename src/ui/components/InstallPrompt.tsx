import { useEffect, useState } from 'react';
import { theme, font } from '../theme';

interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>;
  readonly userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export function InstallPrompt() {
  const [prompt, setPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    const handler = (e: Event) => {
      e.preventDefault();
      setPrompt(e as BeforeInstallPromptEvent);
    };
    window.addEventListener('beforeinstallprompt', handler);
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  if (!prompt || dismissed) return null;

  async function handleInstall() {
    if (!prompt) return;
    await prompt.prompt();
    const { outcome } = await prompt.userChoice;
    if (outcome === 'accepted' || outcome === 'dismissed') setDismissed(true);
  }

  return (
    <div
      role="banner"
      style={{
        position: 'fixed',
        bottom: 20,
        left: '50%',
        transform: 'translateX(-50%)',
        background: '#1a1d1b',
        border: `1px solid #2a2e2b`,
        borderRadius: 12,
        padding: '12px 18px',
        display: 'flex',
        alignItems: 'center',
        gap: 14,
        boxShadow: '0 4px 24px rgba(0,0,0,0.5)',
        zIndex: 9999,
        maxWidth: 'calc(100vw - 40px)',
        fontFamily: font.mono,
      }}
    >
      <span style={{ fontSize: 13, color: theme.text, whiteSpace: 'nowrap' }}>
        Install Guitarmateur
      </span>
      <button
        onClick={handleInstall}
        style={{
          background: theme.accent,
          color: theme.accentText,
          border: 'none',
          borderRadius: 8,
          padding: '5px 14px',
          fontSize: 12,
          fontFamily: font.mono,
          fontWeight: 600,
          cursor: 'pointer',
          letterSpacing: '.04em',
          whiteSpace: 'nowrap',
        }}
      >
        Install
      </button>
      <button
        onClick={() => setDismissed(true)}
        aria-label="Dismiss"
        style={{
          background: 'none',
          border: 'none',
          color: theme.muted,
          fontSize: 16,
          cursor: 'pointer',
          padding: '0 2px',
          lineHeight: 1,
        }}
      >
        ×
      </button>
    </div>
  );
}
