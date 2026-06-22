"use client";

import { useTheme } from "next-themes";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/src/components/ui/select";
import {
  TooltipContent,
  TooltipProvider,
  TooltipRoot,
  TooltipTrigger,
} from "@/src/components/ui/tooltip";
import { Skeleton } from "@/src/components/ui/skeleton";
import { HEATMAP_RANGES, type HeatmapCell, type HeatmapDay } from "@/src/lib/mock-data";
import { useDeliveryHeatmap } from "@/src/lib/use-delivery-heatmap";

// Hour labels are spaced out so the axis stays readable when 24 columns share a
// narrow grid; every cell still exists, only these hours are annotated.
const HOUR_TICKS = [0, 3, 6, 9, 12, 15, 18, 21];

// Layout: a fixed day-label column followed by 24 equal hour columns.
const GRID_COLUMNS = "3.25rem repeat(24, minmax(0, 1fr))";

/**
 * Heatmap-only colours. Recharts-style: the grid is painted with inline styles
 * (per-cell alpha can't come from a Tailwind token), so these mirror the
 * primary/secondary tokens in globals.css — keep in sync if the palette changes.
 */
const HEATMAP_COLORS = {
  dark: { primary: "43, 217, 124", empty: "#1a1c1f" },
  light: { primary: "10, 125, 77", empty: "#eef0f2" },
} as const;

// Five intensity buckets: 0 = no activity, 4 = busiest. Alpha rises with volume.
const LEVEL_ALPHA = [0, 0.24, 0.46, 0.7, 0.95];

function levelFor(count: number, max: number): number {
  if (count <= 0 || max <= 0) return 0;
  const ratio = count / max;
  if (ratio <= 0.25) return 1;
  if (ratio <= 0.5) return 2;
  if (ratio <= 0.75) return 3;
  return 4;
}

function pad(n: number): string {
  return n.toString().padStart(2, "0");
}

export function DeliveryHeatmap() {
  const { range, setRange, days, max, isLoading } = useDeliveryHeatmap();
  const { resolvedTheme } = useTheme();
  const colors =
    resolvedTheme === "light" ? HEATMAP_COLORS.light : HEATMAP_COLORS.dark;

  const cellColor = (level: number) =>
    level === 0 ? colors.empty : `rgba(${colors.primary}, ${LEVEL_ALPHA[level]})`;

  return (
    <section className="rounded-xl border border-border bg-card">
      <div className="flex flex-col gap-3 border-b border-border px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-sm font-medium">Activity heatmap</h2>
          <p className="text-xs text-muted-foreground">
            Deliveries grouped by hour of day
          </p>
        </div>
        <Select value={range} onValueChange={setRange}>
          <SelectTrigger size="sm" className="w-36" aria-label="Heatmap date range">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {HEATMAP_RANGES.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="p-5">
        <div className="overflow-x-auto">
          <div className="min-w-[680px]">
            {isLoading ? (
              <HeatmapSkeleton />
            ) : (
              <HeatmapGrid days={days} max={max} cellColor={cellColor} />
            )}
          </div>
        </div>

        <Legend cellColor={cellColor} />
      </div>
    </section>
  );
}

function HeatmapGrid({
  days,
  max,
  cellColor,
}: {
  days: HeatmapDay[];
  max: number;
  cellColor: (level: number) => string;
}) {
  return (
    <TooltipProvider delayDuration={120}>
      {/* Hour axis */}
      <div
        className="grid items-center pb-1"
        style={{ gridTemplateColumns: GRID_COLUMNS }}
      >
        <span />
        {Array.from({ length: 24 }, (_, hour) => (
          <span
            key={hour}
            className="text-center text-[10px] tabular-nums text-muted-foreground"
          >
            {HOUR_TICKS.includes(hour) ? hour : ""}
          </span>
        ))}
      </div>

      {/* One row per day */}
      {days.map((day) => (
        <div
          key={day.date}
          className="grid items-center"
          style={{ gridTemplateColumns: GRID_COLUMNS }}
        >
          <span
            className="truncate pr-2 text-right text-[11px] text-muted-foreground"
            title={`${day.weekday}, ${day.label} · ${day.total.toLocaleString()} deliveries`}
          >
            {day.label}
          </span>
          {day.cells.map((cell) => (
            <HeatmapTile
              key={cell.hour}
              cell={cell}
              day={day}
              color={cellColor(levelFor(cell.count, max))}
            />
          ))}
        </div>
      ))}
    </TooltipProvider>
  );
}

function HeatmapTile({
  cell,
  day,
  color,
}: {
  cell: HeatmapCell;
  day: HeatmapDay;
  color: string;
}) {
  const hourRange = `${pad(cell.hour)}:00–${pad((cell.hour + 1) % 24)}:00`;
  const deliveries = `${cell.count.toLocaleString()} ${
    cell.count === 1 ? "delivery" : "deliveries"
  }`;

  return (
    <TooltipRoot>
      <TooltipTrigger asChild>
        <button
          type="button"
          aria-label={`${deliveries} · ${day.weekday}, ${day.label} ${hourRange}`}
          className="m-[1.5px] aspect-square rounded-[3px] outline-none ring-offset-1 ring-offset-card transition-[box-shadow] focus-visible:ring-2 focus-visible:ring-ring"
          style={{ backgroundColor: color }}
        />
      </TooltipTrigger>
      <TooltipContent>
        <p className="font-medium">{deliveries}</p>
        <p className="text-muted-foreground">
          {day.weekday}, {day.label} · {hourRange}
        </p>
      </TooltipContent>
    </TooltipRoot>
  );
}

function Legend({ cellColor }: { cellColor: (level: number) => string }) {
  return (
    <div className="mt-4 flex items-center justify-end gap-2 text-[11px] text-muted-foreground">
      <span>Less</span>
      <div className="flex items-center gap-1">
        {LEVEL_ALPHA.map((_, level) => (
          <span
            key={level}
            className="size-3 rounded-[3px]"
            style={{ backgroundColor: cellColor(level) }}
          />
        ))}
      </div>
      <span>More</span>
    </div>
  );
}

function HeatmapSkeleton() {
  return (
    <div className="space-y-1">
      {Array.from({ length: HEATMAP_RANGES[0].days }, (_, row) => (
        <div
          key={row}
          className="grid items-center"
          style={{ gridTemplateColumns: GRID_COLUMNS }}
        >
          <Skeleton className="mr-2 h-3 w-10" />
          {Array.from({ length: 24 }, (_, col) => (
            <Skeleton key={col} className="m-[1.5px] aspect-square rounded-[3px]" />
          ))}
        </div>
      ))}
    </div>
  );
}
