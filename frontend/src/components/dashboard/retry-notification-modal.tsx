"use client";

import { useState } from "react";
import { AlertTriangle, Loader2, RefreshCw } from "lucide-react";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/src/components/ui/dialog";
import { Button } from "@/src/components/ui/button";
import { useData } from "@/src/store";
import { chainColors, timeAgo, type ChainEvent } from "@/src/lib/mock-data";

interface RetryNotificationModalProps {
  event: ChainEvent | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

// Simulated network latency for the retry request against the off-chain helper.
const RETRY_LATENCY_MS = 1400;

export function RetryNotificationModal({
  event,
  open,
  onOpenChange,
}: RetryNotificationModalProps) {
  const retryNotification = useData((state) => state.retryNotification);
  const [isRetrying, setIsRetrying] = useState(false);

  async function handleRetry() {
    if (!event) return;
    setIsRetrying(true);
    try {
      // Stand-in for re-dispatching the notification through the helper API.
      await new Promise((resolve) => setTimeout(resolve, RETRY_LATENCY_MS));
      // Refresh the notification status so the feed reflects the result.
      retryNotification(event.id);
      onOpenChange(false);
    } finally {
      setIsRetrying(false);
    }
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        // Don't allow dismissing the modal while a retry is in flight.
        if (isRetrying) return;
        onOpenChange(next);
      }}
    >
      <DialogContent showCloseButton={!isRetrying}>
        <DialogHeader>
          <DialogTitle>Retry notification</DialogTitle>
          <DialogDescription>
            Re-dispatch the failed notification for this event through its
            configured channels.
          </DialogDescription>
        </DialogHeader>

        {event ? (
          <div className="space-y-4">
            {/* Event summary */}
            <div className="rounded-lg border border-border bg-secondary/30 p-3">
              <div className="flex items-center gap-2">
                <span
                  className="size-2 shrink-0 rounded-full"
                  style={{ backgroundColor: chainColors[event.chain] }}
                  title={event.chain}
                />
                <p className="truncate font-mono text-sm">
                  <span className="text-primary">{event.eventName}</span>
                  <span className="text-muted-foreground">
                    {" "}
                    · {event.contract}
                  </span>
                </p>
              </div>
              <p className="mt-1 pl-4 text-xs text-muted-foreground">
                {event.chain} · block {event.blockNumber.toLocaleString()} ·{" "}
                {timeAgo(event.timestamp)}
              </p>
              {event.matchedRule ? (
                <p className="mt-1 pl-4 text-xs text-muted-foreground">
                  Rule: <span className="text-foreground">{event.matchedRule}</span>
                </p>
              ) : null}
            </div>

            {/* Failure reason */}
            <div className="flex gap-2.5 rounded-lg border border-destructive/20 bg-destructive/10 p-3 text-sm text-destructive">
              <AlertTriangle className="mt-0.5 size-4 shrink-0" />
              <div>
                <p className="font-medium">Delivery failed</p>
                <p className="mt-0.5 text-destructive/90">
                  {event.failureReason ??
                    "The notification could not be delivered."}
                </p>
              </div>
            </div>
          </div>
        ) : null}

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isRetrying}
          >
            Cancel
          </Button>
          <Button onClick={handleRetry} disabled={isRetrying || !event}>
            {isRetrying ? (
              <>
                <Loader2 className="animate-spin" />
                Retrying…
              </>
            ) : (
              <>
                <RefreshCw />
                Retry
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
