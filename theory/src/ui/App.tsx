import { useCallback, useEffect, useMemo, useState } from 'react';
import { createPlayer, type Player } from '../core/audio';
import { UI, loadLang, saveLang, type Lang } from '../i18n';
import { findLesson } from '../lessons';
import { ContentsPage } from './ContentsPage';
import { Ctx, ProgressCtx, type TheoryContext } from './context';
import { Header } from './Header';
import { LessonPage } from './LessonPage';
import {
  PROGRESS_STORAGE_KEY,
  loadProgress,
  storeAnswer,
  type Progress,
  type QuizId,
} from './progress';
import { ReviewPage } from './ReviewPage';
import { parseRoute } from './router';

const isLesson = (slug: string) => findLesson(slug) !== undefined;

export function App({ player: given }: { player?: Player } = {}) {
  const [lang, setLangState] = useState<Lang>(() => loadLang());
  const [path, setPath] = useState(() => window.location.pathname);
  const [player] = useState(() => given ?? createPlayer());
  const [soundOn, setSoundState] = useState(true);
  const [progress, setProgress] = useState<Progress>(() => loadProgress());
  // Each answer goes straight through storage, so another tab's answers are never overwritten.
  const recordQuiz = useCallback(
    (id: QuizId, right: boolean) => setProgress(storeAnswer(id, right, Date.now())),
    [],
  );
  useEffect(() => {
    const onStorage = (e: StorageEvent) => {
      if (e.key === PROGRESS_STORAGE_KEY || e.key === null) setProgress(loadProgress());
    };
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, []);

  // A link with a #step (a shared take, a review card opened in a new tab) lands on that step.
  useEffect(() => {
    const id = window.location.hash.slice(1);
    if (id) requestAnimationFrame(() => document.getElementById(id)?.scrollIntoView());
  }, []);

  useEffect(() => {
    const onPop = () => setPath(window.location.pathname);
    window.addEventListener('popstate', onPop);
    return () => window.removeEventListener('popstate', onPop);
  }, []);

  const navigate = useCallback((href: string) => {
    window.history.pushState(null, '', href);
    setPath(window.location.pathname);
    const hash = new URL(href, window.location.href).hash.slice(1);
    // The target page renders on the next frame; scroll to the step once it is there, or to the top.
    requestAnimationFrame(() => {
      const target = hash ? document.getElementById(hash) : null;
      if (target) target.scrollIntoView();
      else window.scrollTo(0, 0);
    });
  }, []);

  const route = parseRoute(path, isLesson);
  const lesson = route.page === 'lesson' ? findLesson(route.slug) : undefined;
  const ui = UI[lang];

  useEffect(() => {
    document.documentElement.lang = lang;
    document.title = lesson
      ? `${lesson.copy[lang].title} · ${ui.appName}`
      : route.page === 'review'
        ? `${ui.reviewTitle} · ${ui.appName}`
        : ui.appName;
  }, [lang, lesson, ui, route.page]);

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
      recordQuiz,
    }),
    [lang, ui, player, soundOn, navigate, recordQuiz],
  );

  return (
    <Ctx.Provider value={ctx}>
      <ProgressCtx.Provider value={progress}>
        <Header />
        {lesson ? (
          <LessonPage lesson={lesson} />
        ) : route.page === 'review' ? (
          <ReviewPage />
        ) : (
          <ContentsPage missingPath={route.page === 'notFound' ? route.path : undefined} />
        )}
      </ProgressCtx.Provider>
    </Ctx.Provider>
  );
}
