import { SiteHeader } from '@shared/ui/SiteHeader';
import { LANGS, type Lang, type UiStrings } from '../i18n';

/** The site header (shared/ui/SiteHeader.tsx) with the ear trainer's text; this page is Ear training. */
export function Header({ ui, lang, onLang }: { ui: UiStrings; lang: Lang; onLang(lang: Lang): void }) {
  return (
    <div className="site-top">
      <SiteHeader
        brand={ui.brand}
        navLabel={ui.navLabel}
        labels={{ lessons: ui.navLessons, review: ui.navReview, practice: ui.navPractice, ear: ui.navEar }}
        current="ear"
        languageLabel={ui.langLabel}
        languages={LANGS.map((l) => ({ id: l, tag: l, name: ui.langName[l] }))}
        language={lang}
        onLanguage={onLang}
      />
    </div>
  );
}
