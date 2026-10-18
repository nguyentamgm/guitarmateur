/** A level's words from the strings (i18n/strings.ts `levels`, `play`), looked up by id. */
import type { AnswerId, Level } from '../core/levels';
import type { RoundQuestion } from '../core/round';
import { degreeQuestion } from '../core/stage3';
import type { KindSounds } from '../audio/levelSounds';
import { fill, type LevelText, type PlayText, type UiStrings } from '../i18n';
import { degreeInKey, keyText, noteText } from './labels';

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
  const label = words.answers[id] ?? id;
  // A degree with ♭ or ♯ is also named as said ("♭3 (flat three)"), label first (WCAG 2.5.3).
  const spoken = level.kind === 'degree' ? ui.spoken[id as keyof UiStrings['spoken']] : undefined;
  return {
    label,
    heard: words.heard[id] ?? id,
    icon: ui.answerIcons[id],
    name:
      spoken && /[b#]/.test(id) ? fill(ui.degreeAnswerLabel, { shown: label, spoken }) : undefined,
  };
}

/**
 * What a question was, in the feedback after an answer. From Stage 3 on it names the note's letter
 * in the key ("that was 5: the note E, in the key of A major"); before, it is the answer's words.
 */
export function feedbackHeard(ui: UiStrings, level: Level, q: RoundQuestion): string {
  if (level.kind !== 'degree') return answerWords(ui, level, q.answer).heard;
  const { key, degree } = degreeQuestion(level, q);
  const words = {
    degree: degreeInKey(key, degree),
    note: noteText(key, degree),
    key: keyText(ui, key),
  };
  if (degree === '1') return fill(ui.heardRoot, words);
  return fill(q.answer === 'notRoot' ? ui.heardNotRoot : ui.heardDegree, words);
}
