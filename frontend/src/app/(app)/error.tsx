"use client";

import { useEffect } from "react";

import { ErrorState } from "@/src/components/error/error-state";
import { logger } from "@/src/lib/logger";

/**
 * Error boundary for the dashboard route group. Because it is nested inside
 * `(app)/layout.tsx`, the app shell (sidebar + nav) stays mounted and only the
 * content area is replaced — the user can retry without losing context.
 */
export default function AppError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    logger.error("Unhandled dashboard error", error, { digest: error.digest });
  }, [error]);

  return (
    <div className="flex flex-1 items-center justify-center p-6">
      <ErrorState
        title="This section failed to load"
        description="An unexpected error occurred. You can retry without leaving the dashboard."
        onRetry={reset}
        retryLabel="Retry"
        className="w-full max-w-md"
      />
    </div>
  );
}
