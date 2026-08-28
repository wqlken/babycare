"use client";

import { useState, type ReactNode } from "react";
import { Plus, Ruler } from "lucide-react";
import { AppDrawer } from "@/components/ui/app-drawer";

type GrowthRecordDrawerProps = {
  childName: string;
  children: ReactNode;
};

export function GrowthRecordDrawer({
  childName,
  children,
}: GrowthRecordDrawerProps) {
  const [open, setOpen] = useState(false);

  return (
    <div className="rounded-lg border border-[var(--border-soft)] bg-[var(--surface)] px-4 py-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-start gap-3">
          <span className="flex size-11 shrink-0 items-center justify-center rounded-lg bg-[var(--accent-growth-soft)] text-[var(--accent-growth-strong)]">
            <Ruler aria-hidden="true" size={22} />
          </span>
          <div>
            <h2 className="text-lg font-semibold text-[var(--foreground)]">
              生长测量
            </h2>
            <p className="mt-1 text-sm text-[var(--text-muted)]">
              记录 {childName} 的体重和身长/身高。
            </p>
          </div>
        </div>
        <button
          className="bc-focus-ring flex min-h-12 items-center justify-center gap-2 rounded-lg bg-[var(--accent-growth)] px-4 text-base font-semibold text-white"
          onClick={() => setOpen(true)}
          type="button"
        >
          <Plus aria-hidden="true" size={20} />
          新增测量
        </button>
      </div>
      <AppDrawer
        description={`记录 ${childName} 的本次测量数据。`}
        onClose={() => setOpen(false)}
        open={open}
        title="新增测量"
      >
        {children}
      </AppDrawer>
    </div>
  );
}
