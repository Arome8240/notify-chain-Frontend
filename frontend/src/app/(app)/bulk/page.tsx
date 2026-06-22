"use client";

import { useState, useMemo } from "react";
import { Megaphone, Users, ArrowLeft, Send, Check } from "lucide-react";
import { Topbar } from "@/src/components/dashboard/topbar";
import {
  NotificationPreview,
  type PreviewPayload,
} from "@/src/components/dashboard/notification-preview";
import { ChannelIcon } from "@/src/components/dashboard/channel-icon";
import { Button } from "@/src/components/ui/button";
import { Input } from "@/src/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/src/components/ui/select";
import { useData } from "@/src/store";
import { CHAINS, type ChannelType } from "@/src/lib/mock-data";

const CHANNEL_TYPES: ChannelType[] = ["webhook", "email", "telegram", "discord"];

interface FormErrors {
  title?: string;
  message?: string;
  channels?: string;
  recipients?: string;
}

function validate(
  title: string,
  message: string,
  channels: ChannelType[],
  recipientCount: number
): FormErrors {
  const errs: FormErrors = {};
  if (!title.trim()) errs.title = "Title is required.";
  if (!message.trim()) errs.message = "Message is required.";
  if (channels.length === 0) errs.channels = "Select at least one channel.";
  if (recipientCount === 0) errs.recipients = "No recipients match the current filters.";
  return errs;
}

export default function BulkPage() {
  const watchlist = useData((s) => s.watchlist);

  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [chainFilter, setChainFilter] = useState<string>("all");
  const [contractFilter, setContractFilter] = useState<string>("all");
  const [selectedChannels, setSelectedChannels] = useState<ChannelType[]>([]);
  const [errors, setErrors] = useState<FormErrors>({});
  const [submitted, setSubmitted] = useState(false);
  const [isReviewing, setIsReviewing] = useState(false);

  // Derive recipient count from watchlist filtered by chain / contract
  const recipientCount = useMemo(() => {
    let items = watchlist.filter((w) => w.active);
    if (chainFilter !== "all") items = items.filter((w) => w.chain === chainFilter);
    if (contractFilter !== "all") items = items.filter((w) => w.id === contractFilter);
    // Use eventsToday as a proxy for subscriber-like engagement count
    return items.reduce((sum, w) => sum + Math.max(1, Math.ceil(w.eventsToday / 100)), 0);
  }, [watchlist, chainFilter, contractFilter]);

  // Available contracts depend on chain filter
  const filteredContracts = useMemo(
    () =>
      chainFilter === "all"
        ? watchlist
        : watchlist.filter((w) => w.chain === chainFilter),
    [watchlist, chainFilter]
  );

  function toggleChannel(type: ChannelType) {
    setSelectedChannels((prev) =>
      prev.includes(type) ? prev.filter((c) => c !== type) : [...prev, type]
    );
    if (errors.channels) setErrors((e) => ({ ...e, channels: undefined }));
  }

  const payload: PreviewPayload = {
    title,
    message,
    channels: selectedChannels,
    recipientCount,
    contractFilter: contractFilter === "all" ? "" : (watchlist.find((w) => w.id === contractFilter)?.name ?? ""),
    chain: chainFilter === "all" ? "" : chainFilter,
  };

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const errs = validate(title, message, selectedChannels, recipientCount);
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }
    setErrors({});
    setIsReviewing(true);
  }

  const topbarDescription = useMemo(() => {
    if (submitted) return "Campaign sent";
    if (isReviewing) return "Review and confirm your campaign details";
    return "Compose and send a campaign to multiple recipients";
  }, [submitted, isReviewing]);

  const renderStepper = () => {
    const stepItem = (stepNum: number, label: string, isActive: boolean, isCompleted: boolean) => (
      <div className={`flex items-center gap-2 ${isActive ? "text-primary font-semibold" : "text-muted-foreground"}`}>
        <span className={`flex size-6 items-center justify-center rounded-full text-xs font-semibold transition-all duration-200 ${
          isCompleted 
            ? "bg-primary text-primary-foreground" 
            : isActive 
              ? "bg-primary/20 text-primary border border-primary/50" 
              : "bg-muted text-muted-foreground border border-border"
        }`}>
          {isCompleted ? <Check className="size-3.5 stroke-[3]" /> : stepNum}
        </span>
        <span className="text-sm font-medium">{label}</span>
      </div>
    );

    return (
      <div className="mb-6 flex items-center justify-start gap-4 text-xs font-medium border-b border-border pb-4">
        {stepItem(1, "Compose", !isReviewing && !submitted, isReviewing || submitted)}
        <div className="h-px w-8 bg-border" />
        {stepItem(2, "Review", isReviewing && !submitted, submitted)}
        <div className="h-px w-8 bg-border" />
        {stepItem(3, "Send", submitted, false)}
      </div>
    );
  };

  if (submitted) {
    return (
      <>
        <Topbar title="Bulk notifications" description={topbarDescription} />
        <div className="flex-1 p-4 md:p-6 max-w-3xl mx-auto w-full">
          {renderStepper()}
          <div className="flex flex-col items-center justify-center gap-4 py-12 text-center bg-card rounded-xl border border-border px-6 mt-4">
            <span className="flex size-14 items-center justify-center rounded-full bg-primary/10 text-primary">
              <Megaphone className="size-7" />
            </span>
            <div>
              <p className="text-lg font-semibold">Campaign dispatched!</p>
              <p className="mt-1 text-sm text-muted-foreground max-w-md mx-auto">
                &ldquo;{title}&rdquo; was sent to {recipientCount} recipient{recipientCount !== 1 ? "s" : ""} via{" "}
                {selectedChannels.join(", ")}.
              </p>
            </div>
            <Button variant="outline" onClick={() => { setSubmitted(false); setIsReviewing(false); setTitle(""); setMessage(""); setSelectedChannels([]); setChainFilter("all"); setContractFilter("all"); }}>
              Send another
            </Button>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Topbar
        title="Bulk notifications"
        description={topbarDescription}
      />

      <div className="flex-1 p-4 md:p-6">
        {renderStepper()}
        <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
          {isReviewing ? (
            <div className="space-y-6">
              {/* Campaign Overview Card */}
              <section className="rounded-xl border border-border bg-card p-6 space-y-6 shadow-xs">
                <div className="flex items-center justify-between border-b border-border pb-4">
                  <div>
                    <h2 className="text-base font-semibold tracking-tight">Review Campaign Details</h2>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      Double check the details below before sending. Once sent, campaigns cannot be undone.
                    </p>
                  </div>
                  <span className="flex items-center gap-1.5 rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-semibold text-primary">
                    <span className="relative flex size-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                      <span className="relative inline-flex rounded-full size-2 bg-primary"></span>
                    </span>
                    Ready to Send
                  </span>
                </div>

                {/* Metadata summary (Grid layout) */}
                <div className="grid gap-4 sm:grid-cols-2">
                  {/* Target Audience */}
                  <div className="rounded-lg border border-border bg-muted/30 p-4 space-y-3">
                    <div className="flex items-center gap-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                      <Users className="size-4 text-primary" />
                      Target Audience
                    </div>
                    <div className="space-y-1">
                      <div className="text-2xl font-bold tracking-tight text-foreground">
                        {recipientCount} <span className="text-sm font-normal text-muted-foreground">recipient{recipientCount !== 1 ? "s" : ""} matched</span>
                      </div>
                      <div className="flex flex-wrap gap-1.5 pt-1.5">
                        <span className="rounded bg-secondary/80 px-2 py-0.5 text-[11px] text-muted-foreground font-medium">
                          Chain: <span className="text-foreground">{chainFilter === "all" ? "All chains" : chainFilter}</span>
                        </span>
                        <span className="rounded bg-secondary/80 px-2 py-0.5 text-[11px] text-muted-foreground font-medium">
                          Contract: <span className="text-foreground">{contractFilter === "all" ? "All contracts" : (watchlist.find((w) => w.id === contractFilter)?.name ?? "All contracts")}</span>
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Delivery Channels */}
                  <div className="rounded-lg border border-border bg-muted/30 p-4 space-y-3">
                    <div className="flex items-center gap-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                      <Megaphone className="size-4 text-primary" />
                      Delivery Channels
                    </div>
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {selectedChannels.map((type) => (
                        <span
                          key={type}
                          className="flex items-center gap-1.5 rounded-md border border-border bg-background px-2.5 py-1 text-xs font-medium capitalize shadow-2xs"
                        >
                          <ChannelIcon type={type} className="size-3.5 text-primary" />
                          {type}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Content Summary */}
                <div className="space-y-3">
                  <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Message Content</div>
                  
                  <div className="rounded-lg border border-border bg-background p-4 space-y-3">
                    <div className="space-y-1">
                      <div className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">Campaign Title</div>
                      <div className="text-sm font-semibold text-foreground">{title}</div>
                    </div>
                    <div className="border-t border-border/60 my-2" />
                    <div className="space-y-1">
                      <div className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">Campaign Message</div>
                      <div className="text-sm text-foreground whitespace-pre-wrap break-words leading-relaxed font-sans">{message}</div>
                    </div>
                  </div>
                </div>
              </section>

              {/* Actions */}
              <div className="flex items-center justify-between gap-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsReviewing(false)}
                  className="gap-2"
                >
                  <ArrowLeft className="size-4" />
                  Back to edit
                </Button>
                <Button
                  type="button"
                  onClick={() => setSubmitted(true)}
                  className="gap-2 bg-primary text-primary-foreground hover:bg-primary/90 font-medium px-6"
                >
                  <Send className="size-4" />
                  Confirm & send campaign
                </Button>
              </div>
            </div>
          ) : (
            {/* ── Composer form ─────────────────────────────────── */}
            <form onSubmit={handleSubmit} noValidate className="space-y-6">
              {/* Message content */}
              <section className="rounded-xl border border-border bg-card p-5 space-y-4">
                <h2 className="text-sm font-medium">Message</h2>

                <div className="space-y-1.5">
                  <label className="text-xs text-muted-foreground" htmlFor="bulk-title">
                    Title <span aria-hidden="true" className="text-destructive">*</span>
                  </label>
                  <Input
                    id="bulk-title"
                    placeholder="e.g. Network upgrade scheduled"
                    value={title}
                    onChange={(e) => { setTitle(e.target.value); if (errors.title) setErrors((v) => ({ ...v, title: undefined })); }}
                    aria-invalid={!!errors.title}
                    aria-describedby={errors.title ? "title-err" : undefined}
                  />
                  {errors.title && (
                    <p id="title-err" className="text-xs text-destructive">{errors.title}</p>
                  )}
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs text-muted-foreground" htmlFor="bulk-message">
                    Message <span aria-hidden="true" className="text-destructive">*</span>
                  </label>
                  <textarea
                    id="bulk-message"
                    rows={4}
                    placeholder="Describe the event or action in plain language…"
                    value={message}
                    onChange={(e) => { setMessage(e.target.value); if (errors.message) setErrors((v) => ({ ...v, message: undefined })); }}
                    aria-invalid={!!errors.message}
                    aria-describedby={errors.message ? "message-err" : undefined}
                    className="w-full resize-none rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-xs placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-50 aria-invalid:border-destructive"
                  />
                  {errors.message && (
                    <p id="message-err" className="text-xs text-destructive">{errors.message}</p>
                  )}
                </div>
              </section>

              {/* Recipient selection */}
              <section className="rounded-xl border border-border bg-card p-5 space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-sm font-medium">Recipients</h2>
                  <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    <Users className="size-3.5" />
                    {recipientCount} matched
                  </span>
                </div>

                <div className="grid gap-3 sm:grid-cols-2">
                  <div className="space-y-1.5">
                    <label className="text-xs text-muted-foreground" htmlFor="chain-filter">
                      Chain
                    </label>
                    <Select value={chainFilter} onValueChange={(v) => { setChainFilter(v); setContractFilter("all"); }}>
                      <SelectTrigger id="chain-filter" className="w-full">
                        <SelectValue placeholder="All chains" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All chains</SelectItem>
                        {CHAINS.map((c) => (
                          <SelectItem key={c} value={c}>{c}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs text-muted-foreground" htmlFor="contract-filter">
                      Contract
                    </label>
                    <Select value={contractFilter} onValueChange={setContractFilter}>
                      <SelectTrigger id="contract-filter" className="w-full">
                        <SelectValue placeholder="All contracts" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All contracts</SelectItem>
                        {filteredContracts.map((w) => (
                          <SelectItem key={w.id} value={w.id}>{w.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {errors.recipients && (
                  <p className="text-xs text-destructive">{errors.recipients}</p>
                )}
              </section>

              {/* Channel selection */}
              <section className="rounded-xl border border-border bg-card p-5 space-y-4">
                <h2 className="text-sm font-medium">
                  Delivery channels <span aria-hidden="true" className="text-destructive">*</span>
                </h2>

                <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                  {CHANNEL_TYPES.map((type) => {
                    const active = selectedChannels.includes(type);
                    return (
                      <button
                        key={type}
                        type="button"
                        onClick={() => toggleChannel(type)}
                        aria-pressed={active}
                        className={`flex flex-col items-center gap-2 rounded-lg border p-4 text-sm capitalize transition-colors ${
                          active
                            ? "border-primary bg-primary/10 text-primary"
                            : "border-border bg-background text-muted-foreground hover:border-primary/40 hover:text-foreground"
                        }`}
                      >
                        <ChannelIcon type={type} className="size-5" />
                        {type}
                      </button>
                    );
                  })}
                </div>

                {errors.channels && (
                  <p className="text-xs text-destructive">{errors.channels}</p>
                )}
              </section>

              <div className="flex justify-end">
                <Button type="submit" disabled={recipientCount === 0}>
                  <Megaphone className="size-4" />
                  Review campaign
                </Button>
              </div>
            </form>
          )}

          {/* ── Preview panel ──────────────────────────────────── */}
          <div className="lg:sticky lg:top-20 lg:self-start">
            <NotificationPreview payload={payload} />
          </div>
        </div>
      </div>
    </>
  );
}
