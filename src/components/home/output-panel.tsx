"use client";

import { Download } from "lucide-react";
import { useEffect, useMemo } from "react";
import { Button } from "@/components/ui/button";
import type { ProcessedImage } from "@/lib/types";

/**
 * Props for the OutputPanel component.
 */
interface OutputPanelProps {
  /** Array of processed images to display */
  processedImages: ProcessedImage[];
  /** Callback to download all images */
  onDownloadAll: () => void;
}

/**
 * Formats a file size in bytes to a human-readable KB string.
 *
 * @param bytes - The file size in bytes
 * @returns Formatted string with size in KB
 */
const formatFileSize = (bytes: number): string => {
  return `${(bytes / 1024).toFixed(0)} KB`;
};

/**
 * Output panel component displaying processed images.
 *
 * @description
 * Shows processed images in a grid layout with download overlay on hover.
 * Provides a "Download All" button when there are results.
 *
 * @param props - Component props
 * @returns The rendered OutputPanel component
 */
export function OutputPanel({
  processedImages,
  onDownloadAll,
}: OutputPanelProps) {
  const hasResults = processedImages.length > 0;

  return (
    <div className="flex flex-col min-h-0 border border-border rounded-md overflow-hidden">
      {/* Panel Header */}
      <div className="flex items-center justify-between px-4 py-2 border-b border-border bg-muted/50">
        <span className="text-xs font-bold uppercase tracking-widest">
          Output
        </span>
        {hasResults && (
          <Button
            variant="outline"
            size="sm"
            onClick={onDownloadAll}
            className="h-7 gap-1.5 text-xs"
            style={{ color: "hsl(82, 100%, 35%)" }}
          >
            <Download className="h-3.5 w-3.5" />
            Download All
          </Button>
        )}
      </div>

      {/* Panel Content */}
      <div className="flex-1 overflow-auto p-2 flex flex-col">
        {!hasResults ? (
          <div className="h-full flex items-center justify-center text-muted-foreground">
            <span className="text-sm">Processed images appear here</span>
          </div>
        ) : processedImages.length === 1 ? (
          <SingleImageView image={processedImages[0]} />
        ) : (
          <ImageGrid images={processedImages} />
        )}
      </div>
    </div>
  );
}

/**
 * Props for the SingleImageView component.
 */
interface SingleImageViewProps {
  /** The processed image to display */
  image: ProcessedImage;
}

/**
 * Single image view for when only one image is processed.
 *
 * @param props - Component props
 * @returns The rendered SingleImageView component
 */
function SingleImageView({ image }: SingleImageViewProps) {
  /** Memoize object URL to prevent creating duplicates on each render */
  const objectUrl = useMemo(
    () => URL.createObjectURL(image.processedBlob),
    [image.processedBlob],
  );

  /** Cleanup object URL when image changes or component unmounts */
  useEffect(() => {
    return () => URL.revokeObjectURL(objectUrl);
  }, [objectUrl]);

  return (
    <a
      href={objectUrl}
      download={image.fileName}
      className="group relative flex-1 flex items-center justify-center bg-muted border border-border rounded overflow-hidden"
    >
      {/* biome-ignore lint/performance/noImgElement: blob URLs not supported by next/image */}
      <img
        src={objectUrl}
        alt={image.fileName}
        className="w-full h-full object-contain"
      />
      <ImageOverlay
        fileName={image.fileName}
        fileSize={image.processedBlob.size}
      />
    </a>
  );
}

/**
 * Props for the ImageGrid component.
 */
interface ImageGridProps {
  /** Array of processed images to display */
  images: ProcessedImage[];
}

/**
 * Grid view for multiple processed images.
 *
 * @param props - Component props
 * @returns The rendered ImageGrid component
 */
function ImageGrid({ images }: ImageGridProps) {
  return (
    <div
      className="h-full grid gap-2"
      style={{
        gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
        gridAutoRows: "minmax(200px, 1fr)",
      }}
    >
      {images.map((img) => (
        <ImageGridItem key={img.processedHash} image={img} />
      ))}
    </div>
  );
}

/**
 * Props for the ImageGridItem component.
 */
interface ImageGridItemProps {
  /** The processed image to display */
  image: ProcessedImage;
}

/**
 * Individual image item in the grid with proper URL lifecycle management.
 *
 * @param props - Component props
 * @returns The rendered ImageGridItem component
 */
function ImageGridItem({ image }: ImageGridItemProps) {
  /** Memoize object URL to prevent creating duplicates on each render */
  const objectUrl = useMemo(
    () => URL.createObjectURL(image.processedBlob),
    [image.processedBlob],
  );

  /** Cleanup object URL when image changes or component unmounts */
  useEffect(() => {
    return () => URL.revokeObjectURL(objectUrl);
  }, [objectUrl]);

  return (
    <a
      href={objectUrl}
      download={image.fileName}
      className="group relative flex items-center justify-center bg-muted border border-border rounded overflow-hidden"
    >
      {/* biome-ignore lint/performance/noImgElement: blob URLs not supported by next/image */}
      <img
        src={objectUrl}
        alt={image.fileName}
        className="w-full h-full object-contain"
      />
      <ImageOverlay
        fileName={image.fileName}
        fileSize={image.processedBlob.size}
      />
    </a>
  );
}

/**
 * Props for the ImageOverlay component.
 */
interface ImageOverlayProps {
  /** Name of the image file */
  fileName: string;
  /** Size of the image file in bytes */
  fileSize: number;
}

/**
 * Overlay shown on hover with file info and download prompt.
 *
 * @param props - Component props
 * @returns The rendered ImageOverlay component
 */
function ImageOverlay({ fileName, fileSize }: ImageOverlayProps) {
  return (
    <div className="absolute inset-0 bg-black/80 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center text-white text-xs p-2">
      <span className="font-mono text-[10px] truncate w-full text-center">
        {fileName}
      </span>
      <span className="font-mono text-primary mt-1">
        {formatFileSize(fileSize)}
      </span>
      <span className="mt-2 text-[10px] uppercase tracking-wide opacity-70">
        Click to download
      </span>
    </div>
  );
}
