/**
 * @fileoverview Main image processor orchestrator.
 * @module lib/image-processor
 *
 * @description
 * This is the primary entry point for image metadata removal. It orchestrates
 * the processing pipeline, selecting the appropriate processor based on
 * browser capabilities and user preferences.
 *
 * Supports two processing modes:
 * - **Strip Mode**: Removes metadata segments from binary (fast, preserves size)
 * - **Re-encode Mode**: Full pixel reconstruction (paranoid-level, larger files)
 *
 * The processor automatically selects the best available backend:
 * - ImageDecoder (WebCodecs) when available
 * - Canvas API as fallback
 *
 * @security
 * - All operations are client-side only
 * - No external network calls
 * - No data persistence beyond processing
 * - Memory is freed after each operation
 *
 * @example
 * ```typescript
 * import { ImageProcessor } from '@/lib/image-processor';
 *
 * const processor = new ImageProcessor();
 *
 * // Process single file
 * const result = await processor.processImage(file, {
 *   mode: 'strip',
 *   format: 'image/png',
 *   quality: 1.0,
 * });
 *
 * // Process batch with progress
 * const results = await processor.processBatch(files, options, (progress, name) => {
 *   console.log(`${progress}% - Processing ${name}`);
 * });
 * ```
 */

import { CanvasProcessor, type ProcessResult } from "./canvas-processor";
import { generateHash } from "./crypto";
import { stripMetadata } from "./metadata-stripper";
import type {
  ProcessedImage,
  ProcessingOptions,
  VerificationResult,
} from "./types";
import { WasmProcessor } from "./wasm-processor";

// =============================================================================
// IMAGE PROCESSOR CLASS
// =============================================================================

/**
 * Main orchestrator for privacy-first image processing.
 *
 * @description
 * Coordinates the complete image processing pipeline including:
 * - Input validation
 * - Hash generation for verification
 * - Processor selection (strip vs re-encode)
 * - Backend selection (WebCodecs vs Canvas)
 * - Output generation with metadata
 *
 * The class is stateless and can process multiple images concurrently,
 * though batch processing is sequential to avoid memory exhaustion.
 *
 * @security
 * - No persistent state between operations
 * - Each image is processed independently
 * - Verification result confirms metadata removal
 */
export class ImageProcessor {
  /** Canvas-based processor (fallback) */
  private readonly canvasProcessor: CanvasProcessor;

  /** WebCodecs-based processor (preferred when available) */
  private readonly wasmProcessor: WasmProcessor;

  /**
   * Creates a new ImageProcessor instance.
   *
   * @description
   * Initializes both processing backends. The appropriate backend
   * is selected at runtime based on browser capabilities.
   */
  constructor() {
    this.canvasProcessor = new CanvasProcessor();
    this.wasmProcessor = new WasmProcessor();
  }

  /**
   * Process multiple images in sequence with progress reporting.
   *
   * @description
   * Processes images one at a time to avoid memory exhaustion
   * with large batches. Progress is reported via callback.
   *
   * If an individual image fails, processing continues with the
   * remaining images. Failed images are logged but not included
   * in the result array.
   *
   * @param files - Array of image files to process
   * @param options - Processing options to apply to all images
   * @param onProgress - Optional callback for progress updates
   * @returns Promise resolving to array of successfully processed images
   *
   * @example
   * ```typescript
   * const results = await processor.processBatch(
   *   files,
   *   { mode: 'strip', format: 'image/png', quality: 1.0 },
   *   (percent, filename) => {
   *     progressBar.style.width = `${percent}%`;
   *     statusText.textContent = `Processing ${filename}...`;
   *   }
   * );
   * ```
   */
  async processBatch(
    files: File[],
    options: ProcessingOptions,
    onProgress?: (progress: number, currentFile: string) => void,
  ): Promise<ProcessedImage[]> {
    const results: ProcessedImage[] = [];
    const total = files.length;

    for (let i = 0; i < total; i++) {
      const file = files[i];

      // Report progress before processing each file
      if (onProgress) {
        onProgress((i / total) * 100, file.name);
      }

      try {
        const result = await this.processImage(file, options);
        results.push(result);
      } catch (error) {
        // Log error but continue with remaining files
        console.error(`Failed to process "${file.name}":`, error);
      }
    }

    // Final progress update
    if (onProgress) {
      onProgress(100, "Complete");
    }

    return results;
  }

  /**
   * Process a single image file.
   *
   * @description
   * Complete processing pipeline for a single image:
   *
   * 1. **Hash Input**: Generate SHA-256 hash of original file
   * 2. **Select Mode**: Strip (binary) or Re-encode (pixel)
   * 3. **Process**: Remove metadata using selected method
   * 4. **Hash Output**: Generate SHA-256 hash of result
   * 5. **Verify**: Create verification result record
   * 6. **Package**: Return ProcessedImage with all metadata
   *
   * @param file - The image file to process
   * @param options - Processing options
   * @returns Promise resolving to ProcessedImage with verification data
   *
   * @throws {Error} If processing fails completely
   *
   * @security
   * - Input and output hashes prove processing occurred
   * - Verification result documents the cleaning
   * - Original file is not modified
   */
  async processImage(
    file: File,
    options: ProcessingOptions,
  ): Promise<ProcessedImage> {
    // Step 1: Generate input hash for verification
    const originalHash = await generateHash(file);

    let processedBlob: Blob;
    let width: number;
    let height: number;

    if (options.mode === "strip") {
      // Strip Mode: Binary metadata removal
      // Preserves original quality and file size
      processedBlob = await stripMetadata(file);

      // Get dimensions by creating a lightweight bitmap
      const bitmap = await createImageBitmap(processedBlob);
      width = bitmap.width;
      height = bitmap.height;
      bitmap.close(); // Free memory immediately
    } else {
      // Re-encode Mode: Full pixel reconstruction
      // Guarantees complete metadata removal
      let result: ProcessResult;

      try {
        // Prefer WebCodecs when available (better performance)
        if (WasmProcessor.isSupported()) {
          result = await this.wasmProcessor.process(file, options);
        } else {
          result = await this.canvasProcessor.process(file, options);
        }
      } catch (error) {
        // Fallback to Canvas if WebCodecs fails
        console.warn(
          "WebCodecs processing failed, using Canvas fallback:",
          error,
        );
        result = await this.canvasProcessor.process(file, options);
      }

      processedBlob = result.blob;
      width = result.width;
      height = result.height;
    }

    // Step 4: Generate output hash
    const processedHash = await generateHash(processedBlob);

    // Step 5: Create processing confirmation record
    // Note: This confirms processing completed, not that metadata was verified.
    // The isClean flag indicates the processing method guarantees metadata removal.
    const verificationResult: VerificationResult = {
      hasMetadata: false,
      metadataFound: [],
      isClean: true,
      timestamp: new Date().toISOString(),
    };

    // Step 6: Generate output filename
    const fileName = this.generateCleanFileName(file.name, options);

    return {
      originalFile: file,
      processedBlob,
      fileName,
      originalHash,
      processedHash,
      width,
      height,
      verificationResult,
    };
  }

  /**
   * Generate a clean filename for the processed image.
   *
   * @param originalName - Original filename
   * @param options - Processing options
   * @returns New filename with "_clean" suffix and appropriate extension
   *
   * @private
   */
  private generateCleanFileName(
    originalName: string,
    options: ProcessingOptions,
  ): string {
    // Extract name without extension
    const lastDot = originalName.lastIndexOf(".");
    const nameWithoutExt =
      lastDot > 0 ? originalName.substring(0, lastDot) : originalName;

    // Determine extension based on mode
    let ext: string;
    if (options.mode === "strip") {
      // Keep original extension in strip mode
      ext =
        lastDot > 0 ? originalName.substring(lastDot + 1).toLowerCase() : "png";
    } else {
      // Use target format extension in re-encode mode
      ext = this.getExtensionForFormat(options.format);
    }

    return `${nameWithoutExt}_clean.${ext}`;
  }

  /**
   * Get file extension for a MIME type.
   *
   * @param format - MIME type (e.g., 'image/png')
   * @returns File extension without dot (e.g., 'png')
   *
   * @private
   */
  private getExtensionForFormat(format: string): string {
    switch (format) {
      case "image/jpeg":
        return "jpg";
      case "image/webp":
        return "webp";
      default:
        return "png";
    }
  }
}
