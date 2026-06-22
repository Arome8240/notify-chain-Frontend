import Link from "next/link";
import { Topbar } from "@/src/components/dashboard/topbar";
import {
  watchlist,
  events as allEvents,
  timeAgo,
  chainColors,
  type WatchedContract,
} from "@/src/lib/mock-data";

type Props = {
  params: { id: string };
};

function EventRow({ ev }: { ev: (typeof allEvents)[number] }) {
  return (
    <li className="flex items-start gap-4 px-4 py-3">
      <div className="size-2 rounded-full bg-muted/40" />
      <div className="min-w-0">
        <div className="flex items-center gap-2">
          <p className="truncate font-medium">{ev.eventName}</p>
          <p className="text-xs text-muted-foreground">{ev.chain}</p>
        </div>
        <p className="mt-1 text-xs text-muted-foreground">
          {ev.txHash} · {timeAgo(ev.timestamp)} · block {ev.blockNumber}
        </p>
      </div>
    </li>
  );
}

export default function ContractDetails({ params }: Props) {
  const id = decodeURIComponent(params.id);

  const contract: WatchedContract | undefined = watchlist.find(
    (w) => w.id === id || w.name === id
  );

  if (!contract) {
    return (
      <>
        <Topbar title="Contract not found" description="Requested contract is missing" />
        <div className="flex-1 p-6">
          <div className="rounded-xl border border-border bg-card p-6 text-sm text-muted-foreground">
            The contract you requested was not found in the watchlist.
            <div className="mt-4">
              <Link href="/" className="text-primary underline">
                Back to dashboard
              </Link>
            </div>
          </div>
        </div>
      </>
    );
  }

  const events = allEvents
    .filter((e) => e.contract === contract.name || e.contractAddress === contract.address)
    .slice()
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

  return (
    <>
      <Topbar
        title={contract.name}
        description={`${contract.type} on ${contract.chain} — ${contract.address}`}
      />

      <div className="flex-1 space-y-6 p-4 md:p-6">
        <div className="flex items-center justify-between">
          <nav className="text-sm text-muted-foreground">
            <Link href="/" className="underline">
              Dashboard
            </Link>
            <span className="mx-2">/</span>
            <Link href="/watchlist" className="underline">
              Watchlist
            </Link>
            <span className="mx-2">/</span>
            <span className="text-foreground">{contract.name}</span>
          </nav>
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <div className="col-span-1 rounded-xl border border-border bg-card p-4">
            <div className="flex items-start gap-3">
              <span
                className="size-3 rounded-full"
                style={{ backgroundColor: chainColors[contract.chain] }}
                title={contract.chain}
              />
              <div>
                <h2 className="font-medium">{contract.name}</h2>
                <p className="mt-1 text-xs text-muted-foreground">{contract.address}</p>
                <p className="mt-2 text-sm text-muted-foreground">Type: {contract.type}</p>
                <p className="mt-1 text-sm text-muted-foreground">Added: {timeAgo(contract.addedAt)}</p>
                <p className="mt-2 text-sm">
                  <span className="font-medium">{contract.eventsToday.toLocaleString()}</span>
                  <span className="ml-2 text-xs text-muted-foreground">events today</span>
                </p>
              </div>
            </div>
          </div>

          <div className="col-span-2 rounded-xl border border-border bg-card p-0">
            <div className="border-b border-border px-4 py-3">
              <h3 className="text-sm font-medium">Recent events</h3>
              <p className="mt-1 text-xs text-muted-foreground">Showing latest activity for this contract</p>
            </div>
            <ul className="divide-y divide-border">
              {events.length === 0 ? (
                <li className="px-4 py-6 text-center text-sm text-muted-foreground">No recent events for this contract.</li>
              ) : (
                events.map((ev) => <EventRow key={ev.id} ev={ev} />)
              )}
            </ul>
          </div>
        </div>
      </div>
    </>
  );
}
