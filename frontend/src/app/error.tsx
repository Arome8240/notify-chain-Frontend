"use client";

import { useEffect } from "react";

import { ErrorState } from "@/src/components/error/error-state";
import { logger } from "@/src/lib/logger";

/**
 * Root error boundary. Catches errors thrown anywhere under the root layout
 * (e.g. the marketing page) that aren't handled by a closer boundary.
 */
export default function RootError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    logger.error("Unhandled route error", error, { digest: error.digest });
  }, [error]);

  return (
    <ErrorState
      fullScreen
      title="Something went wrong"
      description="An unexpected error occurred while loading this page. You can try again or return home."
      onRetry={reset}
      homeHref="/"
    />
  );
}
