"use client";

import { useMemo } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import {
  Activity,
  Bell,
  Radio,
  CheckCircle2,
  ChevronRight,
  Home,
} from "lucide-react";
import { Topbar } from "@/src/components/dashboard/topbar";
import { StatusBadge } from "@/src/components/dashboard/status-badge";
import {
  events,
  rules,
  channels,
  dashboardStats,
  timeAgo,
  type EventStatus,
} from "@/src/lib/mock-data";
import { cn } from "@/src/lib/utils";

// ---------------------------------------------------------------------------
// Metric config — maps URL slug → display metadata + filtered data derivation
// ---------------------------------------------------------------------------

export type MetricSlug =
  | "events-today"
  | "notifications-sent"
  | "active-rules"
  | "delivery-success";

interface MetricConfig {
  slug: MetricSlug;
  label: string;
  description: string;
  icon: React.ElementType;
  value: string;
  hint?: string;
}

const metricConfigs: MetricConfig[] = [
  {
    slug: "events-today",
    label: "Events today",
    description: "All decoded events captured in the last 24 hours",
    icon: Activity,
    value: dashboardStats.eventsToday.toLocaleString(),
    hint: `+${dashboardStats.eventsTodayDelta}% vs yesterday`,
  },
  {
    slug: "notifications-sent",
    label: "Notifications sent",
    description: "Notifications dispatched across all delivery channels",
    icon: Bell,
    value: dashboardStats.notificationsSent.toLocaleString(),
    hint: `+${dashboardStats.notificationsDelta}% vs yesterday`,
  },
  {
    slug: "active-rules",
    label: "Active rules",
    description: "Notification rules currently enabled and listening",
    icon: Radio,
    value: String(dashboardStats.activeRules),
    hint: `${dashboardStats.watchedContracts} contracts watched`,
  },
  {
    slug: "delivery-success",
    label: "Delivery success",
    description: "End-to-end delivery success rate across all channels",
    icon: CheckCircle2,
    value: `${dashboardStats.deliverySuccess}%`,
    hint: `${dashboardStats.avgLatencyMs}ms avg latency`,
  },
];

const statusTone: Record<EventStatus, "success" | "pending" | "danger"> = {
  delivered: "success",
  pending: "pending",
  failed: "danger",
};

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

export default function AnalyticsDetailPage() {
  const { metric } = useParams<{ metric: string }>();

  const config = metricConfigs.find((c) => c.slug === metric);

  // Derive the relevant table rows for each metric
  const eventsRows = useMemo(() => {
    if (metric === "events-today") return events;
    if (metric === "notifications-sent")
      return events.filter((e) => e.status === "delivered");
    if (metric === "delivery-success")
      return events.filter(
        (e) => e.status === "delivered" || e.status === "failed"
      );
    return [];
  }, [metric]);

  const rulesRows = useMemo(() => {
    if (metric === "active-rules")
      return rules.filter((r) => r.status === "active");
    return [];
  }, [metric]);

  const channelsRows = useMemo(() => {
    if (metric === "delivery-success" || metric === "notifications-sent")
      return channels;
    return [];
  }, [metric]);

  if (!config) {
    return (
      <div className="flex flex-1 flex-col">
        <Topbar title="Analytics" description="Metric not found" />
        <div className="flex flex-1 items-center justify-center text-sm text-muted-foreground">
          Unknown metric.{" "}
          <Link
            href="/dashboard"
            className="ml-1 text-primary underline underline-offset-4"
          >
            Back to dashboard
          </Link>
        </div>
      </div>
    );
  }

  const Icon = config.icon;

  return (
    <div className="flex flex-1 flex-col">
      <Topbar
        title={config.label}
        description={config.description}
      />

      <div className="flex-1 space-y-6 p-4 md:p-6">
        {/* Breadcrumb */}
        <nav
          aria-label="Breadcrumb"
          className="flex items-center gap-1.5 text-xs text-muted-foreground"
        >
          <Link
            href="/dashboard"
            className="flex items-center gap-1 transition-colors hover:text-foreground"
          >
            <Home className="size-3.5" />
            Dashboard
          </Link>
          <ChevronRight className="size-3.5" />
          <span className="text-foreground">{config.label}</span>
        </nav>

        {/* Hero stat */}
        <div className="rounded-xl border border-border bg-card p-6">
          <div className="flex items-center gap-3">
            <span className="flex size-10 items-center justify-center rounded-lg bg-secondary">
              <Icon className="size-5 text-foreground" />
            </span>
            <div>
              <p className="text-sm text-muted-foreground">{config.label}</p>
              <p className="text-3xl font-semibold tracking-tight">
                {config.value}
              </p>
            </div>
          </div>
          {config.hint && (
            <p className="mt-3 text-xs text-muted-foreground">{config.hint}</p>
          )}
        </div>

        {/* Events table — shown for events-today, notifications-sent, delivery-success */}
        {eventsRows.length > 0 && (
          <section className="rounded-xl border border-border bg-card">
            <div className="border-b border-border px-5 py-4">
              <h2 className="text-sm font-medium">
                {metric === "events-today"
                  ? "All events today"
                  : metric === "notifications-sent"
                  ? "Successfully delivered events"
                  : "Events by delivery status"}
              </h2>
              <p className="text-xs text-muted-foreground">
                {eventsRows.length} records
              </p>
            </div>

            <div className="hidden grid-cols-[1.4fr_1fr_1fr_0.8fr_0.6fr] gap-4 border-b border-border px-5 py-2.5 text-xs font-medium uppercase tracking-wider text-muted-foreground lg:grid">
              <span>Event</span>
              <span>Args</span>
              <span>Rule</span>
              <span>Status</span>
              <span className="text-right">Time</span>
            </div>

            <ul className="divide-y divide-border">
              {eventsRows.map((e) => (
                <li
                  key={e.id}
                  className="grid grid-cols-1 gap-3 px-5 py-4 lg:grid-cols-[1.4fr_1fr_1fr_0.8fr_0.6fr] lg:items-center lg:gap-4"
                >
                  <div className="min-w-0">
                    <p className="truncate font-mono text-sm">
                      <span className="text-primary">{e.eventName}</span>
                      <span className="text-muted-foreground">
                        {" "}
                        | {e.contract}
                      </span>
                    </p>
                    <p className="truncate text-xs text-muted-foreground">
                      {e.chain} | block {e.blockNumber.toLocaleString()}
                    </p>
                  </div>
                  <div className="truncate font-mono text-xs text-muted-foreground">
                    {Object.entries(e.args)
                      .slice(0, 2)
                      .map(([k, v]) => `${k}: ${v}`)
                      .join("  |  ")}
                  </div>
                  <div className="text-sm">
                    {e.matchedRule ? (
                      <span className="text-foreground">{e.matchedRule}</span>
                    ) : (
                      <span className="text-muted-foreground">—</span>
                    )}
                  </div>
                  <div>
                    <StatusBadge
                      tone={statusTone[e.status]}
                      label={e.status}
                      pulse={e.status === "pending"}
                    />
                  </div>
                  <div className="text-right text-xs text-muted-foreground">
                    {timeAgo(e.timestamp)}
                  </div>
                </li>
              ))}
            </ul>
          </section>
        )}

        {/* Rules table — shown for active-rules */}
        {rulesRows.length > 0 && (
          <section className="rounded-xl border border-border bg-card">
            <div className="border-b border-border px-5 py-4">
              <h2 className="text-sm font-medium">Active rules</h2>
              <p className="text-xs text-muted-foreground">
                {rulesRows.length} rules currently enabled
              </p>
            </div>

            <div className="hidden grid-cols-[1.5fr_1fr_0.8fr_0.8fr_0.6fr] gap-4 border-b border-border px-5 py-2.5 text-xs font-medium uppercase tracking-wider text-muted-foreground lg:grid">
              <span>Rule</span>
              <span>Contract</span>
              <span>Chain</span>
              <span>Triggered 24h</span>
              <span className="text-right">Last triggered</span>
            </div>

            <ul className="divide-y divide-border">
              {rulesRows.map((r) => (
                <li
                  key={r.id}
                  className="grid grid-cols-1 gap-3 px-5 py-4 lg:grid-cols-[1.5fr_1fr_0.8fr_0.8fr_0.6fr] lg:items-center lg:gap-4"
                >
                  <div>
                    <p className="text-sm font-medium">{r.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {r.description}
                    </p>
                  </div>
                  <p className="font-mono text-xs text-muted-foreground">
                    {r.contract}
                  </p>
                  <p className="text-sm">{r.chain}</p>
                  <p className="text-sm tabular-nums">{r.triggered24h}</p>
                  <p className="text-right text-xs text-muted-foreground">
                    {timeAgo(r.lastTriggered)}
                  </p>
                </li>
              ))}
            </ul>
          </section>
        )}

        {/* Channels table — shown for delivery-success and notifications-sent */}
        {channelsRows.length > 0 && (
          <section className="rounded-xl border border-border bg-card">
            <div className="border-b border-border px-5 py-4">
              <h2 className="text-sm font-medium">Delivery channels</h2>
              <p className="text-xs text-muted-foreground">
                Per-channel delivery breakdown
              </p>
            </div>

            <div className="hidden grid-cols-[1.5fr_1fr_0.8fr_0.8fr_0.6fr] gap-4 border-b border-border px-5 py-2.5 text-xs font-medium uppercase tracking-wider text-muted-foreground lg:grid">
              <span>Channel</span>
              <span>Destination</span>
              <span>Deliveries 24h</span>
              <span>Success rate</span>
              <span className="text-right">Last delivery</span>
            </div>

            <ul className="divide-y divide-border">
              {channelsRows.map((ch) => (
                <li
                  key={ch.id}
                  className="grid grid-cols-1 gap-3 px-5 py-4 lg:grid-cols-[1.5fr_1fr_0.8fr_0.8fr_0.6fr] lg:items-center lg:gap-4"
                >
                  <div className="flex items-center gap-2">
                    <span
                      className={cn(
                        "size-2 rounded-full",
                        ch.connected ? "bg-primary" : "bg-muted-foreground"
                      )}
                    />
                    <p className="text-sm font-medium">{ch.name}</p>
                  </div>
                  <p className="font-mono text-xs text-muted-foreground truncate">
                    {ch.destination}
                  </p>
                  <p className="text-sm tabular-nums">
                    {ch.deliveries24h.toLocaleString()}
                  </p>
                  <p
                    className={cn(
                      "text-sm tabular-nums",
                      ch.successRate >= 99
                        ? "text-primary"
                        : ch.successRate >= 95
                        ? "text-foreground"
                        : "text-destructive"
                    )}
                  >
                    {ch.successRate}%
                  </p>
                  <p className="text-right text-xs text-muted-foreground">
                    {timeAgo(ch.lastDelivery)}
                  </p>
                </li>
              ))}
            </ul>
          </section>
        )}
      </div>
    </div>
  );
}
