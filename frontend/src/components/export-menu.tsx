"use client";

import { Download } from "lucide-react";
import { Button } from "@/src/components/ui/button";
import { useExport } from "@/src/lib/export";
import type { ExportJob } from "@/src/store/types";
import { useState } from "react";

interface ExportMenuProps {
  dataType: ExportJob["dataType"];
}

export function ExportMenu({ dataType }: ExportMenuProps) {
  const { exportData } = useExport();
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="relative">
      <Button
        variant="outline"
        size="sm"
        onClick={() => setIsOpen(!isOpen)}
      >
        <Download className="size-4" />
        Export
      </Button>

      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-10"
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute right-0 z-20 mt-2 w-40 rounded-xl border border-border bg-background shadow-lg">
            <div className="p-2 space-y-1">
              <button
                className="w-full flex items-center gap-2 px-3 py-2 rounded-md text-sm text-left hover:bg-secondary/50 transition-colors"
                onClick={() => {
                  exportData(dataType, "csv");
                  setIsOpen(false);
                }}
              >
                <span>CSV</span>
              </button>
              <button
                className="w-full flex items-center gap-2 px-3 py-2 rounded-md text-sm text-left hover:bg-secondary/50 transition-colors"
                onClick={() => {
                  exportData(dataType, "json");
                  setIsOpen(false);
                }}
              >
                <span>JSON</span>
              </button>
              <button
                className="w-full flex items-center gap-2 px-3 py-2 rounded-md text-sm text-left hover:bg-secondary/50 transition-colors"
                onClick={() => {
                  exportData(dataType, "pdf");
                  setIsOpen(false);
                }}
              >
                <span>PDF</span>
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
