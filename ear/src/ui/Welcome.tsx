/**
 * The welcome, first visit only (docs/ear-levels.md "Welcome"), and its sound check: one guitar
 * note, then "Can you hear the guitar?". When sound cannot start at all, it says so instead.
 */
import { useState } from 'react';
import type { UiStrings } from '../i18n';

export function Welcome({
  ui,
  noAudio,
  onCheck,
  onDone,
}: {
  ui: UiStrings;
  /** Sound could not start in this browser. */
  noAudio: boolean;
  /** Play the sound check's note. */
  onCheck(): void;
  /** "Yes, I can hear it": on to the map, never shown again. */
  onDone(): void;
}) {
  const [step, setStep] = useState<'welcome' | 'asking' | 'help'>('welcome');
  const check = () => {
    onCheck();
    setStep('asking');
  };

  return (
    <section className="board lv-screen" aria-labelledby="lv-welcome">
      <h2 id="lv-welcome" tabIndex={-1}>
        {ui.welcomeTitle}
      </h2>
      {step === 'welcome' && (
        <>
          <p>{ui.welcomeLines.noMusic}</p>
          <p>{ui.welcomeLines.time}</p>
          <p>{ui.welcomeLines.headphones}</p>
        </>
      )}
      <div aria-live="polite">
        {step !== 'welcome' && noAudio && <p className="lv-warn">{ui.levelsNoAudio}</p>}
        {step === 'asking' && !noAudio && <p className="lv-big">{ui.soundCheckQuestion}</p>}
        {step === 'help' && !noAudio && <p className="lv-warn">{ui.soundCheckHelp}</p>}
      </div>
      <div className="lv-actions">
        {step === 'welcome' && (
          <button type="button" className="btn lv-main" onClick={check}>
            {ui.checkSound}
          </button>
        )}
        {step === 'asking' && !noAudio && (
          <>
            <button type="button" className="btn lv-main" onClick={onDone}>
              {ui.yes}
            </button>
            <button type="button" className="btn ghost lv-main" onClick={() => setStep('help')}>
              {ui.no}
            </button>
          </>
        )}
        {(step === 'help' || (step === 'asking' && noAudio)) && (
          <button type="button" className="btn lv-main" onClick={check}>
            {ui.tryAgain}
          </button>
        )}
      </div>
    </section>
  );
}
