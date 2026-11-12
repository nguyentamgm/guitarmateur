import { useState } from 'react';
import type { Session } from '../../sessions';
import { useTheory } from '../context';

export function SessionCheck({ session }: { session: Session }) {
  const { ui, lang } = useTheory();
  const copy = session.copy[lang];
  const [picked, setPicked] = useState<Readonly<Record<number, number>>>({});

  const choose = (qIndex: number, optIndex: number) => {
    setPicked((prev) => ({ ...prev, [qIndex]: optIndex }));
  };

  return (
    <section id="check" className="step">
      <div className="step-head prose">
        <h2>{ui.session.checkTitle}</h2>
      </div>
      <div className="text prose">
        {copy.check.map((q, qIndex) => {
          const selected = picked[qIndex];
          const isRight = selected !== undefined && selected === session.checkAnswers[qIndex];

          return (
            <div key={qIndex} className="checklist prose">
              <p className="question">
                <strong>{q.question}</strong>
              </p>
              <div role="group" aria-label={q.question} className="group">
                {q.options.map((opt, optIndex) => (
                  <button
                    key={optIndex}
                    type="button"
                    className="chip"
                    aria-pressed={selected === optIndex}
                    onClick={() => choose(qIndex, optIndex)}
                  >
                    {opt}
                  </button>
                ))}
              </div>
              <p
                className={selected === undefined ? 'caption' : isRight ? 'caption good' : 'caption warn'}
                aria-live="polite"
              >
                {selected !== undefined && (
                  <>
                    <span>{isRight ? ui.session.checkRight : ui.session.checkWrong}</span>
                    {' '}
                    <span>{q.why}</span>
                  </>
                )}
              </p>
            </div>
          );
        })}
      </div>
    </section>
  );
}
