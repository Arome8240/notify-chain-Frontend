"use client";

import { useData, useUIState } from "@/src/store";
import { events } from "./mock-data";
import type { ExportFormat, ExportJob } from "@/src/store/types";
import { useCallback } from "react";

function exportToCSV(data: any[], filename: string) {
  if (data.length === 0) return null;

  const headers = Object.keys(data[0]);
  const csvContent = [
    headers.join(","),
    ...data.map((row) =>
      headers
        .map((header) => {
          const value = row[header];
          const stringValue =
            typeof value === "object" ? JSON.stringify(value) : String(value);
          return `"${stringValue.replace(/"/g, '""')}"`;
        })
        .join(",")
    ),
  ].join("\n");

  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  return URL.createObjectURL(blob);
}

function exportToJSON(data: any[], filename: string) {
  const jsonContent = JSON.stringify(data, null, 2);
  const blob = new Blob([jsonContent], { type: "application/json" });
  return URL.createObjectURL(blob);
}

function exportToPDF(data: any[], filename: string) {
  // For now, just use JSON for PDF fallback, but could integrate jsPDF
  return exportToJSON(data, filename);
}

function getExportFunction(format: ExportFormat) {
  switch (format) {
    case "csv":
      return exportToCSV;
    case "json":
      return exportToJSON;
    case "pdf":
      return exportToPDF;
    default:
      return exportToJSON;
  }
}

function flattenObject(obj: any, prefix = ""): any {
  return Object.keys(obj).reduce((acc: any, key) => {
    const fullKey = prefix ? `${prefix}.${key}` : key;
    const value = obj[key];
    if (value && typeof value === "object" && !Array.isArray(value)) {
      Object.assign(acc, flattenObject(value, fullKey));
    } else {
      acc[fullKey] = value;
    }
    return acc;
  }, {});
}

export function useExport() {
  const { channels, rules, watchlist } = useData();
  const { startExport, updateExportProgress, updateExportStatus } = useUIState();

  const exportData = useCallback(
    async (dataType: ExportJob["dataType"], format: ExportFormat) => {
      let data: any[] = [];

      // Get data based on type
      switch (dataType) {
        case "events":
          data = events;
          break;
        case "rules":
          data = rules;
          break;
        case "channels":
          data = channels;
          break;
        case "watchlist":
          data = watchlist;
          break;
      }

      // Flatten objects for better CSV export
      const flattenedData = data.map((item) => flattenObject(item));
      const totalItems = flattenedData.length;

      // Start export
      const jobId = startExport({
        status: "preparing",
        format,
        dataType,
        totalItems,
      });

      try {
        // Simulate processing with progress
        updateExportStatus(jobId, "processing");

        for (let i = 0; i <= totalItems; i++) {
          const progress = Math.round((i / totalItems) * 100);
          const estimatedTimeRemaining = Math.max(
            0,
            Math.round((totalItems - i) * 0.1)
          );

          updateExportProgress(jobId, progress, i, estimatedTimeRemaining);

          // Simulate processing delay for demonstration
          if (i < totalItems) {
            await new Promise((resolve) => setTimeout(resolve, 50));
          }
        }

        updateExportStatus(jobId, "completing");

        // Generate the file
        const exporter = getExportFunction(format);
        const downloadUrl = exporter(flattenedData, `notify-chain-${dataType}`);

        if (downloadUrl) {
          updateExportStatus(jobId, "completed", undefined, downloadUrl);
        } else {
          throw new Error("Failed to generate export file");
        }
      } catch (error) {
        updateExportStatus(
          jobId,
          "failed",
          error instanceof Error ? error.message : "Export failed"
        );
      }
    },
    [channels, rules, watchlist, startExport, updateExportProgress, updateExportStatus]
  );

  return { exportData };
}
