/**
 * @fileoverview Binary metadata stripper for images.
 * @module lib/metadata-stripper
 *
 * @description
 * This module provides functions to strip metadata segments directly from
 * image file binaries without re-encoding. This approach preserves the
 * original image quality and file size while removing all privacy-sensitive
 * metadata (EXIF, XMP, IPTC, ICC profiles, comments, etc.).
 *
 * @security This module is privacy-critical. All operations are performed
 * client-side using ArrayBuffer manipulation. No data is transmitted.
 *
 * @example
 * ```typescript
 * import { stripMetadata } from '@/lib/metadata-stripper';
 *
 * const cleanBlob = await stripMetadata(imageFile);
 * ```
 */

/*** JPEG METADATA STRIPPER ***/

/**
 * JPEG marker constants for readability and maintainability.
 * @see https://www.w3.org/Graphics/JPEG/itu-t81.pdf
 */
const JPEG_MARKERS = {
  /** Start of Image */
  SOI: 0xd8,
  /** End of Image */
  EOI: 0xd9,
  /** Start of Scan (image data follows) */
  SOS: 0xda,
  /** Define Quantization Table */
  DQT: 0xdb,
  /** Define Huffman Table */
  DHT: 0xc4,
  /** Define Restart Interval */
  DRI: 0xdd,
  /** Comment - REMOVED for privacy */
  COM: 0xfe,
  /** APP0 (JFIF header) - kept if valid JFIF */
  APP0: 0xe0,
  /** APP1-APP15 range start (EXIF, XMP, etc.) - REMOVED */
  APP1: 0xe1,
  /** APP15 range end - REMOVED */
  APP15: 0xef,
  /** Restart markers range */
  RST0: 0xd0,
  RST7: 0xd7,
  /** TEM marker */
  TEM: 0x01,
  /** Start of Frame range */
  SOF0: 0xc0,
  SOF15: 0xcf,
  /** Define Arithmetic Coding */
  DAC: 0xcc,
} as const;

/**
 * Strips all metadata from a JPEG file while preserving image data.
 *
 * @description
 * Parses the JPEG binary structure and removes:
 * - APP1-APP15 segments (EXIF, XMP, ICC Profile, IPTC, Adobe, etc.)
 * - COM segments (comments)
 * - Non-JFIF APP0 segments
 *
 * Preserves:
 * - JFIF APP0 header (required for proper display)
 * - DQT, DHT, DRI segments (required for decoding)
 * - SOF segments (frame information)
 * - SOS and all image scan data
 *
 * @param file - The JPEG file to process
 * @returns A new Blob containing the stripped JPEG
 * @throws {Error} If the file is not a valid JPEG
 *
 * @security
 * - Input validation ensures only valid JPEG files are processed
 * - No external calls or network access
 * - Memory is freed after processing via garbage collection
 *
 * @example
 * ```typescript
 * const file = new File([jpegData], 'photo.jpg', { type: 'image/jpeg' });
 * const cleanBlob = await stripJpegMetadata(file);
 * ```
 */
export async function stripJpegMetadata(file: File): Promise<Blob> {
  const buffer = await file.arrayBuffer();
  const data = new Uint8Array(buffer);

  // Validate JPEG signature (FFD8)
  if (data.length < 2 || data[0] !== 0xff || data[1] !== JPEG_MARKERS.SOI) {
    throw new Error("Invalid JPEG: Missing SOI marker");
  }

  // Pre-allocate output array with estimated size (usually smaller than input)
  const output: number[] = [];
  output.push(0xff, JPEG_MARKERS.SOI);

  let i = 2;
  const maxIterations = data.length; // Prevent infinite loops

  for (let iter = 0; iter < maxIterations && i < data.length - 1; iter++) {
    // Scan for marker prefix
    if (data[i] !== 0xff) {
      i++;
      continue;
    }

    const marker = data[i + 1];

    // End of Image - finalize and exit
    if (marker === JPEG_MARKERS.EOI) {
      output.push(0xff, JPEG_MARKERS.EOI);
      break;
    }

    // Skip padding bytes (consecutive 0xFF)
    if (marker === 0xff) {
      i++;
      continue;
    }

    // Handle standalone markers (no length field)
    if (isStandaloneMarker(marker)) {
      output.push(0xff, marker);
      i += 2;
      continue;
    }

    // Read segment length (2 bytes, big-endian, includes length bytes)
    if (i + 3 >= data.length) {
      break; // Truncated file - exit gracefully
    }
    const segmentLength = (data[i + 2] << 8) | data[i + 3];

    // Validate segment length to prevent out-of-bounds access
    if (segmentLength < 2 || i + 2 + segmentLength > data.length) {
      break; // Invalid or truncated segment
    }

    // Determine if this segment should be kept
    if (shouldKeepJpegSegment(marker, data, i)) {
      // Copy marker (2 bytes) + segment data (segmentLength bytes)
      for (let j = 0; j < segmentLength + 2; j++) {
        output.push(data[i + j]);
      }
    }

    // Handle Start of Scan - copy all entropy-coded image data
    if (marker === JPEG_MARKERS.SOS) {
      i += 2 + segmentLength;
      // Copy raw image data until EOI marker
      // Must handle byte stuffing: FF00 is an escaped 0xFF in image data
      while (i < data.length) {
        output.push(data[i]);
        if (data[i] === 0xff && i + 1 < data.length) {
          const nextByte = data[i + 1];
          // FF00 is byte stuffing (escaped FF in image data) - copy both bytes
          if (nextByte === 0x00) {
            i++;
            output.push(data[i]);
          } else if (nextByte === JPEG_MARKERS.EOI) {
            // Actual EOI marker found
            output.push(JPEG_MARKERS.EOI);
            i += 2;
            break;
          }
          // Other markers (like RST0-RST7) are valid in scan data
        }
        i++;
      }
      break; // EOI found or end of data, processing complete
    }

    i += 2 + segmentLength;
  }

  return new Blob([new Uint8Array(output)], { type: "image/jpeg" });
}

/**
 * Checks if a JPEG marker is standalone (has no length field).
 * @param marker - The marker byte (without 0xFF prefix)
 * @returns true if the marker is standalone
 */
function isStandaloneMarker(marker: number): boolean {
  return (
    (marker >= JPEG_MARKERS.RST0 && marker <= JPEG_MARKERS.RST7) ||
    marker === JPEG_MARKERS.SOI ||
    marker === JPEG_MARKERS.EOI ||
    marker === JPEG_MARKERS.TEM
  );
}

/**
 * Determines whether a JPEG segment should be preserved.
 *
 * @param marker - The marker byte
 * @param data - The full file data
 * @param offset - Current position in data
 * @returns true if the segment should be kept
 */
function shouldKeepJpegSegment(
  marker: number,
  data: Uint8Array,
  offset: number,
): boolean {
  // APP0: Keep only if it's a valid JFIF header
  if (marker === JPEG_MARKERS.APP0) {
    // JFIF signature: "JFIF\0" at offset+4 with null terminator at offset+8
    const hasJfifSig =
      offset + 8 < data.length &&
      data[offset + 4] === 0x4a && // J
      data[offset + 5] === 0x46 && // F
      data[offset + 6] === 0x49 && // I
      data[offset + 7] === 0x46 && // F
      data[offset + 8] === 0x00; // null terminator
    return hasJfifSig;
  }

  // APP1-APP15: ALWAYS REMOVE (EXIF, XMP, ICC, IPTC, Adobe, etc.)
  if (marker >= JPEG_MARKERS.APP1 && marker <= JPEG_MARKERS.APP15) {
    return false;
  }

  // COM (Comment): ALWAYS REMOVE
  if (marker === JPEG_MARKERS.COM) {
    return false;
  }

  // Essential segments for image decoding - KEEP
  if (
    marker === JPEG_MARKERS.DQT || // Quantization tables
    marker === JPEG_MARKERS.DHT || // Huffman tables
    marker === JPEG_MARKERS.DRI || // Restart interval
    marker === JPEG_MARKERS.SOS // Start of scan
  ) {
    return true;
  }

  // SOF0-SOF15 (except DHT=0xC4 and DAC=0xCC): Frame headers - KEEP
  if (
    marker >= JPEG_MARKERS.SOF0 &&
    marker <= JPEG_MARKERS.SOF15 &&
    marker !== JPEG_MARKERS.DHT &&
    marker !== JPEG_MARKERS.DAC
  ) {
    return true;
  }

  // Unknown markers: Keep for safety (may be required for decoding)
  return true;
}

/*** PNG METADATA STRIPPER ***/

/**
 * PNG chunk types and their purposes.
 * @see https://www.w3.org/TR/PNG-Chunks.html
 */
const PNG_CHUNKS = {
  /** Critical chunks that MUST be preserved */
  CRITICAL: new Set(["IHDR", "PLTE", "IDAT", "IEND"]),
  /** Transparency chunk - preserve for alpha channel support */
  TRANSPARENCY: "tRNS",
} as const;

/** PNG 8-byte file signature */
const PNG_SIGNATURE = new Uint8Array([
  0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a,
]);

/**
 * Strips all metadata from a PNG file while preserving image data.
 *
 * @description
 * Parses the PNG chunk structure and removes all ancillary chunks:
 * - tEXt, iTXt, zTXt (text metadata)
 * - tIME (modification time)
 * - iCCP (ICC color profile)
 * - eXIf (EXIF metadata)
 * - pHYs, gAMA, cHRM, sRGB (color/display info)
 * - All other non-critical chunks
 *
 * Preserves:
 * - IHDR (image header - required)
 * - PLTE (palette for indexed images)
 * - IDAT (compressed image data)
 * - IEND (image end marker)
 * - tRNS (transparency - required for proper alpha)
 *
 * @param file - The PNG file to process
 * @returns A new Blob containing the stripped PNG
 * @throws {Error} If the file is not a valid PNG
 *
 * @security
 * - Validates PNG signature before processing
 * - Bounds-checks all chunk reads
 * - No external dependencies or network calls
 */
export async function stripPngMetadata(file: File): Promise<Blob> {
  const buffer = await file.arrayBuffer();
  const data = new Uint8Array(buffer);

  // Validate PNG signature
  if (data.length < 8) {
    throw new Error("Invalid PNG: File too small");
  }
  for (let i = 0; i < 8; i++) {
    if (data[i] !== PNG_SIGNATURE[i]) {
      throw new Error("Invalid PNG: Bad signature");
    }
  }

  const output: number[] = [];

  // Copy PNG signature
  for (let i = 0; i < 8; i++) {
    output.push(PNG_SIGNATURE[i]);
  }

  // Allowed chunk types
  const allowedChunks = new Set([
    ...PNG_CHUNKS.CRITICAL,
    PNG_CHUNKS.TRANSPARENCY,
  ]);

  let i = 8;
  const maxIterations = Math.ceil(data.length / 12); // Minimum chunk size is 12 bytes

  for (let iter = 0; iter < maxIterations && i + 12 <= data.length; iter++) {
    // Read chunk length (4 bytes, big-endian, unsigned)
    const length =
      ((data[i] << 24) |
        (data[i + 1] << 16) |
        (data[i + 2] << 8) |
        data[i + 3]) >>>
      0;

    // Validate chunk length
    if (length > 0x7fffffff || i + 12 + length > data.length) {
      break; // Invalid or truncated chunk
    }

    // Read chunk type (4 ASCII characters)
    const type = String.fromCharCode(
      data[i + 4],
      data[i + 5],
      data[i + 6],
      data[i + 7],
    );

    // Total chunk size: length(4) + type(4) + data(length) + CRC(4)
    const chunkSize = 12 + length;

    // Keep only allowed chunks
    if (allowedChunks.has(type)) {
      for (let j = 0; j < chunkSize; j++) {
        output.push(data[i + j]);
      }
    }

    i += chunkSize;

    // Stop after IEND (no valid data after it)
    if (type === "IEND") break;
  }

  return new Blob([new Uint8Array(output)], { type: "image/png" });
}

/*** WEBP METADATA STRIPPER ***/

/**
 * WebP chunk types to preserve (image data only).
 * @see https://developers.google.com/speed/webp/docs/riff_container
 */
const WEBP_KEEP_CHUNKS = new Set([
  "VP8 ", // Lossy image data
  "VP8L", // Lossless image data
  "VP8X", // Extended header (needed for features)
  "ANIM", // Animation parameters
  "ANMF", // Animation frame
  "ALPH", // Alpha channel data
]);

/**
 * Strips all metadata from a WebP file while preserving image data.
 *
 * @description
 * WebP uses RIFF container format. This function removes:
 * - EXIF chunk
 * - XMP chunk
 * - ICCP chunk (ICC profile)
 *
 * Preserves:
 * - VP8/VP8L (image data)
 * - VP8X (extended features header)
 * - ANIM/ANMF (animation data)
 * - ALPH (alpha channel)
 *
 * @param file - The WebP file to process
 * @returns A new Blob containing the stripped WebP
 * @throws {Error} If the file is not a valid WebP
 *
 * @security
 * - Validates RIFF/WEBP signature
 * - Validates chunk sizes before reading
 * - Recalculates RIFF size header after stripping
 */
export async function stripWebpMetadata(file: File): Promise<Blob> {
  const buffer = await file.arrayBuffer();
  const data = new Uint8Array(buffer);

  // Validate minimum size and RIFF signature
  if (data.length < 12) {
    throw new Error("Invalid WebP: File too small");
  }

  // Check RIFF header
  const isRiff =
    data[0] === 0x52 &&
    data[1] === 0x49 &&
    data[2] === 0x46 &&
    data[3] === 0x46; // "RIFF"

  // Check WEBP signature
  const isWebp =
    data[8] === 0x57 &&
    data[9] === 0x45 &&
    data[10] === 0x42 &&
    data[11] === 0x50; // "WEBP"

  if (!isRiff || !isWebp) {
    throw new Error("Invalid WebP: Bad RIFF/WEBP signature");
  }

  const output: number[] = [];

  // Copy RIFF header (will update size later)
  for (let i = 0; i < 12; i++) {
    output.push(data[i]);
  }

  let i = 12;
  const maxIterations = Math.ceil(data.length / 8);

  for (let iter = 0; iter < maxIterations && i + 8 <= data.length; iter++) {
    // Read chunk ID (4 bytes)
    const chunkId = String.fromCharCode(
      data[i],
      data[i + 1],
      data[i + 2],
      data[i + 3],
    );

    // Read chunk size (4 bytes, little-endian)
    const chunkSize =
      (data[i + 4] |
        (data[i + 5] << 8) |
        (data[i + 6] << 16) |
        (data[i + 7] << 24)) >>>
      0;

    // Validate chunk size
    if (chunkSize > data.length - i - 8) {
      break; // Truncated chunk
    }

    // RIFF chunks are padded to even byte boundaries
    const paddedSize = chunkSize + (chunkSize % 2);
    const totalSize = 8 + paddedSize;

    // Keep only image data chunks
    if (WEBP_KEEP_CHUNKS.has(chunkId)) {
      const endPos = Math.min(i + totalSize, data.length);
      for (let j = i; j < endPos; j++) {
        output.push(data[j]);
      }
    }

    i += totalSize;
  }

  // Recalculate and fix RIFF file size (total bytes - 8)
  const fileSize = output.length - 8;
  output[4] = fileSize & 0xff;
  output[5] = (fileSize >> 8) & 0xff;
  output[6] = (fileSize >> 16) & 0xff;
  output[7] = (fileSize >> 24) & 0xff;

  return new Blob([new Uint8Array(output)], { type: "image/webp" });
}

/*** MAIN ENTRY POINT ***/

/**
 * Strips metadata from an image file based on its MIME type.
 *
 * @description
 * This is the main entry point for metadata stripping. It automatically
 * detects the image format and delegates to the appropriate stripper.
 *
 * Supported formats:
 * - JPEG (image/jpeg)
 * - PNG (image/png)
 * - WebP (image/webp)
 *
 * @param file - The image file to process
 * @returns A new Blob containing the stripped image
 * @throws {Error} If the format is not supported
 *
 * @security
 * - Validates file type before processing
 * - Each format handler validates file signature
 * - No external network calls
 * - Memory is managed via garbage collection
 *
 * @example
 * ```typescript
 * const input = document.querySelector('input[type="file"]');
 * const file = input.files[0];
 *
 * try {
 *   const cleanBlob = await stripMetadata(file);
 *   const url = URL.createObjectURL(cleanBlob);
 *   // Use the clean image...
 *   URL.revokeObjectURL(url); // Clean up when done
 * } catch (error) {
 *   console.error('Failed to strip metadata:', error);
 * }
 * ```
 */
export async function stripMetadata(file: File): Promise<Blob> {
  const type = file.type.toLowerCase();

  switch (type) {
    case "image/jpeg":
    case "image/jpg":
      return stripJpegMetadata(file);
    case "image/png":
      return stripPngMetadata(file);
    case "image/webp":
      return stripWebpMetadata(file);
    default:
      throw new Error(
        `Unsupported image format: ${type}. Supported formats: JPEG, PNG, WebP.`,
      );
  }
}
