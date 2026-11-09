/**
 * Cryptographic utilities for client-side password hashing and session tokens.
 * Uses the Web Crypto API (supported natively in all modern browsers and Node 18+).
 * 
 * Never stores plaintext passwords. Uses PBKDF2 with SHA-256 and 100,000 iterations
 * plus a 16-byte cryptographically secure random salt per user.
 */

const PBKDF2_ITERATIONS = 100000;
const SALT_BYTE_LENGTH = 16;
const HASH_KEY_BYTE_LENGTH = 32;

function bufferToHex(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);
  let hex = '';
  for (let i = 0; i < bytes.length; i++) {
    hex += bytes[i].toString(16).padStart(2, '0');
  }
  return hex;
}

function hexToBuffer(hex: string): Uint8Array {
  const bytes = new Uint8Array(hex.length / 2);
  for (let i = 0; i < hex.length; i += 2) {
    bytes[i / 2] = parseInt(hex.substring(i, i + 2), 16);
  }
  return bytes;
}

/** Timing-safe string comparison to prevent side-channel timing attacks */
function constantTimeCompare(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) {
    diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  return diff === 0;
}

/** Generates a cryptographically secure random hex string */
export function generateSecureToken(byteLength = 32): string {
  const bytes = new Uint8Array(byteLength);
  globalThis.crypto.getRandomValues(bytes);
  return bufferToHex(bytes.buffer);
}

/** Hashes a password using PBKDF2-SHA256 with a unique random salt */
export async function hashPassword(password: string): Promise<string> {
  const salt = new Uint8Array(SALT_BYTE_LENGTH);
  globalThis.crypto.getRandomValues(salt);

  const encoder = new TextEncoder();
  const passwordKey = await globalThis.crypto.subtle.importKey(
    'raw',
    encoder.encode(password),
    'PBKDF2',
    false,
    ['deriveBits']
  );

  const derivedBits = await globalThis.crypto.subtle.deriveBits(
    {
      name: 'PBKDF2',
      salt: salt.buffer as ArrayBuffer,
      iterations: PBKDF2_ITERATIONS,
      hash: 'SHA-256',
    },
    passwordKey,
    HASH_KEY_BYTE_LENGTH * 8
  );

  const saltHex = bufferToHex(salt.buffer);
  const hashHex = bufferToHex(derivedBits);
  return `${saltHex}:${hashHex}`;
}

/** Verifies a candidate password against a stored `salt:hash` string */
export async function verifyPassword(password: string, storedHashRecord: string): Promise<boolean> {
  try {
    const [saltHex, expectedHashHex] = storedHashRecord.split(':');
    if (!saltHex || !expectedHashHex) return false;

    const salt = hexToBuffer(saltHex);
    const encoder = new TextEncoder();
    const passwordKey = await globalThis.crypto.subtle.importKey(
      'raw',
      encoder.encode(password),
      'PBKDF2',
      false,
      ['deriveBits']
    );

    const derivedBits = await globalThis.crypto.subtle.deriveBits(
      {
        name: 'PBKDF2',
        salt: salt.buffer as ArrayBuffer,
        iterations: PBKDF2_ITERATIONS,
        hash: 'SHA-256',
      },
      passwordKey,
      HASH_KEY_BYTE_LENGTH * 8
    );

    const derivedHashHex = bufferToHex(derivedBits);
    return constantTimeCompare(derivedHashHex, expectedHashHex);
  } catch (err) {
    console.error('Password verification failed due to crypto error:', err);
    return false;
  }
}
