import { describe, expect, it } from 'vitest';
import type { Player } from '@shared/core/audio';
import { parseNote, type DegreeLabel, type Key } from '@shared/core/music';
import { cadence, droneNotes } from '../core/context';
import { questionTonic } from '../core/questions';
import { resolution } from '../core/resolution';
import {
  initialSession,
  step,
  type Phase,
  type SessionEvent,
  type SessionSettings,
  type SessionState,
} from '../core/session';
import { DRONE_DUCK, LEAD_SEC, createEarAudio, type AudioSettings } from './driver';
import {
  COMPARE_GAP_BEATS,
  NOTE_BEATS,
  RESOLUTION_LAST_BEATS,
  comparePart,
  contextPart,
  notePart,
  resolutionPart,
} from './timeline';

const A_MAJOR: Key = { tonic: parseNote('A'), mode: 'major' };
const BPM = 90;
const BEAT = 60 / BPM;
const r = (x: number) => +x.toFixed(4);

/** A fake player on a hand-moved clock: it logs every call with its time on that clock. */
function fakePlayer(start = 10) {
  const log: string[] = [];
  const clock = { now: start as number | null };
  const player: Player = {
    enabled: true,
    setEnabled: () => {},
    now: () => clock.now,
    pluck: (midi, delay = 0, length) =>
      log.push(`pluck ${midi} @${r(clock.now! + delay)} ~${r(length ?? 0)}`),
    mute: () => {},
    tone: (midi, delay = 0, length) =>
      log.push(`tone ${midi} @${r(clock.now! + delay)} ~${r(length ?? 0)}`),
    click: (accent = false, delay = 0) =>
      log.push(`click${accent ? ' accent' : ''} @${r(clock.now! + delay)}`),
    setLevels: (l) => log.push(`levels ${JSON.stringify(l)}`),
    hold: (midis) => {
      log.push(`hold ${midis.join(' ')}`);
      return { stop: () => log.push(`stop hold ${midis.join(' ')}`) };
    },
    cancel: () => log.push('cancel'),
  };
  return { player, log, clock };
}

/** Timers that only fire when the test says so. */
function fakeTimers() {
  const intervals = new Map<number, () => void>();
  let id = 0;
  return {
    deps: {
      setInterval: (fn: () => void) => (intervals.set(++id, fn), id),
      clearInterval: (h: unknown) => void intervals.delete(h as number),
    },
    tick: () => [...intervals.values()].forEach((fn) => fn()),
    get running() {
      return intervals.size;
    },
  };
}

const SETTINGS: SessionSettings = {
  key: A_MAJOR,
  degrees: ['1', '3', '5'],
  register: 'above',
  keyChange: 'fixed',
  context: 'everyQuestion',
  resolution: true,
  drone: 'off',
  autoNext: false,
};

/** The session wired to the driver, as the page will be: events in, effects to the driver, audioDone back. */
function harness(
  over: Partial<SessionSettings> = {},
  audio: Partial<AudioSettings> = {},
  seed = 219,
) {
  const f = fakePlayer();
  const timers = fakeTimers();
  const sound: AudioSettings = { bpm: BPM, sound: 'guitar', ...audio };
  let state: SessionState = initialSession({ ...SETTINGS, ...over }, seed);
  const done: Phase[] = [];
  let noAudio = 0;
  const dispatch = (e: SessionEvent) => {
    const next = step(state, e);
    state = next.state;
    driver.run(next.effects, sound);
  };
  const driver = createEarAudio(
    f.player,
    {
      onDone: (phase) => {
        done.push(phase);
        dispatch({ type: 'audioDone', phase });
      },
      onNoAudio: () => noAudio++,
    },
    timers.deps,
  );
  /** Move the audio clock to `t` and let the driver look. */
  const at = (t: number) => {
    f.clock.now = t;
    timers.tick();
  };
  return {
    ...f,
    timers,
    driver,
    dispatch,
    at,
    done,
    get state() {
      return state;
    },
    get noAudio() {
      return noAudio;
    },
  };
}

/** The log lines a part makes when it starts at `t0` (its first sound at t0 + LEAD_SEC). */
function expected(
  part: ReturnType<typeof notePart>,
  t0: number,
  voice: 'pluck' | 'tone' = 'pluck',
) {
  return part.sounds.map((s) =>
    s.kind === 'click'
      ? `click accent @${r(t0 + LEAD_SEC + s.time)}`
      : `${s.kind === 'chord' ? 'pluck' : voice} ${s.midi} @${r(t0 + LEAD_SEC + s.time)} ~${r(s.length!)}`,
  );
}

describe('a full question, right first try (A major, 90 BPM, guitar)', () => {
  it('cadence and tonic, the note, then the walk home, each when the one before ends', () => {
    const h = harness();
    h.dispatch({ type: 'start' });
    const q = h.state.question!;
    const tonic = questionTonic(A_MAJOR, SETTINGS);
    const ctx = contextPart(A_MAJOR, tonic, BPM);
    expect(h.log).toEqual(['cancel', ...expected(ctx, 10)]);
    // The cadence's first strum starts LEAD_SEC in; the tonic after 5 beats; the part lasts 6.
    expect(h.log[1]).toMatch(/^pluck \d+ @10\.05 /);
    expect(h.log.at(-1)).toBe(`pluck ${tonic} @${r(10.05 + 5 * BEAT)} ~${r(BEAT)}`);

    // Not yet: the clock is just short of the end.
    const ctxEnd = 10 + LEAD_SEC + 6 * BEAT;
    h.at(ctxEnd - 0.01);
    expect(h.done).toEqual([]);
    h.log.length = 0;
    h.at(ctxEnd);
    expect(h.done).toEqual(['context']);
    expect(h.state.phase).toBe('prompt');
    expect(h.log).toEqual(expected(notePart(q.midi, BPM), ctxEnd));

    const noteEnd = ctxEnd + LEAD_SEC + NOTE_BEATS * BEAT;
    h.at(noteEnd);
    expect(h.state.phase).toBe('waiting');

    h.log.length = 0;
    h.at(noteEnd + 1.5);
    h.dispatch({ type: 'answer', degree: q.degree });
    const steps = resolution(q.key, q.degree, q.midi);
    expect(h.log).toEqual(['cancel', ...expected(resolutionPart(steps, BPM), noteEnd + 1.5)]);
    expect(h.state.phase).toBe('resolving');

    const walkEnd =
      noteEnd + 1.5 + LEAD_SEC + (steps.length - 1) * (BEAT / 2) + RESOLUTION_LAST_BEATS * BEAT;
    h.at(walkEnd);
    expect(h.done).toEqual(['context', 'prompt', 'resolving']);
    expect(h.state.phase).toBe('review');
    // Nothing left to watch: the timer is off until the next part.
    expect(h.timers.running).toBe(0);
  });

  it('with resolution off, a right answer is one soft accented click', () => {
    const h = harness({ resolution: false });
    h.dispatch({ type: 'start' });
    h.at(100);
    h.at(200);
    h.log.length = 0;
    h.dispatch({ type: 'answer', degree: h.state.question!.degree });
    expect(h.log).toEqual(['cancel', `click accent @${r(200 + LEAD_SEC)}`]);
    expect(h.state.phase).toBe('review');
  });
});

describe('a full question, wrong first try', () => {
  it('the note picked, a gap, the right note, then the walk home of the right note', () => {
    const h = harness();
    h.dispatch({ type: 'start' });
    h.at(100);
    h.at(200);
    expect(h.state.phase).toBe('waiting');
    const q = h.state.question!;
    const wrong = (['1', '3', '5'] as DegreeLabel[]).find((d) => d !== q.degree)!;
    h.log.length = 0;
    h.dispatch({ type: 'answer', degree: wrong });
    const picked =
      q.midi -
      { '1': 0, '3': 4, '5': 7 }[q.degree as '1']! +
      { '1': 0, '3': 4, '5': 7 }[wrong as '1']!;
    expect(h.log).toEqual([
      'cancel',
      `pluck ${picked} @${r(200.05)} ~${r(BEAT)}`,
      `pluck ${q.midi} @${r(200.05 + (1 + COMPARE_GAP_BEATS) * BEAT)} ~${r(BEAT)}`,
    ]);
    expect(h.log.slice(1)).toEqual(expected(comparePart(picked, q.midi, BPM), 200));
    // The comparison lasts 1 + ½ + 1 + ½ beats; then the walk home.
    const cmpEnd = 200 + LEAD_SEC + 3 * BEAT;
    h.at(cmpEnd - 0.01);
    expect(h.state.phase).toBe('answered');
    h.log.length = 0;
    h.at(cmpEnd);
    expect(h.state.phase).toBe('resolving');
    expect(h.log).toEqual(
      expected(resolutionPart(resolution(q.key, q.degree, q.midi), BPM), cmpEnd),
    );
    h.at(cmpEnd + 10);
    expect(h.state.phase).toBe('review');
    expect(h.done).toEqual(['context', 'prompt', 'answered', 'resolving']);
  });

  it('then an answer button plays its note, and Next cuts it and starts the next question', () => {
    const h = harness();
    h.dispatch({ type: 'start' });
    for (const t of [100, 200]) h.at(t);
    h.dispatch({ type: 'answer', degree: h.state.question!.degree });
    h.at(300);
    expect(h.state.phase).toBe('review');
    h.log.length = 0;
    h.dispatch({ type: 'answer', degree: '5' });
    expect(h.log[0]).toBe('cancel');
    expect(h.log[1]).toMatch(/^pluck \d+ @300\.05 ~1\.3333$/);
    h.log.length = 0;
    h.dispatch({ type: 'next' });
    expect(h.log[0]).toBe('cancel');
    expect(h.state.phase).toBe('context');
  });
});

describe('sound settings', () => {
  it('clean tone: single notes are tones, the cadence chords stay guitar', () => {
    const h = harness({}, { sound: 'clean' });
    h.dispatch({ type: 'start' });
    const tonic = questionTonic(A_MAJOR, SETTINGS);
    expect(h.log.slice(1)).toEqual(expected(contextPart(A_MAJOR, tonic, BPM), 10, 'tone'));
    expect(h.log.filter((l) => l.startsWith('tone'))).toEqual([
      `tone ${tonic} @${r(10.05 + 5 * BEAT)} ~${r(BEAT)}`,
    ]);
    h.at(100);
    expect(h.log.at(-1)).toMatch(/^tone /);
  });

  it('the short cadence and the tempo come from the audio settings', () => {
    const h = harness({}, { bpm: 120, cadenceForm: 'short' });
    h.dispatch({ type: 'start' });
    const c = cadence(A_MAJOR, 120, 'short', questionTonic(A_MAJOR, SETTINGS));
    expect(h.log.slice(1)).toEqual(expected(contextPart(A_MAJOR, c.tonic.midi, 120, 'short'), 10));
    h.at(10 + LEAD_SEC + c.duration);
    expect(h.done).toEqual(['context']);
  });
});

describe('the drone', () => {
  it('holds 1 and 5 from the start, sits under the cadence, and comes back up after it', () => {
    const h = harness({ drone: 'continuous' });
    h.dispatch({ type: 'start' });
    expect(h.log.slice(0, 3)).toEqual([
      'cancel',
      `hold ${droneNotes(A_MAJOR).join(' ')}`,
      expect.stringMatching(/^pluck/),
    ]);
    expect(h.log.at(-1)).toBe(`levels {"drone":${DRONE_DUCK}}`);
    h.log.length = 0;
    h.at(10 + LEAD_SEC + 6 * BEAT);
    expect(h.log[0]).toBe('levels {"drone":1}');
  });

  it('changes key with a crossfade: the old one stops as the new one starts', () => {
    const h = harness({ drone: 'continuous', context: 'keyChange' });
    h.dispatch({ type: 'start' });
    h.log.length = 0;
    const e: Key = { tonic: parseNote('E'), mode: 'minor' };
    const next = step(h.state, {
      type: 'settingsChanged',
      settings: { ...SETTINGS, drone: 'continuous', context: 'keyChange', key: e },
    });
    h.driver.run(next.effects, { bpm: BPM, sound: 'guitar' });
    expect(h.log.slice(0, 4)).toEqual([
      'cancel',
      'levels {"drone":1}',
      `stop hold ${droneNotes(A_MAJOR).join(' ')}`,
      `hold ${droneNotes(e).join(' ')}`,
    ]);
  });

  it('plays at the drone level set, half of it under the cadence, and follows a new level at once', () => {
    const h = harness({ drone: 'continuous' }, { droneLevel: 0.4 });
    h.dispatch({ type: 'start' });
    expect(h.log.filter((l) => l.startsWith('levels'))).toEqual([
      'levels {"drone":0.4}',
      `levels {"drone":${0.4 * DRONE_DUCK}}`,
    ]);
    h.at(10 + LEAD_SEC + 6 * BEAT);
    expect(h.log.at(-2)).toBe('levels {"drone":0.4}');
    // A new level with nothing else to do (a settings change): applied straight away.
    h.log.length = 0;
    h.driver.run([], { bpm: BPM, sound: 'guitar', droneLevel: 0.7 });
    expect(h.log).toEqual(['levels {"drone":0.7}']);
  });

  it('stops on stop, and on leaving the page', () => {
    const h = harness({ drone: 'continuous' });
    h.dispatch({ type: 'start' });
    h.dispatch({ type: 'stop' });
    expect(h.log.slice(-3)).toEqual([
      'cancel',
      'levels {"drone":1}',
      `stop hold ${droneNotes(A_MAJOR).join(' ')}`,
    ]);
    const h2 = harness({ drone: 'continuous' });
    h2.dispatch({ type: 'start' });
    h2.log.length = 0;
    h2.driver.dispose();
    expect(h2.log).toEqual([
      'cancel',
      `stop hold ${droneNotes(A_MAJOR).join(' ')}`,
      'levels {"drone":1}',
    ]);
    expect(h2.timers.running).toBe(0);
  });

  it('"drone only": the drone alone for the lead-in, then the note', () => {
    const h = harness({ context: 'droneOnly' });
    h.dispatch({ type: 'start' });
    expect(h.log).toEqual(['cancel', `hold ${droneNotes(A_MAJOR).join(' ')}`]);
    h.at(10 + LEAD_SEC + 4 * BEAT);
    expect(h.done).toEqual(['context']);
    expect(h.log.at(-1)).toMatch(/^pluck /);
  });
});

describe('timing and cancelling', () => {
  it('a cancel drops the pending end: no stale audioDone', () => {
    const h = harness();
    h.dispatch({ type: 'start' });
    h.driver.run([{ type: 'cancelAudio' }], { bpm: BPM, sound: 'guitar' });
    expect(h.timers.running).toBe(0);
    h.at(1000);
    expect(h.done).toEqual([]);
  });

  it('auto-next: the pause in review, then the next question', () => {
    const h = harness({ autoNext: true, resolution: false });
    h.dispatch({ type: 'start' });
    for (const t of [100, 200]) h.at(t);
    h.dispatch({ type: 'answer', degree: h.state.question!.degree });
    expect(h.state.phase).toBe('review');
    h.at(200 + LEAD_SEC + 2 * BEAT - 0.01);
    expect(h.state.phase).toBe('review');
    h.at(200 + LEAD_SEC + 2 * BEAT);
    expect(h.state.phase).toBe('context');
    expect(h.state.history).toHaveLength(2);
  });

  it('a late timer never moves a sound: every note was scheduled when its part began', () => {
    const h = harness();
    h.dispatch({ type: 'start' });
    const before = [...h.log];
    // The page stalls for 3 s mid-cadence: no note is added or moved, the end comes on the next tick.
    h.at(13);
    expect(h.log).toEqual(before);
    h.at(20);
    expect(h.done).toEqual(['context']);
  });
});

describe('no audio', () => {
  it('says so instead of running a silent quiz', () => {
    const h = harness();
    h.clock.now = null;
    h.dispatch({ type: 'start' });
    expect(h.noAudio).toBe(1);
    expect(h.log.filter((l) => /pluck|tone/.test(l))).toEqual([]);
  });

  it('says so when the audio clock is lost mid-part, and stops watching', () => {
    const h = harness();
    h.dispatch({ type: 'start' });
    h.clock.now = null;
    h.timers.tick();
    expect(h.noAudio).toBe(1);
    expect(h.timers.running).toBe(0);
    expect(h.done).toEqual([]);
  });
});
