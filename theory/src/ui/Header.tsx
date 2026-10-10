import { LANGS } from '../i18n';
import { useTheory } from './context';
import { GlobeIcon } from './GlobeIcon';
import { Link } from './Link';
import { BASE, hrefFor } from './router';

/** Which section of the site a page belongs to: highlighted in the header. */
export type Section = 'lessons' | 'review';

/**
 * The site header, the same on both apps: brand · Lessons · Review · Practice · sound · language.
 * The practice app (src/ui/components/SiteHeader.tsx) keeps a copy with the same markup and order.
 */
export function Header({ section }: { section: Section }) {
  const { ui, lang, setLang, soundOn, setSoundOn } = useTheory();
  const current = (s: Section) => (s === section ? 'page' : undefined);
  return (
    <header className="topbar">
      {/* The homepage is the practice app, a different page: a plain link loads it. */}
      <a href="/" className="brand">
        {ui.brand}
      </a>
      <div className="topbar-tools">
        <nav className="topnav" aria-label={ui.navLabel}>
          <Link href={BASE} className="navlink" aria-current={current('lessons')}>
            {ui.navLessons}
          </Link>
          <Link href={hrefFor({ page: 'review' })} className="navlink" aria-current={current('review')}>
            {ui.navReview}
          </Link>
          <a href="/" className="navlink">
            {ui.navPractice}
          </a>
        </nav>
        <button type="button" className="btn ghost" aria-pressed={soundOn} onClick={() => setSoundOn(!soundOn)}>
          {soundOn ? ui.soundOn : ui.soundOff}
        </button>
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
