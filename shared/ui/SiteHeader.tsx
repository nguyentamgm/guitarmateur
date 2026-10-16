import type { MouseEvent } from 'react';
import { RadioGroup } from './controls';
import { GlobeIcon } from './GlobeIcon';
import { SITE_SECTIONS, type SiteSection } from './siteSections';

/** One choice of the language switch: its id, its BCP 47 tag, its name in that language. */
export interface SiteLanguage<L extends string> {
  readonly id: L;
  readonly tag: string;
  readonly name: string;
}

/**
 * The site header, the same on every page: brand · Lessons · Review · Practice · Ear training ·
 * language. The text comes from the page (no copy lives in shared/). Links are plain `<a href>`s;
 * a page that navigates its own sections client-side (Theory) handles the click in `onNavigate`.
 */
export function SiteHeader<L extends string>({
  brand,
  navLabel,
  labels,
  current,
  languageLabel,
  languages,
  language,
  onLanguage,
  onNavigate,
}: {
  brand: string;
  navLabel: string;
  labels: Readonly<Record<SiteSection, string>>;
  /** The section this page belongs to (`aria-current="page"`); none for a page outside them. */
  current?: SiteSection;
  languageLabel: string;
  languages: readonly SiteLanguage<L>[];
  language: L;
  onLanguage(language: L): void;
  onNavigate?(e: MouseEvent<HTMLAnchorElement>, href: string): void;
}) {
  return (
    <header className="topbar">
      {/* The homepage is the practice app. */}
      <a href="/" className="brand">
        {brand}
      </a>
      <div className="topbar-tools">
        <nav className="topnav" aria-label={navLabel}>
          {SITE_SECTIONS.filter(({ hidden }) => !hidden).map(({ id, href }) => (
            <a
              key={id}
              href={href}
              className="navlink"
              aria-current={id === current ? 'page' : undefined}
              onClick={onNavigate && ((e) => onNavigate(e, href))}
            >
              {labels[id]}
            </a>
          ))}
        </nav>
        <RadioGroup className="group" label={languageLabel}>
          <GlobeIcon />
          {languages.map((l) => (
            <button
              key={l.id}
              type="button"
              className="chip"
              lang={l.tag}
              role="radio"
              aria-checked={l.id === language}
              tabIndex={l.id === language ? 0 : -1}
              // The name holds the shown code too, so "EN" / "VI" is what a voice user can say.
              aria-label={`${l.name} (${l.id.toUpperCase()})`}
              onClick={() => onLanguage(l.id)}
            >
              {l.id.toUpperCase()}
            </button>
          ))}
        </RadioGroup>
      </div>
    </header>
  );
}
