import { useCallback, useEffect, useMemo, useState } from 'react';
import { createPlayer, type Player } from '../core/audio';
import { UI, loadLang, saveLang, type Lang } from '../i18n';
import { findLesson } from '../lessons';
import { ContentsPage } from './ContentsPage';
import { Ctx, type TheoryContext } from './context';
import { Header } from './Header';
import { LessonPage } from './LessonPage';
import { parseRoute } from './router';

const isLesson = (slug: string) => findLesson(slug) !== undefined;

export function App({ player: given }: { player?: Player } = {}) {
  const [lang, setLangState] = useState<Lang>(() => loadLang());
  const [path, setPath] = useState(() => window.location.pathname);
  const [player] = useState(() => given ?? createPlayer());
  const [soundOn, setSoundState] = useState(true);

  useEffect(() => {
    const onPop = () => setPath(window.location.pathname);
    window.addEventListener('popstate', onPop);
    return () => window.removeEventListener('popstate', onPop);
  }, []);

  const navigate = useCallback((href: string) => {
    window.history.pushState(null, '', href);
    setPath(window.location.pathname);
    window.scrollTo(0, 0);
  }, []);

  const route = parseRoute(path, isLesson);
  const lesson = route.page === 'lesson' ? findLesson(route.slug) : undefined;
  const ui = UI[lang];

  useEffect(() => {
    document.documentElement.lang = lang;
    document.title = lesson ? `${lesson.copy[lang].title} · ${ui.appName}` : ui.appName;
  }, [lang, lesson, ui]);

  const ctx = useMemo<TheoryContext>(
    () => ({
      lang,
      ui,
      setLang: (l) => {
        saveLang(l);
        setLangState(l);
      },
      player,
      soundOn,
      setSoundOn: (on) => {
        player.setEnabled(on);
        setSoundState(on);
      },
      navigate,
    }),
    [lang, ui, player, soundOn, navigate],
  );

  return (
    <Ctx.Provider value={ctx}>
      <Header />
      {lesson ? (
        <LessonPage lesson={lesson} />
      ) : (
        <ContentsPage missingPath={route.page === 'notFound' ? route.path : undefined} />
      )}
    </Ctx.Provider>
  );
}
