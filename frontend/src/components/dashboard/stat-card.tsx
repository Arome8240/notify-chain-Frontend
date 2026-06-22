import Link from "next/link";
import { type LucideIcon, TrendingUp, TrendingDown } from "lucide-react";
import { cn } from "@/src/lib/utils";
import type { MetricSlug } from "@/src/app/(app)/dashboard/analytics/[metric]/page";

interface StatCardProps {
  label: string;
  value: string;
  icon: LucideIcon;
  delta?: number;
  hint?: string;
  /** When provided the card becomes a link to the analytics detail page. */
  metric?: MetricSlug;
}

export function StatCard({
  label,
  value,
  icon: Icon,
  delta,
  hint,
  metric,
}: StatCardProps) {
  const positive = (delta ?? 0) >= 0;

  const inner = (
    <>
      <div className="flex items-center justify-between">
        <span className="text-sm text-muted-foreground">{label}</span>
        <Icon className="size-4 text-muted-foreground" />
      </div>
      <p className="mt-3 text-2xl font-semibold tracking-tight">{value}</p>
      <div className="mt-1 flex items-center gap-2 text-xs">
        {typeof delta === "number" ? (
          <span
            className={cn(
              "inline-flex items-center gap-1",
              positive ? "text-primary" : "text-destructive"
            )}
          >
            {positive ? (
              <TrendingUp className="size-3" />
            ) : (
              <TrendingDown className="size-3" />
            )}
            {positive ? "+" : ""}
            {delta}%
          </span>
        ) : null}
        {hint ? <span className="text-muted-foreground">{hint}</span> : null}
      </div>
    </>
  );

  if (metric) {
    return (
      <Link
        href={`/dashboard/analytics/${metric}`}
        className="rounded-xl border border-border bg-card p-5 block transition-colors hover:bg-secondary/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        aria-label={`View details for ${label}`}
      >
        {inner}
      </Link>
    );
  }

  return (
    <div className="rounded-xl border border-border bg-card p-5">{inner}</div>
  );
}
