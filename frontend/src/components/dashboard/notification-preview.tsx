"use client";

import { Bell } from "lucide-react";
import { ChannelIcon } from "@/src/components/dashboard/channel-icon";
import type { ChannelType } from "@/src/lib/mock-data";

export interface PreviewPayload {
  title: string;
  message: string;
  channels: ChannelType[];
  recipientCount: number;
  contractFilter: string;
  chain: string;
}

export function NotificationPreview({ payload }: { payload: PreviewPayload }) {
  const isEmpty = !payload.title && !payload.message;

  return (
    <div className="rounded-xl border border-border bg-card p-5 space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-medium">Preview</h2>
        <span className="rounded-full bg-secondary px-2.5 py-0.5 text-xs text-muted-foreground">
          {payload.recipientCount} recipient{payload.recipientCount !== 1 ? "s" : ""}
        </span>
      </div>

      {isEmpty ? (
        <div className="flex flex-col items-center justify-center gap-2 rounded-lg border border-dashed border-border py-10 text-muted-foreground">
          <Bell className="size-7 opacity-40" />
          <p className="text-xs">Fill in the form to preview the notification</p>
        </div>
      ) : (
        <div className="space-y-3">
          {/* Simulated notification card */}
          <div className="rounded-lg border border-border bg-background p-4 space-y-1.5">
            <p className="text-sm font-semibold leading-snug">
              {payload.title || <span className="text-muted-foreground italic">Untitled</span>}
            </p>
            <p className="text-xs text-muted-foreground whitespace-pre-wrap break-words">
              {payload.message || <span className="italic">No message</span>}
            </p>
            {(payload.chain || payload.contractFilter) && (
              <div className="flex flex-wrap gap-1.5 pt-1">
                {payload.chain && (
                  <span className="rounded bg-secondary px-2 py-0.5 text-[11px] text-muted-foreground">
                    {payload.chain}
                  </span>
                )}
                {payload.contractFilter && (
                  <span className="rounded bg-secondary px-2 py-0.5 font-mono text-[11px] text-muted-foreground">
                    {payload.contractFilter}
                  </span>
                )}
              </div>
            )}
          </div>

          {/* Delivery channels */}
          {payload.channels.length > 0 && (
            <div>
              <p className="mb-2 text-xs text-muted-foreground">Delivered via</p>
              <div className="flex flex-wrap gap-2">
                {payload.channels.map((ch) => (
                  <span
                    key={ch}
                    className="flex items-center gap-1.5 rounded-md border border-border bg-background px-2 py-1 text-xs capitalize"
                  >
                    <ChannelIcon type={ch} className="size-3.5" />
                    {ch}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Raw JSON payload */}
          <details className="group">
            <summary className="cursor-pointer list-none text-xs text-muted-foreground hover:text-foreground transition-colors">
              <span className="group-open:hidden">Show payload ▸</span>
              <span className="hidden group-open:inline">Hide payload ▾</span>
            </summary>
            <pre className="mt-2 overflow-x-auto rounded-md bg-secondary/50 p-3 font-mono text-[11px] leading-relaxed text-muted-foreground">
              {JSON.stringify(
                {
                  title: payload.title,
                  message: payload.message,
                  channels: payload.channels,
                  filters: {
                    chain: payload.chain || null,
                    contract: payload.contractFilter || null,
                  },
                  recipientCount: payload.recipientCount,
                },
                null,
                2
              )}
            </pre>
          </details>
        </div>
      )}
    </div>
  );
}
