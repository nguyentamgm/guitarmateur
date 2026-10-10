import { useEffect, useRef, useState } from 'react';
import type { LocaleId } from '../../i18n';
import { recordVisit, rememberInstallDone, shouldOfferInstall } from '../../state';
import { theme } from '../theme';
import { useT } from '../useT';

interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>;
  readonly userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

/**
 * "Install" in the page's action row — in the flow, so it never covers the fretboard. Offered
 * only when the browser can install the app and the learner is engaged (a second visit, or after
 * the first playback: `played`); once dismissed or answered it never comes back.
 */
export function InstallPrompt({
  language,
  played,
}: {
  language: LocaleId;
  played: boolean;
}) {
  const t = useT(language);
  const [prompt, setPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [memory, setMemory] = useState(recordVisit);
  const asking = useRef(false);

  useEffect(() => {
    const handler = (e: Event) => {
      e.preventDefault();
      setPrompt(e as BeforeInstallPromptEvent);
    };
    const installed = () => setMemory(rememberInstallDone());
    window.addEventListener('beforeinstallprompt', handler);
    window.addEventListener('appinstalled', installed);
    return () => {
      window.removeEventListener('beforeinstallprompt', handler);
      window.removeEventListener('appinstalled', installed);
    };
  }, []);

  if (!prompt || !shouldOfferInstall(memory, played)) return null;

  async function handleInstall() {
    // The browser's dialog can be shown once per event: a double-click must not ask twice.
    if (!prompt || asking.current) return;
    asking.current = true;
    try {
      await prompt.prompt();
      await prompt.userChoice;
      // Either answer is final: the browser will not offer this prompt object again.
      setMemory(rememberInstallDone());
    } catch {
      setPrompt(null); // the event is spent; the browser's own install menu still works
    }
  }

  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 2 }}>
      <button
        onClick={handleInstall}
        type="button"
        className="btn"
        title={t('install.title')}
      >
        {t('install.button')}
      </button>
      <button
        type="button"
        onClick={() => setMemory(rememberInstallDone())}
        aria-label={t('install.dismissAria')}
        title={t('install.dismissAria')}
        style={{
          background: 'none',
          border: 'none',
          color: theme.muted,
          fontSize: 16,
          cursor: 'pointer',
          padding: '0 6px',
          lineHeight: 1,
        }}
      >
        ×
      </button>
    </span>
  );
}
