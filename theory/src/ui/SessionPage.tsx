import { Fragment } from 'react';
import { fill } from '../i18n';
import { PARTS, sessionNeighbours, type Session } from '../sessions';
import { useTheory } from './context';
import { Link } from './Link';
import { hrefFor } from './router';
import { SessionBlock } from './sessions/SessionBlock';
import { SessionCheck } from './sessions/SessionCheck';

export function SessionPage({ session }: { session: Session }) {
  const { ui, lang } = useTheory();
  const copy = session.copy[lang];
  const { prev, next } = sessionNeighbours(session.slug);

  return (
    <main className="wrap">
      <section className="hero">
        <Link href={hrefFor({ page: 'path' })} className="back">
          {ui.session.backToPath}
        </Link>
        <h1>{copy.title}</h1>
        <div className="prose">
          <span className="eyebrow">{ui.session.goalLabel}</span>
          <p className="lead">{copy.goal}</p>
        </div>
        <div className="prose muted">
          <span className="eyebrow">{ui.session.needsLabel}</span>
          <p>{copy.needs}</p>
        </div>
        {copy.recap.length > 0 && (
          <div className="prose">
            <span className="eyebrow">{ui.session.recapLabel}</span>
            <ul>
              {copy.recap.map((item, i) => (
                <li key={i}>{item}</li>
              ))}
            </ul>
          </div>
        )}
      </section>

      {PARTS.map((part, i) => {
        const partCopy = copy.parts[part];
        const blocks = session.parts[part];
        return (
          <section key={part} id={part} className="step">
            <div className="step-head prose">
              <span className="num">{fill(ui.session.partLabel, { n: i + 1 })}</span>
              <h2>{partCopy.title}</h2>
            </div>
            <div className="text prose">
              {partCopy.body.map((p, k) => (
                <p key={k}>{p}</p>
              ))}
            </div>
            {blocks.map((block) => {
              const blockCopy = copy.blocks[block.key];
              return (
                <Fragment key={block.key}>
                  {blockCopy?.intro && <p className="prose">{blockCopy.intro}</p>}
                  <SessionBlock session={session} block={block} />
                </Fragment>
              );
            })}
          </section>
        );
      })}

      <SessionCheck session={session} />

      <nav className="lesson-nav" aria-label={ui.lessonNavLabel}>
        <div className="lesson-nav-links">
          {prev && (
            <Link href={hrefFor({ page: 'session', slug: prev.slug })} className="lesson-nav-card prev">
              <span className="eyebrow">{ui.session.prev}</span>
              <span className="lesson-title">{prev.copy[lang].title}</span>
            </Link>
          )}
          <Link
            href={hrefFor(next ? { page: 'session', slug: next.slug } : { page: 'path' })}
            className="lesson-nav-card next"
          >
            <span className="eyebrow">{next ? ui.session.next : ui.session.backToPath}</span>
            <span className="lesson-title">{next ? next.copy[lang].title : ui.pathTitle}</span>
          </Link>
        </div>
      </nav>
      <footer className="foot">{ui.lessonFooter}</footer>
    </main>
  );
}
