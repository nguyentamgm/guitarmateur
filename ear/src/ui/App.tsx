import { useCallback, useEffect, useRef, useState } from 'react';
import { createPlayer, type Player } from '@shared/core/audio';
import type { Answer } from '../core/stats';
import { LANG_STORAGE_KEY, UI, linkLang, loadLang, saveLang, type Lang } from '../i18n';
import { loadEar, onStoredChange, storeAnswer, type EarData } from '../store/store';
import { Header } from './Header';
import { Trainer } from './Trainer';

/** `next`, keeping `prev`'s settings object when they are the same, so the trainer sees no change. */
const keepSettings = (prev: EarData, next: EarData): EarData =>
  JSON.stringify(prev.settings) === JSON.stringify(next.settings)
    ? { ...next, settings: prev.settings }
    : next;

/** The page. `player` is for tests; the page makes its own, which creates no audio until Start. */
export function App({ player: given }: { player?: Player }) {
  const [player] = useState(() => given ?? createPlayer());
  const [data, setData] = useState<EarData>(() => loadEar());
  const dataRef = useRef(data);

  // Settings and stats changed in another tab show here too.
  useEffect(
    () =>
      onStoredChange((d) => {
        dataRef.current = keepSettings(dataRef.current, d);
        setData(dataRef.current);
      }),
    [],
  );

  // Recorded here, not in a state updater, so each first answer is stored exactly once.
  const onScore = useCallback((answer: Answer) => {
    dataRef.current = keepSettings(
      dataRef.current,
      storeAnswer(dataRef.current, answer, Date.now()),
    );
    setData(dataRef.current);
  }, []);

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
        <Trainer ui={ui} player={player} settings={data.settings} onScore={onScore} />
        <p className="ear-footer">{ui.footer}</p>
      </main>
    </>
  );
}
