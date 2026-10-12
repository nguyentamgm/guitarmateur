import { LOCALES, type LocaleId } from '../../i18n';
import { GlobeIcon } from '@shared/ui/GlobeIcon';
import { RadioGroup } from '@shared/ui/controls';
import { useT } from '../useT';

/**
 * The site header, the same on both apps: brand · Lessons · Review · Practice · language.
 * Same markup, order and class names as the Theory app's header (theory/src/ui/Header.tsx), styled
 * by shared/ui/controls.css; each app keeps its own copy because the text comes from its own i18n.
 * This page is Practice, so Practice is the current section.
 */
export function SiteHeader({
  language,
  onLanguage,
}: {
  language: LocaleId;
  onLanguage: (language: LocaleId) => void;
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
          <RadioGroup className="group" label={t('common.language')}>
            <GlobeIcon />
            {Object.values(LOCALES).map((locale) => (
              <button
                key={locale.id}
                type="button"
                className="chip"
                lang={locale.tag}
                role="radio"
                aria-checked={locale.id === language}
                tabIndex={locale.id === language ? 0 : -1}
                // The name holds the shown code too, so "EN" / "VI" is what a voice user can say.
                aria-label={`${locale.endonym} (${locale.id.toUpperCase()})`}
                onClick={() => onLanguage(locale.id)}
              >
                {locale.id.toUpperCase()}
              </button>
            ))}
          </RadioGroup>
        </div>
      </header>
    </div>
  );
}
