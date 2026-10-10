import { LOCALES, type LocaleId } from '../../i18n';
import { GlobeIcon } from './primitives';
import { useT } from '../useT';

/**
 * The site header, the same on both apps: brand · Lessons · Review · Practice · sound · language.
 * Same markup, order and class names as the Theory app's header (theory/src/ui/Header.tsx), styled
 * by shared/ui/controls.css; each app keeps its own copy because the text comes from its own i18n.
 * This page is Practice, so Practice is the current section.
 */
export function SiteHeader({
  language,
  onLanguage,
  soundOn,
  onSound,
}: {
  language: LocaleId;
  onLanguage: (language: LocaleId) => void;
  soundOn: boolean;
  onSound: (on: boolean) => void;
}) {
  const t = useT(language);
  return (
    <div className="site-top">
      <header className="topbar">
        <a href="/" className="brand">
          {t('nav.brand')}
        </a>
        <div className="topbar-tools">
          <nav className="topnav" aria-label={t('nav.label')}>
            <a href="/theory" className="navlink">
              {t('nav.lessons')}
            </a>
            <a href="/theory/review" className="navlink">
              {t('nav.review')}
            </a>
            <a href="/" className="navlink" aria-current="page">
              {t('nav.practice')}
            </a>
          </nav>
          <button
            type="button"
            className="btn ghost"
            aria-pressed={soundOn}
            onClick={() => onSound(!soundOn)}
          >
            {soundOn ? t('common.soundOn') : t('common.soundOff')}
          </button>
          <div className="group" role="group" aria-label={t('common.language')}>
            <GlobeIcon size={16} />
            {Object.values(LOCALES).map((locale) => (
              <button
                key={locale.id}
                type="button"
                className="chip"
                lang={locale.tag}
                aria-pressed={locale.id === language}
                aria-label={locale.endonym}
                onClick={() => onLanguage(locale.id)}
              >
                {locale.id.toUpperCase()}
              </button>
            ))}
          </div>
        </div>
      </header>
    </div>
  );
}
