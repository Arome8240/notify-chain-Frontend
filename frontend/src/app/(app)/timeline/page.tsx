"use client";

import { Activity } from "lucide-react";
import { Topbar } from "@/src/components/dashboard/topbar";
import { NotificationTimeline } from "@/src/components/dashboard/notification-timeline";
import { deliveryTimelines } from "@/src/lib/mock-data";

const statusOrder = { failed: 0, processing: 1, completed: 2, pending: 3 };

function overallStatus(delivery: (typeof deliveryTimelines)[number]) {
  const last = delivery.stages[delivery.stages.length - 1];
  if (last.status !== "pending") return last.status;
  return delivery.stages.find((s) => s.status === "processing")?.status ?? "pending";
}

export default function TimelinePage() {
  const sorted = [...deliveryTimelines].sort(
    (a, b) => statusOrder[overallStatus(a)] - statusOrder[overallStatus(b)]
  );

  const counts = {
    delivered: deliveryTimelines.filter((d) => overallStatus(d) === "completed").length,
    processing: deliveryTimelines.filter((d) => overallStatus(d) === "processing").length,
    failed: deliveryTimelines.filter((d) => overallStatus(d) === "failed").length,
  };

  return (
    <>
      <Topbar
        title="Delivery timeline"
        description="Lifecycle of each notification from creation to delivery"
      />

      <div className="flex-1 space-y-6 p-4 md:p-6">
        {/* Summary strip */}
        <div className="grid grid-cols-3 gap-4">
          <Stat label="Delivered" value={counts.delivered} tone="primary" />
          <Stat label="Processing" value={counts.processing} tone="warning" />
          <Stat label="Failed" value={counts.failed} tone="destructive" />
        </div>

        {deliveryTimelines.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-3 rounded-xl border border-border bg-card py-16 text-muted-foreground">
            <Activity className="size-8 opacity-40" />
            <p className="text-sm">No delivery records yet.</p>
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {sorted.map((d) => (
              <NotificationTimeline key={d.id} delivery={d} />
            ))}
          </div>
        )}
      </div>
    </>
  );
}

function Stat({
  label,
  value,
  tone,
}: {
  label: string;
  value: number;
  tone: "primary" | "warning" | "destructive";
}) {
  const colors = {
    primary: "text-primary",
    warning: "text-warning",
    destructive: "text-destructive",
  };
  return (
    <div className="rounded-xl border border-border bg-card p-4">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className={`mt-1 text-2xl font-semibold tracking-tight ${colors[tone]}`}>
        {value}
      </p>
    </div>
  );
}
