import { useState, type ReactNode } from 'react';
import type { SessionSettingId } from '../../sessions/types';
import { useTheory } from '../context';
import { ChipGroup } from '../controls';
import {
  SessionSettingsContext,
  useSessionStrumSpeed,
  useSetSessionStrumSpeed,
} from './sessionSettingsContext';
import { loadStrumSpeed, saveStrumSpeed, type StrumSpeed } from './strumSpeed';

export function SessionSettingsProvider({ children }: { readonly children: ReactNode }) {
  const [strumSpeed, setStrumSpeedState] = useState<StrumSpeed>(loadStrumSpeed);

  const setStrumSpeed = (speed: StrumSpeed) => {
    setStrumSpeedState(speed);
    saveStrumSpeed(speed);
  };

  return (
    <SessionSettingsContext.Provider value={{ strumSpeed, setStrumSpeed }}>
      {children}
    </SessionSettingsContext.Provider>
  );
}

export function SessionSettingsBar({
  settings,
}: {
  readonly settings?: readonly SessionSettingId[];
}) {
  const { ui } = useTheory();
  const speed = useSessionStrumSpeed();
  const setSpeed = useSetSessionStrumSpeed();

  if (!settings || settings.length === 0) return null;

  return (
    <div className="session-settings-bar" role="region" aria-label={ui.session.strumSpeed}>
      <div className="session-settings-bar-inner">
        {settings.includes('strumSpeed') && (
          <ChipGroup<StrumSpeed>
            label={ui.session.strumSpeed}
            items={[
              { value: 'slow', text: ui.session.strumSpeeds.slow },
              { value: 'medium', text: ui.session.strumSpeeds.medium },
              { value: 'fast', text: ui.session.strumSpeeds.fast },
            ]}
            value={speed}
            onChange={setSpeed}
          />
        )}
      </div>
    </div>
  );
}
