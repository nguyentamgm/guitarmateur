import type { MouseEvent } from 'react';
import { SiteHeader } from '@shared/ui/SiteHeader';
import type { SiteSection } from '@shared/ui/siteSections';
import { LANGS } from '../i18n';
import { useTheory } from './context';
import { isPlainClick } from './plainClick';
import { BASE } from './router';

/** Which section of the site a page belongs to: highlighted in the header. */
export type Section = Extract<SiteSection, 'lessons' | 'review'>;

/**
 * The site header (shared/ui/SiteHeader.tsx) with Theory's text. Lessons and Review are Theory's
 * own pages, navigated client-side; Practice and Ear training are other pages, loaded by the link.
 */
export function Header({ section }: { section: Section }) {
  const { ui, lang, setLang, navigate } = useTheory();
  const onNavigate = (e: MouseEvent<HTMLAnchorElement>, href: string) => {
    if (href !== BASE && !href.startsWith(`${BASE}/`)) return;
    if (!isPlainClick(e)) return;
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
