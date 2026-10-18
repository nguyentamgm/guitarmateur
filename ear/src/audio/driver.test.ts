import { describe, expect, it } from 'vitest';
import type { Player } from '@shared/core/audio';
import { LEAD_SEC, createEarAudio } from './driver';
import { twoNotesPart } from './timeline';

const r = (x: number) => +x.toFixed(4);

/** A player on a hand-moved clock, logging each note with its time; timers that fire on `at`. */
function harness(audio = true) {
  const log: string[] = [];
  const clock = { now: 10 };
  const player = {
    now: () => (audio ? clock.now : null),
    pluck: (midi: number, delay = 0) => log.push(`pluck ${midi} @${r(clock.now + delay)}`),
    click: () => log.push('click'),
    cancel: () => log.push('cancel'),
  } as unknown as Player;
  const intervals = new Map<number, () => void>();
  let id = 0;
  let noAudio = 0;
  const driver = createEarAudio(
    player,
    { onNoAudio: () => noAudio++ },
    {
      setInterval: (fn) => (intervals.set(++id, fn), id),
      clearInterval: (h) => void intervals.delete(h as number),
    },
  );
  const at = (t: number) => {
    clock.now = t;
    [...intervals.values()].forEach((fn) => fn());
  };
  return { driver, log, at, running: () => intervals.size, noAudio: () => noAudio };
}

const part = twoNotesPart(57, 64, 60); // notes at 0 and 1.5 s, 2.5 s long

describe('the level driver', () => {
  it('hands every note to the player at its exact time, then calls back at the end', () => {
    const h = harness();
    let ended = 0;
    h.driver.playPart(part, () => ended++);
    expect(h.log).toEqual([
      'cancel',
      `pluck 57 @${r(10 + LEAD_SEC)}`,
      `pluck 64 @${r(10 + LEAD_SEC + 1.5)}`,
    ]);
    h.at(10 + LEAD_SEC + 2.49);
    expect(ended).toBe(0);
    h.at(10 + LEAD_SEC + 2.5);
    expect(ended).toBe(1);
    expect(h.running()).toBe(0);
  });

  it('a new part cuts the one before, whose end then never comes; so does cancel', () => {
    const h = harness();
    const ends: string[] = [];
    h.driver.playPart(part, () => ends.push('first'));
    h.at(11);
    h.driver.playPart(part, () => ends.push('again'));
    h.at(10 + LEAD_SEC + 2.5);
    expect(ends).toEqual([]);
    h.at(11 + LEAD_SEC + 2.5);
    expect(ends).toEqual(['again']);
    h.driver.playPart(part, () => ends.push('cut'));
    h.driver.cancel();
    h.at(100);
    expect(ends).toEqual(['again']);
    expect(h.running()).toBe(0);
  });

  it('says so when there is no audio, and calls nothing back', () => {
    const h = harness(false);
    let ended = 0;
    h.driver.playPart(part, () => ended++);
    expect(h.noAudio()).toBe(1);
    expect(h.log).toEqual(['cancel']);
    expect(ended).toBe(0);
  });
});
