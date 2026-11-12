import { fill } from '../i18n';
import { SESSIONS, STAGES, sessionsOf } from '../sessions';
import { useTheory } from './context';
import { Link } from './Link';
import { hrefFor } from './router';

export function PathPage({ missingPath }: { missingPath?: string }) {
  const { ui, lang } = useTheory();
  const pathSessions = sessionsOf('accompany');
  const firstSession = pathSessions[0];

  return (
    <main className="wrap">
      <section className="hero">
        <span className="eyebrow">{ui.pathEyebrow}</span>
        <h1>{ui.pathTitle}</h1>
        <p className="lead">{ui.pathLead}</p>
        {firstSession && (
          <div>
            <Link href={hrefFor({ page: 'session', slug: firstSession.slug })} className="btn">
              {ui.pathStart}
            </Link>
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

      {STAGES.map((stage) => {
        const sessions = sessionsOf('accompany', stage);
        return (
          <section key={stage} className="contents">
            <h2>{ui.pathStage[stage]}</h2>
            {sessions.length > 0 ? (
              <ol className="lesson-list">
                {sessions.map((session) => {
                  const copy = session.copy[lang];
                  const num = SESSIONS.indexOf(session) + 1;
                  return (
                    <li key={session.slug}>
                      <Link href={hrefFor({ page: 'session', slug: session.slug })} className="lesson-card">
                        <b className="num">{String(num).padStart(2, '0')}</b>
                        <span className="lesson-title">{copy.title}</span>
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

      <section className="contents">
        <h2>{ui.pathLeadTitle}</h2>
        <p className="prose">{ui.pathLeadBody}</p>
        <Link href={hrefFor({ page: 'library' })} className="toc-review">
          {ui.pathLibraryLink}
        </Link>
      </section>
    </main>
  );
}
