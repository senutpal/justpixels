"use client";

import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { Button } from "@/components/ui/button";

/**
 * Theme toggle button component.
 *
 * @description
 * A button that toggles between light and dark theme.
 * Uses next-themes for theme management.
 *
 * @returns The rendered ThemeToggle component
 */
export function ThemeToggle() {
  const { theme, setTheme } = useTheme();

  /**
   * Toggles between light and dark theme.
   */
  const handleThemeToggle = (): void => {
    setTheme(theme === "dark" ? "light" : "dark");
  };

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={handleThemeToggle}
      aria-label="Toggle theme"
    >
      {theme === "dark" ? (
        <Sun className="h-4 w-4" />
      ) : (
        <Moon className="h-4 w-4" />
      )}
    </Button>
  );
}
