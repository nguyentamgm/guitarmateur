/** /theory/review: every lesson quiz with its stored score, the one to do next first. */
import { fill } from '../i18n';
import { findLesson } from '../lessons';
import { useProgress, useTheory } from './context';
import { Link } from './Link';
import { QUIZZES, accuracy, daysSince, nextReview, type QuizRecord } from './progress';
import { BASE, hrefFor } from './router';

export function ReviewPage() {
  const { ui, lang } = useTheory();
  const progress = useProgress();
  const now = Date.now();
  const items = nextReview(progress, now);

  const last = (r: QuizRecord) => {
    const days = daysSince(r, now);
    return days === 0 ? ui.reviewLastToday : days === 1 ? ui.reviewLastYesterday : fill(ui.reviewLastDays, { days });
  };

  return (
    <main className="wrap">
      <section className="hero">
        <Link href={BASE} className="back">
          {ui.backToContents}
        </Link>
        <h1>{ui.reviewTitle}</h1>
        <p className="lead">{ui.reviewLead}</p>
      </section>
      <ol className="review-list">
        {items.map((item, i) => {
          const quiz = QUIZZES.find((q) => q.id === item.id)!;
          const lesson = findLesson(quiz.slug)!;
          const copy = lesson.copy[lang];
          const steps = copy.steps as Readonly<Record<string, { title: string }>>;
          const r = item.record;
          const acc = accuracy(r);
          return (
            <li key={item.id} className={i === 0 ? 'review-card next' : 'review-card'}>
              <span className={`reason ${item.reason}`}>{i === 0 ? ui.reviewNext : ui.reviewReason[item.reason]}</span>
              <h2>{steps[quiz.step]!.title}</h2>
              <p className="muted">{copy.title}</p>
              {r && acc !== null && (
                <p className="small">
                  {fill(ui.reviewStats, { acc: Math.round(acc * 100), n: r.recent.length, best: r.bestStreak })}
                  <br />
                  {last(r)}
                </p>
              )}
              <Link href={`${hrefFor({ page: 'lesson', slug: quiz.slug })}#${quiz.step}`} className="btn">
                {ui.reviewOpen}
              </Link>
            </li>
          );
        })}
      </ol>
      <footer className="foot">{ui.reviewFooter}</footer>
    </main>
  );
}
