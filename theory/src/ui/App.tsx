import { useCallback, useEffect, useMemo, useState } from 'react';
import { createPlayer, type Player } from '../core/audio';
import { LANG_STORAGE_KEY, UI, linkLang, loadLang, saveLang, type Lang } from '../i18n';
import { findLesson } from '../lessons';
import { findSession } from '../sessions';
import { Ctx, ProgressCtx, SessionTicksCtx, type TheoryContext } from './context';
import { Header } from './Header';
import { LessonPage } from './LessonPage';
import { LibraryPage } from './LibraryPage';
import { PathPage } from './PathPage';
import { PlayStatus } from './PlayStatus';
import {
  PROGRESS_STORAGE_KEY,
  loadProgress,
  storeAnswer,
  type Progress,
  type QuizId,
} from './progress';
import { ReviewPage } from './ReviewPage';
import { parseRoute } from './router';
import { SessionPage } from './SessionPage';
import {
  SESSIONS_STORAGE_KEY,
  loadTicks,
  storeToggle,
  type SessionTicks,
} from './sessionProgress';

const isLesson = (slug: string) => findLesson(slug) !== undefined;
const isSession = (slug: string) => findSession(slug) !== undefined;

/** Once the page has rendered (next frame), scroll to the step with this id, or to the top. */
function scrollToHash(id: string): void {
  requestAnimationFrame(() => {
    const target = id ? document.getElementById(id) : null;
    if (target) target.scrollIntoView();
    else window.scrollTo(0, 0);
  });
}

export function App({ player: given }: { player?: Player } = {}) {
  // A link's ?lang= (from a practice-app lesson link) wins for this visit, without being remembered.
  const [lang, setLangState] = useState<Lang>(() => linkLang(window.location.search) ?? loadLang());
  const [path, setPath] = useState(() => window.location.pathname);
  const [player] = useState(() => given ?? createPlayer());
  const [progress, setProgress] = useState<Progress>(() => loadProgress());
  const [ticks, setTicks] = useState<SessionTicks>(() => loadTicks());
  // Each answer goes straight through storage, so another tab's answers are never overwritten.
  const recordQuiz = useCallback(
    (id: QuizId, right: boolean) => setProgress(storeAnswer(id, right, Date.now())),
    [],
  );
  const toggleSessionTick = useCallback(
    (slug: string, index: number) => setTicks(storeToggle(slug, index)),
    [],
  );
  useEffect(() => {
    const onStorage = (e: StorageEvent) => {
      if (e.key === PROGRESS_STORAGE_KEY || e.key === null) setProgress(loadProgress());
      if (e.key === SESSIONS_STORAGE_KEY || e.key === null) setTicks(loadTicks());
      // The language is shared with the practice app: a change in another tab shows here too.
      if (e.key === LANG_STORAGE_KEY || e.key === null) setLangState(loadLang());
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

  // A link with a #step (a shared take, a review card opened in a new tab) lands on that step.
  useEffect(() => {
    if (window.location.hash) scrollToHash(window.location.hash.slice(1));
  }, []);

  useEffect(() => {
    const onPop = () => setPath(window.location.pathname);
    window.addEventListener('popstate', onPop);
    return () => window.removeEventListener('popstate', onPop);
  }, []);

  const navigate = useCallback((href: string) => {
    window.history.pushState(null, '', href);
    setPath(window.location.pathname);
    scrollToHash(new URL(href, window.location.href).hash.slice(1));
  }, []);

  const route = parseRoute(path, isLesson, isSession);
  const lesson = route.page === 'lesson' ? findLesson(route.slug) : undefined;
  const session = route.page === 'session' ? findSession(route.slug) : undefined;
  const ui = UI[lang];

  useEffect(() => {
    document.documentElement.lang = lang;
    document.title = lesson
      ? `${lesson.copy[lang].title} · ${ui.appName}`
      : session
        ? `${session.copy[lang].title} · ${ui.appName}`
        : route.page === 'library'
          ? `${ui.libraryTitle} · ${ui.appName}`
          : route.page === 'review'
            ? `${ui.reviewTitle} · ${ui.appName}`
            : ui.appName;
  }, [lang, lesson, session, ui, route.page]);

  const ctx = useMemo<TheoryContext>(
    () => ({
      lang,
      ui,
      setLang: (l) => {
        saveLang(l);
        setLangState(l);
      },
      player,
      navigate,
      recordQuiz,
      toggleSessionTick,
    }),
    [lang, ui, player, navigate, recordQuiz, toggleSessionTick],
  );

  return (
    <Ctx.Provider value={ctx}>
      <ProgressCtx.Provider value={progress}>
        <SessionTicksCtx.Provider value={ticks}>
          <Header section={route.page === 'review' ? 'review' : 'lessons'} />
          <PlayStatus />
          {lesson ? (
            <LessonPage lesson={lesson} />
          ) : session ? (
            <SessionPage session={session} />
          ) : route.page === 'library' ? (
            <LibraryPage />
          ) : route.page === 'review' ? (
            <ReviewPage />
          ) : (
            <PathPage missingPath={route.page === 'notFound' ? route.path : undefined} />
          )}
        </SessionTicksCtx.Provider>
      </ProgressCtx.Provider>
    </Ctx.Provider>
  );
}
