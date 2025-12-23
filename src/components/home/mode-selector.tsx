"use client";

import { Button } from "@/components/ui/button";
import type { ProcessingMode } from "@/lib/types";

/**
 * Props for the ModeSelector component.
 */
interface ModeSelectorProps {
  /** Current processing mode */
  mode: ProcessingMode;
  /** Callback to change the processing mode */
  onModeChange: (mode: ProcessingMode) => void;
}

/**
 * Mode selection component for choosing between Strip and Re-encode modes.
 *
 * @description
 * Displays two buttons for selecting the processing mode:
 * - Strip: Removes metadata directly from binary, preserves original quality
 * - Re-encode: Full pixel reconstruction for paranoid-level cleaning
 *
 * @param props - Component props
 * @returns The rendered ModeSelector component
 */
export function ModeSelector({ mode, onModeChange }: ModeSelectorProps) {
  return (
    <div className="flex gap-2">
      <Button
        variant={mode === "strip" ? "default" : "outline"}
        className="flex-1"
        onClick={() => onModeChange("strip")}
      >
        Strip
      </Button>

      <Button
        variant={mode === "reencode" ? "default" : "outline"}
        className="flex-1"
        onClick={() => onModeChange("reencode")}
      >
        Re-encode
      </Button>
    </div>
  );
}
