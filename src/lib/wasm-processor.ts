/**
 * @fileoverview Native WebCodecs-based image processor.
 * @module lib/wasm-processor
 *
 * @description
 * Provides an advanced image processing implementation using the WebCodecs
 * ImageDecoder API. This API is backed by native/WASM codecs in modern browsers,
 * offering better performance and lower-level access to image decoding.
 *
 * When ImageDecoder is not available (older browsers, Firefox), the system
 * automatically falls back to the Canvas processor.
 *
 * @security
 * - All operations are client-side only
 * - No external network calls
 * - Uses browser's native codec implementations
 * - VideoFrame is closed after use to free GPU/CPU memory
 *
 * @see https://developer.mozilla.org/en-US/docs/Web/API/ImageDecoder
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

/*** WASM/NATIVE PROCESSOR CLASS ***/

/**
 * Advanced image processor using the native ImageDecoder API.
 *
 * @description
 * The ImageDecoder API provides direct access to the browser's native
 * image decoders (JPEG, PNG, WebP, etc.), which are often implemented
 * as optimized native code or WebAssembly.
 *
 * This processor offers:
 * - Lower-level decoding control
 * - Better performance for large images
 * - Access to individual frames (useful for animated images)
 * - Hardware-accelerated decoding when available
 *
 * Fallback: When ImageDecoder is not supported, the ImageProcessor
 * automatically uses CanvasProcessor instead.
 *
 * @security
 * - Uses browser's sandboxed native codecs
 * - VideoFrame data is GPU-resident when possible
 * - Memory is explicitly freed via close() calls
 *
 * @example
 * ```typescript
 * if (WasmProcessor.isSupported()) {
 *   const processor = new WasmProcessor();
 *   const result = await processor.process(file, options);
 * }
 * ```
 */
export class WasmProcessor {
  /**
   * Check if the ImageDecoder API is available.
   *
   * @description
   * ImageDecoder is supported in:
   * - Chrome 94+
   * - Edge 94+
   * - Opera 80+
   *
   * Not yet supported in:
   * - Firefox (as of 2024)
   * - Safari (as of 2024)
   *
   * @returns true if ImageDecoder is available
   *
   * @example
   * ```typescript
   * if (WasmProcessor.isSupported()) {
   *   // Use native decoder
   * } else {
   *   // Fall back to Canvas
   * }
   * ```
   */
  static isSupported(): boolean {
    return typeof ImageDecoder !== "undefined";
  }

  /**
   * Process an image file using the native ImageDecoder API.
   *
   * @description
   * The processing pipeline:
   * 1. Create ImageDecoder from file stream
   * 2. Decode first frame to VideoFrame
   * 3. Draw VideoFrame to canvas (pixel extraction)
   * 4. Export canvas as new blob
   *
   * For animated images (GIF, animated WebP), only the first frame
   * is extracted. This is intentional for privacy (animated images
   * may contain hidden frames with metadata).
   *
   * @param file - The image file to process
   * @param options - Processing options (format, quality)
   * @returns Promise resolving to ProcessResult with blob and dimensions
   *
   * @throws {Error} If ImageDecoder is not supported
   * @throws {Error} If decoding fails
   * @throws {Error} If canvas context cannot be obtained
   *
   * @security
   * - Input stream is processed in chunks (memory efficient)
   * - VideoFrame is closed after use
   * - Canvas contains only pixel data
   */
  async process(
    file: File,
    options: ProcessingOptions,
  ): Promise<ProcessResult> {
    if (!WasmProcessor.isSupported()) {
      throw new Error("ImageDecoder API not available in this browser");
    }

    // Create decoder from file stream (memory efficient for large files)
    const decoder = new ImageDecoder({
      data: file.stream(),
      type: file.type,
      premultiplyAlpha: "default",
    });

    let frame: VideoFrame | null = null;

    try {
      // Decode first frame
      // Note: We explicitly decode only frame 0 to ensure consistency
      // and avoid any hidden frames that might contain metadata
      const result = await decoder.decode({ frameIndex: 0 });
      frame = result.image;

      const width = frame.displayWidth;
      const height = frame.displayHeight;

      // Create canvas to extract pixels
      let canvas: OffscreenCanvas | HTMLCanvasElement;
      let ctx:
        | OffscreenCanvasRenderingContext2D
        | CanvasRenderingContext2D
        | null;

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
        throw new Error("Failed to create canvas 2D context");
      }

      // Draw VideoFrame to canvas (extracts raw pixels)
      ctx.drawImage(frame, 0, 0);

      // Encode to new blob
      const blob = await this.encodeToBlob(canvas, options);

      return { blob, width, height };
    } finally {
      // Free resources in all cases (success or error)
      if (frame) {
        frame.close();
      }
      decoder.close();
    }
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

    if (canvas instanceof OffscreenCanvas) {
      return canvas.convertToBlob({
        type: format,
        quality: quality,
      });
    }

    return new Promise<Blob>((resolve, reject) => {
      (canvas as HTMLCanvasElement).toBlob(
        (blob) => {
          if (blob) {
            resolve(blob);
          } else {
            reject(new Error("Canvas encoding failed"));
          }
        },
        format,
        quality,
      );
    });
  }
}
