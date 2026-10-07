import { fill } from '../i18n';
import { LESSONS, lessonConcepts } from '../lessons';
import { useTheory } from './context';
import { Link } from './Link';
import { hrefFor } from './router';

export function ContentsPage({ missingPath }: { missingPath?: string }) {
  const { ui, lang } = useTheory();
  return (
    <main className="wrap">
      <section className="hero">
        <span className="eyebrow">{ui.tocEyebrow}</span>
        <h1>{ui.tocTitle}</h1>
        <p className="lead">{ui.tocLead}</p>
        <Link href={hrefFor({ page: 'review' })} className="toc-review">
          {ui.tocReview}
        </Link>
        {missingPath !== undefined && (
          <p className="notice" role="status">
            {fill(ui.notFound, { path: missingPath })}
          </p>
        )}
      </section>
      <section className="contents">
        <h2>{ui.tocLessons}</h2>
        <ol className="lesson-list">
          {LESSONS.map((lesson, i) => {
            const copy = lesson.copy[lang];
            return (
              <li key={lesson.slug}>
                <Link href={hrefFor({ page: 'lesson', slug: lesson.slug })} className="lesson-card">
                  <b className="num">{String(i + 1).padStart(2, '0')}</b>
                  <span className="lesson-title">{copy.title}</span>
                  <span className="lesson-summary">{copy.summary}</span>
                  <span className="lesson-ids">{fill(ui.tocConcepts, { ids: lessonConcepts(lesson).join(' · ') })}</span>
                </Link>
              </li>
            );
          })}
        </ol>
      </section>
    </main>
  );
}
