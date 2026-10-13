import type { MouseEvent } from 'react';
import { SiteHeader } from '@shared/ui/SiteHeader';
import { LANGS } from '../i18n';
import { useTheory } from './context';
import { BASE } from './router';

/** Which section of the site a page belongs to: highlighted in the header. */
export type Section = 'lessons' | 'review';

/**
 * The site header (shared/ui/SiteHeader.tsx) with Theory's text. Lessons and Review are Theory's
 * own pages, navigated client-side; Practice and Ear training are other pages, loaded by the link.
 */
export function Header({ section }: { section: Section }) {
  const { ui, lang, setLang, navigate } = useTheory();
  const onNavigate = (e: MouseEvent<HTMLAnchorElement>, href: string) => {
    if (href !== BASE && !href.startsWith(`${BASE}/`)) return;
    if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
    e.preventDefault();
    navigate(href);
  };
  return (
    <SiteHeader
      brand={ui.brand}
      navLabel={ui.navLabel}
      labels={{ lessons: ui.navLessons, review: ui.navReview, practice: ui.navPractice, ear: ui.navEar }}
      current={section}
      languageLabel={ui.langLabel}
      languages={LANGS.map((l) => ({ id: l, tag: l, name: ui.langName[l] }))}
      language={lang}
      onLanguage={setLang}
      onNavigate={onNavigate}
    />
  );
}
