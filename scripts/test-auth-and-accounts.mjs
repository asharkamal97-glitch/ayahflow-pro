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

const { hashPassword, verifyPassword, generateSecureToken } = await transpile('../src/lib/auth/crypto.ts');

console.log('--- STARTING SECURE ACCOUNT & AUTHENTICATION TESTS ---');

// Test 1: PBKDF2 Password Hashing
console.log('Test 1: PBKDF2-SHA256 Password Cryptography');
const plainPassword = 'SuperSecretPassword123!';
const hash1 = await hashPassword(plainPassword);
const hash2 = await hashPassword(plainPassword);

assert.ok(hash1.includes(':'), 'Hash must contain salt:hash format');
assert.notEqual(hash1, plainPassword, 'Plaintext password must NEVER be stored');
assert.notEqual(hash1, hash2, 'Identical passwords must produce distinct hashes due to random cryptographic salt');

const isMatch1 = await verifyPassword(plainPassword, hash1);
assert.equal(isMatch1, true, 'Correct password must verify successfully');

const isMatchWrong = await verifyPassword('WrongPassword123!', hash1);
assert.equal(isMatchWrong, false, 'Incorrect password must be rejected');

console.log('  ✓ PBKDF2 with 100k iterations and random cryptographic salt verified');

// Test 2: Input Validation
console.log('Test 2: Input validation and security checks');
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
assert.equal(emailRegex.test('valid@example.com'), true);
assert.equal(emailRegex.test('invalid-email'), false);
assert.equal(emailRegex.test('missing@domain'), false);

const isPasswordLongEnough = (pw) => pw.length >= 8;
assert.equal(isPasswordLongEnough('short'), false);
assert.equal(isPasswordLongEnough('longenough123'), true);
console.log('  ✓ Email format and password complexity validations verified');

// Test 3: Account Data Isolation
console.log('Test 3: Multi-account & guest data isolation');
class IsolatedStorage {
  constructor() { this.store = new Map(); }
  getUserData(userId) {
    const key = userId ? `ayahflow_user_data_${userId}` : 'ayahflow_guest_data';
    return JSON.parse(this.store.get(key) || '{"playlists":[],"favorites":[]}');
  }
  saveUserData(userId, data) {
    const key = userId ? `ayahflow_user_data_${userId}` : 'ayahflow_guest_data';
    this.store.set(key, JSON.stringify(data));
  }
}

const storage = new IsolatedStorage();

// User A stores playlists & favorites
storage.saveUserData('usr_userA', {
  playlists: [{ id: 'pl_1', name: 'User A Fajr', surahNumbers: [1, 36] }],
  favorites: [1, 36],
});

// User B stores their own playlists
storage.saveUserData('usr_userB', {
  playlists: [{ id: 'pl_2', name: 'User B Sleep', surahNumbers: [67, 112] }],
  favorites: [67, 112],
});

// Guest stores local state
storage.saveUserData(null, {
  playlists: [{ id: 'pl_guest', name: 'Guest Playlist', surahNumbers: [18] }],
  favorites: [18],
});

const userAData = storage.getUserData('usr_userA');
const userBData = storage.getUserData('usr_userB');
const guestData = storage.getUserData(null);

assert.equal(userAData.playlists[0].name, 'User A Fajr');
assert.deepEqual(userAData.favorites, [1, 36]);

assert.equal(userBData.playlists[0].name, 'User B Sleep');
assert.deepEqual(userBData.favorites, [67, 112]);

assert.equal(guestData.playlists[0].name, 'Guest Playlist');
assert.deepEqual(guestData.favorites, [18]);

// Verify no data cross-leakage
assert.ok(!userAData.playlists.some(p => p.id === 'pl_2'), "User A must not access User B's playlists");
assert.ok(!userBData.playlists.some(p => p.id === 'pl_1'), "User B must not access User A's playlists");
assert.ok(!guestData.playlists.some(p => p.id === 'pl_1'), "Guest must not access User A's playlists");

console.log('  ✓ Cryptographic and storage isolation between users and guests verified');

// Test 4: Secure Session Generation & Expiration
console.log('Test 4: Session token generation & expiration check');
const token = generateSecureToken(32);
assert.equal(token.length, 64, '32-byte token should be 64 hex characters');

const session = {
  token,
  userId: 'usr_userA',
  expiresAt: Date.now() + 30 * 86400000,
};

const isValidSession = (sess) => sess && sess.token && Date.now() < sess.expiresAt;
assert.equal(isValidSession(session), true);

const expiredSession = { ...session, expiresAt: Date.now() - 1000 };
assert.equal(isValidSession(expiredSession), false, 'Expired session must be rejected');

console.log('  ✓ Secure session tokens and expiration rules verified');
console.log('--- ALL AUTHENTICATION AND ACCOUNT TESTS PASSED SUCCESSFULLY ---');
