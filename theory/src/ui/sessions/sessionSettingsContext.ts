import { createContext, useContext } from 'react';
import { loadStrumSpeed, saveStrumSpeed, type StrumSpeed } from './strumSpeed';

export interface SessionSettingsContextValue {
  readonly strumSpeed: StrumSpeed;
  readonly setStrumSpeed: (speed: StrumSpeed) => void;
}

export const SessionSettingsContext = createContext<SessionSettingsContextValue | null>(null);

export function useSessionStrumSpeed(): StrumSpeed {
  const ctx = useContext(SessionSettingsContext);
  return ctx ? ctx.strumSpeed : loadStrumSpeed();
}

export function useSetSessionStrumSpeed(): (speed: StrumSpeed) => void {
  const ctx = useContext(SessionSettingsContext);
  return ctx ? ctx.setStrumSpeed : saveStrumSpeed;
}
