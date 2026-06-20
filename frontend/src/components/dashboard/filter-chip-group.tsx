"use client";

/**
 * FilterChipGroup
 *
 * Renders a row of status filter chips for the dashboard events feed.
 * Behaviour:
 *   - Multi-select: any combination of statuses can be active simultaneously.
 *   - Empty selection === "show all" (no chips highlighted).
 *   - Selection is kept in sync with the URL via the `status` search param
 *     (comma-separated, e.g. `?status=delivered,failed`).
 *   - Zustand store is updated on every toggle so the rest of the page
 *     reacts instantly without a navigation round-trip.
 */

import { useCallback, useEffect } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { CheckCircle2, Clock, XCircle, ListFilter } from "lucide-react";
import { FilterChip } from "@/src/components/ui/filter-chip";
import { useUIState } from "@/src/store";
import type { DashboardStatusFilter } from "@/src/store";

// ─── Config ──────────────────────────────────────────────────────────────────

export const STATUS_FILTERS: {
  value: DashboardStatusFilter;
  label: string;
  icon: React.ElementType;
  accentClass: string;
}[] = [
  {
    value: "delivered",
    label: "Delivered",
    icon: CheckCircle2,
    accentClass:
      "border-primary/30 bg-primary/10 text-primary hover:bg-primary/20",
  },
  {
    value: "pending",
    label: "Pending",
    icon: Clock,
    accentClass:
      "border-warning/40 bg-warning/10 text-warning hover:bg-warning/15",
  },
  {
    value: "failed",
    label: "Failed",
    icon: XCircle,
    accentClass:
      "border-destructive/30 bg-destructive/10 text-destructive hover:bg-destructive/15",
  },
];

const URL_PARAM = "status";

// ─── Helpers ─────────────────────────────────────────────────────────────────

function parseUrlStatuses(raw: string | null): DashboardStatusFilter[] {
  if (!raw) return [];
  const valid = new Set<DashboardStatusFilter>(["delivered", "pending", "failed"]);
  return raw
    .split(",")
    .map((s) => s.trim() as DashboardStatusFilter)
    .filter((s) => valid.has(s));
}

function encodeUrlStatuses(statuses: DashboardStatusFilter[]): string {
  return statuses.join(",");
}

// ─── Component ───────────────────────────────────────────────────────────────

export function FilterChipGroup() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const activeFilters = useUIState((s) => s.dashboardStatusFilters);
  const setFilters = useUIState((s) => s.setDashboardStatusFilters);
  const toggleFilter = useUIState((s) => s.toggleDashboardStatusFilter);

  // ── Hydrate store from URL on first render ──────────────────────────────
  useEffect(() => {
    const fromUrl = parseUrlStatuses(searchParams.get(URL_PARAM));
    // Only update if they differ to avoid a spurious re-render cycle
    const current = activeFilters.slice().sort().join(",");
    const incoming = fromUrl.slice().sort().join(",");
    if (current !== incoming) {
      setFilters(fromUrl);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // intentionally run once on mount

  // ── Keep URL in sync whenever the store selection changes ───────────────
  const pushUrl = useCallback(
    (next: DashboardStatusFilter[]) => {
      const params = new URLSearchParams(searchParams.toString());
      if (next.length === 0) {
        params.delete(URL_PARAM);
      } else {
        params.set(URL_PARAM, encodeUrlStatuses(next));
      }
      const qs = params.toString();
      router.replace(`${pathname}${qs ? `?${qs}` : ""}`, { scroll: false });
    },
    [router, pathname, searchParams]
  );

  // ── Toggle handler ──────────────────────────────────────────────────────
  const handleToggle = useCallback(
    (status: DashboardStatusFilter) => {
      const next = activeFilters.includes(status)
        ? activeFilters.filter((s) => s !== status)
        : [...activeFilters, status];
      toggleFilter(status);
      pushUrl(next);
    },
    [activeFilters, toggleFilter, pushUrl]
  );

  // ── Clear all ───────────────────────────────────────────────────────────
  const handleClearAll = useCallback(() => {
    setFilters([]);
    pushUrl([]);
  }, [setFilters, pushUrl]);

  const hasActiveFilters = activeFilters.length > 0;

  return (
    <div
      role="group"
      aria-label="Filter by notification status"
      className="flex flex-wrap items-center gap-1.5"
    >
      <span className="flex items-center gap-1 text-xs text-muted-foreground">
        <ListFilter className="size-3.5" />
        Status
      </span>

      {STATUS_FILTERS.map(({ value, label, icon: Icon, accentClass }) => {
        const isActive = activeFilters.includes(value);
        return (
          <FilterChip
            key={value}
            active={isActive}
            accentClass={accentClass}
            onClick={() => handleToggle(value)}
            aria-label={`${isActive ? "Remove" : "Add"} ${label} filter`}
          >
            <Icon className="size-3" />
            {label}
          </FilterChip>
        );
      })}

      {hasActiveFilters && (
        <button
          type="button"
          onClick={handleClearAll}
          className="ml-1 text-xs text-muted-foreground underline-offset-2 hover:text-foreground hover:underline"
          aria-label="Clear all status filters"
        >
          Clear
        </button>
      )}
    </div>
  );
}
