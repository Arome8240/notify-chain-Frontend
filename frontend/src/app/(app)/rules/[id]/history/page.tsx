"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useState } from "react";
import {
  ArrowLeft,
  Clock3,
  RotateCcw,
  UserRound,
} from "lucide-react";
import { Topbar } from "@/src/components/dashboard/topbar";
import { StatusBadge } from "@/src/components/dashboard/status-badge";
import { Button } from "@/src/components/ui/button";
import { useData } from "@/src/store";
import {
  templateVersions,
  timeAgo,
  type NotificationRule,
  type NotificationTemplateSnapshot,
  type NotificationTemplateVersion,
} from "@/src/lib/mock-data";

const trackedFields = [
  { key: "name", label: "Template name" },
  { key: "description", label: "Description" },
  { key: "contract", label: "Contract" },
  { key: "eventSignature", label: "Event signature" },
  { key: "chain", label: "Chain" },
  { key: "condition", label: "Condition" },
  { key: "channels", label: "Delivery channels" },
  { key: "status", label: "Status" },
] as const;

type TrackedFieldKey = (typeof trackedFields)[number]["key"];

function formatDate(iso: string) {
  return new Intl.DateTimeFormat("en-US", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(iso));
}

function normalizeValue(value: NotificationTemplateSnapshot[TrackedFieldKey]) {
  if (Array.isArray(value)) {
    return value.slice().sort().join("|");
  }

  return value.trim().toLowerCase();
}

function displayValue(value: NotificationTemplateSnapshot[TrackedFieldKey]) {
  return Array.isArray(value) ? value.join(", ") : value;
}

function snapshotFromRule(rule: NotificationRule): NotificationTemplateSnapshot {
  return {
    name: rule.name,
    description: rule.description,
    contract: rule.contract,
    eventSignature: rule.eventSignature,
    chain: rule.chain,
    condition: rule.condition,
    channels: rule.channels,
    status: rule.status,
  };
}

function sameSnapshot(
  a: NotificationTemplateSnapshot,
  b: NotificationTemplateSnapshot
) {
  return trackedFields.every(
    (field) => normalizeValue(a[field.key]) === normalizeValue(b[field.key])
  );
}

export default function TemplateHistoryPage() {
  const params = useParams<{ id: string }>();
  const ruleId = Array.isArray(params.id) ? params.id[0] : params.id;
  const rule = useData((state) => state.rules.find((item) => item.id === ruleId));
  const updateRule = useData((state) => state.updateRule);
  const [selectedVersionId, setSelectedVersionId] = useState<string | null>(null);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  const versions = templateVersions
    .filter((version) => version.ruleId === ruleId)
    .sort((a, b) => b.version - a.version);

  const selectedVersion =
    versions.find((version) => version.id === selectedVersionId) ?? versions[0] ?? null;

  if (!rule) {
    return (
      <>
        <Topbar
          title="Template history"
          description="The requested notification template could not be found"
        />
        <div className="flex-1 p-4 md:p-6">
          <div className="rounded-xl border border-border bg-card p-6 text-sm text-muted-foreground">
            <p>We could not find the template you requested.</p>
            <div className="mt-4">
              <Button asChild variant="outline">
                <Link href="/rules">Back to rules</Link>
              </Button>
            </div>
          </div>
        </div>
      </>
    );
  }

  const currentSnapshot = snapshotFromRule(rule);
  const currentVersion = versions.find((version) =>
    sameSnapshot(version.snapshot, currentSnapshot)
  );

  const changedFields = selectedVersion
    ? trackedFields.filter(
        (field) =>
          normalizeValue(selectedVersion.snapshot[field.key]) !==
          normalizeValue(currentSnapshot[field.key])
      )
    : [];

  const restoreVersion = (version: NotificationTemplateVersion) => {
    if (!window.confirm(`Restore version ${version.version} of ${rule.name}?`)) {
      return;
    }

    updateRule(rule.id, version.snapshot);
    setSelectedVersionId(version.id);
    setStatusMessage(`Restored version ${version.version} from ${version.author}.`);
  };

  return (
    <>
      <Topbar
        title={`${rule.name} history`}
        description="Compare saved versions and restore an older notification template"
      />

      <div className="flex-1 space-y-6 p-4 md:p-6">
        <nav className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
          <Link href="/" className="underline">
            Dashboard
          </Link>
          <span>/</span>
          <Link href="/rules" className="underline">
            Rules
          </Link>
          <span>/</span>
          <span className="text-foreground">{rule.name}</span>
          <span>/</span>
          <span className="text-foreground">History</span>
        </nav>

        {statusMessage ? (
          <div className="rounded-xl border border-primary/30 bg-primary/10 px-4 py-3 text-sm text-primary">
            {statusMessage}
          </div>
        ) : null}

        <div className="grid gap-6 xl:grid-cols-[380px_minmax(0,1fr)]">
          <section className="rounded-xl border border-border bg-card p-4">
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="flex items-center gap-2">
                  <Clock3 className="size-4 text-muted-foreground" />
                  <h2 className="font-medium">Version list</h2>
                </div>
                <p className="mt-1 text-xs text-muted-foreground">
                  {versions.length} saved version{versions.length === 1 ? "" : "s"}
                </p>
              </div>
              <Button asChild variant="ghost" size="sm">
                <Link href="/rules">
                  <ArrowLeft className="size-4" />
                  Back
                </Link>
              </Button>
            </div>

            <div className="mt-4 space-y-3">
              {versions.length === 0 ? (
                <div className="rounded-lg border border-dashed border-border bg-background px-4 py-8 text-center text-sm text-muted-foreground">
                  No template history is available yet.
                </div>
              ) : (
                versions.map((version) => {
                  const isSelected = version.id === selectedVersion?.id;
                  const isCurrent = currentVersion?.id === version.id;
                  const diffCount = trackedFields.filter(
                    (field) =>
                      normalizeValue(version.snapshot[field.key]) !==
                      normalizeValue(currentSnapshot[field.key])
                  ).length;

                  return (
                    <button
                      key={version.id}
                      type="button"
                      onClick={() => {
                        setSelectedVersionId(version.id);
                        setStatusMessage(null);
                      }}
                      className={
                        "w-full rounded-xl border p-4 text-left transition-colors " +
                        (isSelected
                          ? "border-primary/40 bg-primary/5"
                          : "border-border bg-background hover:bg-secondary/40")
                      }
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="text-sm font-medium">
                              Version {version.version}
                            </span>
                            {isCurrent ? (
                              <StatusBadge tone="success" label="current" />
                            ) : null}
                          </div>
                          <p className="mt-1 text-xs text-muted-foreground">
                            {formatDate(version.createdAt)}
                          </p>
                        </div>
                        <span className="rounded-full border border-border bg-secondary px-2 py-0.5 text-xs text-muted-foreground">
                          {diffCount} change{diffCount === 1 ? "" : "s"}
                        </span>
                      </div>

                      <p className="mt-3 text-sm text-foreground">{version.summary}</p>

                      <div className="mt-3 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                        <span className="inline-flex items-center gap-1.5 rounded-full border border-border bg-background px-2 py-1 text-foreground">
                          <UserRound className="size-3.5" />
                          {version.author}
                        </span>
                        <span>{timeAgo(version.createdAt)}</span>
                      </div>

                      <div className="mt-3 flex flex-wrap gap-1.5">
                        {trackedFields
                          .filter(
                            (field) =>
                              normalizeValue(version.snapshot[field.key]) !==
                              normalizeValue(currentSnapshot[field.key])
                          )
                          .slice(0, 3)
                          .map((field) => (
                            <span
                              key={field.key}
                              className="rounded-full border border-amber-500/20 bg-amber-500/10 px-2 py-0.5 text-[11px] text-amber-700 dark:text-amber-300"
                            >
                              {field.label}
                            </span>
                          ))}
                        {diffCount > 3 ? (
                          <span className="rounded-full border border-border bg-secondary px-2 py-0.5 text-[11px] text-muted-foreground">
                            +{diffCount - 3} more
                          </span>
                        ) : null}
                      </div>
                    </button>
                  );
                })
              )}
            </div>
          </section>

          <section className="space-y-6">
            <div className="grid gap-4 md:grid-cols-3">
              <article className="rounded-xl border border-border bg-card p-4">
                <p className="text-xs uppercase tracking-wider text-muted-foreground">
                  Current version
                </p>
                <p className="mt-2 text-2xl font-semibold">
                  {currentVersion ? `v${currentVersion.version}` : "Live"}
                </p>
                <p className="mt-1 text-sm text-muted-foreground">
                  {currentVersion
                    ? `${currentVersion.author} · ${formatDate(currentVersion.createdAt)}`
                    : "The live template is not yet in version history."}
                </p>
              </article>

              <article className="rounded-xl border border-border bg-card p-4">
                <p className="text-xs uppercase tracking-wider text-muted-foreground">
                  Selected revision
                </p>
                <p className="mt-2 text-2xl font-semibold">
                  {selectedVersion ? `v${selectedVersion.version}` : "None"}
                </p>
                <p className="mt-1 text-sm text-muted-foreground">
                  {selectedVersion
                    ? `${selectedVersion.author} · ${formatDate(selectedVersion.createdAt)}`
                    : "Choose a version from the list."}
                </p>
              </article>

              <article className="rounded-xl border border-border bg-card p-4">
                <p className="text-xs uppercase tracking-wider text-muted-foreground">
                  Differences
                </p>
                <p className="mt-2 text-2xl font-semibold">{changedFields.length}</p>
                <p className="mt-1 text-sm text-muted-foreground">
                  changed field{changedFields.length === 1 ? "" : "s"} compared to the live template
                </p>
              </article>
            </div>

            <div className="rounded-xl border border-border bg-card p-4">
              <div className="flex flex-col gap-3 border-b border-border pb-4 md:flex-row md:items-start md:justify-between">
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="text-base font-medium">
                      {selectedVersion ? `Version ${selectedVersion.version}` : "Version comparison"}
                    </h3>
                    {selectedVersion ? (
                      <StatusBadge
                        tone={changedFields.length > 0 ? "pending" : "success"}
                        label={changedFields.length > 0 ? "drift detected" : "matches live"}
                      />
                    ) : null}
                  </div>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {selectedVersion
                      ? selectedVersion.summary
                      : "Select a version to inspect the field-by-field diff."}
                  </p>
                </div>

                {selectedVersion ? (
                  <div className="flex flex-wrap gap-2">
                    <Button
                      variant="outline"
                      onClick={() => restoreVersion(selectedVersion)}
                      disabled={changedFields.length === 0}
                    >
                      <RotateCcw className="size-4" />
                      Restore this version
                    </Button>
                  </div>
                ) : null}
              </div>

              {selectedVersion ? (
                <div className="mt-4 grid gap-4">
                  {trackedFields.map((field) => {
                    const selectedValue = selectedVersion.snapshot[field.key];
                    const currentValue = currentSnapshot[field.key];
                    const changed =
                      normalizeValue(selectedValue) !== normalizeValue(currentValue);

                    return (
                      <div
                        key={field.key}
                        className={
                          "rounded-lg border p-4 " +
                          (changed
                            ? "border-amber-500/20 bg-amber-500/5"
                            : "border-border bg-background")
                        }
                      >
                        <div className="flex flex-wrap items-center justify-between gap-3">
                          <h4 className="text-sm font-medium">{field.label}</h4>
                          <StatusBadge
                            tone={changed ? "pending" : "success"}
                            label={changed ? "changed" : "unchanged"}
                          />
                        </div>

                        <div className="mt-3 grid gap-3 md:grid-cols-2">
                          <div className="rounded-md border border-border bg-card px-3 py-2">
                            <p className="text-[11px] uppercase tracking-wider text-muted-foreground">
                              Selected version
                            </p>
                            <p className="mt-1 text-sm text-foreground">
                              {displayValue(selectedValue)}
                            </p>
                          </div>
                          <div className="rounded-md border border-border bg-card px-3 py-2">
                            <p className="text-[11px] uppercase tracking-wider text-muted-foreground">
                              Live template
                            </p>
                            <p className="mt-1 text-sm text-foreground">
                              {displayValue(currentValue)}
                            </p>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="py-16 text-center text-sm text-muted-foreground">
                  No version selected.
                </div>
              )}
            </div>
          </section>
        </div>
      </div>
    </>
  );
}
