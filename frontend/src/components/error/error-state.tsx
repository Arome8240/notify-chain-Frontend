"use client";

import Link from "next/link";
import { AlertTriangle, RotateCw } from "lucide-react";

import { Button } from "@/src/components/ui/button";
import { cn } from "@/src/lib/utils";

interface ErrorStateProps {
  title?: string;
  description?: string;
  /** When provided, renders a "try again" button wired to this handler. */
  onRetry?: () => void;
  retryLabel?: string;
  /** When provided, renders a link back to this route. */
  homeHref?: string;
  /** Full-screen centered layout (route boundaries) vs. an inline card. */
  fullScreen?: boolean;
  className?: string;
}

/**
 * Reusable error fallback. Purely token-based (no hardcoded colors) so it reads
 * correctly in both light and dark themes. Used by the route error boundaries
 * and available for inline, non-fatal error states (e.g. a section that failed).
 */
export function ErrorState({
  title = "Something went wrong",
  description = "An unexpected error occurred. You can try again or head back home.",
  onRetry,
  retryLabel = "Try again",
  homeHref,
  fullScreen = false,
  className,
}: ErrorStateProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center text-center",
        fullScreen
          ? "relative min-h-screen overflow-hidden bg-background px-6"
          : "rounded-xl border border-border bg-card p-8",
        className
      )}
    >
      {fullScreen && <div className="absolute inset-0 bg-grid opacity-30" />}
      <div className="relative flex flex-col items-center">
        <span className="flex size-12 items-center justify-center rounded-full bg-destructive/10 text-destructive">
          <AlertTriangle className="size-6" />
        </span>
        <h1 className="mt-4 text-balance text-2xl font-semibold tracking-tight">
          {title}
        </h1>
        <p className="mt-2 max-w-md text-pretty text-muted-foreground">
          {description}
        </p>
        {(onRetry || homeHref) && (
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            {onRetry && (
              <Button onClick={onRetry}>
                <RotateCw className="size-4" />
                {retryLabel}
              </Button>
            )}
            {homeHref && (
              <Button asChild variant={onRetry ? "outline" : "default"}>
                <Link href={homeHref}>Return home</Link>
              </Button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
