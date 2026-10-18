/** A level's words from the strings (i18n/strings.ts `levels`, `play`), looked up by id. */
import type { AnswerId, Level } from '../core/levels';
import type { KindSounds } from '../audio/levelSounds';
import type { LevelText, PlayText, UiStrings } from '../i18n';

/** A level can be played once its kind has sounds and it has words (the same keys in every language). */
export const playable = (ui: UiStrings, sounds: KindSounds, level: Level): boolean =>
  sounds[level.kind] !== undefined && ui.play[level.id] !== undefined;

export const levelText = (ui: UiStrings, level: Level): LevelText => ui.levels[level.id]!;

/** A playable level's words (Levels.tsx `playable` checks they are there). */
export const playText = (ui: UiStrings, level: Level): PlayText => ui.play[level.id]!;

/** An answer button's words and icon, and what that answer sounds like. */
export function answerWords(ui: UiStrings, level: Level, answer: AnswerId) {
  const words = playText(ui, level);
  const id = String(answer);
  return { label: words.answers[id] ?? id, heard: words.heard[id] ?? id, icon: ui.answerIcons[id] };
}
