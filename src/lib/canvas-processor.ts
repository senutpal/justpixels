/**
 * @fileoverview Canvas-based image processor for metadata removal.
 * @module lib/canvas-processor
 *
 * @description
 * Provides a fallback image processing implementation using the HTML5 Canvas API.
 * This processor works by:
 * 1. Decoding the image using createImageBitmap
 * 2. Drawing it to a canvas (extracting raw pixel data)
 * 3. Re-encoding to a new image blob (guaranteed metadata-free)
 *
 * This approach is supported in all modern browsers and serves as a fallback
 * when the WebCodecs ImageDecoder API is not available.
 *
 * @security
 * - All operations are client-side only
 * - No external network calls
 * - Image data never leaves the browser
 * - Canvas pixel extraction guarantees metadata removal
 */

import type { ProcessingOptions } from "./types";

/*** TYPES ***/

/**
 * Result of processing an image, including the blob and dimensions.
 */
export interface ProcessResult {
  /** The processed image as a Blob */
  blob: Blob;
  /** Width of the processed image in pixels */
  width: number;
  /** Height of the processed image in pixels */
  height: number;
}

/*** CANVAS PROCESSOR CLASS ***/

/**
 * Image processor using the HTML5 Canvas API.
 *
 * @description
 * This processor ensures complete metadata removal by drawing images to a
 * canvas and creating a new blob. The canvas only holds raw pixel data,
 * so any metadata from the original file is not transferred.
 *
 * Features:
 * - Uses OffscreenCanvas when available (better performance)
 * - Falls back to regular HTMLCanvasElement
 * - Supports PNG, JPEG, and WebP output formats
 * - Preserves image dimensions and alpha channel
 *
 * @security
 * - Canvas API guarantees only pixel data is retained
 * - No metadata can survive the decode → canvas → encode pipeline
 * - ImageBitmap is closed after use to free memory
 *
 * @example
 * ```typescript
 * const processor = new CanvasProcessor();
 * const result = await processor.process(file, {
 *   mode: 'reencode',
 *   format: 'image/png',
 *   quality: 1.0
 * });
 * console.log(`Processed: ${result.width}x${result.height}`);
 * ```
 */
export class CanvasProcessor {
  /**
   * Process an image file using Canvas API.
   *
   * @description
   * The processing pipeline:
   * 1. Create ImageBitmap from file (browser handles decoding)
   * 2. Create canvas with same dimensions
   * 3. Draw ImageBitmap to canvas (pixel data only)
   * 4. Export canvas as new blob
   *
   * @param file - The image file to process
   * @param options - Processing options (format, quality)
   * @returns Promise resolving to ProcessResult with blob and dimensions
   *
   * @throws {Error} If canvas context cannot be obtained
   * @throws {Error} If image cannot be decoded
   *
   * @security
   * - Input is processed entirely in-memory
   * - ImageBitmap is explicitly closed to free resources
   * - No temporary files are created
   */
  async process(
    file: File,
    options: ProcessingOptions,
  ): Promise<ProcessResult> {
    // Decode image to ImageBitmap (most efficient browser-native decoding)
    const bitmap = await self.createImageBitmap(file);
    const { width, height } = bitmap;

    // Create canvas for pixel manipulation
    let canvas: OffscreenCanvas | HTMLCanvasElement;
    let ctx:
      | OffscreenCanvasRenderingContext2D
      | CanvasRenderingContext2D
      | null;

    // Prefer OffscreenCanvas for better performance (works in Web Workers too)
    if (typeof OffscreenCanvas !== "undefined") {
      canvas = new OffscreenCanvas(width, height);
      ctx = canvas.getContext("2d");
    } else {
      canvas = document.createElement("canvas");
      canvas.width = width;
      canvas.height = height;
      ctx = canvas.getContext("2d");
    }

    if (!ctx) {
      bitmap.close();
      throw new Error("Failed to create canvas 2D context");
    }

    // Draw image to canvas - this extracts only pixel data
    // All metadata is inherently stripped as canvas only holds RGBA pixels
    ctx.drawImage(bitmap, 0, 0);

    // Free the ImageBitmap memory immediately
    bitmap.close();

    // Encode pixels to new blob with specified format and quality
    const blob = await this.encodeToBlob(canvas, options);

    return { blob, width, height };
  }

  /**
   * Encode canvas content to a Blob.
   *
   * @param canvas - The canvas containing the image pixels
   * @param options - Processing options for format and quality
   * @returns Promise resolving to the encoded Blob
   *
   * @throws {Error} If encoding fails
   *
   * @private
   */
  private async encodeToBlob(
    canvas: OffscreenCanvas | HTMLCanvasElement,
    options: ProcessingOptions,
  ): Promise<Blob> {
    const { format, quality } = options;

    // OffscreenCanvas has async convertToBlob
    if (canvas instanceof OffscreenCanvas) {
      return canvas.convertToBlob({
        type: format,
        quality: quality,
      });
    }

    // HTMLCanvasElement uses callback-based toBlob
    return new Promise<Blob>((resolve, reject) => {
      (canvas as HTMLCanvasElement).toBlob(
        (blob) => {
          if (blob) {
            resolve(blob);
          } else {
            reject(new Error("Canvas encoding failed: toBlob returned null"));
          }
        },
        format,
        quality,
      );
    });
  }
}
