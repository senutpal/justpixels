"use client";

import { Plus, Trash2, Upload, X } from "lucide-react";
import { useEffect, useMemo, useRef } from "react";

/**
 * Props for the DropZone component.
 */
interface DropZoneProps {
  /** Array of files currently selected */
  files: File[];
  /** Whether user is currently dragging files over the zone */
  isDragging: boolean;
  /** Callback when files are selected via file picker (replaces existing) */
  onFileSelect: (files: File[]) => void;
  /** Callback when files are dropped */
  onDrop: (files: File[]) => void;
  /** Callback when drag over state changes */
  onDragStateChange: (isDragging: boolean) => void;
  /** Callback when a file is removed */
  onFileRemove: (index: number) => void;
  /** Callback to clear all files */
  onClearAll: () => void;
  /** Callback when more files are added (appends to existing) */
  onAddMore: (files: File[]) => void;
}

/**
 * Drag-and-drop file upload zone component.
 *
 * @description
 * Provides a clickable and droppable zone for selecting image files.
 * Shows image previews with remove buttons when files are selected.
 * Supports multiple file selection and filters to only accept images.
 *
 * @param props - Component props
 * @returns The rendered DropZone component
 */
export function DropZone({
  files,
  isDragging,
  onFileSelect,
  onDrop,
  onDragStateChange,
  onFileRemove,
  onClearAll,
  onAddMore,
}: DropZoneProps) {
  /** Reference to the hidden file input element */
  const fileInputRef = useRef<HTMLInputElement>(null);

  /** Reference to the add more file input element */
  const addMoreInputRef = useRef<HTMLInputElement>(null);

  /** Generate preview URLs for all files */
  const previewUrls = useMemo(() => {
    return files.map((file) => URL.createObjectURL(file));
  }, [files]);

  /**
   * Cleanup effect to revoke object URLs when files change or component unmounts.
   * This prevents memory leaks from orphaned blob URLs.
   */
  useEffect(() => {
    return () => {
      for (const url of previewUrls) {
        URL.revokeObjectURL(url);
      }
    };
  }, [previewUrls]);

  /**
   * Handles file selection from the file input element.
   */
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>): void => {
    if (e.target.files) {
      onFileSelect(Array.from(e.target.files));
    }
  };

  /**
   * Handles adding more files to existing selection.
   */
  const handleAddMore = (e: React.ChangeEvent<HTMLInputElement>): void => {
    if (e.target.files) {
      onAddMore(Array.from(e.target.files));
    }
    // Reset input so same file can be selected again
    e.target.value = "";
  };

  /**
   * Handles file drop events on the drop zone.
   */
  const handleDrop = (e: React.DragEvent): void => {
    e.preventDefault();
    onDragStateChange(false);

    const droppedFiles = Array.from(e.dataTransfer.files).filter((file) =>
      file.type.startsWith("image/"),
    );

    if (droppedFiles.length > 0) {
      onDrop(droppedFiles);
    }
  };

  /**
   * Handles drag over events to enable drop functionality.
   */
  const handleDragOver = (e: React.DragEvent): void => {
    e.preventDefault();
    onDragStateChange(true);
  };

  /**
   * Handles drag leave events to reset the dragging state.
   * Checks relatedTarget to avoid flicker when moving between child elements.
   */
  const handleDragLeave = (e: React.DragEvent): void => {
    // Only trigger if leaving the actual drop zone, not moving between children
    if (!e.currentTarget.contains(e.relatedTarget as Node)) {
      onDragStateChange(false);
    }
  };

  /**
   * Triggers the hidden file input click to open the file picker.
   */
  const handleClick = (): void => {
    fileInputRef.current?.click();
  };

  /**
   * Triggers the add more input click.
   */
  const handleAddMoreClick = (): void => {
    addMoreInputRef.current?.click();
  };
  const handleRemoveFile = (e: React.MouseEvent, index: number): void => {
    e.stopPropagation();
    onFileRemove(index);
  };

  /**
   * Handles clearing all files.
   */
  const handleClearAll = (e: React.MouseEvent): void => {
    e.stopPropagation();
    onClearAll();
  };

  // Show empty state when no files
  if (files.length === 0) {
    return (
      <button
        type="button"
        className={`flex-1 min-h-32 flex flex-col items-center justify-center border-2 border-dashed rounded-md transition-all cursor-pointer ${
          isDragging
            ? "border-primary bg-primary/10"
            : "border-border hover:border-muted-foreground hover:bg-muted/50"
        }`}
        onClick={handleClick}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept="image/*"
          onChange={handleFileSelect}
          className="hidden"
        />
        <Upload className="h-8 w-8 text-muted-foreground" />
        <p className="mt-2 text-sm font-medium">Drop images or click</p>
        <p className="text-xs text-muted-foreground mt-1">PNG, JPEG, WebP</p>
      </button>
    );
  }

  // Show preview grid when files are selected
  return (
    <section
      className={`flex-1 min-h-32 border-2 border-dashed rounded-md transition-all overflow-hidden flex flex-col ${
        isDragging ? "border-primary bg-primary/10" : "border-border"
      }`}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      aria-label="Selected files preview"
    >
      {/* Header with file count and actions */}
      <div className="flex items-center justify-between px-3 py-2 bg-muted/50 border-b border-border shrink-0">
        <span className="text-xs font-medium">
          {files.length} file{files.length > 1 ? "s" : ""} selected
        </span>
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={handleAddMoreClick}
            className="inline-flex items-center gap-1 px-2 py-1 text-xs rounded-md bg-primary/10 text-primary hover:bg-primary/20 transition-colors mr-2"
          >
            <Plus className="h-3 w-3" />
            Add
          </button>
          <button
            type="button"
            onClick={handleClearAll}
            className="inline-flex items-center gap-1 px-2 py-1 text-xs rounded-md bg-destructive/10 text-destructive hover:bg-destructive/20 transition-colors"
          >
            <Trash2 className="h-3 w-3" />
            Clear
          </button>
        </div>
      </div>

      {/* Hidden file inputs */}
      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept="image/*"
        onChange={handleFileSelect}
        className="hidden"
      />
      <input
        ref={addMoreInputRef}
        type="file"
        multiple
        accept="image/*"
        onChange={handleAddMore}
        className="hidden"
      />

      {/* Image preview grid - takes remaining space */}
      <div className="flex-1 p-2 overflow-auto">
        <div
          className={`h-full grid gap-2 ${
            files.length === 1
              ? "grid-cols-1"
              : files.length === 2
                ? "grid-cols-2"
                : files.length === 3
                  ? "grid-cols-3"
                  : "grid-cols-2 md:grid-cols-3 lg:grid-cols-4"
          }`}
        >
          {files.map((file, index) => (
            <div
              key={`${file.name}-${file.size}-${file.lastModified}-${index}`}
              className="relative group rounded-md overflow-hidden bg-muted border border-border min-h-[80px]"
            >
              {/* biome-ignore lint/performance/noImgElement: blob URLs not supported by next/image */}
              <img
                src={previewUrls[index]}
                alt={file.name}
                className="w-full h-full object-contain"
              />
              {/* Remove button - always visible */}
              <button
                type="button"
                onClick={(e) => handleRemoveFile(e, index)}
                className="absolute top-1 right-1 p-1 rounded-full bg-black/70 text-white hover:bg-black/90 transition-colors"
                aria-label={`Remove ${file.name}`}
              >
                <X className="h-3.5 w-3.5" />
              </button>
              {/* File name - shown at bottom */}
              <div className="absolute inset-x-0 bottom-0 bg-black/60 text-white text-[10px] px-2 py-1 truncate">
                {file.name}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
