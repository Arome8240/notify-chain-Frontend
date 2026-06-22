"use client";

import { useEffect, useMemo, useState } from "react";
import {
  generateDeliveries,
  groupDeliveriesByHour,
  HEATMAP_RANGES,
  type HeatmapDay,
} from "@/src/lib/mock-data";

export interface UseDeliveryHeatmap {
  range: string;
  setRange: (range: string) => void;
  days: HeatmapDay[];
  /** Largest single-hour count in the current window; drives colour scaling. */
  max: number;
  isLoading: boolean;
}

/**
 * Builds the notification activity heatmap from generated delivery records.
 *
 * The full record set is generated once against a mount-time anchor and reused
 * across range changes, so switching windows only re-groups (cheap) instead of
 * re-generating. Data is empty until mounted to avoid an SSR/client hydration
 * mismatch — the timestamps depend on the current time, which differs per render
 * environment — letting the component show a skeleton in the meantime.
 */
export function useDeliveryHeatmap(
  initialRange: string = HEATMAP_RANGES[0].value
): UseDeliveryHeatmap {
  const [range, setRange] = useState(initialRange);
  const [anchor, setAnchor] = useState<number | null>(null);

  // Anchor to the current time only after mount. Deferring through a timer keeps
  // the first client render identical to the server's (both show the skeleton),
  // avoiding a hydration mismatch from time-dependent timestamps.
  useEffect(() => {
    const timer = setTimeout(() => setAnchor(Date.now()), 0);
    return () => clearTimeout(timer);
  }, []);

  const records = useMemo(
    () => (anchor === null ? [] : generateDeliveries(new Date(anchor))),
    [anchor]
  );

  const rangeDays = useMemo(
    () => HEATMAP_RANGES.find((r) => r.value === range)?.days ?? HEATMAP_RANGES[0].days,
    [range]
  );

  const days = useMemo(
    () =>
      anchor === null
        ? []
        : groupDeliveriesByHour(records, rangeDays, new Date(anchor)),
    [anchor, records, rangeDays]
  );

  const max = useMemo(
    () =>
      days.reduce(
        (peak, day) =>
          day.cells.reduce((m, cell) => Math.max(m, cell.count), peak),
        0
      ),
    [days]
  );

  return { range, setRange, days, max, isLoading: anchor === null };
}
