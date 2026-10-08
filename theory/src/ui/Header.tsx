import { LANGS } from '../i18n';
import { useTheory } from './context';
import { GlobeIcon } from './GlobeIcon';
import { Link } from './Link';
import { BASE, hrefFor } from './router';

export function Header() {
  const { ui, lang, setLang, soundOn, setSoundOn } = useTheory();
  return (
    <header className="topbar">
      <Link href={BASE} className="brand">
        {ui.appName}
      </Link>
      <div className="topbar-tools">
        <Link href={hrefFor({ page: 'review' })} className="navlink">
          {ui.navReview}
        </Link>
        <button type="button" className="btn ghost" aria-pressed={soundOn} onClick={() => setSoundOn(!soundOn)}>
          {soundOn ? ui.soundOn : ui.soundOff}
        </button>
        {/* The practice app is a different page, not a Theory route: a plain link loads it. */}
        <a href="/" className="navlink">
          {ui.navPractice}
        </a>
        <div className="group" role="group" aria-label={ui.langLabel}>
          <GlobeIcon />
          {LANGS.map((l) => (
            <button
              key={l}
              type="button"
              className="chip"
              lang={l}
              aria-pressed={l === lang}
              aria-label={ui.langName[l]}
              onClick={() => setLang(l)}
            >
              {l.toUpperCase()}
            </button>
          ))}
        </div>
      </div>
    </header>
  );
}
