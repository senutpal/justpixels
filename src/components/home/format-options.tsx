"use client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import type { SupportedFormat } from "@/lib/types";

/**
 * Props for the FormatOptions component.
 */
interface FormatOptionsProps {
  /** Current output format */
  format: SupportedFormat;
  /** Callback to change the output format */
  onFormatChange: (format: SupportedFormat) => void;
  /** Current JPEG quality (0-1 scale) */
  quality: number;
  /** Callback to change the JPEG quality */
  onQualityChange: (quality: number) => void;
}

/**
 * Format and quality options for re-encode mode.
 *
 * @description
 * Displays format selector (PNG, JPEG, WebP) and quality slider
 * when JPEG format is selected. Only visible in re-encode mode.
 *
 * @param props - Component props
 * @returns The rendered FormatOptions component
 */
export function FormatOptions({
  format,
  onFormatChange,
  quality,
  onQualityChange,
}: FormatOptionsProps) {
  return (
    <div className="flex gap-3 items-center">
      <Select
        value={format}
        onValueChange={(v) => onFormatChange(v as SupportedFormat)}
      >
        <SelectTrigger className="w-[120px]">
          <SelectValue placeholder="Format" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="image/png">PNG</SelectItem>
          <SelectItem value="image/jpeg">JPEG</SelectItem>
          <SelectItem value="image/webp">WebP</SelectItem>
        </SelectContent>
      </Select>

      {format === "image/jpeg" && (
        <div className="flex-1 flex items-center gap-3">
          <span className="text-xs text-muted-foreground font-mono w-10">
            {Math.round(quality * 100)}%
          </span>
          <Slider
            value={[quality]}
            onValueChange={(v) => onQualityChange(v[0])}
            min={0.5}
            max={1}
            step={0.05}
            className="flex-1"
          />
        </div>
      )}
    </div>
  );
}
