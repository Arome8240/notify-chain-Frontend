import Link from "next/link";
import {
  Activity,
  Bell,
  Radio,
  Send,
  Webhook,
  Mail,
  MessageCircle,
  Hash,
  ArrowRight,
  ShieldCheck,
  Gauge,
  GitBranch,
  Boxes,
} from "lucide-react";
import { MarketingNav } from "@/src/components/marketing/marketing-nav";
import { Button } from "@/src/components/ui/button";

const features = [
  {
    icon: Radio,
    title: "Watch Soroban contracts",
    body: "Track events emitted by Stellar Soroban contracts and keep contract activity visible from one dashboard.",
  },
  {
    icon: Bell,
    title: "Rules engine",
    body: "Describe what matters - value thresholds, specific args, function calls - and only get notified when it happens.",
  },
  {
    icon: Send,
    title: "Route anywhere",
    body: "Fan out matched events to webhooks, email, Telegram and Discord. Per-rule channel mapping with retries.",
  },
  {
    icon: GitBranch,
    title: "Ledger-aware",
    body: "The off-chain helper follows Stellar ledger updates and keeps event views aligned with finalized Soroban activity.",
  },
  {
    icon: Gauge,
    title: "Timely event delivery",
    body: "Surface new contract events quickly after ledger close, with delivery metrics on every channel.",
  },
  {
    icon: ShieldCheck,
    title: "Signed payloads",
    body: "Every webhook is HMAC-signed and idempotent, so your services can trust and de-duplicate every delivery.",
  },
];

const steps = [
  {
    n: "01",
    title: "Add a Soroban contract",
    body: "Paste a Stellar contract ID or pick from a template. Notify-Chain organizes the events your app needs to watch.",
  },
  {
    n: "02",
    title: "Define a rule",
    body: "Choose an event and add conditions on its decoded arguments. Preview matches against recent history.",
  },
  {
    n: "03",
    title: "Connect channels",
    body: "Point the rule at one or more channels. Mix a webhook for automation with Telegram for humans.",
  },
  {
    n: "04",
    title: "React to Soroban events",
    body: "Receive signed event payloads after ledger close and trigger dashboards, automations, or your team.",
  },
];

const channelCards = [
  { icon: Webhook, label: "Webhook", detail: "Signed JSON, retries + DLQ" },
  { icon: MessageCircle, label: "Telegram", detail: "Bots and group chats" },
  { icon: Hash, label: "Discord", detail: "Channel + thread routing" },
  { icon: Mail, label: "Email", detail: "Digests or per-event" },
];

const previewEvents = [
  { name: "TaskCompleted", contract: "TaskRegistry", meta: "reward 2,400", tone: "ok" },
  {
    name: "EscrowReleased",
    contract: "EscrowContract",
    meta: "amount 182,400 stroops",
    tone: "ok",
  },
  { name: "MilestoneLogged", contract: "ProjectTracker", meta: "step 3 approved", tone: "pending" },
  {
    name: "VoteCast",
    contract: "DaoGovernance",
    meta: "proposal #248",
    tone: "ok",
  },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background">
      <MarketingNav />

      {/* Hero */}
      <section className="relative overflow-hidden border-b border-border">
        <div className="absolute inset-0 bg-grid opacity-40" />
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary/40 to-transparent" />
        <div className="relative mx-auto grid max-w-6xl gap-12 px-4 py-20 sm:px-6 lg:grid-cols-2 lg:py-28">
          <div className="flex flex-col justify-center">
            <span className="inline-flex w-fit items-center gap-2 rounded-full border border-border bg-card px-3 py-1 text-xs text-muted-foreground">
              <span className="size-1.5 rounded-full bg-primary animate-pulse-dot" />
              Stellar Soroban contract + off-chain helper, open source
            </span>
            <h1 className="mt-6 text-balance text-4xl font-semibold tracking-tight sm:text-5xl lg:text-6xl">
              Track and react to{" "}
              <span className="text-primary">on-chain events</span>
            </h1>
            <p className="mt-5 max-w-md text-pretty text-base leading-relaxed text-muted-foreground sm:text-lg">
              Notify-Chain watches your Soroban contracts, matches events against your
              rules, and routes them to webhooks, email, Telegram and Discord -
              in real time.
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-3">
              <Button asChild size="lg">
                <Link href="/dashboard">
                  Open dashboard
                  <ArrowRight className="size-4" />
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline">
                <a
                  href="https://github.com/Core-Foundry/Notify-Chain"
                  target="_blank"
                  rel="noreferrer"
                >
                  View on GitHub
                </a>
              </Button>
            </div>
            <div className="mt-10 flex flex-wrap gap-x-8 gap-y-3 text-sm text-muted-foreground">
              <span className="flex items-center gap-2">
                <Boxes className="size-4 text-primary" /> Stellar Soroban
              </span>
              <span className="flex items-center gap-2">
                <Gauge className="size-4 text-primary" /> &lt;1s latency
              </span>
              <span className="flex items-center gap-2">
                <ShieldCheck className="size-4 text-primary" /> Signed payloads
              </span>
            </div>
          </div>

          {/* Live preview panel */}
          <div className="relative flex items-center justify-center">
            <div className="w-full max-w-md rounded-xl border border-border bg-card shadow-2xl shadow-black/40">
              <div className="flex items-center justify-between border-b border-border px-4 py-3">
                <div className="flex items-center gap-2 text-sm font-medium">
                  <Activity className="size-4 text-primary" />
                  Live event stream
                </div>
                <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <span className="size-1.5 rounded-full bg-primary animate-pulse-dot" />
                  Streaming
                </span>
              </div>
              <ul className="divide-y divide-border">
                {previewEvents.map((e, i) => (
                  <li
                    key={i}
                    className="flex items-center justify-between gap-3 px-4 py-3"
                  >
                    <div className="min-w-0">
                      <p className="truncate font-mono text-sm">
                        <span className="text-primary">{e.name}</span>
                        <span className="text-muted-foreground">
                          {" "}
                          · {e.contract}
                        </span>
                      </p>
                      <p className="truncate text-xs text-muted-foreground">
                        {e.meta}
                      </p>
                    </div>
                    <span
                      className={
                        e.tone === "pending"
                          ? "rounded-full border border-warning/20 bg-warning/10 px-2 py-0.5 text-[11px] text-warning"
                          : "rounded-full border border-primary/20 bg-primary/10 px-2 py-0.5 text-[11px] text-primary"
                      }
                    >
                      {e.tone === "pending" ? "matching" : "delivered"}
                    </span>
                  </li>
                ))}
              </ul>
              <div className="border-t border-border px-4 py-3 font-mono text-xs text-muted-foreground">
                POST https://api.acme.xyz/hooks · 200 OK · 84ms
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats strip */}
      <section className="border-b border-border bg-card/30">
        <div className="mx-auto grid max-w-6xl grid-cols-2 gap-px px-4 sm:px-6 lg:grid-cols-4">
          {[
            { v: "31.8K", l: "events captured / day" },
            { v: "99.2%", l: "delivery success" },
            { v: "<1s", l: "median dispatch latency" },
            { v: "5", l: "supported chains" },
          ].map((s) => (
            <div key={s.l} className="px-2 py-8 text-center">
              <p className="text-3xl font-semibold tracking-tight text-foreground">
                {s.v}
              </p>
              <p className="mt-1 text-xs text-muted-foreground">{s.l}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section id="features" className="mx-auto max-w-6xl px-4 py-20 sm:px-6">
        <div className="max-w-2xl">
          <h2 className="text-balance text-3xl font-semibold tracking-tight sm:text-4xl">
            Infrastructure for reacting to Stellar Soroban
          </h2>
          <p className="mt-4 text-pretty leading-relaxed text-muted-foreground">
            A smart contract registry paired with an off-chain helper that does
            the heavy lifting - indexing, decoding, matching and delivery.
          </p>
        </div>
        <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((f) => {
            const Icon = f.icon;
            return (
              <div
                key={f.title}
                className="group rounded-xl border border-border bg-card p-6 transition-colors hover:border-primary/40"
              >
                <span className="flex size-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <Icon className="size-5" />
                </span>
                <h3 className="mt-4 font-medium">{f.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                  {f.body}
                </p>
              </div>
            );
          })}
        </div>
      </section>

      {/* How it works */}
      <section id="how" className="border-y border-border bg-card/30">
        <div className="mx-auto max-w-6xl px-4 py-20 sm:px-6">
          <h2 className="text-balance text-3xl font-semibold tracking-tight sm:text-4xl">
            From Soroban contract to notification in four steps
          </h2>
          <div className="mt-12 grid gap-px overflow-hidden rounded-xl border border-border bg-border sm:grid-cols-2 lg:grid-cols-4">
            {steps.map((s) => (
              <div key={s.n} className="bg-card p-6">
                <span className="font-mono text-sm text-primary">{s.n}</span>
                <h3 className="mt-3 font-medium">{s.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                  {s.body}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Channels */}
      <section id="channels" className="mx-auto max-w-6xl px-4 py-20 sm:px-6">
        <div className="grid gap-12 lg:grid-cols-2 lg:items-center">
          <div>
            <h2 className="text-balance text-3xl font-semibold tracking-tight sm:text-4xl">
              Deliver to the tools your team already uses
            </h2>
            <p className="mt-4 text-pretty leading-relaxed text-muted-foreground">
              Map every rule to one or more channels. Automate with signed
              webhooks, alert humans on Telegram and Discord, or send email
              digests - all with delivery tracking and retries.
            </p>
            <Button asChild className="mt-6" variant="outline">
              <Link href="/channels">
                Explore channels
                <ArrowRight className="size-4" />
              </Link>
            </Button>
          </div>
          <div className="grid grid-cols-2 gap-4">
            {channelCards.map((c) => {
              const Icon = c.icon;
              return (
                <div
                  key={c.label}
                  className="rounded-xl border border-border bg-card p-5"
                >
                  <span className="flex size-10 items-center justify-center rounded-lg bg-secondary text-foreground">
                    <Icon className="size-5" />
                  </span>
                  <h3 className="mt-3 font-medium">{c.label}</h3>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {c.detail}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="border-t border-border">
        <div className="relative mx-auto max-w-6xl overflow-hidden px-4 py-20 text-center sm:px-6">
          <div className="absolute inset-0 bg-grid opacity-30" />
          <div className="relative">
            <h2 className="text-balance text-3xl font-semibold tracking-tight sm:text-4xl">
              Start watching your Soroban contracts
            </h2>
            <p className="mx-auto mt-4 max-w-md text-pretty leading-relaxed text-muted-foreground">
              Spin up the dashboard, add a Stellar contract, and ship your first
              notification rule in minutes.
            </p>
            <Button asChild size="lg" className="mt-8">
              <Link href="/dashboard">
                Open dashboard
                <ArrowRight className="size-4" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-4 py-8 sm:flex-row sm:px-6">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <span className="flex size-6 items-center justify-center rounded bg-primary text-primary-foreground">
              <Activity className="size-3.5" />
            </span>
            Notify-Chain
          </div>
          <p className="text-xs text-muted-foreground">
            A Stellar Soroban contract + off-chain helper system for tracking
            and reacting to events.
          </p>
        </div>
      </footer>
    </div>
  );
}
