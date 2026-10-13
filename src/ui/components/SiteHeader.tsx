import { LOCALES, type LocaleId } from '../../i18n';
import { SiteHeader as SharedSiteHeader } from '@shared/ui/SiteHeader';
import { useT } from '../useT';

const LANGUAGES = Object.values(LOCALES).map((l) => ({ id: l.id, tag: l.tag, name: l.endonym }));

/**
 * The site header (shared/ui/SiteHeader.tsx) with Practice's text. This page is Practice, so
 * Practice is the current section.
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
      <SharedSiteHeader
        brand={t('nav.brand')}
        navLabel={t('nav.label')}
        labels={{ lessons: t('nav.lessons'), review: t('nav.review'), practice: t('nav.practice'), ear: t('nav.ear') }}
        current="practice"
        languageLabel={t('common.language')}
        languages={LANGUAGES}
        language={language}
        onLanguage={onLanguage}
      />
    </div>
  );
}
