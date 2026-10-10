/** The browser's preferred languages, most preferred first. Empty when there is no browser. Never throws. */
export function browserLanguages(): readonly string[] {
  try {
    if (typeof navigator === 'undefined') return [];
    return navigator.languages?.length ? navigator.languages : [navigator.language];
  } catch {
    return [];
  }
}
