/**
 * The ear trainer's address for Practice's key and scale (#225): "Train your ear on these notes"
 * in Step 1. The ear trainer is a separate page that Practice never imports: its link format
 * (`/ear?key=&mode=&notes=`, see docs/ear.md) is written here.
 */
import type { LocaleId } from '../i18n';
import type { NoteName, ScaleId } from '../music';

/** A tonic in plain ASCII, as a link writes it: 'A', 'Bb', 'F#' (the address encodes the #). */
const ascii = (n: NoteName): string => n.letter + (n.alter < 0 ? 'b'.repeat(-n.alter) : '#'.repeat(n.alter));

/**
 * Each scale as the ear trainer's mode and notes: a preset where one matches, else the scale's
 * own degrees (Dorian, Mixolydian, major blues have no preset).
 */
export const EAR_NOTES: Readonly<Record<ScaleId, { readonly mode: 'major' | 'minor'; readonly notes: string }>> = {
  minorPentatonic: { mode: 'minor', notes: 'minor-pentatonic' },
  majorPentatonic: { mode: 'major', notes: 'major-pentatonic' },
  blues: { mode: 'minor', notes: 'blues' },
  major: { mode: 'major', notes: 'scale' },
  'natural-minor': { mode: 'minor', notes: 'scale' },
  dorian: { mode: 'minor', notes: '1,2,b3,4,5,6,b7' },
  mixolydian: { mode: 'major', notes: '1,2,3,4,5,6,b7' },
  'major-blues': { mode: 'major', notes: '1,2,b3,3,5,6' },
};

/** `/ear?key=A&mode=minor&notes=minor-pentatonic&lang=en`, in the page's language. */
export function earHref(key: { readonly tonic: NoteName; readonly scaleId: ScaleId }, lang: LocaleId): string {
  const { mode, notes } = EAR_NOTES[key.scaleId];
  return `/ear?${new URLSearchParams({ key: ascii(key.tonic), mode, notes, lang }).toString()}`;
}
