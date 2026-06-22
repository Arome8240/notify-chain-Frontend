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
import { eventVolume } from "@/src/lib/mock-data";

/**
 * Recharts renders to SVG and is styled through JS props, so it can't consume
 * Tailwind/CSS-variable tokens directly. These maps mirror the color tokens in
 * globals.css for each theme — keep them in sync if the palette changes.
 */
const CHART_COLORS = {
  dark: {
    primary: "#2bd97c",
    muted: "#8a8f98",
    border: "#212328",
    popover: "#131416",
    foreground: "#ededf0",
  },
  light: {
    primary: "#0a7d4d",
    muted: "#5b626e",
    border: "#dfe1e6",
    popover: "#ffffff",
    foreground: "#0c0e12",
  },
} as const;

export function EventVolumeChart() {
  const { resolvedTheme } = useTheme();
  // Until the theme resolves, fall back to the dark palette. The chart only
  // paints client-side (ResponsiveContainer needs measured dimensions), so
  // there is no SSR output to mismatch during hydration.
  const colors =
    resolvedTheme === "light" ? CHART_COLORS.light : CHART_COLORS.dark;

  return (
    <ResponsiveContainer width="100%" height={240}>
      <AreaChart
        data={eventVolume}
        margin={{ top: 8, right: 8, left: -16, bottom: 0 }}
      >
        <defs>
          <linearGradient id="eventsFill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={colors.primary} stopOpacity={0.35} />
            <stop offset="100%" stopColor={colors.primary} stopOpacity={0} />
          </linearGradient>
          <linearGradient id="matchedFill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={colors.muted} stopOpacity={0.25} />
            <stop offset="100%" stopColor={colors.muted} stopOpacity={0} />
          </linearGradient>
        </defs>
        <XAxis
          dataKey="hour"
          stroke={colors.muted}
          fontSize={11}
          tickLine={false}
          axisLine={false}
          interval={1}
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
          dataKey="events"
          stroke={colors.primary}
          strokeWidth={2}
          fill="url(#eventsFill)"
          name="Events"
        />
        <Area
          type="monotone"
          dataKey="matched"
          stroke={colors.muted}
          strokeWidth={1.5}
          fill="url(#matchedFill)"
          name="Matched"
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}
