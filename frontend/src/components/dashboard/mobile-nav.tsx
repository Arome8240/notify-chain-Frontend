"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Activity, Bell, Radio, Send, GitCommitHorizontal } from "lucide-react";
import { cn } from "@/src/lib/utils";

const nav = [
  { href: "/dashboard", label: "Events", icon: Activity },
  { href: "/rules", label: "Rules", icon: Bell },
  { href: "/watchlist", label: "Watchlist", icon: Radio },
  { href: "/channels", label: "Channels", icon: Send },
  { href: "/timeline", label: "Timeline", icon: GitCommitHorizontal },
];

export function MobileNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed inset-x-0 bottom-0 z-30 flex items-center justify-around border-t border-border bg-card/95 backdrop-blur md:hidden">
      {nav.map((item) => {
        const active =
          pathname === item.href || pathname.startsWith(item.href + "/");
        const Icon = item.icon;
        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "flex flex-1 flex-col items-center gap-1 py-2.5 text-[11px]",
              active ? "text-primary" : "text-muted-foreground"
            )}
          >
            <Icon className="size-5" />
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
