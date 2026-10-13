import { GlobeIcon } from '@shared/ui/GlobeIcon';
import { RadioGroup } from '@shared/ui/controls';
import { LANGS, type Lang, type UiStrings } from '../i18n';

/**
 * The site header: brand · Lessons · Review · Practice · Ear training · language. Same markup and
 * class names as the other pages' headers (shared/ui/controls.css); this page is Ear training.
 */
export function Header({ ui, lang, onLang }: { ui: UiStrings; lang: Lang; onLang(lang: Lang): void }) {
  return (
    <div className="site-top">
      <header className="topbar">
        <a href="/" className="brand">
          {ui.brand}
        </a>
        <div className="topbar-tools">
          <nav className="topnav" aria-label={ui.navLabel}>
            <a href="/theory" className="navlink">
              {ui.navLessons}
            </a>
            <a href="/theory/review" className="navlink">
              {ui.navReview}
            </a>
            <a href="/" className="navlink">
              {ui.navPractice}
            </a>
            <a href="/ear" className="navlink" aria-current="page">
              {ui.navEar}
            </a>
          </nav>
          <RadioGroup className="group" label={ui.langLabel}>
            <GlobeIcon />
            {LANGS.map((l) => (
              <button
                key={l}
                type="button"
                className="chip"
                lang={l}
                role="radio"
                aria-checked={l === lang}
                tabIndex={l === lang ? 0 : -1}
                // The name holds the shown code too, so "EN" / "VI" is what a voice user can say.
                aria-label={`${ui.langName[l]} (${l.toUpperCase()})`}
                onClick={() => onLang(l)}
              >
                {l.toUpperCase()}
              </button>
            ))}
          </RadioGroup>
        </div>
      </header>
    </div>
  );
}
