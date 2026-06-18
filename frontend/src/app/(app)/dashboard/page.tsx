"use client";

import { useMemo, useState } from "react";
import {
  Activity,
  Bell,
  Radio,
  CheckCircle2,
  Search,
  ExternalLink,
  RefreshCw,
} from "lucide-react";
import { Topbar } from "@/src/components/dashboard/topbar";
import { StatCard } from "@/src/components/dashboard/stat-card";
import { StatusBadge } from "@/src/components/dashboard/status-badge";
import { EventVolumeChart } from "@/src/components/dashboard/event-volume-chart";
import { RetryNotificationModal } from "@/src/components/dashboard/retry-notification-modal";
import { useUIState, useData } from "@/src/store";
import {
  dashboardStats,
  CHAINS,
  chainColors,
  timeAgo,
  type ChainEvent,
  type EventStatus,
} from "@/src/lib/mock-data";

const statusTone: Record<EventStatus, "success" | "pending" | "danger"> = {
  delivered: "success",
  pending: "pending",
  failed: "danger",
};

const chainFilters = ["All", ...CHAINS] as const;

export default function DashboardPage() {
  const chain = useUIState((state) => state.dashboardChainFilter);
  const query = useUIState((state) => state.dashboardSearchQuery);
  const setChain = useUIState((state) => state.setDashboardChainFilter);
  const setQuery = useUIState((state) => state.setDashboardSearchQuery);
  const events = useData((state) => state.events);

  // Event whose failed notification is being retried in the modal.
  const [retryEvent, setRetryEvent] = useState<ChainEvent | null>(null);

  const filtered = useMemo(() => {
    return events.filter((e) => {
      const matchesChain = chain === "All" || e.chain === chain;
      const q = query.trim().toLowerCase();
      const matchesQuery =
        !q ||
        e.contract.toLowerCase().includes(q) ||
        e.eventName.toLowerCase().includes(q) ||
        e.txHash.toLowerCase().includes(q);
      return matchesChain && matchesQuery;
    });
  }, [events, chain, query]);

  return (
    <>
      <Topbar
        title="Event monitor"
        description="Live feed of decoded events across your watched contracts"
      />

      <div className="flex-1 space-y-6 p-4 md:p-6">
        {/* Stats */}
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          <StatCard
            label="Events today"
            value={dashboardStats.eventsToday.toLocaleString()}
            icon={Activity}
            delta={dashboardStats.eventsTodayDelta}
          />
          <StatCard
            label="Notifications sent"
            value={dashboardStats.notificationsSent.toLocaleString()}
            icon={Bell}
            delta={dashboardStats.notificationsDelta}
          />
          <StatCard
            label="Active rules"
            value={String(dashboardStats.activeRules)}
            icon={Radio}
            hint={`${dashboardStats.watchedContracts} contracts watched`}
          />
          <StatCard
            label="Delivery success"
            value={`${dashboardStats.deliverySuccess}%`}
            icon={CheckCircle2}
            hint={`${dashboardStats.avgLatencyMs}ms avg latency`}
          />
        </div>

        {/* Chart */}
        <div className="rounded-xl border border-border bg-card">
          <div className="flex items-center justify-between border-b border-border px-5 py-4">
            <div>
              <h2 className="text-sm font-medium">Event volume</h2>
              <p className="text-xs text-muted-foreground">
                Last 24 hours · captured vs. matched
              </p>
            </div>
            <div className="flex items-center gap-4 text-xs">
              <span className="flex items-center gap-1.5 text-muted-foreground">
                <span className="size-2 rounded-full bg-primary" /> Captured
              </span>
              <span className="flex items-center gap-1.5 text-muted-foreground">
                <span className="size-2 rounded-full bg-muted-foreground" />{" "}
                Matched
              </span>
            </div>
          </div>
          <div className="p-3">
            <EventVolumeChart />
          </div>
        </div>

        {/* Feed */}
        <div className="rounded-xl border border-border bg-card">
          <div className="flex flex-col gap-3 border-b border-border px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-medium">Recent events</h2>
              <StatusBadge tone="success" label="live" pulse />
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <div className="flex items-center gap-2 rounded-md border border-border bg-background px-3 py-1.5">
                <Search className="size-4 text-muted-foreground" />
                <input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Filter events"
                  className="w-32 bg-transparent text-sm outline-none placeholder:text-muted-foreground sm:w-44"
                />
              </div>
              <div className="flex items-center gap-1 overflow-x-auto">
                {chainFilters.map((c) => (
                  <button
                    key={c}
                    onClick={() => setChain(c)}
                    className={
                      "whitespace-nowrap rounded-md px-2.5 py-1.5 text-xs transition-colors " +
                      (chain === c
                        ? "bg-secondary text-foreground"
                        : "text-muted-foreground hover:text-foreground")
                    }
                  >
                    {c}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Table header (desktop) */}
          <div className="hidden grid-cols-[1.4fr_1fr_1fr_0.8fr_0.6fr] gap-4 border-b border-border px-5 py-2.5 text-xs font-medium uppercase tracking-wider text-muted-foreground lg:grid">
            <span>Event</span>
            <span>Args</span>
            <span>Rule</span>
            <span>Status</span>
            <span className="text-right">Time</span>
          </div>

          <ul className="divide-y divide-border">
            {filtered.map((e) => (
              <li
                key={e.id}
                className="grid grid-cols-1 gap-3 px-5 py-4 transition-colors hover:bg-secondary/30 lg:grid-cols-[1.4fr_1fr_1fr_0.8fr_0.6fr] lg:items-center lg:gap-4"
              >
                <div className="flex items-center gap-3">
                  <span
                    className="mt-0.5 size-2 shrink-0 rounded-full"
                    style={{ backgroundColor: chainColors[e.chain] }}
                    title={e.chain}
                  />
                  <div className="min-w-0">
                    <p className="truncate font-mono text-sm">
                      <span className="text-primary">{e.eventName}</span>
                      <span className="text-muted-foreground">
                        {" "}
                        · {e.contract}
                      </span>
                    </p>
                    <p className="truncate text-xs text-muted-foreground">
                      {e.chain} · block {e.blockNumber.toLocaleString()}
                    </p>
                  </div>
                </div>

                <div className="truncate font-mono text-xs text-muted-foreground">
                  {Object.entries(e.args)
                    .slice(0, 2)
                    .map(([k, v]) => `${k}: ${v}`)
                    .join("  ·  ")}
                </div>

                <div className="text-sm">
                  {e.matchedRule ? (
                    <span className="text-foreground">{e.matchedRule}</span>
                  ) : (
                    <span className="text-muted-foreground">—</span>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  <StatusBadge
                    tone={statusTone[e.status]}
                    label={e.status}
                    pulse={e.status === "pending"}
                  />
                  {e.status === "failed" ? (
                    <button
                      onClick={() => setRetryEvent(e)}
                      className="inline-flex items-center gap-1 rounded-md px-1.5 py-0.5 text-xs font-medium text-destructive transition-colors hover:bg-destructive/10"
                      aria-label={`Retry notification for ${e.eventName} on ${e.contract}`}
                    >
                      <RefreshCw className="size-3" />
                      Retry
                    </button>
                  ) : null}
                </div>

                <div className="flex items-center justify-between gap-2 lg:justify-end">
                  <span className="text-xs text-muted-foreground">
                    {timeAgo(e.timestamp)}
                  </span>
                  <a
                    href="#"
                    className="text-muted-foreground transition-colors hover:text-foreground"
                    aria-label="View transaction"
                  >
                    <ExternalLink className="size-3.5" />
                  </a>
                </div>
              </li>
            ))}
          </ul>

          {filtered.length === 0 ? (
            <div className="px-5 py-16 text-center text-sm text-muted-foreground">
              No events match your filters.
            </div>
          ) : null}
        </div>
      </div>

      <RetryNotificationModal
        event={retryEvent}
        open={retryEvent !== null}
        onOpenChange={(open) => {
          if (!open) setRetryEvent(null);
        }}
      />
    </>
  );
}
