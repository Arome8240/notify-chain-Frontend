import Link from "next/link";
import { CheckCircle2, XCircle } from "lucide-react";
import { Skeleton } from "@/src/components/ui/skeleton";
import { deliveryChannelIcons } from "@/src/components/dashboard/channel-icon";
import { deliveryChannelLabels, type ChannelMetric } from "@/src/lib/mock-data";
import { cn, formatCompactNumber } from "@/src/lib/utils";

export function ChannelMetricCard({ metric }: { metric: ChannelMetric }) {
  const Icon = deliveryChannelIcons[metric.channel];
  const total = metric.successful + metric.failed;
  const successRate = total > 0 ? (metric.successful / total) * 100 : 0;

  return (
    <Link
      href="/dashboard/analytics/delivery-success"
      className="rounded-xl border border-border bg-card p-5 block transition-colors hover:bg-secondary/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      aria-label={`View delivery details for ${deliveryChannelLabels[metric.channel]}`}
    >
      <div className="flex items-center justify-between">
        <span className="flex items-center gap-2 text-sm text-muted-foreground">
          <span className="flex size-7 items-center justify-center rounded-md bg-secondary text-foreground">
            <Icon className="size-4" />
          </span>
          {deliveryChannelLabels[metric.channel]}
        </span>
        <span className="text-xs text-muted-foreground">
          {successRate.toFixed(1)}%
        </span>
      </div>

      <p
        className="mt-3 text-2xl font-semibold tracking-tight"
        title={total.toLocaleString("en-US")}
      >
        {formatCompactNumber(total)}
      </p>
      <p className="text-xs text-muted-foreground">total notifications</p>

      <div className="mt-4 grid grid-cols-2 gap-2">
        <MetricLeg tone="success" label="Delivered" value={metric.successful} />
        <MetricLeg tone="danger" label="Failed" value={metric.failed} />
      </div>
    </Link>
  );
}

function MetricLeg({
  tone,
  label,
  value,
}: {
  tone: "success" | "danger";
  label: string;
  value: number;
}) {
  const Icon = tone === "success" ? CheckCircle2 : XCircle;
  return (
    <div className="rounded-md bg-secondary/50 px-3 py-2">
      <div className="flex items-center gap-1.5">
        <Icon
          className={cn(
            "size-3.5",
            tone === "success" ? "text-primary" : "text-destructive"
          )}
        />
        <span
          className="text-sm font-medium tabular-nums"
          title={value.toLocaleString("en-US")}
        >
          {formatCompactNumber(value)}
        </span>
      </div>
      <p className="mt-0.5 text-[11px] text-muted-foreground">{label}</p>
    </div>
  );
}

export function ChannelMetricCardSkeleton() {
  return (
    <div className="rounded-xl border border-border bg-card p-5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Skeleton className="size-7 rounded-md" />
          <Skeleton className="h-4 w-16" />
        </div>
        <Skeleton className="h-4 w-10" />
      </div>
      <Skeleton className="mt-3 h-8 w-24" />
      <Skeleton className="mt-1.5 h-3 w-28" />
      <div className="mt-4 grid grid-cols-2 gap-2">
        <Skeleton className="h-12 rounded-md" />
        <Skeleton className="h-12 rounded-md" />
      </div>
    </div>
  );
}
