"use client";

import { useCallback, useEffect, useState } from "react";
import { channelMetrics, type ChannelMetric } from "@/src/lib/mock-data";

const LOAD_DELAY_MS = 650;

// Apply a small ±2% jitter so a refresh produces visibly fresh numbers,
// standing in for a re-fetch from the off-chain helper API.
function jitter(metrics: ChannelMetric[]): ChannelMetric[] {
  return metrics.map((m) => {
    const drift = (n: number) => Math.max(0, Math.round(n * (1 + (Math.random() - 0.5) * 0.04)));
    return { ...m, successful: drift(m.successful), failed: drift(m.failed) };
  });
}

export interface UseChannelMetrics {
  metrics: ChannelMetric[];
  isLoading: boolean;
  refresh: () => void;
}

/**
 * Loads notification delivery metrics per channel. Exposes a loading flag so
 * cards can show placeholders, and a `refresh` callback that re-fetches.
 */
export function useChannelMetrics(): UseChannelMetrics {
  const [metrics, setMetrics] = useState<ChannelMetric[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [reloadKey, setReloadKey] = useState(0);

  // Re-runs on mount and whenever `refresh` bumps reloadKey. State is only set
  // from the deferred timer, never synchronously, to avoid cascading renders.
  useEffect(() => {
    let active = true;
    const timer = setTimeout(() => {
      if (!active) return;
      setMetrics(jitter(channelMetrics));
      setIsLoading(false);
    }, LOAD_DELAY_MS);
    return () => {
      active = false;
      clearTimeout(timer);
    };
  }, [reloadKey]);

  const refresh = useCallback(() => {
    setIsLoading(true);
    setReloadKey((k) => k + 1);
  }, []);

  return { metrics, isLoading, refresh };
}
