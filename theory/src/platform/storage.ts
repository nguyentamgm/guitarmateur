/**
 * The browser's localStorage, reached safely. The one place Theory touches it: i18n (the language)
 * and ui (progress, tempos, the practice-app link) both go through here. The accessor itself is
 * shared with the practice app (shared/platform/storage.ts).
 */
export { browserStorage, type KeyValue } from '@shared/platform/storage';
