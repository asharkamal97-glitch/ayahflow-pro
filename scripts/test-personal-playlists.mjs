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

console.log('--- STARTING PERSONAL PLAYLISTS TESTS ---');

// Simulated Playlist Store
class MockPlaylistManager {
  constructor() {
    this.playlists = [];
    this.activePlaylistId = null;
  }

  createPlaylist(name, description = '', initialSurahs = []) {
    const newPl = {
      id: `pl_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      name: name.trim() || 'My Playlist',
      description: description.trim(),
      createdAt: Date.now(),
      updatedAt: Date.now(),
      surahNumbers: [...initialSurahs],
    };
    this.playlists.unshift(newPl);
    return newPl;
  }

  renamePlaylist(id, newName) {
    const pl = this.playlists.find(p => p.id === id);
    if (pl) {
      pl.name = newName.trim();
      pl.updatedAt = Date.now();
    }
  }

  deletePlaylist(id) {
    this.playlists = this.playlists.filter(p => p.id !== id);
    if (this.activePlaylistId === id) this.activePlaylistId = null;
  }

  addSurah(playlistId, surahNumber) {
    const pl = this.playlists.find(p => p.id === playlistId);
    if (pl && !pl.surahNumbers.includes(surahNumber)) {
      pl.surahNumbers.push(surahNumber);
      pl.updatedAt = Date.now();
      return true;
    }
    return false;
  }

  removeSurah(playlistId, surahNumber) {
    const pl = this.playlists.find(p => p.id === playlistId);
    if (pl) {
      pl.surahNumbers = pl.surahNumbers.filter(n => n !== surahNumber);
      pl.updatedAt = Date.now();
    }
  }

  reorderSurah(playlistId, fromIndex, toIndex) {
    const pl = this.playlists.find(p => p.id === playlistId);
    if (!pl) return;
    if (fromIndex < 0 || fromIndex >= pl.surahNumbers.length) return;
    if (toIndex < 0 || toIndex >= pl.surahNumbers.length) return;

    const [moved] = pl.surahNumbers.splice(fromIndex, 1);
    pl.surahNumbers.splice(toIndex, 0, moved);
    pl.updatedAt = Date.now();
  }

  getTracks(playlistId, reciter = RECITERS[0]) {
    const pl = this.playlists.find(p => p.id === playlistId);
    if (!pl) return [];
    return pl.surahNumbers.map(num => {
      const surah = SURAHS.find(s => s.number === num);
      if (!surah) return null;
      return {
        surah,
        reciter,
        audioUrl: getSurahAudioUrl(reciter, surah.number),
      };
    }).filter(Boolean);
  }
}

const manager = new MockPlaylistManager();

// Test 1: Create playlist
console.log('Test 1: Create personal playlist');
const pl = manager.createPlaylist('Nighttime Reflection', 'Calming surahs for sleep', [67, 18]);
assert.equal(pl.name, 'Nighttime Reflection');
assert.deepEqual(pl.surahNumbers, [67, 18]);
console.log('  ✓ Playlist created with custom title, notes, and initial surahs');

// Test 2: Add surah preserving custom order
console.log('Test 2: Preserving custom surah sequence');
manager.addSurah(pl.id, 1);
manager.addSurah(pl.id, 114);
assert.deepEqual(pl.surahNumbers, [67, 18, 1, 114], 'Surahs must follow insertion order, NOT numerical order');
console.log('  ✓ Custom surah order [67, 18, 1, 114] strictly preserved');

// Test 3: Reorder surahs
console.log('Test 3: Reorder surahs in playlist');
// Move 114 from index 3 to index 0
manager.reorderSurah(pl.id, 3, 0);
assert.deepEqual(pl.surahNumbers, [114, 67, 18, 1], 'Surah 114 moved to first position');
console.log('  ✓ Reordering (114 moved to index 0) verified: [114, 67, 18, 1]');

// Test 4: Track generation in exact order
console.log('Test 4: Track generation in exact playlist order');
const tracks = manager.getTracks(pl.id, RECITERS[0]);
assert.equal(tracks.length, 4);
assert.equal(tracks[0].surah.number, 114);
assert.equal(tracks[1].surah.number, 67);
assert.equal(tracks[2].surah.number, 18);
assert.equal(tracks[3].surah.number, 1);
console.log('  ✓ Tracks generated match exact saved sequence for player engine');

// Test 5: Remove surah
console.log('Test 5: Remove surah from playlist');
manager.removeSurah(pl.id, 18);
assert.deepEqual(pl.surahNumbers, [114, 67, 1]);
console.log('  ✓ Surah 18 removed cleanly');

// Test 6: Rename & Delete
console.log('Test 6: Rename and delete playlist');
manager.renamePlaylist(pl.id, 'Midnight Quran Sanctuary');
assert.equal(manager.playlists[0].name, 'Midnight Quran Sanctuary');

manager.deletePlaylist(pl.id);
assert.equal(manager.playlists.length, 0);
console.log('  ✓ Rename and delete verified');

console.log('--- ALL PERSONAL PLAYLISTS TESTS PASSED SUCCESSFULLY ---');
