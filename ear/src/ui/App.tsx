import { useEffect, useState } from 'react';
import { LANG_STORAGE_KEY, UI, linkLang, loadLang, saveLang, type Lang } from '../i18n';
import { Header } from './Header';

export function App() {
  // A link's ?lang= wins for this visit, without being remembered.
  const [lang, setLang] = useState<Lang>(() => linkLang(window.location.search) ?? loadLang());
  const ui = UI[lang];

  // The language is shared with the other pages: a change in another tab shows here too.
  useEffect(() => {
    const onStorage = (e: StorageEvent) => {
      if (e.key === LANG_STORAGE_KEY || e.key === null) setLang(loadLang());
    };
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, []);

  // Take ?lang= off the address, so a reload or a bookmark doesn't override a later choice.
  useEffect(() => {
    const url = new URL(window.location.href);
    if (!url.searchParams.has('lang')) return;
    url.searchParams.delete('lang');
    window.history.replaceState(window.history.state, '', url.pathname + url.search + url.hash);
  }, []);

  useEffect(() => {
    document.documentElement.lang = lang;
    document.title = ui.appName;
  }, [lang, ui]);

  return (
    <>
      <Header
        ui={ui}
        lang={lang}
        onLang={(l) => {
          saveLang(l);
          setLang(l);
        }}
      />
      <main className="ear-page">
        <div className="ear-head">
          <div className="ear-kicker">{ui.kicker}</div>
          <h1>{ui.title}</h1>
          <p className="ear-lead">{ui.lead}</p>
        </div>
        <section className="board">
          <p>{ui.soon}</p>
        </section>
        <p className="ear-footer">{ui.footer}</p>
      </main>
    </>
  );
}
