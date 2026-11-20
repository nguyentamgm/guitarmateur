import { parseNote } from '../../core/music';
import { fill } from '../../i18n';
import { chordIn, sessionNeighbours, type Session, type SessionPractice } from '../../sessions';
import { useSessionTicks, useTheory } from '../context';
import { Link } from '../Link';
import { hrefFor } from '../router';
import { isDone } from '../sessionProgress';
import { TrainerLink } from '../TrainerLink';

/** Opens Practice on the session's key and chords, named in the link: "G–D–Em–C (I–V–vi–IV)". */
function PracticeLink({ slug, practice }: { slug: string; practice: SessionPractice }) {
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
      label={fill(ui.session.practiceLink, {
        chords: chords.map((c) => c.symbol).join('–'),
        numerals: chords.map((c) => c.roman).join('–'),
      })}
    />
  );
}

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
        <div className="prose session-done">
          <p role="status">{ui.session.doneMessage}</p>
          {next ? (
            <Link href={hrefFor({ page: 'session', slug: next.slug })} className="btn">
              {ui.session.nextSession}
            </Link>
          ) : (
            <Link
              href={hrefFor({ page: 'library' })}
              className="btn"
            >
              {ui.pathLibraryLink}
            </Link>
          )}
          {session.practice && <PracticeLink slug={session.slug} practice={session.practice} />}
        </div>
      )}
    </section>
  );
}
