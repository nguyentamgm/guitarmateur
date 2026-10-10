/**
 * The page's one audio engine (one AudioContext), shared by lick playback (`useTransport`) and the
 * notes clicked on a neck (`notePlayer`), so the volume sliders and the sound toggle reach both.
 * Created on first use, which is always a user gesture (a click), as browsers require; it lives as
 * long as the page.
 */
import { createEngine, type AudioEngine } from '../audio';

let engine: AudioEngine | null = null;

/** The engine, created now if needed. Throws where Web Audio is missing (callers check first). */
export function getEngine(): AudioEngine {
  engine ??= createEngine();
  return engine;
}

/** The engine if something already created it, else null (never creates one). */
export function peekEngine(): AudioEngine | null {
  return engine;
}

/** Test hook: forget the engine. */
export function resetEngineForTests(): void {
  engine = null;
}
