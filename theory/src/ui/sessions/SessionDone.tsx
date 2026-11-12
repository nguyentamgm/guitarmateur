import { sessionNeighbours, type Session } from '../../sessions';
import { useSessionTicks, useTheory } from '../context';
import { Link } from '../Link';
import { hrefFor } from '../router';
import { isDone } from '../sessionProgress';

export function SessionDone({ session }: { session: Session }) {
  const { ui, lang, toggleSessionTick } = useTheory();
  const ticks = useSessionTicks();
  const copy = session.copy[lang];
  const { next } = sessionNeighbours(session.slug);
  const done = isDone(ticks, session.slug, copy.canDo.length);

  return (
    <section id="done" className="step">
      <div className="step-head prose">
        <h2>{ui.session.canDoTitle}</h2>
      </div>
      <p className="prose lead">{ui.session.canDoLead}</p>
      <div className="checklist prose">
        {copy.canDo.map((item, index) => {
          const checked = (ticks[session.slug] ?? []).includes(index);
          return (
            <label key={index}>
              <input
                type="checkbox"
                checked={checked}
                onChange={() => toggleSessionTick(session.slug, index)}
              />{' '}
              {item}
            </label>
          );
        })}
      </div>
      {done && (
        <div className="prose">
          <p role="status">{ui.session.doneMessage}</p>
          {next ? (
            <Link href={hrefFor({ page: 'session', slug: next.slug })} className="btn">
              {ui.session.nextSession}
            </Link>
          ) : (
            <Link href={hrefFor({ page: 'path' })} className="btn">
              {ui.session.backToPath}
            </Link>
          )}
        </div>
      )}
    </section>
  );
}
