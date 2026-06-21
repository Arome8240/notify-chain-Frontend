"use client";

import { useState } from "react";
import { Plus, Copy, Check, Trash2, X } from "lucide-react";
import { Topbar } from "@/src/components/dashboard/topbar";
import Link from "next/link";
import { StatusBadge } from "@/src/components/dashboard/status-badge";
import { Button } from "@/src/components/ui/button";
import { Input } from "@/src/components/ui/input";
import { useData } from "@/src/store";
import { ExportMenu } from "@/src/components/export-menu";
import {
  chainColors,
  timeAgo,
  CHAINS,
  type WatchedContract,
  type Chain,
} from "@/src/lib/mock-data";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/src/components/ui/dialog";
import { chainColors, timeAgo } from "@/src/lib/mock-data";
import { useKeyboardList } from "@/src/lib/use-keyboard-list";

function shorten(addr: string) {
  return `${addr.slice(0, 6)}…${addr.slice(-4)}`;
}

export default function WatchlistPage() {
  const items = useData((state) => state.watchlist);
  const toggleWatchlistItem = useData((state) => state.toggleWatchlistItem);
  const removeWatchlistItem = useData((state) => state.removeWatchlistItem);
  const addWatchlistItem = useData((state) => state.addWatchlistItem);
  const [copied, setCopied] = useState<string | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    address: "",
    chain: "Ethereum" as Chain,
    type: "Custom" as WatchedContract["type"],
    events: "",
  });
  const { listRef: watchlistRef, getRowProps: getWatchlistRowProps } =
    useKeyboardList(items.length);

  function copy(addr: string) {
    navigator.clipboard?.writeText(addr);
    setCopied(addr);
    setTimeout(() => setCopied(null), 1500);
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    
    const newContract: WatchedContract = {
      id: `wc_${Date.now()}`,
      name: formData.name,
      address: formData.address,
      chain: formData.chain,
      type: formData.type,
      events: formData.events.split(",").map((e: string) => e.trim()).filter((e: string) => e.length > 0),
      eventsToday: 0,
      addedAt: new Date().toISOString(),
      active: true,
    };

    addWatchlistItem(newContract);
    setIsDialogOpen(false);
    setFormData({
      name: "",
      address: "",
      chain: "Ethereum",
      type: "Custom",
      events: "",
    });
  }

  const activeCount = items.filter((i) => i.active).length;

  return (
    <>
      <Topbar
        title="Watchlist"
        description="Contracts and addresses Notify-Chain is indexing"
      />

      <div className="flex-1 space-y-6 p-4 md:p-6">
        <div className="flex items-center justify-between gap-4">
          <p className="text-sm text-muted-foreground">
            <span className="text-foreground">{activeCount}</span> active ·{" "}
            {items.length} total
          </p>
          <div className="flex items-center gap-2">
            <ExportMenu dataType="watchlist" />
            <Button onClick={() => setIsDialogOpen(true)}>
              <Plus className="size-4" />
              Add contract
            </Button>
          </div>
        </div>

        <div className="overflow-hidden rounded-xl border border-border bg-card">
          <div className="hidden grid-cols-[1.6fr_1fr_1.4fr_0.7fr_0.6fr] gap-4 border-b border-border px-5 py-2.5 text-xs font-medium uppercase tracking-wider text-muted-foreground lg:grid">
            <span>Contract</span>
            <span>Type</span>
            <span>Tracked events</span>
            <span className="text-right">Events today</span>
            <span className="text-right">Actions</span>
          </div>

          <ul
              className="divide-y divide-border"
              ref={watchlistRef as React.RefObject<HTMLUListElement>}
              role="listbox"
              aria-label="Watched contracts"
            >
            {items.map((c, index) => (
              <li
                key={c.id}
                {...getWatchlistRowProps(index)}
                className="grid grid-cols-1 gap-3 px-5 py-4 transition-colors hover:bg-secondary/30 focus:bg-secondary/30 focus:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring lg:grid-cols-[1.6fr_1fr_1.4fr_0.7fr_0.6fr] lg:items-center lg:gap-4"
                aria-label={`${c.name} on ${c.chain}, ${c.active ? "active" : "paused"}`}
              >
                <div className="flex items-center gap-3">
                  <span
                    className="size-2.5 shrink-0 rounded-full"
                    style={{ backgroundColor: chainColors[c.chain] }}
                    title={c.chain}
                  />
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <Link href={`/contracts/${c.id}`} className="truncate font-medium hover:underline">
                        {c.name}
                      </Link>
                      <StatusBadge
                        tone={c.active ? "success" : "muted"}
                        label={c.active ? "active" : "paused"}
                      />
                    </div>
                    <button
                      onClick={() => copy(c.address)}
                      className="mt-0.5 flex items-center gap-1.5 font-mono text-xs text-muted-foreground transition-colors hover:text-foreground"
                    >
                      {shorten(c.address)}
                      {copied === c.address ? (
                        <Check className="size-3 text-primary" />
                      ) : (
                        <Copy className="size-3" />
                      )}
                    </button>
                  </div>
                </div>

                <div className="text-sm text-muted-foreground">{c.type}</div>

                <div className="flex flex-wrap gap-1.5">
                  {c.events.map((ev) => (
                    <span
                      key={ev}
                      className="rounded-md border border-border bg-background px-1.5 py-0.5 font-mono text-xs text-muted-foreground"
                    >
                      {ev}
                    </span>
                  ))}
                </div>

                <div className="text-sm lg:text-right">
                  <span className="font-medium">
                    {c.eventsToday.toLocaleString()}
                  </span>
                  <span className="ml-1 text-xs text-muted-foreground lg:hidden">
                    events today
                  </span>
                  <p className="text-xs text-muted-foreground">
                    added {timeAgo(c.addedAt)}
                  </p>
                </div>

                <div className="flex items-center gap-2 lg:justify-end">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => toggleWatchlistItem(c.id)}
                  >
                    {c.active ? "Pause" : "Resume"}
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    onClick={() => removeWatchlistItem(c.id)}
                    aria-label="Remove contract"
                    className="text-muted-foreground hover:text-destructive"
                  >
                    <Trash2 className="size-4" />
                  </Button>
                </div>
              </li>
            ))}
          </ul>

          {items.length === 0 ? (
            <div className="px-5 py-16 text-center text-sm text-muted-foreground">
              No contracts in your watchlist yet.
            </div>
          ) : null}
        </div>
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent onClose={() => setIsDialogOpen(false)}>
          <DialogHeader>
            <DialogTitle>Add Contract to Watchlist</DialogTitle>
            <DialogDescription>
              Enter the contract details to start tracking events.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="name" className="text-sm font-medium">
                Contract Name
              </label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g., USDC"
                required
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="address" className="text-sm font-medium">
                Contract Address
              </label>
              <Input
                id="address"
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                placeholder="0x..."
                required
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="chain" className="text-sm font-medium">
                Chain
              </label>
              <select
                id="chain"
                value={formData.chain}
                onChange={(e) => setFormData({ ...formData, chain: e.target.value as Chain })}
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                required
              >
                {CHAINS.map((chain) => (
                  <option key={chain} value={chain}>
                    {chain}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <label htmlFor="type" className="text-sm font-medium">
                Contract Type
              </label>
              <select
                id="type"
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value as WatchedContract["type"] })}
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                required
              >
                <option value="ERC-20">ERC-20</option>
                <option value="ERC-721">ERC-721</option>
                <option value="DeFi">DeFi</option>
                <option value="Governance">Governance</option>
                <option value="Custom">Custom</option>
              </select>
            </div>
            <div className="space-y-2">
              <label htmlFor="events" className="text-sm font-medium">
                Events (comma-separated)
              </label>
              <Input
                id="events"
                value={formData.events}
                onChange={(e) => setFormData({ ...formData, events: e.target.value })}
                placeholder="e.g., Transfer, Approval"
              />
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button type="submit">Add Contract</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}
