import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import ts from 'typescript';

// Transpile AudioManager TypeScript to ESM on the fly
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
  constructor({ duration = 240, readyState = 4 } = {}) {
    this._currentTime = 0;
    this.duration = duration;
    this.readyState = readyState;
    this.seekable = new MockTimeRanges([[0, duration]]);
    this.seeking = false;
    this.volume = 1;
    this.muted = false;
    this.playbackRate = 1;
    this.paused = true;
    this.listeners = new Map();
    this.error = null;
  }

  get currentTime() { return this._currentTime; }
  set currentTime(val) {
    this._currentTime = val;
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

  removeEventListener(event, handler) {
    if (this.listeners.has(event)) {
      this.listeners.get(event).delete(handler);
    }
  }

  emit(event) {
    const handlers = this.listeners.get(event);
    if (!handlers) return;
    for (const h of handlers) h();
  }

  async play() {
    this.paused = false;
    return Promise.resolve();
  }

  pause() {
    this.paused = true;
  }
}

async function runTests() {
  console.log('--- STARTING AYAHFLOW AUDIO PLAYBACK TESTS ---');

  const audioManager = new AudioManager();
  const mockAudio = new MockAudioElement({ duration: 240, readyState: 4 });
  audioManager.registerAudioElement(mockAudio);

  let progressCalled = 0;
  let lastProgressTime = 0;
  let lastProgressDur = 0;
  const unsubProgress = audioManager.onProgress((time, dur) => {
    progressCalled++;
    lastProgressTime = time;
    lastProgressDur = dur;
  });

  let endedCalled = 0;
  const unsubEnded = audioManager.onEnded(() => {
    endedCalled++;
  });

  let errorCalled = 0;
  const unsubError = audioManager.onError(() => {
    errorCalled++;
  });

  // TEST 1: Initial progress reporting
  console.log('Test 1: Verify audio element registration & metadata');
  mockAudio._currentTime = 15;
  mockAudio.emit('timeupdate');
  assert.equal(lastProgressTime, 15, 'Current time should be 15');
  assert.equal(lastProgressDur, 240, 'Duration should be 240');
  console.log('  ✓ Initial registration and progress reporting verified');

  // TEST 2: Seek to 30 seconds
  console.log('Test 2: Seek to 30 seconds');
  const res30 = audioManager.seek(30);
  assert.equal(res30.status, 'applied', 'Seek to 30 should be applied');
  assert.equal(mockAudio.currentTime, 30, 'Mock audio currentTime should be 30');
  assert.equal(audioManager.isSeeking(), true, 'isSeeking should be true during lock');
  console.log('  ✓ Seek to 30 seconds succeeded');

  // TEST 3: Seek clamping to valid boundaries
  console.log('Test 3: Seek clamping (negative & beyond duration)');
  const resNeg = audioManager.seek(-10);
  assert.equal(resNeg.status, 'applied');
  assert.equal(mockAudio.currentTime, 0, 'Negative seek clamped to 0');

  const resOver = audioManager.seek(999);
  assert.equal(resOver.status, 'applied');
  assert.equal(mockAudio.currentTime, 240, 'Over-duration seek clamped to duration');
  console.log('  ✓ Seek boundaries clamped correctly to [0, duration]');

  // TEST 4: Seek near end without premature auto-next
  console.log('Test 4: Seek near end (duration - 1s)');
  endedCalled = 0;
  audioManager.seek(239);
  assert.equal(mockAudio.currentTime, 239);
  mockAudio.emit('timeupdate');
  assert.equal(endedCalled, 0, 'Seeking near end must not trigger auto-next prematurely');
  console.log('  ✓ Seek near end does not trigger premature ended event');

  // TEST 5: Natural completion & duplicate prevention
  console.log('Test 5: Natural track end triggers onEnded exactly once');
  // Wait out the seek lock
  await new Promise((resolve) => setTimeout(resolve, 350));
  endedCalled = 0;
  mockAudio.emit('ended');
  mockAudio.emit('ended'); // Immediate duplicate
  assert.equal(endedCalled, 1, 'Ended callback must be called exactly once despite duplicate event');
  console.log('  ✓ Duplicate ended events debounced cleanly');

  // TEST 6: PlayRecitation handles AbortError safely
  console.log('Test 6: AbortError during playRecitation does not throw or crash');
  mockAudio.play = async () => {
    const err = new Error('The play() request was interrupted');
    err.name = 'AbortError';
    throw err;
  };
  const playResult = await audioManager.playRecitation();
  assert.equal(playResult, false, 'playRecitation returns false on AbortError without unhandled rejection');
  console.log('  ✓ AbortError handled safely without interrupting application state');

  // TEST 7: Error handling
  console.log('Test 7: Audio element error triggers onError callback');
  errorCalled = 0;
  mockAudio.error = { code: 4, message: 'MEDIA_ELEMENT_ERROR: Format unsupported' };
  mockAudio.emit('error');
  assert.equal(errorCalled, 1, 'Error callback must be fired on audio error');
  console.log('  ✓ Audio error propagated cleanly');

  unsubProgress();
  unsubEnded();
  unsubError();

  console.log('--- ALL AUDIO PLAYBACK TESTS PASSED SUCCESSFULLY ---');
}

runTests().catch((err) => {
  console.error('Test failed:', err);
  process.exit(1);
});
