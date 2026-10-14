import { describe, expect, it } from 'vitest';
import { parseNote, type DegreeLabel, type Key } from '@shared/core/music';
import { questionTonic, type Question } from './questions';
import { resolution } from './resolution';
import {
  AUTO_NEXT_BEATS,
  DRONE_LEAD_BEATS,
  initialSession,
  step,
  type Effect,
  type Phase,
  type SessionEvent,
  type SessionSettings,
  type SessionState,
} from './session';

const key = (tonic: string, mode: Key['mode']): Key => ({ tonic: parseNote(tonic), mode });
const A_MAJOR = key('A', 'major');

/** A major, 1 3 5 above the root, cadence every question, resolution on: `over` on top. */
const settings = (over: Partial<SessionSettings> = {}): SessionSettings => ({
  key: A_MAJOR,
  degrees: ['1', '3', '5'],
  register: 'above',
  keyChange: 'fixed',
  context: 'everyQuestion',
  resolution: true,
  drone: 'off',
  autoNext: false,
  ...over,
});

const SEED = 216;
const fresh = (over: Partial<SessionSettings> = {}, seed = SEED) =>
  initialSession(settings(over), seed);

const START: SessionEvent = { type: 'start' };
const NEXT: SessionEvent = { type: 'next' };
const STOP: SessionEvent = { type: 'stop' };
const done = (phase: Phase): SessionEvent => ({ type: 'audioDone', phase });
const answer = (degree: DegreeLabel): SessionEvent => ({ type: 'answer', degree });
const changed = (s: SessionSettings): SessionEvent => ({ type: 'settingsChanged', settings: s });

/** Each event in turn; the last step. */
function run(state: SessionState, ...events: SessionEvent[]) {
  let result = { state, effects: [] as readonly Effect[] };
  for (const e of events) result = step(result.state, e);
  return result;
}

const q = (s: SessionState): Question => s.question!;
/** An active degree that is not the question's. */
const wrongFor = (s: SessionState): DegreeLabel =>
  s.settings.degrees.find((d) => d !== q(s).degree)!;
const tonicOf = (s: SessionState) => questionTonic(q(s).key, s.settings);
/** The degree's note in the question's octave: the tonic at or below the note, plus the degree. */
const near = (s: SessionState, semitones: number) =>
  q(s).midi - ({ '1': 0, '3': 4, '5': 7 } as Record<string, number>)[q(s).degree]! + semitones;

/** The state at `phase`, by the main path (a wrong answer passes through 'answered'). */
function reach(phase: Phase, over: Partial<SessionSettings> = {}, seed = SEED): SessionState {
  let s = fresh(over, seed);
  const path: Phase[] = ['idle', 'context', 'prompt', 'waiting', 'answered', 'resolving', 'review'];
  for (const p of path.slice(1, path.indexOf(phase) + 1)) {
    if (p === 'context') s = step(s, START).state;
    else if (p === 'answered') s = step(s, answer(wrongFor(s))).state;
    else s = step(s, done(path[path.indexOf(p) - 1]!)).state;
  }
  expect(s.phase).toBe(phase);
  return s;
}

describe('step: start', () => {
  it('asks a question and plays the cadence first, its tonic at the question tonic', () => {
    const { state, effects } = step(fresh(), START);
    expect(state.phase).toBe('context');
    expect(state.history).toEqual([state.question]);
    expect(state.score).toEqual({ asked: 0, right: 0, streak: 0 });
    expect(['1', '3', '5']).toContain(q(state).degree);
    expect(effects).toEqual([
      { type: 'cancelAudio' },
      { type: 'playContext', key: A_MAJOR, tonic: tonicOf(state), done: 'context' },
    ]);
  });

  it('puts the cadence tonic and the tonic replay where the questions sound, an octave down in B major', () => {
    // B4 (71) + 7 = 78 is over HIGHEST_MIDI, so B major's questions sit on B3 (59).
    const s = step(fresh({ key: key('B', 'major') }), START).state;
    expect(step(fresh({ key: key('B', 'major') }), START).effects[1]).toMatchObject({ tonic: 59 });
    expect(
      step(run(s, done('context'), done('prompt')).state, { type: 'playTonic' }).effects[1],
    ).toEqual({
      type: 'playNote',
      midi: 59,
    });
  });

  it('plays the cadence at the start under "cadence when the key changes" too', () => {
    const { state, effects } = step(fresh({ context: 'keyChange' }), START);
    expect(state.phase).toBe('context');
    expect(effects.map((e) => e.type)).toEqual(['cancelAudio', 'playContext']);
  });

  it('starts the drone before the cadence when the drone is on', () => {
    const { effects } = step(fresh({ drone: 'continuous' }), START);
    expect(effects.map((e) => e.type)).toEqual(['cancelAudio', 'startDrone', 'playContext']);
    expect(effects[1]).toEqual({ type: 'startDrone', key: A_MAJOR });
  });

  it('"drone only" plays no cadence: the drone alone for DRONE_LEAD_BEATS, then the note', () => {
    const { state, effects } = step(fresh({ context: 'droneOnly' }), START);
    expect(state.phase).toBe('context');
    expect(effects).toEqual([
      { type: 'cancelAudio' },
      { type: 'startDrone', key: A_MAJOR },
      { type: 'wait', beats: DRONE_LEAD_BEATS, done: 'context' },
    ]);
    expect(step(state, done('context'))).toEqual({
      state: { ...state, phase: 'prompt' },
      effects: [{ type: 'playNote', midi: q(state).midi, done: 'prompt' }],
    });
  });

  it('starts over after stop: a new question, history and score', () => {
    const played = run(
      fresh(),
      START,
      done('context'),
      answer(wrongFor(reach('waiting'))),
      STOP,
    ).state;
    expect(played.phase).toBe('idle');
    expect(played.score.asked).toBe(1);
    const again = step(played, START).state;
    expect(again.phase).toBe('context');
    expect(again.history).toHaveLength(1);
    expect(again.answer).toBeNull();
    expect(again.score).toEqual({ asked: 0, right: 0, streak: 0 });
  });

  it('is reproducible: the same state and event give the same step', () => {
    const s = reach('review');
    expect(step(s, NEXT)).toEqual(step(s, NEXT));
    expect(run(fresh(), START, done('context'))).toEqual(run(fresh(), START, done('context')));
  });
});

describe('step: the note', () => {
  it('context done → prompt, playing the note; prompt done → waiting, silently', () => {
    const s = reach('context');
    const prompt = step(s, done('context'));
    expect(prompt.state.phase).toBe('prompt');
    expect(prompt.effects).toEqual([{ type: 'playNote', midi: q(s).midi, done: 'prompt' }]);
    expect(step(prompt.state, done('prompt'))).toEqual({
      state: { ...prompt.state, phase: 'waiting' },
      effects: [],
    });
  });
});

describe('step: the first answer', () => {
  it.each(['prompt', 'waiting'] as const)('right, in %s: scored, then the walk home', (phase) => {
    const s = reach(phase);
    const { state, effects } = step(s, answer(q(s).degree));
    expect(state.phase).toBe('resolving');
    expect(state.answer).toBe(q(s).degree);
    expect(state.score).toEqual({ asked: 1, right: 1, streak: 1 });
    expect(effects).toEqual([
      { type: 'cancelAudio' },
      { type: 'score', question: q(s), answer: q(s).degree, right: true },
      {
        type: 'playResolution',
        steps: resolution(q(s).key, q(s).degree, q(s).midi),
        done: 'resolving',
      },
    ]);
  });

  it.each(['prompt', 'waiting'] as const)(
    'wrong, in %s: scored, then the note picked and the right one',
    (phase) => {
      const s = reach(phase);
      const wrong = wrongFor(s);
      const { state, effects } = step(s, answer(wrong));
      expect(state.phase).toBe('answered');
      expect(state.answer).toBe(wrong);
      expect(state.score).toEqual({ asked: 1, right: 0, streak: 0 });
      const semis = { '1': 0, '3': 4, '5': 7 }[wrong as '1' | '3' | '5'];
      expect(effects).toEqual([
        { type: 'cancelAudio' },
        { type: 'score', question: q(s), answer: wrong, right: false },
        { type: 'playCompare', answer: near(s, semis), right: q(s).midi, done: 'answered' },
      ]);
    },
  );

  it('plays the wrong note in the octave up from the tonic at or below the question', () => {
    // C major, 7 above the root: 1 asked → B is the B above it, not the B a half step below.
    let s = step(fresh({ key: key('C', 'major'), degrees: ['1', '7'] }), START).state;
    while (q(s).degree !== '1')
      s = run(s, done('context'), answer('1'), done('resolving'), NEXT).state;
    const { effects } = run(s, done('context'), answer('7'));
    expect(effects[2]).toEqual({
      type: 'playCompare',
      answer: q(s).midi + 11,
      right: q(s).midi,
      done: 'answered',
    });
  });

  it('takes ♭5 for ♯4: one answer, two labels, stored as the id', () => {
    let s = step(fresh({ key: key('A', 'minor'), degrees: ['1', 'b5'] }), START).state;
    while (q(s).degree !== '#4')
      s = run(s, done('context'), answer('1'), done('answered'), done('resolving'), NEXT).state;
    const { state, effects } = run(s, done('context'), answer('b5'));
    expect(state.answer).toBe('#4');
    expect(effects[1]).toEqual({ type: 'score', question: q(s), answer: '#4', right: true });
  });

  it('with resolution off, a right answer goes straight to review', () => {
    const s = reach('waiting', { resolution: false });
    const { state, effects } = step(s, answer(q(s).degree));
    expect(state.phase).toBe('review');
    expect(effects.map((e) => e.type)).toEqual(['cancelAudio', 'score']);
  });

  it('counts the streak across questions and resets it on a miss', () => {
    let s = reach('waiting');
    const scores = [];
    for (const right of [true, true, false, true]) {
      s = run(s, answer(right ? q(s).degree : wrongFor(s))).state;
      scores.push(s.score);
      s = run(
        s,
        ...(right ? [] : [done('answered')]),
        done('resolving'),
        NEXT,
        done('context'),
        done('prompt'),
      ).state;
    }
    expect(scores).toEqual([
      { asked: 1, right: 1, streak: 1 },
      { asked: 2, right: 2, streak: 2 },
      { asked: 3, right: 2, streak: 0 },
      { asked: 4, right: 3, streak: 1 },
    ]);
  });
});

describe('step: after the answer', () => {
  it('answered done → the walk home of the right note', () => {
    const s = reach('answered');
    expect(step(s, done('answered'))).toEqual({
      state: { ...s, phase: 'resolving' },
      effects: [
        {
          type: 'playResolution',
          steps: resolution(q(s).key, q(s).degree, q(s).midi),
          done: 'resolving',
        },
      ],
    });
  });

  it('answered done → review when resolution is off', () => {
    const s = reach('answered', { resolution: false });
    expect(step(s, done('answered'))).toEqual({ state: { ...s, phase: 'review' }, effects: [] });
  });

  it('resolving done → review, silently', () => {
    const s = reach('resolving');
    expect(step(s, done('resolving'))).toEqual({ state: { ...s, phase: 'review' }, effects: [] });
  });

  it('auto-next: review waits AUTO_NEXT_BEATS, then asks the next question', () => {
    const s = reach('resolving', { autoNext: true });
    const r = step(s, done('resolving'));
    expect(r.effects).toEqual([{ type: 'wait', beats: AUTO_NEXT_BEATS, done: 'review' }]);
    const next = step(r.state, done('review'));
    expect(next.state.phase).toBe('context');
    expect(next.state.history).toHaveLength(2);
    expect(next).toEqual(step(r.state, NEXT));
  });

  it('auto-next waits after a right answer with resolution off, and after the comparison', () => {
    const wait = { type: 'wait', beats: AUTO_NEXT_BEATS, done: 'review' };
    const s = reach('waiting', { autoNext: true, resolution: false });
    expect(step(s, answer(q(s).degree)).effects).toContainEqual(wait);
    expect(
      step(reach('answered', { autoNext: true, resolution: false }), done('answered')).effects,
    ).toEqual([wait]);
  });

  it('in review, an answer button plays its note to compare, scoring nothing', () => {
    const s = reach('review');
    const other = (['1', '3', '5'] as const).find((d) => d !== s.answer && d !== q(s).degree)!;
    const semis = { '1': 0, '3': 4, '5': 7 }[other];
    expect(step(s, answer(other))).toEqual({
      state: s,
      effects: [{ type: 'cancelAudio' }, { type: 'playNote', midi: near(s, semis) }],
    });
  });

  it('next → the next question: the cadence again under "every question"', () => {
    const s = reach('review');
    const { state, effects } = step(s, NEXT);
    expect(state.phase).toBe('context');
    expect(state.answer).toBeNull();
    expect(state.history).toEqual([q(s), q(state)]);
    expect(state.seed).not.toBe(s.seed);
    expect(effects).toEqual([
      { type: 'cancelAudio' },
      { type: 'playContext', key: A_MAJOR, tonic: tonicOf(state), done: 'context' },
    ]);
  });

  it.each(['keyChange', 'droneOnly'] as const)(
    'next → the note at once under "%s" in the same key',
    (context) => {
      const s = reach('review', { context });
      const { state, effects } = step(s, NEXT);
      expect(state.phase).toBe('prompt');
      expect(effects).toEqual([
        { type: 'cancelAudio' },
        { type: 'playNote', midi: q(state).midi, done: 'prompt' },
      ]);
    },
  );
});

describe('step: replays never score', () => {
  it.each(['waiting', 'review'] as const)('in %s: the note, the cadence, the tonic', (phase) => {
    const s = reach(phase);
    const cancel = { type: 'cancelAudio' };
    expect(step(s, { type: 'replayNote' })).toEqual({
      state: s,
      effects: [cancel, { type: 'playNote', midi: q(s).midi }],
    });
    expect(step(s, { type: 'replayContext' })).toEqual({
      state: s,
      effects: [cancel, { type: 'playContext', key: q(s).key, tonic: tonicOf(s) }],
    });
    expect(step(s, { type: 'playTonic' })).toEqual({
      state: s,
      effects: [cancel, { type: 'playNote', midi: tonicOf(s) }],
    });
  });

  it('carry no done, so they never move the phase', () => {
    for (const type of ['replayNote', 'replayContext', 'playTonic'] as const) {
      for (const e of step(reach('waiting'), { type }).effects)
        expect(e).not.toHaveProperty('done');
    }
  });
});

describe('step: key changes', () => {
  /** Answer right and move on until the key changes; the step that asks the new key's first question. */
  function untilKeyChange(s: SessionState) {
    let n = 1;
    for (;;) {
      const r = run(
        s,
        ...(s.phase === 'context' ? [done('context')] : []),
        answer(q(s).degree),
        done('resolving'),
        NEXT,
      );
      n++;
      if (q(r.state).key.tonic !== q(s).key.tonic) return { ...r, n };
      s = r.state;
      expect(r.effects.map((e) => e.type)).not.toContain('startDrone');
    }
  }

  it('"cadence when the key changes": the cadence again on the 11th question, in the new key', () => {
    const { state, effects, n } = untilKeyChange(
      step(fresh({ context: 'keyChange', keyChange: 10 }), START).state,
    );
    expect(n).toBe(11);
    expect(state.phase).toBe('context');
    expect(effects).toEqual([
      { type: 'cancelAudio' },
      { type: 'playContext', key: q(state).key, tonic: tonicOf(state), done: 'context' },
    ]);
  });

  it('restarts the drone in the new key, before the cadence', () => {
    const { state, effects } = untilKeyChange(
      step(fresh({ context: 'keyChange', keyChange: 10, drone: 'continuous' }), START).state,
    );
    expect(effects.map((e) => e.type)).toEqual(['cancelAudio', 'startDrone', 'playContext']);
    expect(effects[1]).toEqual({ type: 'startDrone', key: q(state).key });
  });

  it('"drone only": the new key\'s drone alone first', () => {
    const { state, effects } = untilKeyChange(
      step(fresh({ context: 'droneOnly', keyChange: 10 }), START).state,
    );
    expect(effects).toEqual([
      { type: 'cancelAudio' },
      { type: 'startDrone', key: q(state).key },
      { type: 'wait', beats: DRONE_LEAD_BEATS, done: 'context' },
    ]);
  });
});

/** `reach(phase)`, on a seed whose first question asks `degree`. */
function reachAsking(
  phase: Phase,
  degree: DegreeLabel,
  over: Partial<SessionSettings> = {},
): SessionState {
  for (let seed = 1; seed < 500; seed++) {
    const s = reach(phase, over, seed);
    if (q(s).degree === degree) return s;
  }
  throw new Error(`no seed asks ${degree}`);
}

describe('step: settingsChanged', () => {
  it('in idle, just keeps the new settings', () => {
    const s = fresh();
    const next = settings({ key: key('E', 'minor'), drone: 'continuous' });
    expect(step(s, changed(next))).toEqual({ state: { ...s, settings: next }, effects: [] });
  });

  it('switching off the question\'s degree drops it unscored and asks one at once (same key, "key changes" policy)', () => {
    const s = reachAsking('waiting', '3', { context: 'keyChange' });
    const next = settings({ context: 'keyChange', degrees: ['1', 'b3', '5'] });
    const { state, effects } = step(s, changed(next));
    expect(state.phase).toBe('prompt');
    expect(state.score).toEqual(s.score);
    expect(state.history).toEqual([state.question]);
    expect(['1', 'b3', '5']).toContain(q(state).degree);
    expect(effects).toEqual([
      { type: 'cancelAudio' },
      { type: 'playNote', midi: q(state).midi, done: 'prompt' },
    ]);
  });

  it('a new key replays the context in it', () => {
    const s = reach('waiting', { context: 'keyChange' });
    const e = key('E', 'major');
    const { state, effects } = step(s, changed(settings({ context: 'keyChange', key: e })));
    expect(state.phase).toBe('context');
    expect(q(state).key).toEqual(e);
    expect(effects).toEqual([
      { type: 'cancelAudio' },
      { type: 'playContext', key: e, tonic: tonicOf(state), done: 'context' },
    ]);
  });

  it('a new key with the drone on restarts the drone in it, once', () => {
    const s = reach('review', { drone: 'continuous' });
    const e = key('E', 'minor');
    const { effects } = step(s, changed(settings({ drone: 'continuous', key: e })));
    expect(effects.filter((x) => x.type === 'startDrone')).toEqual([
      { type: 'startDrone', key: e },
    ]);
    expect(effects.map((x) => x.type)).toEqual(['cancelAudio', 'startDrone', 'playContext']);
  });

  it.each([
    ['a degree added', { degrees: ['1', 'b3', '3', '5'] }],
    ['another degree switched off', { degrees: ['1', '3'] }],
    ['the register', { register: 'twoOctaves' }],
  ] as const)('%s keeps the question: it applies from the next one', (_, over) => {
    for (const phase of ['context', 'waiting', 'review'] as const) {
      const s = reachAsking(phase, '3');
      const next = settings(over as Partial<SessionSettings>);
      expect(step(s, changed(next)), phase).toEqual({
        state: { ...s, settings: next },
        effects: [],
      });
    }
  });

  it('a change that cuts the cadence short plays it again', () => {
    const s = reachAsking('context', '3', { context: 'keyChange' });
    const { state, effects } = step(
      s,
      changed(settings({ context: 'keyChange', degrees: ['1', '5'] })),
    );
    expect(state.phase).toBe('context');
    expect(effects.map((e) => e.type)).toEqual(['cancelAudio', 'playContext']);
  });

  it('the same degrees under other labels, or in another order, keep the question', () => {
    const s = reach('waiting', { degrees: ['1', '#4', '5'] });
    const next = settings({ degrees: ['5', 'b5', '1'] });
    expect(step(s, changed(next))).toEqual({ state: { ...s, settings: next }, effects: [] });
  });

  it.each([
    ['weights', { weights: { '3': 4 } }],
    ['key changes', { keyChange: 25 }],
    ['auto-next', { autoNext: true }],
    ['resolution', { resolution: false }],
    ['the cadence policy', { context: 'keyChange' }],
  ] as const)('a change of %s keeps the question and its phase, silently', (_, over) => {
    for (const phase of ['context', 'waiting', 'resolving', 'review'] as const) {
      const s = reach(phase);
      const next = settings(over as Partial<SessionSettings>);
      expect(step(s, changed(next)), phase).toEqual({
        state: { ...s, settings: next },
        effects: [],
      });
    }
  });

  it("turning the drone on or off starts or stops it, in the question's key", () => {
    const s = reach('waiting');
    expect(step(s, changed(settings({ drone: 'continuous' }))).effects).toEqual([
      { type: 'startDrone', key: A_MAJOR },
    ]);
    const on = reach('waiting', { drone: 'continuous' });
    expect(step(on, changed(settings({ drone: 'off' }))).effects).toEqual([{ type: 'stopDrone' }]);
  });

  it('"drone only" holds the drone whatever the drone setting says', () => {
    const s = reach('review');
    expect(step(s, changed(settings({ context: 'droneOnly' }))).effects).toEqual([
      { type: 'startDrone', key: A_MAJOR },
    ]);
    const only = reach('review', { context: 'droneOnly' });
    expect(
      step(only, changed(settings({ context: 'droneOnly', drone: 'continuous' }))).effects,
    ).toEqual([]);
    expect(step(only, changed(settings({ context: 'keyChange' }))).effects).toEqual([
      { type: 'stopDrone' },
    ]);
  });

  it("the drone turned on with a degree change starts with the dropped question's key", () => {
    const s = reachAsking('waiting', '3', { context: 'keyChange' });
    const { effects } = step(
      s,
      changed(settings({ context: 'keyChange', drone: 'continuous', degrees: ['1', '5'] })),
    );
    expect(effects.map((e) => e.type)).toEqual(['cancelAudio', 'startDrone', 'playNote']);
  });
});

describe('the drone "before each question"', () => {
  it("fades in with each question's cadence and out once the answer's sounds are done", () => {
    const start = step(fresh({ drone: 'question' }), START);
    expect(start.effects.map((e) => e.type)).toEqual(['cancelAudio', 'startDrone', 'playContext']);
    // Held through the note, the answer and the walk home…
    const s = run(start.state, done('context'), done('prompt')).state;
    const answered = step(s, answer(q(s).degree));
    expect(answered.effects.map((e) => e.type)).not.toContain('stopDrone');
    // …and let go in review.
    const rev = step(answered.state, done('resolving'));
    expect(rev.effects).toEqual([{ type: 'stopDrone' }]);
    // The next question brings it back, in the same key.
    const next = step(rev.state, NEXT);
    expect(next.effects.map((e) => e.type)).toEqual(['cancelAudio', 'startDrone', 'playContext']);
    expect(next.effects[1]).toEqual({ type: 'startDrone', key: A_MAJOR });
  });

  it('with resolution off, it is let go right after the answer; with auto-next, before the pause', () => {
    const s = reach('waiting', { drone: 'question', resolution: false, autoNext: true });
    expect(step(s, answer(q(s).degree)).effects).toEqual([
      { type: 'cancelAudio' },
      { type: 'score', question: q(s), answer: q(s).degree, right: true },
      { type: 'stopDrone' },
      { type: 'wait', beats: AUTO_NEXT_BEATS, done: 'review' },
    ]);
  });

  it('switched to mid-question: it sounds now; in review it waits for the next question', () => {
    expect(step(reach('waiting'), changed(settings({ drone: 'question' }))).effects).toEqual([
      { type: 'startDrone', key: A_MAJOR },
    ]);
    expect(step(reach('review'), changed(settings({ drone: 'question' }))).effects).toEqual([]);
    // From continuous to "before each question" in review: it stops.
    expect(
      step(reach('review', { drone: 'continuous' }), changed(settings({ drone: 'question' })))
        .effects,
    ).toEqual([{ type: 'stopDrone' }]);
  });

  it('"drone only" still holds it in review', () => {
    const s = reach('resolving', { drone: 'question', context: 'droneOnly' });
    expect(step(s, done('resolving')).effects).toEqual([]);
  });
});

describe('step: stop', () => {
  it.each(['context', 'prompt', 'waiting', 'answered', 'resolving', 'review'] as const)(
    'from %s: idle and silent, the question kept',
    (phase) => {
      const s = reach(phase);
      expect(step(s, STOP)).toEqual({
        state: { ...s, phase: 'idle' },
        effects: [{ type: 'cancelAudio' }, { type: 'stopDrone' }],
      });
    },
  );
});

describe('step: events that make no sense are ignored', () => {
  const PHASES: Phase[] = [
    'idle',
    'context',
    'prompt',
    'waiting',
    'answered',
    'resolving',
    'review',
  ];
  const REPLAYS: SessionEvent[] = [
    { type: 'replayNote' },
    { type: 'replayContext' },
    { type: 'playTonic' },
  ];
  const IGNORED: Record<Phase, SessionEvent[]> = {
    idle: [NEXT, STOP, answer('1'), ...REPLAYS],
    context: [START, NEXT, answer('1'), ...REPLAYS],
    prompt: [START, NEXT, ...REPLAYS],
    waiting: [START, NEXT],
    answered: [START, NEXT, answer('1'), ...REPLAYS],
    resolving: [START, NEXT, answer('1'), ...REPLAYS],
    review: [START],
  };

  it.each(PHASES)('in %s', (phase) => {
    const s = reach(phase);
    const audioDone = PHASES.filter((p) => p !== phase || ['idle', 'waiting'].includes(p)).map(
      done,
    );
    for (const e of [...IGNORED[phase], ...audioDone]) {
      const r = step(s, e);
      expect(r.state, JSON.stringify(e)).toBe(s);
      expect(r.effects, JSON.stringify(e)).toEqual([]);
    }
  });
});
