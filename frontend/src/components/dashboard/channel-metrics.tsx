"use client";

import { RefreshCw } from "lucide-react";
import { Button } from "@/src/components/ui/button";
import {
  ChannelMetricCard,
  ChannelMetricCardSkeleton,
} from "@/src/components/dashboard/channel-metric-card";
import { useChannelMetrics } from "@/src/lib/use-channel-metrics";
import { DELIVERY_CHANNELS } from "@/src/lib/mock-data";
import { cn } from "@/src/lib/utils";

export function ChannelMetrics() {
  const { metrics, isLoading, refresh } = useChannelMetrics();

  return (
    <section className="space-y-3">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-sm font-medium">Notifications by channel</h2>
          <p className="text-xs text-muted-foreground">
            Delivery totals across the last 24 hours
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={refresh}
          disabled={isLoading}
          aria-label="Refresh channel metrics"
        >
          <RefreshCw className={cn("size-4", isLoading && "animate-spin")} />
          Refresh
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {isLoading
          ? DELIVERY_CHANNELS.map((channel) => (
              <ChannelMetricCardSkeleton key={channel} />
            ))
          : metrics.map((metric) => (
              <ChannelMetricCard key={metric.channel} metric={metric} />
            ))}
      </div>
    </section>
  );
}
