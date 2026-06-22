"use client";

import { useEffect } from "react";

import { logger } from "@/src/lib/logger";

/**
 * Global error boundary — the last line of defense. It catches errors thrown by
 * the **root layout itself**, so it must render its own <html>/<body> and cannot
 * rely on the app's providers/components. Because the layout (and therefore the
 * stylesheet) may have failed, styling is inline and uses CSS variables with
 * safe fallbacks: design tokens are picked up if available, otherwise the
 * fallbacks keep the screen readable. Only active in production builds.
 */
export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    logger.error("Root layout (global) error", error, { digest: error.digest });
  }, [error]);

  return (
    <html lang="en">
      <body
        style={{
          margin: 0,
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "1.5rem",
          textAlign: "center",
          background: "var(--background, #f7f8f9)",
          color: "var(--foreground, #0c0e12)",
          fontFamily:
            "var(--font-sans, ui-sans-serif, system-ui, -apple-system, sans-serif)",
        }}
      >
        <div style={{ maxWidth: "28rem" }}>
          <h1
            style={{
              fontSize: "1.5rem",
              fontWeight: 600,
              letterSpacing: "-0.025em",
              margin: 0,
            }}
          >
            Something went wrong
          </h1>
          <p
            style={{
              marginTop: "0.5rem",
              color: "var(--muted-foreground, #5b626e)",
            }}
          >
            A critical error occurred and the app could not recover. Please try
            again.
          </p>
          <button
            type="button"
            onClick={reset}
            style={{
              marginTop: "2rem",
              height: "2.25rem",
              padding: "0 1rem",
              borderRadius: "0.5rem",
              border: "none",
              cursor: "pointer",
              fontSize: "0.875rem",
              fontWeight: 500,
              background: "var(--primary, #0a7d4d)",
              color: "var(--primary-foreground, #ffffff)",
            }}
          >
            Try again
          </button>
        </div>
      </body>
    </html>
  );
}
