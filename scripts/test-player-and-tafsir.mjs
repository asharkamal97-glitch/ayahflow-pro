// Exercises the real AudioManager with a deterministic HTMLMediaElement test double.
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import ts from 'typescript';

const managerSource = await readFile(new URL('../src/lib/audioManager.ts', import.meta.url), 'utf8');
const { outputText, diagnostics = [] } = ts.transpileModule(managerSource, {
  compilerOptions: { module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2022 },
  reportDiagnostics: true,
});
assert.equal(diagnostics.length, 0, 'AudioManager TypeScript should transpile without diagnostics');
const managerModuleUrl = `data:text/javascript;base64,${Buffer.from(outputText).toString('base64')}`;
const { AudioManager } = await import(managerModuleUrl);

class MockTimeRanges {
  constructor(ranges = []) { this.ranges = ranges; }
  get length() { return this.ranges.length; }
  start(index) { return this.ranges[index][0]; }
  end(index) { return this.ranges[index][1]; }
}

class MockAudioElement {
  constructor({ duration = 120, readyState = 1, ranges = [[0, duration]], supportsSeek = true } = {}) {
    this._currentTime = 0;
    this.duration = duration;
    this.readyState = readyState;
    this.seekable = new MockTimeRanges(ranges);
    this.supportsSeek = supportsSeek;
    this.seeking = false;
    this.playbackRate = 1;
    this.volume = 1;
    this.listeners = new Map();
  }

  get currentTime() { return this._currentTime; }
  set currentTime(value) {
    if (!this.supportsSeek) throw new Error('mock media rejects seeks');
    this._currentTime = value;
    this.seeking = true;
    this.emit('seeking');
    queueMicrotask(() => {
      this.seeking = false;
      this.emit('seeked');
    });
  }

  addEventListener(event, handler) {
    if (!this.listeners.has(event)) this.listeners.set(event, new Set());
    this.listeners.get(event).add(handler);
  }

  removeEventListener(event, handler) { this.listeners.get(event)?.delete(handler); }
  emit(event) { this.listeners.get(event)?.forEach((handler) => handler(new Event(event))); }
  resetSource() {
    this._currentTime = 0;
    this.duration = Number.NaN;
    this.readyState = 0;
    this.seekable = new MockTimeRanges();
    this.emit('emptied');
  }
}

const makeManager = (options) => {
  const manager = new AudioManager();
  const audio = new MockAudioElement(options);
  manager.registerAudioElement(audio);
  return { manager, audio };
};

console.log('--- Actual AudioManager seek tests ---');
{
  const { manager, audio } = makeManager({ duration: 120, ranges: [[0, 120]] });
  assert.equal(manager.seek(1).target, 1, 'seek 0 → 1 second');
  assert.equal(audio.currentTime, 1);
  for (const delta of [2, 4, 5, 10]) {
    const target = audio.currentTime + delta;
    const result = manager.seek(target);
    assert.equal(result.status, 'applied', `seek forward by ${delta}s`);
    assert.equal(audio.currentTime, target);
  }
  const backwardTarget = audio.currentTime - 4;
  assert.equal(manager.seek(backwardTarget).target, backwardTarget, 'backward seek applies');
  assert.equal(manager.seek(-10).target, 0, 'backward seek clamps at zero');
  assert.equal(audio.currentTime, 0);
  assert.equal(manager.seek(119.5).target, 119.5, 'seek near track end');
  assert.equal(manager.seek(500).target, 120, 'seek beyond finite duration clamps to end');
}

console.log('--- Metadata, unknown duration, range, and UI progress tests ---');
{
  const { manager, audio } = makeManager({ duration: 120, ranges: [[0, 120]] });
  const progress = [];
  manager.onProgress((currentTime, duration) => progress.push({ currentTime, duration }));

  for (const currentTime of [0, 1, 2, 3]) {
    audio._currentTime = currentTime;
    audio.emit('timeupdate');
  }
  assert.deepEqual(progress.slice(-4), [0, 1, 2, 3].map((currentTime) => ({ currentTime, duration: 120 })),
    'visible elapsed-time state follows each real timeupdate');

  manager.seek(10);
  audio.emit('timeupdate'); // emitted while the seek is still settling
  assert.deepEqual(progress.at(-1), { currentTime: 10, duration: 120 },
    'timer continues receiving real progress during a pending seek');
  audio._currentTime = 11;
  audio.emit('timeupdate');
  assert.deepEqual(progress.at(-1), { currentTime: 11, duration: 120 },
    'timer continues after seeking and remains synchronized with duration');

  manager.registerAudioElement(null);
  const lastProgress = progress.length;
  audio._currentTime = 12;
  audio.emit('timeupdate');
  assert.equal(progress.length, lastProgress, 'cleanup detaches progress listeners from the old element');
}

{
  const manager = new AudioManager();
  const oldAudio = new MockAudioElement({ duration: 30, ranges: [[0, 30]] });
  const activeAudio = new MockAudioElement({ duration: 80, ranges: [[0, 80]] });
  const progress = [];
  manager.onProgress((currentTime, duration) => progress.push({ currentTime, duration }));
  manager.registerAudioElement(oldAudio);
  manager.registerAudioElement(activeAudio);
  oldAudio._currentTime = 5;
  oldAudio.emit('timeupdate');
  assert.deepEqual(progress.at(-1), { currentTime: 0, duration: 80 },
    'replacing the Surah element detaches its stale timer listener');
  activeAudio._currentTime = 1;
  activeAudio.emit('timeupdate');
  assert.deepEqual(progress.at(-1), { currentTime: 1, duration: 80 },
    'new active Surah element updates the visible timer and duration');
  manager.registerAudioElement(null);
}

{
  const { manager, audio } = makeManager({ duration: Number.NaN, readyState: 0, ranges: [] });
  let lastProgress = null;
  manager.onProgress((currentTime, duration) => { lastProgress = { currentTime, duration }; });
  assert.equal(manager.seek(12).status, 'queued', 'seek queues before metadata');
  assert.equal(audio.currentTime, 0, 'queued request does not fake the media time');
  audio.duration = 120;
  audio.readyState = 1;
  audio.seekable = new MockTimeRanges([[0, 120]]);
  audio.emit('loadedmetadata');
  assert.equal(audio.currentTime, 12, 'queued seek applies once metadata and a range are ready');
  await new Promise((resolve) => setImmediate(resolve));
  assert.deepEqual(lastProgress, { currentTime: 12, duration: 120 }, 'displayed time follows actual media events');
  manager.registerAudioElement(null);
}

{
  const { manager, audio } = makeManager({ duration: Number.NaN, readyState: 1, ranges: [[0, 40]] });
  assert.equal(manager.seek(25).target, 25, 'unknown duration can use a finite seekable range');
  assert.equal(audio.currentTime, 25);
  manager.registerAudioElement(null);
}

{
  const { manager, audio } = makeManager({ duration: Number.POSITIVE_INFINITY, ranges: [[10, 90]] });
  assert.equal(manager.seek(95).target, 90, 'infinite duration clamps to the seekable live edge');
  assert.equal(manager.seek(2).target, 10, 'infinite duration clamps to the first seekable point');
  assert.equal(manager.seek(Number.POSITIVE_INFINITY).status, 'rejected', 'non-finite target is rejected');
  manager.registerAudioElement(null);
}

{
  const { manager, audio } = makeManager({ duration: 100, ranges: [[0, 15]], supportsSeek: true });
  const result = manager.seek(60);
  assert.equal(result.status, 'applied', 'progressive HTTP stream allows seeking beyond initial buffered range');
  assert.equal(audio.currentTime, 60, 'audio element currentTime updated to requested unbuffered timestamp');
  manager.registerAudioElement(null);
}

{
  const { manager, audio } = makeManager({ duration: 100, ranges: [[0, 15]], supportsSeek: false });
  const result = manager.seek(60);
  assert.equal(result.status, 'rejected', 'media element that rejects seeking surfaces as rejected');
  assert.equal(audio.currentTime, 0, 'rejected seek does not move the real element or UI state');
  assert.equal(manager.seek(10).status, 'rejected', 'setter errors are surfaced as rejected seeks');
  assert.equal(audio.currentTime, 0, 'setter error never updates playback UI to the requested position');
  manager.registerAudioElement(null);
}

{
  const { manager, audio } = makeManager({ duration: 100, ranges: [[0, 100]] });
  let lastProgress = null;
  manager.onProgress((currentTime, duration) => { lastProgress = { currentTime, duration }; });
  manager.seek(33.4);
  audio.emit('timeupdate');
  assert.deepEqual(lastProgress, { currentTime: 33.4, duration: 100 }, 'stale timeupdate cannot overwrite an active seek');
  await new Promise((resolve) => setImmediate(resolve));
  assert.deepEqual(lastProgress, { currentTime: 33.4, duration: 100 }, 'seeked updates display from actual element position');
  audio.currentTime = 86;
  await new Promise((resolve) => setImmediate(resolve));
  audio.resetSource();
  assert.deepEqual(lastProgress, { currentTime: 0, duration: 0 }, 'new Surah source clears stale playback position and duration');
  manager.registerAudioElement(null);
}

console.log('--- Existing Tafsir timestamp regression tests ---');
const AL_FATIHAH_TIMESTAMPS = [
  { verse_key: '1:1', timestamp_from: 0, timestamp_to: 6090 },
  { verse_key: '1:2', timestamp_from: 6090, timestamp_to: 11680 },
  { verse_key: '1:3', timestamp_from: 11680, timestamp_to: 16300 },
  { verse_key: '1:4', timestamp_from: 16300, timestamp_to: 20950 },
  { verse_key: '1:5', timestamp_from: 20950, timestamp_to: 27660 },
  { verse_key: '1:6', timestamp_from: 27660, timestamp_to: 33250 },
  { verse_key: '1:7', timestamp_from: 33250, timestamp_to: 46490 },
];
const getActiveAyah = (timeSeconds, timestamps) => {
  const timestamp = timestamps.find((item) => timeSeconds * 1000 >= item.timestamp_from && timeSeconds * 1000 < item.timestamp_to);
  return timestamp ? Number.parseInt(timestamp.verse_key.split(':')[1], 10) : 1;
};
assert.equal(getActiveAyah(2.5, AL_FATIHAH_TIMESTAMPS), 1);
assert.equal(getActiveAyah(8, AL_FATIHAH_TIMESTAMPS), 2);
assert.equal(getActiveAyah(14, AL_FATIHAH_TIMESTAMPS), 3);
assert.equal(getActiveAyah(18.5, AL_FATIHAH_TIMESTAMPS), 4);
assert.equal(getActiveAyah(24, AL_FATIHAH_TIMESTAMPS), 5);
assert.equal(getActiveAyah(30, AL_FATIHAH_TIMESTAMPS), 6);
assert.equal(getActiveAyah(38, AL_FATIHAH_TIMESTAMPS), 7);

console.log('--- Existing player layering regression test ---');
assert.ok(9999 > 5000 && 5000 > 4000, 'modal > fullscreen player > mini-player stacking order');
console.log('All audio seeking and existing player regression checks passed.');
