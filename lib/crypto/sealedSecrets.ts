/**
 * AES-256-GCM seal/unseal for Square OAuth tokens.
 * Key is read from SQUARE_TOKEN_ENCRYPTION_KEY (hex, base64, or utf-8 hashed to 32 bytes via SHA-256).
 * Server-only — never import from client components.
 */

import crypto from 'crypto'

const ALGORITHM = 'aes-256-gcm'
const IV_BYTES = 12
const TAG_BYTES = 16

/**
 * Derive a 32-byte Buffer from an arbitrary-length key string.
 * Hex strings of exactly 64 chars are decoded directly.
 * Base64 strings of exactly 44 chars (256-bit) are decoded directly.
 * Everything else is hashed with SHA-256 to produce a stable 32-byte key.
 */
function deriveKey(raw: string): Buffer {
  const trimmed = raw.trim()

  if (/^[0-9a-fA-F]{64}$/.test(trimmed)) {
    return Buffer.from(trimmed, 'hex')
  }

  if (/^[A-Za-z0-9+/]{43}=$/.test(trimmed) || /^[A-Za-z0-9+/]{44}$/.test(trimmed)) {
    const decoded = Buffer.from(trimmed, 'base64')
    if (decoded.byteLength === 32) return decoded
  }

  return crypto.createHash('sha256').update(trimmed, 'utf8').digest()
}

function getEncryptionKey(): Buffer {
  const raw = process.env.SQUARE_TOKEN_ENCRYPTION_KEY
  if (!raw || raw.trim().length === 0) {
    throw new Error(
      'SQUARE_TOKEN_ENCRYPTION_KEY is not set. Provide a 32+ byte secret before using Square OAuth.',
    )
  }
  return deriveKey(raw)
}

/**
 * Encrypt plaintext to a colon-delimited hex string: iv:authTag:ciphertext
 */
export function sealSecret(plaintext: string): string {
  const key = getEncryptionKey()
  const iv = crypto.randomBytes(IV_BYTES)
  const cipher = crypto.createCipheriv(ALGORITHM, key, iv) as crypto.CipherGCM
  const encrypted = Buffer.concat([cipher.update(plaintext, 'utf8'), cipher.final()])
  const tag = cipher.getAuthTag()
  return [iv.toString('hex'), tag.toString('hex'), encrypted.toString('hex')].join(':')
}

/**
 * Decrypt a sealed string produced by sealSecret.
 * Throws on any integrity failure.
 */
export function unsealSecret(sealed: string): string {
  const parts = sealed.split(':')
  if (parts.length !== 3) {
    throw new Error('Invalid sealed secret format — expected iv:tag:ciphertext')
  }
  const [ivHex, tagHex, ciphertextHex] = parts

  let iv: Buffer
  let tag: Buffer
  let ciphertext: Buffer
  try {
    iv = Buffer.from(ivHex, 'hex')
    tag = Buffer.from(tagHex, 'hex')
    ciphertext = Buffer.from(ciphertextHex, 'hex')
  } catch {
    throw new Error('Malformed sealed secret hex segments')
  }

  if (iv.byteLength !== IV_BYTES) {
    throw new Error(`IV must be ${IV_BYTES} bytes, got ${iv.byteLength}`)
  }
  if (tag.byteLength !== TAG_BYTES) {
    throw new Error(`Auth tag must be ${TAG_BYTES} bytes, got ${tag.byteLength}`)
  }

  const key = getEncryptionKey()
  const decipher = crypto.createDecipheriv(ALGORITHM, key, iv) as crypto.DecipherGCM
  decipher.setAuthTag(tag)

  try {
    const decrypted = Buffer.concat([decipher.update(ciphertext), decipher.final()])
    return decrypted.toString('utf8')
  } catch {
    throw new Error('Secret authentication failed — data may be tampered or key mismatch')
  }
}

/**
 * Pure roundtrip test — useful in unit tests and verify scripts.
 * Returns true if seal → unseal produces the original value.
 * Does NOT touch process.env; accepts an explicit key string.
 */
export function roundtripTest(plaintext: string, keyOverride: string): boolean {
  const key = deriveKey(keyOverride)

  const iv = crypto.randomBytes(IV_BYTES)
  const cipher = crypto.createCipheriv(ALGORITHM, key, iv) as crypto.CipherGCM
  const encrypted = Buffer.concat([cipher.update(plaintext, 'utf8'), cipher.final()])
  const tag = cipher.getAuthTag()
  const sealed = [iv.toString('hex'), tag.toString('hex'), encrypted.toString('hex')].join(':')

  const decipher = crypto.createDecipheriv(ALGORITHM, key, iv) as crypto.DecipherGCM
  decipher.setAuthTag(tag)
  const decrypted = Buffer.concat([
    decipher.update(Buffer.from(encrypted)),
    decipher.final(),
  ]).toString('utf8')

  return decrypted === plaintext && sealed.split(':').length === 3
}
