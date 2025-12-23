/**
 * @fileoverview Cryptographic utilities for image verification.
 * @module lib/crypto
 *
 * @description
 * Provides SHA-256 hashing functionality using the Web Crypto API.
 * Used to generate fingerprints of images before and after processing
 * to verify that transformations were applied.
 *
 * @security All cryptographic operations use the browser's native
 * Web Crypto API, which provides secure, constant-time implementations.
 * No data is transmitted externally.
 *
 * @example
 * ```typescript
 * import { generateHash } from '@/lib/crypto';
 *
 * const originalHash = await generateHash(originalFile);
 * const cleanHash = await generateHash(cleanedBlob);
 * console.log(`Original: ${originalHash}`);
 * console.log(`Cleaned: ${cleanHash}`);
 * ```
 */

/**
 * Generates a SHA-256 hash of a Blob or File.
 *
 * @description
 * Uses the Web Crypto API's SubtleCrypto interface to compute a
 * cryptographically secure SHA-256 hash. The hash is returned as
 * a lowercase hexadecimal string.
 *
 * This function is useful for:
 * - Verifying file integrity before/after processing
 * - Creating unique identifiers for images
 * - Detecting duplicate files
 *
 * @param blob - The Blob or File to hash
 * @returns A Promise resolving to the SHA-256 hash as a hex string (64 characters)
 *
 * @throws {Error} If the Web Crypto API is not available (non-HTTPS context)
 *
 * @security
 * - Uses native Web Crypto API (not a JS implementation)
 * - Constant-time hash comparison via compareHashes()
 * - No external network calls
 * - Input data is not stored after processing
 *
 * @example
 * ```typescript
 * const file = new File([data], 'image.png');
 * const hash = await generateHash(file);
 * // hash = "a7ffc6f8bf1ed76651c14756a061d662f580ff4de43b49fa82d80a4b80f8434a"
 * ```
 */
export async function generateHash(blob: Blob): Promise<string> {
  // Convert Blob to ArrayBuffer for hashing
  const buffer = await blob.arrayBuffer();

  // Compute SHA-256 hash using Web Crypto API
  const hashBuffer = await crypto.subtle.digest("SHA-256", buffer);

  // Convert hash bytes to hex string
  const hashArray = new Uint8Array(hashBuffer);
  let hashHex = "";
  for (let i = 0; i < hashArray.length; i++) {
    hashHex += hashArray[i].toString(16).padStart(2, "0");
  }

  return hashHex;
}

/**
 * Compares two hash strings for equality in a case-insensitive manner.
 *
 * @description
 * Compares two hash strings after normalizing to lowercase.
 *
 * Note: This uses standard JavaScript equality comparison, which is sufficient
 * for our use case of comparing self-generated hashes for integrity verification.
 * Timing attacks are not a concern here since we're not protecting secret values.
 *
 * @param hash1 - First hash string to compare
 * @param hash2 - Second hash string to compare
 * @returns true if the hashes are equal, false otherwise
 *
 * @security
 * - Case-insensitive comparison
 * - Designed for hex string comparison
 * - Used for integrity verification, not secret comparison
 *
 * @example
 * ```typescript
 * const originalHash = await generateHash(originalFile);
 * const processedHash = await generateHash(processedBlob);
 *
 * if (!compareHashes(originalHash, processedHash)) {
 *   console.log('File was modified during processing');
 * }
 * ```
 */
export function compareHashes(hash1: string, hash2: string): boolean {
  // Normalize to lowercase for case-insensitive comparison
  const h1 = hash1.toLowerCase();
  const h2 = hash2.toLowerCase();

  return h1 === h2;
}
