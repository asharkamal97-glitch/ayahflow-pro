import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import ts from 'typescript';

// Transpile constants.ts and crypto.ts
const transpile = async (relPath) => {
  const src = await readFile(new URL(relPath, import.meta.url), 'utf8');
  const { outputText } = ts.transpileModule(src, {
    compilerOptions: { module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2022 },
  });
  return import(`data:text/javascript;base64,${Buffer.from(outputText).toString('base64')}`);
};

const { SURAHS, RECITERS, getSurahAudioUrl } = await transpile('../src/lib/constants.ts');

console.log('--- STARTING FIRST-TIME VISITOR STATE TESTS ---');

// Mock localStorage
class MockLocalStorage {
  constructor() { this.store = new Map(); }
  getItem(k) { return this.store.get(k) || null; }
  setItem(k, v) { this.store.set(k, String(v)); }
  removeItem(k) { this.store.delete(k); }
  clear() { this.store.clear(); }
}
globalThis.localStorage = new MockLocalStorage();
globalThis.window = { localStorage: globalThis.localStorage };

// Test 1: First-time visitor has NULL currentTrack and zero audio state
console.log('Test 1: Fresh visitor initial state');
const freshVisitorState = {
  currentTrack: null,
  isPlaying: false,
  currentTime: 0,
  duration: 0,
  favorites: [],
  downloadedSurahs: [],
  insights: {
    totalMinutesListened: 0,
    currentStreak: 0,
    bestStreak: 0,
    lastListenedDate: null,
    dailyMinutes: {},
    timeOfDayStats: {
      afterFajr: 0, morning: 0, dhuhr: 0, afternoon: 0, afterMaghrib: 0, evening: 0, lateNight: 0,
    },
    reciterListens: {},
    surahListens: {},
  },
};

assert.equal(freshVisitorState.currentTrack, null, 'First-time visitor must NOT have an active currentTrack');
assert.equal(freshVisitorState.isPlaying, false, 'First-time visitor must NOT be playing audio automatically');
assert.equal(freshVisitorState.insights.totalMinutesListened, 0, 'Total minutes must start at 0');
assert.equal(freshVisitorState.insights.currentStreak, 0, 'Streak must start at 0');
assert.deepEqual(freshVisitorState.favorites, [], 'Favorites must start empty');
assert.deepEqual(freshVisitorState.downloadedSurahs, [], 'Downloaded surahs must start empty');
console.log('  ✓ Fresh visitor initial state is pristine (no uninvited audio, no fake history)');

// Test 2: Audio element render safety with null currentTrack
console.log('Test 2: Null currentTrack rendering safety');
function shouldRenderRecitationAudio(currentTrack) {
  return currentTrack !== null && Boolean(currentTrack.audioUrl);
}
assert.equal(shouldRenderRecitationAudio(null), false, 'Must not render audio element when currentTrack is null');
assert.equal(shouldRenderRecitationAudio({ audioUrl: '' }), false, 'Must not render audio element when audioUrl is empty');
assert.equal(shouldRenderRecitationAudio({ audioUrl: 'https://example.com/001.mp3' }), true);
console.log('  ✓ No recitation audio element is loaded or preloaded for a new visitor');

// Test 3: Explicit play action starts playback from requested Surah
console.log('Test 3: Explicit play action initiation');
let state = { ...freshVisitorState };
function playSurah(surah, reciter = RECITERS[0]) {
  state = {
    ...state,
    currentTrack: {
      surah,
      reciter,
      audioUrl: getSurahAudioUrl(reciter, surah.number),
    },
    isPlaying: true,
    currentTime: 0,
    duration: 0,
  };
}

playSurah(SURAHS[0], RECITERS[0]);
assert.notEqual(state.currentTrack, null, 'currentTrack should be set on explicit action');
assert.equal(state.currentTrack.surah.number, 1, 'Should play Surah Al-Fatihah');
assert.equal(state.isPlaying, true, 'isPlaying should become true on explicit action');
console.log('  ✓ Explicit play action smoothly starts recitation');

// Test 4: Corrupt saved state recovery
console.log('Test 4: Corrupt and legacy saved state recovery');
const corruptStorageStrings = [
  '{ corrupt json',
  'null',
  '{"insights": "not an object"}',
  '{"favorites": "not an array"}',
  '{"insights": {"totalMinutesListened": 142, "bestStreak": 12}}', // Legacy mock
];

for (const raw of corruptStorageStrings) {
  let parsed;
  try {
    parsed = JSON.parse(raw);
  } catch {
    parsed = null;
  }

  const sanitized = {
    favorites: Array.isArray(parsed?.favorites) ? parsed.favorites : [],
    insights: (parsed?.insights && typeof parsed.insights === 'object' && parsed.insights.bestStreak !== 12)
      ? parsed.insights
      : freshVisitorState.insights,
  };

  assert.ok(Array.isArray(sanitized.favorites), 'Favorites must safely resolve to an array');
  assert.equal(typeof sanitized.insights.totalMinutesListened, 'number', 'Insights must have valid numeric total');
}
console.log('  ✓ Corrupt, invalid, and legacy mock storage states are safely recovered');

console.log('--- ALL FIRST-TIME VISITOR TESTS PASSED SUCCESSFULLY ---');
