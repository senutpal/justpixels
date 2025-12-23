"use client";

import type { LucideIcon } from "lucide-react";
import { Lock, Zap } from "lucide-react";

/**
 * Data structure for a processing mode card.
 */
interface ModeCardData {
  /** Icon component to display */
  icon: LucideIcon;
  /** Mode title */
  title: string;
  /** Best use case description */
  bestFor: string;
  /** Main description paragraph */
  description: string;
  /** Technical details list */
  technicalDetails: string[];
  /** Success message */
  successMessage: string;
}

/** Mode card configurations */
const modes: ModeCardData[] = [
  {
    icon: Zap,
    title: "Strip Mode",
    bestFor: "Quick cleaning with original quality",
    description:
      "Strip mode surgically removes metadata segments from your image file without touching the actual pixels.",
    technicalDetails: [
      "Parses JPEG/PNG binary structure",
      "Identifies EXIF, XMP, IPTC segments",
      "Removes metadata markers (APP1, APP13)",
      "Preserves image data bytes exactly",
    ],
    successMessage: "Identical image quality, smaller file size",
  },
  {
    icon: Lock,
    title: "Re-encode Mode",
    bestFor: "Maximum privacy (paranoid mode)",
    description:
      "Re-encode mode completely rebuilds your image from scratch. It reads every pixel and creates an entirely new file with zero traces of the original.",
    technicalDetails: [
      "Decodes image to raw pixel data",
      "Creates fresh Canvas element",
      "Re-encodes to new PNG/JPEG/WebP",
      "Zero original file structure remains",
    ],
    successMessage: "Complete pixel reconstruction",
  },
];

/**
 * Processing modes grid component.
 *
 * @description
 * Displays a grid of cards explaining the two processing modes:
 * Strip and Re-encode. Each card includes technical details.
 *
 * @returns The rendered ProcessingModes component
 */
export function ProcessingModes() {
  return (
    <div className="grid md:grid-cols-2 gap-4 mt-6">
      {modes.map((mode) => (
        <ModeCard key={mode.title} {...mode} />
      ))}
    </div>
  );
}

/**
 * Individual mode card component.
 *
 * @param props - Mode card data
 * @returns The rendered ModeCard component
 */
function ModeCard({
  icon: Icon,
  title,
  bestFor,
  description,
  technicalDetails,
  successMessage,
}: ModeCardData) {
  return (
    <div className="border border-border rounded-md p-6 space-y-4">
      <div className="flex items-center gap-3">
        <Icon className="h-5 w-5 text-primary" />
        <h3 className="font-bold uppercase tracking-wide">{title}</h3>
      </div>
      <p className="text-sm text-muted-foreground leading-relaxed">
        <strong>Best for:</strong> {bestFor}
      </p>
      <div className="space-y-3 text-sm">
        <p className="leading-relaxed">{description}</p>
        <div className="bg-muted/50 rounded p-3 font-mono text-xs">
          {technicalDetails.map((detail) => (
            <p key={detail}>• {detail}</p>
          ))}
        </div>
        <div className="flex items-center gap-2 !text-lime-600">
          <span>✓</span>
          <span>{successMessage}</span>
        </div>
      </div>
    </div>
  );
}
