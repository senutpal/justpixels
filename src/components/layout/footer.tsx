/**
 * Application version string.
 */
const APP_VERSION = "v1.0.0";

/**
 * Shared footer component for the justpixels application.
 *
 * @description
 * Displays privacy messaging and version information.
 * Used across all pages for consistent branding.
 *
 * @returns The rendered Footer component
 */
export function Footer() {
  return (
    <footer className="shrink-0 pt-4 flex items-center justify-between text-xs text-muted-foreground">
      <span>100% client-side • No uploads</span>
      <span className="font-mono">{APP_VERSION}</span>
    </footer>
  );
}
