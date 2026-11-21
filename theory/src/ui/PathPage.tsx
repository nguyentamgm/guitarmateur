import { fill } from '../i18n';
import { PATH_STAGES, SESSIONS, sessionsOf } from '../sessions';
import { useSessionTicks, useTheory } from './context';
import { Link } from './Link';
import { hrefFor } from './router';
import { isDone, nextSession } from './sessionProgress';

export function PathPage({ missingPath }: { missingPath?: string }) {
  const { ui, lang } = useTheory();
  const ticks = useSessionTicks();
  const next = nextSession(ticks, SESSIONS);
  const anyDone = SESSIONS.some((s) => isDone(ticks, s.slug, s.copy.en.canDo.length));

  return (
    <main className="wrap">
      <section className="hero">
        <span className="eyebrow">{ui.pathEyebrow}</span>
        <h1>{ui.pathTitle}</h1>
        <p className="lead">{ui.pathLead}</p>
        {next ? (
          <div>
            <Link href={hrefFor({ page: 'session', slug: next.slug })} className="btn">
              {anyDone ? fill(ui.pathContinue, { title: next.copy[lang].title }) : ui.pathStart}
            </Link>
          </div>
        ) : (
          <div>
            <p className="prose">{ui.pathAllDone}</p>
            <a href={`/?lang=${lang}`} className="btn">
              {ui.navPractice}
            </a>
          </div>
        )}
        <Link href={hrefFor({ page: 'review' })} className="toc-review">
          {ui.tocReview}
        </Link>
        {missingPath !== undefined && (
          <p className="notice" role="status">
            {fill(ui.notFound, { path: missingPath })}
          </p>
        )}
      </section>

      {(['accompany', 'lead'] as const).map((path) => (
        <section key={path} className="contents">
          <h2>{path === 'lead' ? ui.pathLeadTitle : ui.pathOneTitle}</h2>
          {path === 'lead' && <p className="prose">{ui.pathLeadBody}</p>}
          {PATH_STAGES[path].map((stage) => {
            const sessions = sessionsOf(path, stage);
            return (
              <section key={stage} className="contents">
                <h3>{ui.pathStage[stage]}</h3>
                {sessions.length > 0 ? (
                  <ol className="lesson-list">
                    {sessions.map((session) => {
                      const copy = session.copy[lang];
                      const num = SESSIONS.indexOf(session) + 1;
                      const done = isDone(ticks, session.slug, session.copy.en.canDo.length);
                      return (
                        <li key={session.slug}>
                          <Link href={hrefFor({ page: 'session', slug: session.slug })} className="lesson-card">
                            <b className="num">{String(num).padStart(2, '0')}</b>
                            <span className="lesson-title">
                              {copy.title}
                              {done && ' '}
                              {done && <span className="lesson-status done">{ui.session.statusDone}</span>}
                            </span>
                            <span className="lesson-summary">{copy.summary}</span>
                          </Link>
                        </li>
                      );
                    })}
                  </ol>
                ) : (
                  <p className="prose muted">{ui.pathComingSoon}</p>
                )}
              </section>
            );
          })}
        </section>
      ))}

      <div className="contents">
        <Link href={hrefFor({ page: 'library' })} className="toc-review">
          {ui.pathLibraryLink}
        </Link>
      </div>
    </main>
  );
}
