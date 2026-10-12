import { LANGS } from '../i18n';
import { useTheory } from './context';
import { GlobeIcon } from '@shared/ui/GlobeIcon';
import { RadioGroup } from '@shared/ui/controls';
import { Link } from './Link';
import { BASE, hrefFor } from './router';

/** Which section of the site a page belongs to: highlighted in the header. */
export type Section = 'lessons' | 'review';

/**
 * The site header, the same on both apps: brand · Lessons · Review · Practice · language.
 * The practice app (src/ui/components/SiteHeader.tsx) keeps a copy with the same markup and order.
 */
export function Header({ section }: { section: Section }) {
  const { ui, lang, setLang } = useTheory();
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
              onClick={() => setLang(l)}
            >
              {l.toUpperCase()}
            </button>
          ))}
        </RadioGroup>
      </div>
    </header>
  );
}
