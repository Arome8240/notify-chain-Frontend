"use client";

import { useCallback, useEffect, useState } from "react";
import {
  deliveryTrends,
  type TrendInterval,
  type TrendPoint,
} from "@/src/lib/mock-data";

const LOAD_DELAY_MS = 500;

// Small ±3 % jitter so switching intervals produces visibly fresh numbers,
// standing in for a real API re-fetch.
function jitter(points: TrendPoint[]): TrendPoint[] {
  const drift = (n: number) =>
    Math.max(0, Math.round(n * (1 + (Math.random() - 0.5) * 0.06)));
  return points.map((p) => ({
    ...p,
    delivered: drift(p.delivered),
    failed: drift(p.failed),
  }));
}

export interface UseDeliveryTrends {
  data: TrendPoint[];
  isLoading: boolean;
  interval: TrendInterval;
  setInterval: (interval: TrendInterval) => void;
}

/**
 * Returns delivery trend data for a given time interval.
 * Exposes a `setInterval` callback — switching intervals triggers a simulated
 * async reload (skeleton state) to mirror real API behaviour.
 */
export function useDeliveryTrends(
  defaultInterval: TrendInterval = "24h"
): UseDeliveryTrends {
  const [interval, setIntervalState] = useState<TrendInterval>(defaultInterval);
  const [data, setData] = useState<TrendPoint[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let active = true;
    setIsLoading(true);

    const timer = setTimeout(() => {
      if (!active) return;
      setData(jitter(deliveryTrends[interval]));
      setIsLoading(false);
    }, LOAD_DELAY_MS);

    return () => {
      active = false;
      clearTimeout(timer);
    };
  }, [interval]);

  const setInterval = useCallback((next: TrendInterval) => {
    setIntervalState(next);
  }, []);

  return { data, isLoading, interval, setInterval };
}
