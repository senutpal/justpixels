/**
 * @fileoverview Core TypeScript type definitions for the image processor.
 * @module lib/types
 *
 * @description
 * Defines all interfaces and types used throughout the privacy-first
 * image metadata remover. These types ensure type safety and provide
 * clear contracts for data flow between components.
 *
 * @security
 * All types are designed to support privacy-first operations:
 * - No server URLs or API endpoints
 * - No tracking identifiers
 * - All operations are client-side only
 */

/*** FORMAT AND MODE TYPES ***/

/**
 * Supported output image formats.
 *
 * @description
 * - `image/png` - Lossless compression, preserves all pixel data exactly
 * - `image/jpeg` - Lossy compression, smaller files, no alpha channel
 * - `image/webp` - Modern format, supports both lossy and lossless
 */
export type SupportedFormat = "image/png" | "image/jpeg" | "image/webp";

/**
 * Processing mode for metadata removal.
 *
 * @description
 * Two modes are available, each with different tradeoffs:
 *
 * - `strip` - Removes metadata segments directly from the binary file.
 *   Preserves original image quality and file size. Fastest option.
 *   Best for most use cases.
 *
 * - `reencode` - Decodes the image to raw pixels and creates a new file.
 *   Guarantees complete metadata removal but may increase file size.
 *   Use for paranoid-level security or when changing output format.
 */
export type ProcessingMode = "strip" | "reencode";

/*** PROCESSING OPTIONS ***/

/**
 * Configuration options for image processing.
 *
 * @description
 * Controls how images are processed and what format they are output in.
 * Different options are relevant for different processing modes.
 *
 * @example
 * ```typescript
 * // Strip mode (preserves original quality and size)
 * const stripOptions: ProcessingOptions = {
 *   mode: 'strip',
 *   format: 'image/png', // Ignored in strip mode
 *   quality: 1.0,        // Ignored in strip mode
 * };
 *
 * // Re-encode mode (full pixel reconstruction)
 * const reencodeOptions: ProcessingOptions = {
 *   mode: 'reencode',
 *   format: 'image/jpeg',
 *   quality: 0.95,
 *   lossless: false,
 * };
 * ```
 */
export interface ProcessingOptions {
  /**
   * Processing mode to use.
   *
   * - `strip`: Binary metadata removal (preserves file size)
   * - `reencode`: Full pixel re-encoding (guaranteed clean)
   *
   * @default 'strip'
   */
  mode: ProcessingMode;

  /**
   * Target output format (only used in 'reencode' mode).
   *
   * In 'strip' mode, the original format is preserved.
   *
   * @default 'image/png'
   */
  format: SupportedFormat;

  /**
   * Output quality for lossy formats (JPEG, lossy WebP).
   *
   * Range: 0.0 (lowest quality, smallest file) to 1.0 (highest quality, largest file)
   *
   * Recommended values:
   * - 0.95-1.0 for high quality
   * - 0.80-0.90 for web use
   * - 0.60-0.75 for thumbnails
   *
   * @default 1.0
   */
  quality: number;

  /**
   * Whether to use lossless compression for WebP output.
   *
   * Only applicable when format is 'image/webp'.
   * When true, quality setting is ignored.
   *
   * @default true
   */
  lossless?: boolean;
}

/*** IMAGE FILE TYPES ***/

/**
 * Represents an input image file with metadata for UI display.
 *
 * @description
 * Used to track files in the processing queue with unique identifiers
 * and preview URLs for UI rendering.
 */
export interface ImageFile {
  /** The original File object from the file input */
  file: File;

  /** Unique identifier for this file in the queue */
  id: string;

  /** Object URL for preview rendering (must be revoked when done) */
  previewUrl: string;
}

/**
 * Result of processing a single image.
 *
 * @description
 * Contains the processed image data along with verification information
 * to prove that metadata was removed.
 *
 * @security
 * - Hashes allow verification that processing occurred
 * - Verification result confirms no metadata remains
 * - All data remains client-side
 */
export interface ProcessedImage {
  /** Reference to the original input file */
  originalFile: File;

  /** The processed image as a Blob (metadata removed) */
  processedBlob: Blob;

  /** Suggested filename for download (original name + "_clean" + extension) */
  fileName: string;

  /** SHA-256 hash of the original file (for verification) */
  originalHash: string;

  /** SHA-256 hash of the processed file (proves processing occurred) */
  processedHash: string;

  /** Width of the processed image in pixels */
  width: number;

  /** Height of the processed image in pixels */
  height: number;

  /** Verification result confirming metadata removal */
  verificationResult: VerificationResult;
}

/*** VERIFICATION TYPES ***/

/**
 * Result of metadata verification check.
 *
 * @description
 * Documents the verification performed on a processed image.
 * This provides proof that metadata removal was successful.
 */
export interface VerificationResult {
  /**
   * Whether any metadata was detected in the output.
   * Should always be false for successfully processed images.
   */
  hasMetadata: boolean;

  /**
   * List of metadata types found (empty for clean images).
   * Examples: ['EXIF', 'XMP', 'ICC Profile']
   */
  metadataFound: string[];

  /**
   * Whether the image is confirmed clean of metadata.
   * This is the primary success indicator.
   */
  isClean: boolean;

  /**
   * ISO 8601 timestamp of when verification was performed.
   * Useful for audit logs.
   */
  timestamp: string;
}

/*** PROGRESS TRACKING ***/

/**
 * Progress information for batch processing.
 *
 * @description
 * Used to provide real-time feedback during batch operations.
 */
export interface ProcessProgress {
  /** Total number of files to process */
  total: number;

  /** Number of files completed so far */
  processed: number;

  /** Name of the currently processing file (optional) */
  currentFile?: string;
}
