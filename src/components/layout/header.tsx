"use client";

import Image from "next/image";
import Link from "next/link";
import { ThemeToggle } from "./theme-toggle";

/**
 * Props for the Header component.
 */
interface HeaderProps {
  /** Whether to show the "about" navigation link (shown on home page) */
  showAboutLink?: boolean;
  /** Whether to show the "back" navigation button (shown on about page) */
  showBackButton?: boolean;
}

/**
 * Shared header component for the justpixels application.
 *
 * @description
 * Displays the application logo, title, and navigation controls.
 * Used across all pages for consistent branding and navigation.
 *
 * @param props - Component props
 * @returns The rendered Header component
 */
export function Header({
  showAboutLink = false,
  showBackButton = false,
}: HeaderProps) {
  return (
    <header className="flex items-center justify-between shrink-0 pb-4 border-b border-border">
      <div className="flex items-center gap-3">
        <Link
          href="/"
          className={
            showBackButton
              ? "flex items-center gap-3 hover:opacity-80 transition-opacity"
              : "flex items-center gap-3"
          }
        >
          <Image
            src="/logo.png"
            alt="justpixels"
            width={32}
            height={32}
            className="dark:invert"
          />
          <div className="flex items-center gap-2">
            <span className="text-lg font-bold tracking-tight">justpixels</span>
            <span className="hidden sm:inline text-xs text-muted-foreground">
              · protect your privacy
            </span>
          </div>
        </Link>
      </div>
      <div className="flex items-center gap-2">
        {showAboutLink && (
          <Link
            href="/about"
            className="text-xs uppercase tracking-widest text-muted-foreground hover:text-foreground transition-colors"
          >
            about
          </Link>
        )}
        {showBackButton && (
          <Link href="/">
            <button
              type="button"
              className="inline-flex items-center justify-center gap-2 whitespace-nowrap font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 hover:bg-accent hover:text-accent-foreground rounded-md px-3 h-8 text-xs uppercase tracking-widest"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <path d="m12 19-7-7 7-7" />
                <path d="M19 12H5" />
              </svg>
              Back
            </button>
          </Link>
        )}
        <ThemeToggle />
      </div>
    </header>
  );
}
