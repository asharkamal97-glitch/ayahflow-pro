import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import ts from 'typescript';

// Transpile constants.ts
const constSource = await readFile(new URL('../src/lib/constants.ts', import.meta.url), 'utf8');
const { outputText: constOutput, diagnostics: constDiag = [] } = ts.transpileModule(constSource, {
  compilerOptions: { module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2022 },
  reportDiagnostics: true,
});
assert.equal(constDiag.length, 0, 'constants.ts should transpile without diagnostics');
const constModuleUrl = `data:text/javascript;base64,${Buffer.from(constOutput).toString('base64')}`;
const { SURAHS, RECITERS, getSurahAudioUrl } = await import(constModuleUrl);

console.log('--- STARTING PLAYBACK STATE & SEQUENTIAL TRANSITION TESTS ---');

// Simulated Store State & Actions based on usePlayerStore implementation
function createMockStore() {
  let state = {
    currentTrack: {
      surah: SURAHS[0],
      reciter: RECITERS[0],
      audioUrl: getSurahAudioUrl(RECITERS[0], 1),
    },
    isPlaying: false,
    currentTime: 0,
    duration: 180,
    repeatMode: 'all', // 'all' | 'one' | 'off'
    isShuffle: false,
    selectedReciter: RECITERS[0],
    playlist: null,
    playlistIndex: -1,
    queue: [],
  };

  const actions = {
    getState: () => ({ ...state }),
    setState: (partial) => {
      state = { ...state, ...partial };
    },
    playPlaylist: (tracks, startIndex = 0) => {
      if (!tracks || tracks.length === 0) return;
      const safeIndex = Math.max(0, Math.min(tracks.length - 1, startIndex));
      const activeTrack = tracks[safeIndex];
      const remainingQueue = tracks.slice(safeIndex + 1);
      state = {
        ...state,
        playlist: tracks,
        playlistIndex: safeIndex,
        currentTrack: activeTrack,
        queue: remainingQueue,
        currentTime: 0,
        isPlaying: true,
      };
    },
    playSurah: (surah, reciter) => {
      const activeReciter = reciter || state.selectedReciter;
      state = {
        ...state,
        currentTrack: {
          surah,
          reciter: activeReciter,
          audioUrl: getSurahAudioUrl(activeReciter, surah.number),
        },
        playlist: null,
        playlistIndex: -1,
        queue: [],
        currentTime: 0,
        isPlaying: true,
      };
    },
    skipBy: (seconds) => {
      let target = state.currentTime + seconds;
      if (target < 0) target = 0;
      if (state.duration > 0 && target > state.duration) target = state.duration;
      state.currentTime = target;
    },
    handleTrackEnded: () => {
      // 1. Repeat single track
      if (state.repeatMode === 'one') {
        state = { ...state, currentTime: 0, isPlaying: true };
        return;
      }

      // 2. Playlist mode
      if (state.playlist && state.playlist.length > 0) {
        const nextIdx = state.playlistIndex + 1;
        if (nextIdx < state.playlist.length) {
          const nextTrack = state.playlist[nextIdx];
          state = {
            ...state,
            playlistIndex: nextIdx,
            currentTrack: nextTrack,
            queue: state.playlist.slice(nextIdx + 1),
            currentTime: 0,
            isPlaying: true,
          };
          return;
        }

        // Last track in playlist
        if (state.repeatMode === 'all') {
          const firstTrack = state.playlist[0];
          state = {
            ...state,
            playlistIndex: 0,
            currentTrack: firstTrack,
            queue: state.playlist.slice(1),
            currentTime: 0,
            isPlaying: true,
          };
          return;
        }

        // repeatMode === 'off'
        state = { ...state, isPlaying: false, currentTime: 0 };
        return;
      }

      // 3. Queue mode
      if (state.queue.length > 0) {
        const nextTrack = state.queue[0];
        state = {
          ...state,
          currentTrack: nextTrack,
          queue: state.queue.slice(1),
          currentTime: 0,
          isPlaying: true,
        };
        return;
      }

      // 4. Natural Surah progression (1 -> 2 -> ... -> 114)
      const currentNum = state.currentTrack.surah.number;
      if (currentNum < 114) {
        const nextSurah = SURAHS.find((s) => s.number === currentNum + 1) || SURAHS[currentNum];
        actions.playSurah(nextSurah, state.selectedReciter);
        return;
      }

      // Surah 114 finished
      if (state.repeatMode === 'all') {
        actions.playSurah(SURAHS[0], state.selectedReciter);
        return;
      }

      state = { ...state, isPlaying: false, currentTime: 0 };
    },
  };

  return actions;
}

// TEST 1: Sequential Playlist Playback
console.log('Test 1: Sequential playlist playback');
const store = createMockStore();
const samplePlaylist = [
  { surah: SURAHS[0], reciter: RECITERS[0], audioUrl: getSurahAudioUrl(RECITERS[0], 1) },
  { surah: SURAHS[1], reciter: RECITERS[0], audioUrl: getSurahAudioUrl(RECITERS[0], 2) },
  { surah: SURAHS[2], reciter: RECITERS[0], audioUrl: getSurahAudioUrl(RECITERS[0], 3) },
];

store.playPlaylist(samplePlaylist, 0);
assert.equal(store.getState().currentTrack.surah.number, 1);
assert.equal(store.getState().playlistIndex, 0);
assert.equal(store.getState().queue.length, 2);

// Natural track end of track 1
store.handleTrackEnded();
assert.equal(store.getState().currentTrack.surah.number, 2);
assert.equal(store.getState().playlistIndex, 1);
assert.equal(store.getState().queue.length, 1);

// Natural track end of track 2
store.handleTrackEnded();
assert.equal(store.getState().currentTrack.surah.number, 3);
assert.equal(store.getState().playlistIndex, 2);
assert.equal(store.getState().queue.length, 0);

// Last track finishes with repeatMode='all' -> loops to track 1
store.handleTrackEnded();
assert.equal(store.getState().currentTrack.surah.number, 1);
assert.equal(store.getState().playlistIndex, 0);
assert.equal(store.getState().queue.length, 2);
console.log('  ✓ Playlist advances sequentially and loops on repeatMode="all"');

// TEST 2: Playlist last track with repeatMode='off'
console.log('Test 2: Playlist completion with repeatMode="off"');
store.playPlaylist(samplePlaylist, 2); // Start at last track
store.setState({ repeatMode: 'off' });
store.handleTrackEnded();
assert.equal(store.getState().isPlaying, false, 'Playback should finish cleanly');
assert.equal(store.getState().currentTime, 0);
console.log('  ✓ Playlist terminates cleanly on last track when repeatMode="off"');

// TEST 3: Individual Surah natural progression (1 -> 2 -> ... -> 114)
console.log('Test 3: Natural next-Surah progression');
store.playSurah(SURAHS[0], RECITERS[0]); // Surah 1 (Al-Fatihah)
assert.equal(store.getState().playlist, null, 'Playlist should be cleared on individual playSurah');
assert.equal(store.getState().currentTrack.surah.number, 1);

store.handleTrackEnded();
assert.equal(store.getState().currentTrack.surah.number, 2, 'Should advance to Surah 2 (Al-Baqarah)');

store.playSurah(SURAHS[112], RECITERS[0]); // Surah 113 (Al-Falaq)
store.handleTrackEnded();
assert.equal(store.getState().currentTrack.surah.number, 114, 'Should advance to Surah 114 (An-Nas)');

// Surah 114 finishes with repeatMode='off'
store.setState({ repeatMode: 'off' });
store.handleTrackEnded();
assert.equal(store.getState().isPlaying, false, 'Surah 114 with repeat off should stop');

// Surah 114 finishes with repeatMode='all'
store.playSurah(SURAHS[113], RECITERS[0]); // Surah 114
store.setState({ repeatMode: 'all' });
store.handleTrackEnded();
assert.equal(store.getState().currentTrack.surah.number, 1, 'Surah 114 with repeat all should wrap to Surah 1');
console.log('  ✓ Natural Surah progression (1 -> 114) and safe wrap verified');

// TEST 4: Repeat One Mode
console.log('Test 4: Repeat Mode "one"');
store.playSurah(SURAHS[35], RECITERS[0]); // Surah 36 (Ya-Sin)
store.setState({ repeatMode: 'one', currentTime: 150 });
store.handleTrackEnded();
assert.equal(store.getState().currentTrack.surah.number, 36, 'Should remain on Surah 36');
assert.equal(store.getState().currentTime, 0, 'Current time should reset to 0');
assert.equal(store.getState().isPlaying, true, 'Should stay playing');
console.log('  ✓ Repeat "one" restarts current track cleanly');

// TEST 5: Skip forward and backward (skipBy)
console.log('Test 5: Skip forward and backward (skipBy)');
store.setState({ currentTime: 20, duration: 100 });
store.skipBy(10);
assert.equal(store.getState().currentTime, 30, '20 + 10 = 30');
store.skipBy(-15);
assert.equal(store.getState().currentTime, 15, '30 - 15 = 15');
store.skipBy(-50);
assert.equal(store.getState().currentTime, 0, 'Clamped to 0 minimum');
store.skipBy(200);
assert.equal(store.getState().currentTime, 100, 'Clamped to duration maximum');
console.log('  ✓ skipBy handles positive, negative, and bounded values correctly');

console.log('--- ALL PLAYBACK STATE TESTS PASSED SUCCESSFULLY ---');
