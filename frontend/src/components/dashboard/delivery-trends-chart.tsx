"use client";

import { useTheme } from "next-themes";
import {
  Area,
  AreaChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { TrendingUp } from "lucide-react";
import { Skeleton } from "@/src/components/ui/skeleton";
import { useDeliveryTrends } from "@/src/lib/use-delivery-trends";
import { TREND_INTERVALS, trendIntervalLabels } from "@/src/lib/mock-data";
import { cn } from "@/src/lib/utils";
import type { TrendInterval } from "@/src/lib/mock-data";

/**
 * Chart colour tokens — mirrors CHART_COLORS in event-volume-chart.tsx.
 * Keep in sync with globals.css if the palette changes.
 */
const CHART_COLORS = {
  dark: {
    primary: "#2bd97c",
    danger: "#f0506e",
    muted: "#8a8f98",
    border: "#212328",
    popover: "#131416",
    foreground: "#ededf0",
  },
  light: {
    primary: "#0a7d4d",
    danger: "#c8324f",
    muted: "#5b626e",
    border: "#dfe1e6",
    popover: "#ffffff",
    foreground: "#0c0e12",
  },
} as const;

// ---------------------------------------------------------------------------
// Interval selector
// ---------------------------------------------------------------------------

function IntervalButton({
  label,
  active,
  onClick,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "rounded-md px-2.5 py-1.5 text-xs transition-colors",
        active
          ? "bg-secondary text-foreground"
          : "text-muted-foreground hover:text-foreground"
      )}
      aria-pressed={active}
    >
      {label}
    </button>
  );
}

// ---------------------------------------------------------------------------
// Empty state
// ---------------------------------------------------------------------------

function EmptyState() {
  return (
    <div className="flex h-60 flex-col items-center justify-center gap-2 text-center">
      <TrendingUp className="size-8 text-muted-foreground/40" />
      <p className="text-sm font-medium text-muted-foreground">
        No delivery data for this period
      </p>
      <p className="text-xs text-muted-foreground/70">
        Try a different time range or check back later.
      </p>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Loading skeleton
// ---------------------------------------------------------------------------

function ChartSkeleton() {
  return (
    <div className="flex h-60 flex-col justify-end gap-1 px-2">
      <div className="flex items-end gap-2">
        {Array.from({ length: 12 }).map((_, i) => (
          <Skeleton
            key={i}
            className="flex-1 rounded-sm"
            style={{ height: `${30 + Math.sin(i) * 20 + Math.random() * 40}px` }}
          />
        ))}
      </div>
      <Skeleton className="mt-2 h-3 w-full" />
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main component
// ---------------------------------------------------------------------------

export function DeliveryTrendsChart() {
  const { resolvedTheme } = useTheme();
  const colors =
    resolvedTheme === "light" ? CHART_COLORS.light : CHART_COLORS.dark;

  const { data, isLoading, interval, setInterval } = useDeliveryTrends("24h");

  const isEmpty = !isLoading && data.length === 0;

  return (
    <div className="rounded-xl border border-border bg-card">
      {/* Header */}
      <div className="flex flex-col gap-3 border-b border-border px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-sm font-medium">Delivery trends</h2>
          <p className="text-xs text-muted-foreground">
            Delivered vs. failed notifications over time
          </p>
        </div>

        {/* Interval tabs */}
        <div className="flex items-center gap-1" role="group" aria-label="Select time range">
          {TREND_INTERVALS.map((i: TrendInterval) => (
            <IntervalButton
              key={i}
              label={i}
              active={interval === i}
              onClick={() => setInterval(i)}
            />
          ))}
        </div>
      </div>

      {/* Legend */}
      <div className="flex items-center gap-4 px-5 pt-3 text-xs">
        <span className="flex items-center gap-1.5 text-muted-foreground">
          <span className="size-2 rounded-full bg-primary" /> Delivered
        </span>
        <span className="flex items-center gap-1.5 text-muted-foreground">
          <span className="size-2 rounded-full bg-destructive" /> Failed
        </span>
        {!isLoading && !isEmpty && (
          <span className="ml-auto text-muted-foreground">
            {trendIntervalLabels[interval]}
          </span>
        )}
      </div>

      {/* Chart body */}
      <div className="p-3">
        {isLoading ? (
          <ChartSkeleton />
        ) : isEmpty ? (
          <EmptyState />
        ) : (
          <ResponsiveContainer width="100%" height={240}>
            <AreaChart
              data={data}
              margin={{ top: 8, right: 8, left: -16, bottom: 0 }}
            >
              <defs>
                <linearGradient
                  id="deliveredFill"
                  x1="0"
                  y1="0"
                  x2="0"
                  y2="1"
                >
                  <stop
                    offset="0%"
                    stopColor={colors.primary}
                    stopOpacity={0.35}
                  />
                  <stop
                    offset="100%"
                    stopColor={colors.primary}
                    stopOpacity={0}
                  />
                </linearGradient>
                <linearGradient id="failedFill" x1="0" y1="0" x2="0" y2="1">
                  <stop
                    offset="0%"
                    stopColor={colors.danger}
                    stopOpacity={0.3}
                  />
                  <stop
                    offset="100%"
                    stopColor={colors.danger}
                    stopOpacity={0}
                  />
                </linearGradient>
              </defs>

              <XAxis
                dataKey="label"
                stroke={colors.muted}
                fontSize={11}
                tickLine={false}
                axisLine={false}
              />
              <YAxis
                stroke={colors.muted}
                fontSize={11}
                tickLine={false}
                axisLine={false}
                width={48}
              />
              <Tooltip
                cursor={{ stroke: colors.border }}
                contentStyle={{
                  background: colors.popover,
                  border: `1px solid ${colors.border}`,
                  borderRadius: 8,
                  fontSize: 12,
                }}
                labelStyle={{ color: colors.foreground }}
              />
              <Area
                type="monotone"
                dataKey="delivered"
                stroke={colors.primary}
                strokeWidth={2}
                fill="url(#deliveredFill)"
                name="Delivered"
                isAnimationActive={true}
                animationDuration={400}
              />
              <Area
                type="monotone"
                dataKey="failed"
                stroke={colors.danger}
                strokeWidth={1.5}
                fill="url(#failedFill)"
                name="Failed"
                isAnimationActive={true}
                animationDuration={400}
              />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
}
