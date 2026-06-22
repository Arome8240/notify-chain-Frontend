"use client";

import { Columns3, RotateCcw } from "lucide-react";
import { Button } from "@/src/components/ui/button";
import { Checkbox } from "@/src/components/ui/checkbox";
import { usePreferences } from "@/src/store";
import { useState, useCallback } from "react";
import type { ColumnVisibility } from "@/src/store/types";

export interface ColumnDef {
  id: string;
  label: string;
}

interface ColumnToggleProps {
  table: keyof ColumnVisibility;
  columns: ColumnDef[];
  align?: "left" | "right";
}

export function ColumnToggle({ table, columns, align = "right" }: ColumnToggleProps) {
  const [isOpen, setIsOpen] = useState(false);
  const visibility = usePreferences((state) => state.columnVisibility[table] as Record<string, boolean>);
  const toggleColumn = usePreferences((state) => state.toggleColumn);
  const resetColumnVisibility = usePreferences((state) => state.resetColumnVisibility);

  const handleToggle = useCallback(
    (columnId: string) => {
      toggleColumn(table, columnId);
    },
    [table, toggleColumn]
  );

  const handleReset = useCallback(() => {
    resetColumnVisibility(table);
  }, [table, resetColumnVisibility]);

  const visibleCount = Object.values(visibility).filter(Boolean).length;

  return (
    <div className="relative">
      <Button
        variant="outline"
        size="sm"
        onClick={() => setIsOpen(!isOpen)}
      >
        <Columns3 className="size-4" />
        Columns
        <span className="ml-1 rounded-md bg-secondary px-1.5 py-0.5 text-xs tabular-nums text-muted-foreground">
          {visibleCount}/{columns.length}
        </span>
      </Button>

      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-10"
            onClick={() => setIsOpen(false)}
          />
          <div
            className={`absolute ${align === "right" ? "right-0" : "left-0"} z-20 mt-2 w-56 rounded-xl border border-border bg-background shadow-lg`}
          >
            <div className="border-b border-border px-4 py-2.5">
              <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                Visible columns
              </p>
            </div>
            <div className="p-2 space-y-1">
              {columns.map((col) => (
                <label
                  key={col.id}
                  className="flex items-center gap-2 px-2 py-1.5 rounded-md text-sm cursor-pointer hover:bg-secondary/50 transition-colors"
                >
                  <Checkbox
                    checked={visibility[col.id] ?? true}
                    onCheckedChange={() => handleToggle(col.id)}
                  />
                  <span>{col.label}</span>
                </label>
              ))}
            </div>
            <div className="border-t border-border p-2">
              <Button
                variant="ghost"
                size="sm"
                className="w-full justify-start text-muted-foreground"
                onClick={handleReset}
              >
                <RotateCcw className="size-3.5" />
                Reset to defaults
              </Button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
