"use client";

import { useState } from "react";
import {
  DropZone,
  FormatOptions,
  ModeSelector,
  OutputPanel,
} from "@/components/home";
import { Footer, Header } from "@/components/layout";
import { Button } from "@/components/ui/button";
import { ImageProcessor } from "@/lib/image-processor";
import type {
  ProcessedImage,
  ProcessingMode,
  ProcessingOptions,
  SupportedFormat,
} from "@/lib/types";

/** Default JPEG quality setting (0-1 scale) */
const DEFAULT_QUALITY = 0.95;

/**
 * Home page component for the justpixels image metadata stripping application.
 *
 * @description
 * This is the main application page that provides a drag-and-drop interface
 * for users to upload images and strip metadata from them. All processing
 * happens client-side in the browser for maximum privacy.
 *
 * @features
 * - Drag-and-drop file upload
 * - Batch image processing
 * - Two processing modes: Strip (metadata removal) and Re-encode (full pixel reconstruction)
 * - Multiple output formats: PNG, JPEG, WebP
 * - Quality slider for JPEG output
 * - Theme toggle (light/dark mode)
 *
 * @returns The rendered Home page component
 */
export default function Home() {
  /***  State Management ***/

  /** Array of files selected by the user for processing */
  const [files, setFiles] = useState<File[]>([]);

  /** Flag indicating whether image processing is in progress */
  const [isProcessing, setIsProcessing] = useState(false);

  /** Processing progress percentage (0-100) */
  const [progress, setProgress] = useState(0);

  /** Array of successfully processed images with their blobs */
  const [processedImages, setProcessedImages] = useState<ProcessedImage[]>([]);

  /** Flag indicating whether user is dragging files over the drop zone */
  const [isDragging, setIsDragging] = useState(false);

  /***  Processing Options State ***/

  /** Current processing mode: 'strip' for metadata removal, 'reencode' for full reconstruction */
  const [mode, setMode] = useState<ProcessingMode>("strip");

  /** Output format for re-encoded images */
  const [format, setFormat] = useState<SupportedFormat>("image/png");

  /** JPEG quality setting (0-1 scale), only applies when format is 'image/jpeg' */
  const [quality, setQuality] = useState(DEFAULT_QUALITY);

  /***  Event Handlers ***/

  /**
   * Handles file selection from the DropZone component.
   *
   * @param selectedFiles - Array of selected files
   */
  const handleFileSelect = (selectedFiles: File[]): void => {
    setFiles(selectedFiles);
    setProcessedImages([]);
  };

  /**
   * Handles file drop from the DropZone component.
   *
   * @param droppedFiles - Array of dropped files
   */
  const handleFileDrop = (droppedFiles: File[]): void => {
    setFiles(droppedFiles);
    setProcessedImages([]);
  };

  /**
   * Removes a single file from the selection by index.
   *
   * @param index - Index of the file to remove
   */
  const handleFileRemove = (index: number): void => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  };

  /**
   * Clears all selected files.
   */
  const handleClearAll = (): void => {
    setFiles([]);
    setProcessedImages([]);
  };

  /**
   * Adds more files to the existing selection.
   *
   * @param newFiles - Array of new files to add
   */
  const handleAddMore = (newFiles: File[]): void => {
    setFiles((prev) => [...prev, ...newFiles]);
  };

  /*** Processing Functions ***/

  /**
   * Processes all selected images with the current options.
   * Uses the ImageProcessor to strip metadata or re-encode images.
   */
  const processImages = async (): Promise<void> => {
    if (files.length === 0) return;

    setIsProcessing(true);
    setProgress(0);
    setProcessedImages([]);

    const processor = new ImageProcessor();
    const options: ProcessingOptions = {
      mode,
      format,
      quality: format === "image/jpeg" ? quality : 1.0,
      lossless: format === "image/webp",
    };

    try {
      const results = await processor.processBatch(
        files,
        options,
        (progressValue) => setProgress(progressValue),
      );
      setProcessedImages(results);
    } catch (error) {
      console.error("Processing failed", error);
    } finally {
      setIsProcessing(false);
    }
  };

  /**
   * Downloads all processed images by creating temporary anchor elements.
   * Uses URL.createObjectURL for each blob and revokes after download.
   */
  const downloadAll = (): void => {
    for (const img of processedImages) {
      const url = URL.createObjectURL(img.processedBlob);
      const anchor = document.createElement("a");
      anchor.href = url;
      anchor.download = img.fileName;
      anchor.click();
      URL.revokeObjectURL(url);
    }
  };

  /***  Render ***/

  return (
    <div className="h-screen w-screen overflow-hidden bg-background">
      <div className="h-full w-full flex flex-col p-4 md:p-6 lg:p-8 max-w-7xl mx-auto stagger-children">
        <Header showAboutLink />

        {/* Main Content */}
        <main className="flex-1 grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6 pt-4 min-h-0">
          {/* Left Panel - Config & Drop */}
          <div className="flex flex-col gap-4 min-h-0">
            <ModeSelector mode={mode} onModeChange={setMode} />

            {mode === "reencode" && (
              <FormatOptions
                format={format}
                onFormatChange={setFormat}
                quality={quality}
                onQualityChange={setQuality}
              />
            )}

            <DropZone
              files={files}
              isDragging={isDragging}
              onFileSelect={handleFileSelect}
              onDrop={handleFileDrop}
              onDragStateChange={setIsDragging}
              onFileRemove={handleFileRemove}
              onClearAll={handleClearAll}
              onAddMore={handleAddMore}
            />

            {/* Process Button */}
            <Button
              size="lg"
              onClick={processImages}
              disabled={files.length === 0 || isProcessing}
              className="w-full uppercase tracking-widest font-bold"
            >
              {isProcessing
                ? `Processing ${Math.round(progress)}%`
                : "Clean Images"}
            </Button>
          </div>

          {/* Right Panel - Results */}
          <OutputPanel
            processedImages={processedImages}
            onDownloadAll={downloadAll}
          />
        </main>

        <Footer />
      </div>
    </div>
  );
}
