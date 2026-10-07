import { useCallback, useEffect, useMemo, useState } from 'react';
import { createPlayer, type Player } from '../core/audio';
import { UI, loadLang, saveLang, type Lang } from '../i18n';
import { findLesson } from '../lessons';
import { ContentsPage } from './ContentsPage';
import { Ctx, type TheoryContext } from './context';
import { Header } from './Header';
import { LessonPage } from './LessonPage';
import { loadProgress, recordAnswer, saveProgress, type Progress, type QuizId } from './progress';
import { ReviewPage } from './ReviewPage';
import { parseRoute } from './router';

const isLesson = (slug: string) => findLesson(slug) !== undefined;

export function App({ player: given }: { player?: Player } = {}) {
  const [lang, setLangState] = useState<Lang>(() => loadLang());
  const [path, setPath] = useState(() => window.location.pathname);
  const [player] = useState(() => given ?? createPlayer());
  const [soundOn, setSoundState] = useState(true);
  const [progress, setProgress] = useState<Progress>(() => loadProgress());
  const recordQuiz = useCallback((id: QuizId, right: boolean) => {
    setProgress((p) => recordAnswer(p, id, right, Date.now()));
  }, []);
  // Save after every change; the first run only writes back what was just read.
  useEffect(() => saveProgress(progress), [progress]);

  useEffect(() => {
    const onPop = () => setPath(window.location.pathname);
    window.addEventListener('popstate', onPop);
    return () => window.removeEventListener('popstate', onPop);
  }, []);

  const navigate = useCallback((href: string) => {
    window.history.pushState(null, '', href);
    setPath(window.location.pathname);
    const hash = new URL(href, window.location.href).hash.slice(1);
    if (!hash) return window.scrollTo(0, 0);
    // The target page renders on the next frame; scroll to the step once it is there.
    requestAnimationFrame(() => document.getElementById(hash)?.scrollIntoView());
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
      progress,
      recordQuiz,
    }),
    [lang, ui, player, soundOn, navigate, progress, recordQuiz],
  );

  return (
    <Ctx.Provider value={ctx}>
      <Header />
      {lesson ? (
        <LessonPage lesson={lesson} />
      ) : route.page === 'review' ? (
        <ReviewPage />
      ) : (
        <ContentsPage missingPath={route.page === 'notFound' ? route.path : undefined} />
      )}
    </Ctx.Provider>
  );
}
