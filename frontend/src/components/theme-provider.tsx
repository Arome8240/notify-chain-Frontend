"use client";

import {
  ThemeProvider as NextThemesProvider,
  type ThemeProviderProps,
} from "next-themes";

/**
 * Thin wrapper around next-themes so the (server) root layout can mount a
 * client-side theme provider. All configuration (attribute, defaultTheme,
 * enableSystem…) is passed through from the layout.
 */
export function ThemeProvider({ children, ...props }: ThemeProviderProps) {
  return <NextThemesProvider {...props}>{children}</NextThemesProvider>;
}
