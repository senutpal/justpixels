/**
 * @fileoverview WebCodecs API type definitions.
 * @module types/webcodecs
 *
 * @description
 * Provides TypeScript declarations for the WebCodecs ImageDecoder API.
 * These types supplement the standard DOM types which may not include
 * WebCodecs in all TypeScript versions.
 *
 * @see https://w3c.github.io/webcodecs/
 */

/**
 * Initialization options for ImageDecoder.
 */
interface ImageDecoderInit {
  /** MIME type of the image (e.g., 'image/jpeg') */
  type: string;
  /** Image data as stream or buffer */
  data: ReadableStream<Uint8Array> | BufferSource;
  /** Alpha channel handling */
  premultiplyAlpha?: "none" | "premultiply" | "default";
  /** Color space conversion mode */
  colorSpaceConversion?: "none" | "default";
  /** Desired output width (optional scaling) */
  desiredWidth?: number;
  /** Desired output height (optional scaling) */
  desiredHeight?: number;
}

/**
 * Options for decoding a specific frame.
 */
interface ImageDecodeOptions {
  /** Zero-based index of the frame to decode */
  frameIndex?: number;
  /** Whether to wait for complete frames only */
  completeFramesOnly?: boolean;
}

/**
 * Result of an image decode operation.
 */
interface ImageDecodeResult {
  /** The decoded video frame containing pixel data */
  image: VideoFrame;
  /** Whether decoding is complete */
  complete: boolean;
}

/**
 * Represents an image track in a multi-frame image.
 */
interface ImageTrack {
  /** Whether this track is animated */
  readonly animated: boolean;
  /** Number of frames in this track */
  readonly frameCount: number;
  /** Number of times the animation should repeat */
  readonly repetitionCount: number;
  /** Whether this track is selected */
  selected: boolean;
}

/**
 * Collection of image tracks.
 */
interface ImageTrackList {
  /** Ready promise */
  readonly ready: Promise<void>;
  /** Number of tracks */
  readonly length: number;
  /** Selected track index */
  readonly selectedIndex: number;
  /** Selected track */
  readonly selectedTrack: ImageTrack | null;
}

/**
 * Video color space information.
 */
interface VideoColorSpace {
  /** Color primaries */
  readonly primaries: string | null;
  /** Transfer function */
  readonly transfer: string | null;
  /** Matrix coefficients */
  readonly matrix: string | null;
  /** Full range flag */
  readonly fullRange: boolean | null;
}

/**
 * Options for VideoFrame copyTo operation.
 */
interface VideoFrameCopyToOptions {
  /** Target rectangle */
  rect?: { x: number; y: number; width: number; height: number };
  /** Layout description */
  layout?: Array<{ offset: number; stride: number }>;
}

/**
 * ImageDecoder provides a way to decode encoded image data.
 * @see https://w3c.github.io/webcodecs/#imagedecoder-interface
 */
declare class ImageDecoder {
  constructor(init: ImageDecoderInit);
  decode(options?: ImageDecodeOptions): Promise<ImageDecodeResult>;
  reset(): void;
  close(): void;
  readonly type: string;
  readonly complete: boolean;
  readonly tracks: ImageTrackList;
}

/**
 * VideoFrame represents a single frame of video or image data.
 * @see https://w3c.github.io/webcodecs/#videoframe-interface
 */
declare class VideoFrame {
  constructor(image: CanvasImageSource, init?: VideoFrameInit);
  close(): void;
  readonly displayWidth: number;
  readonly displayHeight: number;
  readonly duration: number | null;
  readonly timestamp: number | null;
  readonly colorSpace: VideoColorSpace;

  clone(): VideoFrame;
  copyTo(
    destination: BufferSource,
    options?: VideoFrameCopyToOptions,
  ): Promise<PlaneLayout[]>;
}

/**
 * Initialization options for VideoFrame.
 */
interface VideoFrameInit {
  duration?: number;
  timestamp?: number;
  alpha?: "keep" | "discard";
}

/**
 * Layout information for a video plane.
 */
interface PlaneLayout {
  offset: number;
  stride: number;
}
