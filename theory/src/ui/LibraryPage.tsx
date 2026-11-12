import { fill } from '../i18n';
import { LESSONS, conceptName, lessonConcepts } from '../lessons';
import { useProgress, useTheory } from './context';
import { Link } from './Link';
import { lessonStatus } from './progress';
import { hrefFor } from './router';

export function LibraryPage() {
  const { ui, lang } = useTheory();
  const progress = useProgress();
  return (
    <main className="wrap">
      <section className="hero">
        <Link href={hrefFor({ page: 'path' })} className="back">
          {ui.backToPath}
        </Link>
        <h1>{ui.libraryTitle}</h1>
        <p className="lead">{ui.libraryLead}</p>
      </section>
      <section className="contents">
        <h2>{ui.tocLessons}</h2>
        <ol className="lesson-list">
          {LESSONS.map((lesson, i) => {
            const copy = lesson.copy[lang];
            const status = lessonStatus(progress, lesson.slug);
            return (
              <li key={lesson.slug}>
                <Link href={hrefFor({ page: 'lesson', slug: lesson.slug })} className="lesson-card">
                  <b className="num">{String(i + 1).padStart(2, '0')}</b>
                  <span className="lesson-title">
                    {copy.title}
                    {status && ' '}
                    {status && <span className={`lesson-status ${status}`}>{ui.tocStatus[status]}</span>}
                  </span>
                  <span className="lesson-summary">{copy.summary}</span>
                  <span className="lesson-ids">
                    {fill(ui.tocConcepts, {
                      names: lessonConcepts(lesson)
                        .map((id) => conceptName(id, lang))
                        .join(' · '),
                    })}
                  </span>
                </Link>
              </li>
            );
          })}
        </ol>
      </section>
    </main>
  );
}
