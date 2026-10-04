import { fill } from '../i18n';
import type { Lesson } from '../lessons';
import { useTheory } from './context';
import { LessonScene } from './lessons/LessonScene';
import { Link } from './Link';
import { BASE } from './router';

export function LessonPage({ lesson }: { lesson: Lesson }) {
  const { ui, lang } = useTheory();
  const copy = lesson.copy[lang];
  return (
    <main className="wrap">
      <section className="hero">
        <Link href={BASE} className="back">
          {ui.backToContents}
        </Link>
        <h1>{copy.title}</h1>
        <p className="lead">{copy.lead}</p>
        <ol className="steps-index">
          {lesson.steps.map((s, i) => (
            <li key={s.id}>
              <a href={`#${s.id}`}>
                <b>{i + 1}</b> {copy.steps[s.id]!.title}
              </a>
            </li>
          ))}
        </ol>
      </section>

      {lesson.steps.map((s, i) => {
        const step = copy.steps[s.id]!;
        return (
          <section key={s.id} id={s.id} className="step">
            <div className="step-head prose">
              <span className="num">
                {fill(ui.stepLabel, { n: i + 1 })} · {s.concepts.join(' · ')}
              </span>
              <h2>{step.title}</h2>
            </div>
            <div className="text prose">
              {step.body.map((p, k) => (
                <p key={k}>{p}</p>
              ))}
            </div>
            <LessonScene slug={lesson.slug} step={s.id} copy={copy.scene} />
            <dl className="takeaways prose">
              <div>
                <dt>{ui.takeaway}</dt>
                <dd>{step.takeaway}</dd>
              </div>
              <div>
                <dt>{ui.tryIt}</dt>
                <dd>{step.tryIt}</dd>
              </div>
            </dl>
          </section>
        );
      })}

      <section className="step">
        <div className="step-head prose">
          <span className="eyebrow">{ui.notYetEyebrow}</span>
          <h2>{copy.notYetTitle}</h2>
        </div>
        <p className="prose muted">{copy.notYetIntro}</p>
        <div className="skip">
          {copy.notYet.map((item) => (
            <div key={item.title}>
              <h3>{item.title}</h3>
              <p>{item.why}</p>
            </div>
          ))}
        </div>
      </section>
      <footer className="foot">{ui.lessonFooter}</footer>
    </main>
  );
}
