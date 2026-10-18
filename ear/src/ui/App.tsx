import { useCallback, useEffect, useRef, useState } from 'react';
import { createPlayer, type Player } from '@shared/core/audio';
import type { RoundEffect } from '../core/round';
import { LEVEL_SOUNDS, type KindSounds } from '../audio/levelSounds';
import { LANG_STORAGE_KEY, UI, linkLang, loadLang, saveLang, type Lang } from '../i18n';
import {
  loadEar,
  onStoredChange,
  storeRoundEffect,
  storeWelcomed,
  type EarData,
} from '../store/store';
import { Header } from './Header';
import { Levels } from './Levels';

/**
 * The page. `player` and `sounds` are for tests; the page makes its own player, which creates no
 * audio until a first sound is asked for.
 */
export function App({
  player: given,
  sounds = LEVEL_SOUNDS,
}: {
  player?: Player;
  sounds?: KindSounds;
}) {
  const [player] = useState(() => given ?? createPlayer());
  const [data, setData] = useState<EarData>(() => loadEar());
  // A link's ?level=n (Practice's "Train your ear on these notes"), read once on arrival.
  const [startLevel] = useState(() => {
    const n = Number(new URLSearchParams(window.location.search).get('level'));
    return Number.isInteger(n) && n > 0 ? n : null;
  });
  const dataRef = useRef(data);

  // Progress made in another tab shows here too.
  useEffect(
    () =>
      onStoredChange((d) => {
        dataRef.current = d;
        setData(d);
      }),
    [],
  );

  const onWelcomed = useCallback(() => {
    dataRef.current = storeWelcomed(dataRef.current);
    setData(dataRef.current);
  }, []);

  // Recorded here, not in a state updater, so each effect is stored exactly once.
  const onRoundEffect = useCallback((level: number, effect: RoundEffect) => {
    const next = storeRoundEffect(dataRef.current, level, effect);
    if (next === dataRef.current) return;
    dataRef.current = next;
    setData(next);
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

  // Take ?lang= and ?level= off the address, so a reload or a bookmark doesn't override a later
  // choice. Any other parameter (an old link's ?key= &mode= &notes=) is left alone and ignored.
  useEffect(() => {
    const url = new URL(window.location.href);
    const params = ['lang', 'level'].filter((p) => url.searchParams.has(p));
    if (params.length === 0) return;
    for (const p of params) url.searchParams.delete(p);
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
        </div>
        <Levels
          ui={ui}
          lang={lang}
          startLevel={startLevel}
          player={player}
          sounds={sounds}
          welcomed={data.welcomed}
          progress={data.levels}
          onWelcomed={onWelcomed}
          onRoundEffect={onRoundEffect}
        />
        <p className="ear-footer">{ui.footer}</p>
      </main>
    </>
  );
}
