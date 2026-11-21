import { parseNote } from '../../core/music';
import { fill } from '../../i18n';
import {
  SESSIONS,
  chordIn,
  sessionNeighbours,
  type Session,
  type SessionPractice,
} from '../../sessions';
import { useSessionTicks, useTheory } from '../context';
import { Link } from '../Link';
import { hrefFor } from '../router';
import { isDone, nextSession } from '../sessionProgress';
import { TrainerLink } from '../TrainerLink';

/** Opens Practice on the session's key and chords. */
function PracticeLink({
  slug,
  practice,
  label,
}: {
  slug: string;
  practice: SessionPractice;
  label?: string;
}) {
  const { ui } = useTheory();
  const chords = practice.bars.map((spec) => chordIn(practice.in, spec));
  return (
    <TrainerLink
      trainerKey={{
        tonic: parseNote(practice.in.tonic),
        scale: practice.scale ?? (practice.in.mode === 'major' ? 'major' : 'naturalMinor'),
      }}
      chords={chords.map((c) => c.chord)}
      boxes={practice.boxes}
      swing={practice.swing}
      progressionKey={slug}
      label={
        label ??
        fill(ui.session.practiceLink, {
          chords: chords.map((c) => c.symbol).join('–'),
          numerals: chords.map((c) => c.roman).join('–'),
        })
      }
    />
  );
}

export function SessionDone({ session }: { session: Session }) {
  const { ui, lang, toggleSessionTick } = useTheory();
  const ticks = useSessionTicks();
  const copy = session.copy[lang];
  const { next } = sessionNeighbours(session.slug);
  const done = isDone(ticks, session.slug, copy.canDo.length);
  const unfinished = nextSession(ticks, SESSIONS);

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
        <div className="prose session-done">
          <p role="status">{unfinished ? ui.session.doneMessage : ui.pathAllDone}</p>
          {unfinished && (
            <Link
              href={hrefFor({ page: 'session', slug: (next ?? unfinished).slug })}
              className="btn"
            >
              {ui.session.nextSession}
            </Link>
          )}
          {session.practice && (
            <PracticeLink
              slug={session.slug}
              practice={session.practice}
              label={copy.practiceLabel}
            />
          )}
          {!unfinished && (
            <>
              <a href={`/?lang=${lang}`}>{ui.navPractice}</a>
              <Link href={hrefFor({ page: 'review' })}>{ui.tocReview}</Link>
            </>
          )}
        </div>
      )}
    </section>
  );
}
