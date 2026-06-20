import * as React from "react";
import { X } from "lucide-react";
import { cn } from "@/src/lib/utils";

export interface FilterChipProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  /** Whether this chip is currently active/selected */
  active?: boolean;
  /** Optional colour accent applied when active (tailwind bg/text/border utility strings) */
  accentClass?: string;
  /** Show a dismiss × icon when active instead of just a highlighted state */
  dismissible?: boolean;
  /** Called when the × button is clicked (only relevant when dismissible=true) */
  onDismiss?: () => void;
}

/**
 * FilterChip — a pill-shaped toggle button used inside filter rows.
 *
 * Inactive: muted ghost appearance.
 * Active:   filled/highlighted using the optional accentClass, or the
 *           default primary colour when none is provided.
 */
export function FilterChip({
  active = false,
  accentClass,
  dismissible = false,
  onDismiss,
  className,
  children,
  onClick,
  ...props
}: FilterChipProps) {
  return (
    <button
      type="button"
      role="checkbox"
      aria-checked={active}
      onClick={onClick}
      className={cn(
        // Base
        "inline-flex items-center gap-1 rounded-full border px-3 py-1 text-xs font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1",
        // Inactive
        !active &&
          "border-border bg-background text-muted-foreground hover:border-foreground/30 hover:text-foreground",
        // Active — use accent or fall back to primary
        active &&
          (accentClass ??
            "border-primary/30 bg-primary/10 text-primary hover:bg-primary/20"),
        className
      )}
      {...props}
    >
      {children}
      {active && dismissible && (
        <span
          role="button"
          aria-label="Remove filter"
          tabIndex={0}
          onClick={(e) => {
            e.stopPropagation();
            onDismiss?.();
          }}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              e.stopPropagation();
              onDismiss?.();
            }
          }}
          className="ml-0.5 rounded-full p-0.5 hover:bg-primary/20"
        >
          <X className="size-2.5" />
        </span>
      )}
    </button>
  );
}
