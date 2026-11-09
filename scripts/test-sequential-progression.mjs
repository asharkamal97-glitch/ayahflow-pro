import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import ts from 'typescript';

const transpile = async (relPath) => {
  const src = await readFile(new URL(relPath, import.meta.url), 'utf8');
  const { outputText } = ts.transpileModule(src, {
    compilerOptions: { module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2022 },
  });
  return import(`data:text/javascript;base64,${Buffer.from(outputText).toString('base64')}`);
};

const { SURAHS, RECITERS, getSurahAudioUrl } = await transpile('../src/lib/constants.ts');

console.log('--- STARTING SEQUENTIAL PLAYLIST PROGRESSION TESTS (A -> B -> C) ---');

// Mock Store implementation exactly replicating usePlayerStore transition lock and logic
function createPlayerEngine() {
  let state = {
    currentTrack: null,
    isPlaying: false,
    currentTime: 0,
    duration: 180,
    repeatMode: 'all',
    playlist: null,
    playlistIndex: -1,
    queue: [],
    isTransitioningTrack: false,
    lastTransitionTimestamp: 0,
  };

  const engine = {
    getState: () => ({ ...state }),
    resetTransitionLock: () => {
      state.isTransitioningTrack = false;
      state.lastTransitionTimestamp = 0;
    },

    playPlaylist: (tracks, startIndex = 0) => {
      if (!tracks || tracks.length === 0) return;
      const idx = Math.max(0, Math.min(tracks.length - 1, startIndex));
      state = {
        ...state,
        playlist: tracks,
        playlistIndex: idx,
        currentTrack: tracks[idx],
        queue: tracks.slice(idx + 1),
        currentTime: 0,
        isPlaying: true,
        isTransitioningTrack: false,
        lastTransitionTimestamp: 0,
      };
    },

    handleTrackEnded: (fromAudioUrl) => {
      const { currentTrack, repeatMode, playlist, playlistIndex, isTransitioningTrack, lastTransitionTimestamp } = state;
      if (!currentTrack) return;
      if (fromAudioUrl && currentTrack.audioUrl !== fromAudioUrl) return;

      const now = Date.now();
      // Atomic debounce / transition lock guard
      if (isTransitioningTrack || (lastTransitionTimestamp && now - lastTransitionTimestamp < 1000)) {
        return; // Guarded: blocks duplicate event
      }

      state.isTransitioningTrack = true;
      state.lastTransitionTimestamp = now;

      setTimeout(() => {
        state.isTransitioningTrack = false;
      }, 1000);

      // Playlist progression
      if (playlist && playlist.length > 0) {
        const nextIdx = playlistIndex + 1;
        if (nextIdx < playlist.length) {
          const nextTrack = playlist[nextIdx];
          state = {
            ...state,
            playlistIndex: nextIdx,
            currentTrack: nextTrack,
            queue: playlist.slice(nextIdx + 1),
            currentTime: 0,
            isPlaying: true,
          };
          return;
        }

        // Last track in playlist
        if (repeatMode === 'all') {
          const firstTrack = playlist[0];
          state = {
            ...state,
            playlistIndex: 0,
            currentTrack: firstTrack,
            queue: playlist.slice(1),
            currentTime: 0,
            isPlaying: true,
          };
          return;
        }

        // repeatMode === 'off'
        state = { ...state, isPlaying: false, currentTime: 0 };
      }
    },
  };

  return engine;
}

const reciter = RECITERS[0];
const trackA = { surah: SURAHS[0], reciter, audioUrl: getSurahAudioUrl(reciter, 1) }; // Al-Fatihah
const trackB = { surah: SURAHS[1], reciter, audioUrl: getSurahAudioUrl(reciter, 2) }; // Al-Baqarah
const trackC = { surah: SURAHS[2], reciter, audioUrl: getSurahAudioUrl(reciter, 3) }; // Ali 'Imran

const playlist = [trackA, trackB, trackC];

// Test 1: Playlist [A, B, C] starts at A
console.log('Test 1: Start playlist [A, B, C] at track A');
const engine = createPlayerEngine();
engine.playPlaylist(playlist, 0);

assert.equal(engine.getState().playlistIndex, 0);
assert.equal(engine.getState().currentTrack.surah.number, 1, 'Current track should be Track A');
assert.equal(engine.getState().queue.length, 2, 'Queue should have [B, C]');
console.log('  ✓ Playlist successfully initialized at Track A with queue [B, C]');

// Test 2: Track A finishes -> advances to Track B. Duplicate event does NOT skip B!
console.log('Test 2: Track A completion with duplicate ended events (protecting Track B)');
engine.handleTrackEnded(trackA.audioUrl);

assert.equal(engine.getState().playlistIndex, 1, 'Playlist index should advance from 0 to 1 (Track B)');
assert.equal(engine.getState().currentTrack.surah.number, 2, 'Current track MUST be Track B (NOT skipped)');
assert.equal(engine.getState().queue.length, 1, 'Queue should have [C]');

// Now simulate an immediate second completion event (e.g. from React synthetic handler or flushed buffer)
console.log('  -> Simulating immediate duplicate completion event within 50ms...');
engine.handleTrackEnded(trackA.audioUrl); // With old URL
engine.handleTrackEnded(engine.getState().currentTrack.audioUrl); // With new URL during transition lock

assert.equal(engine.getState().playlistIndex, 1, 'Playlist index MUST remain 1 (Track B protected)');
assert.equal(engine.getState().currentTrack.surah.number, 2, 'Track B is still active and playing!');
console.log('  ✓ Transition lock successfully blocked duplicate trigger: Track B was NOT skipped!');

// Test 3: Track B completes naturally -> advances to Track C
console.log('Test 3: Track B natural completion -> advances to Track C');
// Fast-forward past transition lock timestamp
engine.resetTransitionLock();

engine.handleTrackEnded(trackB.audioUrl);
assert.equal(engine.getState().playlistIndex, 2, 'Playlist index advances to 2 (Track C)');
assert.equal(engine.getState().currentTrack.surah.number, 3, 'Current track is Track C');
assert.equal(engine.getState().queue.length, 0, 'Queue is now empty as this is the final track');
console.log('  ✓ Natural progression A -> B -> C verified without any skipped tracks');

// Test 4: Final track completion with repeatMode 'all'
console.log('Test 4: Final track completion loops to Track A (repeatMode="all")');
engine.resetTransitionLock();

engine.handleTrackEnded(trackC.audioUrl);
assert.equal(engine.getState().playlistIndex, 0, 'Should loop back to index 0');
assert.equal(engine.getState().currentTrack.surah.number, 1, 'Current track should be Track A');
assert.equal(engine.getState().queue.length, 2, 'Queue restored to [B, C]');
console.log('  ✓ Clean wrap-around to Track A verified');

// Test 5: Manual track selection in playlist
console.log('Test 5: Manual track selection within active playlist');
engine.playPlaylist(playlist, 1); // User clicks Track B directly
assert.equal(engine.getState().playlistIndex, 1);
assert.equal(engine.getState().currentTrack.surah.number, 2, 'Should immediately play selected Track B');
assert.equal(engine.getState().queue.length, 1);
assert.equal(engine.getState().queue[0].surah.number, 3, 'Queue must be [Track C]');

// Track B finishes -> should go to C
engine.resetTransitionLock();
engine.handleTrackEnded(trackB.audioUrl);
assert.equal(engine.getState().playlistIndex, 2);
assert.equal(engine.getState().currentTrack.surah.number, 3);
console.log('  ✓ Manual selection at Track B and subsequent progression to Track C verified');

// Test 6: Switching playlists
console.log('Test 6: Switching playlists cleanly replaces queue');
const playlist2 = [
  { surah: SURAHS[66], reciter, audioUrl: getSurahAudioUrl(reciter, 67) }, // Al-Mulk
  { surah: SURAHS[17], reciter, audioUrl: getSurahAudioUrl(reciter, 18) }, // Al-Kahf
];

engine.playPlaylist(playlist2, 0);
assert.equal(engine.getState().playlist.length, 2);
assert.equal(engine.getState().currentTrack.surah.number, 67);
assert.equal(engine.getState().queue.length, 1);
assert.equal(engine.getState().queue[0].surah.number, 18);
console.log('  ✓ Switching playlists cleanly resets queue and current track');

console.log('--- ALL SEQUENTIAL PROGRESSION TESTS PASSED SUCCESSFULLY ---');
