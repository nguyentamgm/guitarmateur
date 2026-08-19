import { useMemo } from 'react';
import { createTranslator, MESSAGES, type LocaleId, type Translate, type TranslationKey } from '../i18n';

/** Translator bound to a locale, memoized. `en` is the fallback catalog. */
export function useT(language: LocaleId): Translate {
  return useMemo(
    () => createTranslator<TranslationKey>(language, MESSAGES[language] ?? {}, MESSAGES.en),
    [language],
  );
}
