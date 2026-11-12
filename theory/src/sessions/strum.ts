export type Stroke = 'down' | 'up';

export interface StrumStep {
  readonly bar: number;
  readonly beat: number;
  readonly click: 'accent' | 'plain' | null;
  readonly stroke: Stroke | null;
}

/** 'D' down, 'U' up, '-' nothing: one character per eighth note of a bar. */
export const defaultPattern = (beatsPerBar: 3 | 4): string => 'D-'.repeat(beatsPerBar);

export function strumSteps(bars: number, beatsPerBar: 3 | 4, pattern: string): StrumStep[] {
  const expectedLength = beatsPerBar * 2;
  if (pattern.length !== expectedLength) {
    throw new Error(
      `Pattern length ${pattern.length} does not match expected ${expectedLength} eighth notes for ${beatsPerBar} beats per bar: "${pattern}"`,
    );
  }

  for (let i = 0; i < pattern.length; i++) {
    const ch = pattern[i]!;
    if (ch !== 'D' && ch !== 'U' && ch !== '-') {
      throw new Error(`Unknown pattern character '${ch}' at index ${i} in "${pattern}". Expected 'D', 'U', or '-'.`);
    }
  }

  const steps: StrumStep[] = [];
  for (let bar = 0; bar < bars; bar++) {
    for (let e = 0; e < expectedLength; e++) {
      const beat = Math.floor(e / 2);
      const isEven = e % 2 === 0;
      const click: 'accent' | 'plain' | null = isEven ? (beat === 0 ? 'accent' : 'plain') : null;
      const ch = pattern[e]!;
      const stroke: Stroke | null = ch === 'D' ? 'down' : ch === 'U' ? 'up' : null;

      steps.push({
        bar,
        beat,
        click,
        stroke,
      });
    }
  }

  return steps;
}
