"use client";

import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";

import { Button } from "@/src/components/ui/button";

/**
 * Accessible light/dark theme toggle.
 *
 * The icon shown is decided purely by the `.dark` class via Tailwind's `dark:`
 * variant, so there is no client-only state to gate on — that avoids both a
 * hydration mismatch and the brief flash of the wrong icon on first paint.
 * `resolvedTheme` is only read inside the click handler (after mount), so it is
 * always defined when used.
 */
export function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme();

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}
      aria-label="Toggle light and dark theme"
      title="Toggle theme"
    >
      {/* Moon in light mode (click → dark), Sun in dark mode (click → light). */}
      <Moon className="block size-4 dark:hidden" />
      <Sun className="hidden size-4 dark:block" />
      <span className="sr-only">Toggle theme</span>
    </Button>
  );
}
