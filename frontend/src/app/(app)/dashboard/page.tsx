"use client";

import { useMemo, useState } from "react";
import {
  Activity,
  Bell,
  BookmarkPlus,
  CheckCircle2,
  ExternalLink,
  PencilLine,
  Play,
  Radio,
  Search,
  SlidersHorizontal,
  Trash2,
} from "lucide-react";
import { Topbar } from "@/src/components/dashboard/topbar";
import { StatCard } from "@/src/components/dashboard/stat-card";
import { StatusBadge } from "@/src/components/dashboard/status-badge";
import { EventVolumeChart } from "@/src/components/dashboard/event-volume-chart";
import { ChannelMetrics } from "@/src/components/dashboard/channel-metrics";
import { useUIState } from "@/src/store";
import { useKeyboardList } from "@/src/lib/use-keyboard-list";
import { Button } from "@/src/components/ui/button";
import { Input } from "@/src/components/ui/input";
import { ExportMenu } from "@/src/components/export-menu";
import type { DashboardFilterPreset } from "@/src/store/types";
import {
  events,
  dashboardStats,
  CHAINS,
  chainColors,
  timeAgo,
  type EventStatus,
} from "@/src/lib/mock-data";

const statusTone: Record<EventStatus, "success" | "pending" | "danger"> = {
  delivered: "success",
  pending: "pending",
  failed: "danger",
};

const chainFilters = ["All", ...CHAINS] as const;

function formatFilterSummary(preset: DashboardFilterPreset) {
  const parts = [preset.dashboardChainFilter];
  if (preset.dashboardSearchQuery.trim()) {
    parts.push(`"${preset.dashboardSearchQuery.trim()}"`);
  }
  return parts.join(" | ");
}

function sameFilterState(
  chain: string,
  query: string,
  preset: DashboardFilterPreset
) {
  return (
    chain === preset.dashboardChainFilter &&
    query.trim() === preset.dashboardSearchQuery.trim()
  );
}

export default function DashboardPage() {
  const chain = useUIState((state) => state.dashboardChainFilter);
  const query = useUIState((state) => state.dashboardSearchQuery);
  const presets = useUIState((state) => state.dashboardFilterPresets);
  const setChain = useUIState((state) => state.setDashboardChainFilter);
  const setQuery = useUIState((state) => state.setDashboardSearchQuery);
  const savePreset = useUIState((state) => state.saveDashboardFilterPreset);
  const updatePreset = useUIState((state) => state.updateDashboardFilterPreset);
  const deletePreset = useUIState((state) => state.deleteDashboardFilterPreset);
  const applyPreset = useUIState((state) => state.applyDashboardFilterPreset);

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingPresetId, setEditingPresetId] = useState<string | null>(null);
  const [presetName, setPresetName] = useState("");
  const [presetError, setPresetError] = useState<string | null>(null);

  const { listRef: eventsListRef, getRowProps: getEventRowProps } =
    useKeyboardList(filtered.length);

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
  }, [chain, query]);

  const activePreset = presets.find((preset) => sameFilterState(chain, query, preset));

  function openNewPresetForm() {
    setEditingPresetId(null);
    setPresetName(
      chain === "All" && !query.trim()
        ? ""
        : `${chain !== "All" ? chain : "All"} filters`
    );
    setPresetError(null);
    setIsFormOpen(true);
  }

  function openEditPresetForm(preset: DashboardFilterPreset) {
    setEditingPresetId(preset.id);
    setPresetName(preset.name);
    setPresetError(null);
    setIsFormOpen(true);
  }

  function closePresetForm() {
    setIsFormOpen(false);
    setEditingPresetId(null);
    setPresetName("");
    setPresetError(null);
  }

  function submitPresetForm() {
    const name = presetName.trim();
    if (!name) {
      setPresetError("Give this preset a name before saving.");
      return;
    }

    if (editingPresetId) {
      updatePreset(editingPresetId, name);
    } else {
      savePreset(name);
    }

    closePresetForm();
  }

  function deletePresetById(id: string) {
    if (!window.confirm("Delete this saved filter preset?")) return;
    deletePreset(id);
    if (editingPresetId === id) {
      closePresetForm();
    }
  }

  return (
    <>
      <Topbar
        title="Event monitor"
        description="Live feed of decoded events across your watched contracts"
      />

      <div className="flex-1 space-y-6 p-4 md:p-6">
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

        {/* Notification metrics by delivery channel */}
        <ChannelMetrics />

        {/* Chart */}
        <div className="rounded-xl border border-border bg-card">
          <div className="flex items-center justify-between border-b border-border px-5 py-4">
            <div>
              <h2 className="text-sm font-medium">Event volume</h2>
              <p className="text-xs text-muted-foreground">
                Last 24 hours | captured vs. matched
              </p>
            </div>
            <div className="flex items-center gap-4 text-xs">
              <span className="flex items-center gap-1.5 text-muted-foreground">
                <span className="size-2 rounded-full bg-primary" /> Captured
              </span>
              <span className="flex items-center gap-1.5 text-muted-foreground">
                <span className="size-2 rounded-full bg-muted-foreground" /> Matched
              </span>
            </div>
          </div>
          <div className="p-3">
            <EventVolumeChart />
          </div>
        </div>

        <div className="grid gap-6 xl:grid-cols-[minmax(0,1.5fr)_360px]">
          <div className="rounded-xl border border-border bg-card">
            <div className="flex flex-col gap-3 border-b border-border px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-2">
                <h2 className="text-sm font-medium">Recent events</h2>
                <StatusBadge tone="success" label="live" pulse />
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <ExportMenu dataType="events" />
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

            <div className="hidden grid-cols-[1.4fr_1fr_1fr_0.8fr_0.6fr] gap-4 border-b border-border px-5 py-2.5 text-xs font-medium uppercase tracking-wider text-muted-foreground lg:grid">
              <span>Event</span>
              <span>Args</span>
              <span>Rule</span>
              <span>Status</span>
              <span className="text-right">Time</span>
            </div>

            <ul
                className="divide-y divide-border"
                ref={eventsListRef as React.RefObject<HTMLUListElement>}
                role="listbox"
                aria-label="Recent events"
              >
              {filtered.map((e, index) => (
                <li
                  key={e.id}
                  {...getEventRowProps(index)}
                  className="grid grid-cols-1 gap-3 px-5 py-4 transition-colors hover:bg-secondary/30 focus:bg-secondary/30 focus:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring lg:grid-cols-[1.4fr_1fr_1fr_0.8fr_0.6fr] lg:items-center lg:gap-4"
                  aria-label={`${e.eventName} on ${e.contract}, ${e.chain}, status ${e.status}`}
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
                        <span className="text-muted-foreground"> | {e.contract}</span>
                      </p>
                      <p className="truncate text-xs text-muted-foreground">
                        {e.chain} | block {e.blockNumber.toLocaleString()}
                      </p>
                    </div>
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
                      <span className="text-muted-foreground">-</span>
                    )}
                  </div>

                  <div>
                    <StatusBadge
                      tone={statusTone[e.status]}
                      label={e.status}
                      pulse={e.status === "pending"}
                    />
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

          <aside className="space-y-4">
            <div className="rounded-xl border border-border bg-card p-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <SlidersHorizontal className="size-4 text-muted-foreground" />
                    <h3 className="text-sm font-medium">Saved filter presets</h3>
                  </div>
                  <p className="mt-1 text-xs text-muted-foreground">
                    Capture the current chain and search filters for quick reuse.
                  </p>
                </div>
                <Button variant="outline" size="sm" onClick={openNewPresetForm}>
                  <BookmarkPlus className="size-4" />
                  Save filter
                </Button>
              </div>

              {activePreset ? (
                <div className="mt-4 rounded-lg border border-primary/20 bg-primary/5 px-3 py-2 text-xs text-primary">
                  Active preset: {activePreset.name}
                </div>
              ) : (
                <div className="mt-4 rounded-lg border border-dashed border-border bg-background px-3 py-2 text-xs text-muted-foreground">
                  These filters are not saved yet.
                </div>
              )}

              {isFormOpen ? (
                <div className="mt-4 rounded-xl border border-border bg-background p-4">
                  <div className="flex items-center justify-between gap-2">
                    <div>
                      <h4 className="text-sm font-medium">
                        {editingPresetId ? "Edit preset" : "Save current filters"}
                      </h4>
                      <p className="mt-1 text-xs text-muted-foreground">
                        {editingPresetId
                          ? "This will rename the preset while keeping its saved filters."
                          : "The preset will store the current chain and search filters."}
                      </p>
                    </div>
                  </div>

                  <div className="mt-4 space-y-3">
                    <div>
                      <label className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-muted-foreground">
                        Preset name
                      </label>
                      <Input
                        value={presetName}
                        onChange={(e) => setPresetName(e.target.value)}
                        placeholder="e.g. Whale watch on Base"
                      />
                    </div>

                    <div className="rounded-lg border border-border bg-card px-3 py-2 text-xs text-muted-foreground">
                      {formatFilterSummary({
                        id: "preview",
                        name: "preview",
                        dashboardChainFilter: chain,
                        dashboardSearchQuery: query,
                        createdAt: "",
                        updatedAt: "",
                      })}
                    </div>

                    {presetError ? (
                      <p className="text-xs text-destructive">{presetError}</p>
                    ) : null}
                  </div>

                  <div className="mt-4 flex items-center justify-end gap-2">
                    <Button variant="ghost" onClick={closePresetForm}>
                      Cancel
                    </Button>
                    <Button onClick={submitPresetForm}>
                      {editingPresetId ? "Update preset" : "Save preset"}
                    </Button>
                  </div>
                </div>
              ) : null}

              <div className="mt-4 space-y-3">
                {presets.length === 0 ? (
                  <div className="rounded-lg border border-dashed border-border px-3 py-6 text-center text-sm text-muted-foreground">
                    No saved presets yet.
                  </div>
                ) : (
                  presets.map((preset) => {
                    const isCurrent = sameFilterState(chain, query, preset);

                    return (
                      <div
                        key={preset.id}
                        className="rounded-xl border border-border bg-background p-3"
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="min-w-0">
                            <div className="flex flex-wrap items-center gap-2">
                              <h4 className="truncate text-sm font-medium">
                                {preset.name}
                              </h4>
                              {isCurrent ? (
                                <StatusBadge tone="success" label="applied" />
                              ) : null}
                            </div>
                            <p className="mt-1 text-xs text-muted-foreground">
                              {formatFilterSummary(preset)}
                            </p>
                          </div>
                          <span className="whitespace-nowrap text-[11px] text-muted-foreground">
                            {timeAgo(preset.updatedAt)}
                          </span>
                        </div>

                        <div className="mt-3 flex flex-wrap gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => applyPreset(preset.id)}
                          >
                            <Play className="size-4" />
                            Apply
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => openEditPresetForm(preset)}
                          >
                            <PencilLine className="size-4" />
                            Edit
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            className="text-muted-foreground hover:text-destructive"
                            onClick={() => deletePresetById(preset.id)}
                          >
                            <Trash2 className="size-4" />
                            Delete
                          </Button>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>

            <div className="rounded-xl border border-border bg-card p-4 text-xs text-muted-foreground">
              Applying a preset restores every dashboard filter we currently expose.
            </div>
          </aside>
        </div>
      </div>
    </>
  );
}
