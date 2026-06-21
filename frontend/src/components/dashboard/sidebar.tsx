"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Activity,
  Bell,
  Radio,
  Send,
  Zap,
  ArrowUpRight,
  GitCommitHorizontal,
} from "lucide-react";
import { cn } from "@/src/lib/utils";

const nav = [
  { href: "/dashboard", label: "Events", icon: Activity },
  { href: "/rules", label: "Rules", icon: Bell },
  { href: "/watchlist", label: "Watchlist", icon: Radio },
  { href: "/channels", label: "Channels", icon: Send },
  { href: "/timeline", label: "Timeline", icon: GitCommitHorizontal },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden w-60 shrink-0 flex-col border-r border-border bg-card/40 md:flex">
      <div className="flex h-14 items-center gap-2 border-b border-border px-5">
        <Link href="/" className="flex items-center gap-2">
          <span className="flex size-7 items-center justify-center rounded-md bg-primary text-primary-foreground">
            <Zap className="size-4" />
          </span>
          <span className="font-semibold tracking-tight">Notify-Chain</span>
        </Link>
      </div>

      <nav className="flex flex-1 flex-col gap-1 p-3">
        <p className="px-3 pb-1 pt-2 text-xs font-medium uppercase tracking-wider text-muted-foreground">
          Monitor
        </p>
        {nav.map((item) => {
          const active =
            pathname === item.href || pathname.startsWith(item.href + "/");
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors",
                active
                  ? "bg-secondary text-foreground"
                  : "text-muted-foreground hover:bg-secondary/60 hover:text-foreground"
              )}
            >
              <Icon className="size-4" />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-border p-3">
        <a
          href="https://github.com/Core-Foundry/Notify-Chain"
          target="_blank"
          rel="noreferrer"
          className="flex items-center justify-between rounded-md px-3 py-2 text-sm text-muted-foreground transition-colors hover:bg-secondary/60 hover:text-foreground"
        >
          Documentation
          <ArrowUpRight className="size-4" />
        </a>
      </div>
    </aside>
  );
}
