"use client";

import { X, Download, CheckCircle2, AlertCircle, Loader2 } from "lucide-react";
import { Button } from "@/src/components/ui/button";
import { Card, CardContent } from "@/src/components/ui/card";
import { Badge } from "@/src/components/ui/badge";
import { useStore } from "@/src/store";
import { cn } from "@/src/lib/utils";
import type { ExportJob } from "@/src/store/types";

function getStatusIcon(status: ExportJob["status"]) {
  switch (status) {
    case "preparing":
    case "processing":
    case "completing":
      return <Loader2 className="size-4 animate-spin" />;
    case "completed":
      return <CheckCircle2 className="size-4 text-green-500" />;
    case "failed":
      return <AlertCircle className="size-4 text-red-500" />;
    default:
      return null;
  }
}

function getStatusBadgeVariant(status: ExportJob["status"]) {
  switch (status) {
    case "preparing":
    case "processing":
    case "completing":
      return "default";
    case "completed":
      return "secondary";
    case "failed":
      return "destructive";
    default:
      return "outline";
  }
}

function getStatusText(status: ExportJob["status"]) {
  switch (status) {
    case "preparing":
      return "Preparing...";
    case "processing":
      return "Processing...";
    case "completing":
      return "Finalizing...";
    case "completed":
      return "Completed";
    case "failed":
      return "Failed";
    default:
      return "Idle";
  }
}

function getDataTypeText(dataType: ExportJob["dataType"]) {
  return dataType.charAt(0).toUpperCase() + dataType.slice(1);
}

function ExportProgressItem({ job }: { job: ExportJob }) {
  const { removeExportJob } = useStore();

  const handleDownload = () => {
    if (job.downloadUrl) {
      const link = document.createElement("a");
      link.href = job.downloadUrl;
      link.download = `notify-chain-${job.dataType}-${new Date(job.startedAt).toISOString().split("T")[0]}.${job.format}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  return (
    <Card className="w-full max-w-md border shadow-md">
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              {getStatusIcon(job.status)}
              <span className="font-medium text-sm">
                Exporting {getDataTypeText(job.dataType)} as {job.format.toUpperCase()}
              </span>
            </div>

            {(job.status === "processing" || job.status === "completing" || job.status === "preparing") && (
              <div className="w-full bg-secondary rounded-full h-2 mb-2">
                <div
                  className="bg-primary h-2 rounded-full transition-all duration-300"
                  style={{ width: `${job.progress}%` }}
                />
              </div>
            )}

            <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
              <Badge variant={getStatusBadgeVariant(job.status)}>
                {getStatusText(job.status)}
              </Badge>
              <span>{job.progress}% complete</span>
              <span>•</span>
              <span>{job.processedItems} of {job.totalItems} items</span>
              {job.estimatedTimeRemaining !== undefined && job.status !== "completed" && job.status !== "failed" && (
                <>
                  <span>•</span>
                  <span>~{Math.max(1, Math.round(job.estimatedTimeRemaining))}s remaining</span>
                </>
              )}
            </div>

            {job.error && (
              <p className="mt-2 text-xs text-red-500">{job.error}</p>
            )}
          </div>

          <div className="flex items-center gap-1">
            {job.status === "completed" && job.downloadUrl && (
              <Button
                variant="outline"
                size="icon"
                onClick={handleDownload}
                aria-label="Download export"
              >
                <Download className="size-4" />
              </Button>
            )}
            <Button
              variant="ghost"
              size="icon"
              onClick={() => removeExportJob(job.id)}
              aria-label="Close"
            >
              <X className="size-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export function ExportProgressContainer() {
  const { exportJobs } = useStore();

  if (exportJobs.length === 0) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2">
      {exportJobs.map((job) => (
        <ExportProgressItem key={job.id} job={job} />
      ))}
    </div>
  );
}
