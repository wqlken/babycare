"use client";

import { useState } from "react";
import { AppDrawer } from "@/components/ui/app-drawer";
import type { NormalizedDateRange } from "@/lib/summary-range";
import { CalendarDays, SlidersHorizontal } from "lucide-react";

type SummaryRangeFormProps = {
  range: NormalizedDateRange;
};

export function SummaryRangeForm({ range }: SummaryRangeFormProps) {
  const [open, setOpen] = useState(false);

  return (
    <div className="rounded-lg border border-[var(--border-soft)] bg-[var(--surface)] px-3 py-3">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-start gap-3">
          <span className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-[var(--surface-muted)] text-[var(--primary-strong)]">
            <CalendarDays aria-hidden="true" size={20} />
          </span>
          <div>
            <p className="text-sm font-medium text-[var(--text-muted)]">
              当前范围
            </p>
            <p className="mt-1 font-semibold text-[var(--foreground)]">
              {range.startDate} 至 {range.endDate}
            </p>
            {range.includeEmpty ? (
              <p className="mt-1 text-xs text-[var(--text-muted)]">
                已显示无记录日期
              </p>
            ) : null}
          </div>
        </div>
        <button
          className="bc-focus-ring flex min-h-11 items-center justify-center gap-2 rounded-lg bg-[var(--primary)] px-4 text-sm font-semibold text-white"
          onClick={() => setOpen(true)}
          type="button"
        >
          <SlidersHorizontal aria-hidden="true" size={18} />
          筛选
        </button>
      </div>
      <AppDrawer
        description="选择要查看的汇总日期范围。"
        onClose={() => setOpen(false)}
        open={open}
        title="汇总筛选"
      >
        <form className="space-y-4" method="get">
          <label className="block">
            <span className="bc-label">开始日期</span>
            <span className="mt-2 flex min-h-12 items-center gap-2 rounded-lg border border-[var(--border-soft)] bg-[var(--surface)] px-3">
              <CalendarDays
                aria-hidden="true"
                className="text-[var(--text-muted)]"
                size={18}
              />
              <input
                className="min-h-9 w-full bg-transparent text-base text-[var(--foreground)] outline-none"
                defaultValue={range.startDate}
                name="startDate"
                required
                type="date"
              />
            </span>
          </label>
          <label className="block">
            <span className="bc-label">结束日期</span>
            <span className="mt-2 flex min-h-12 items-center gap-2 rounded-lg border border-[var(--border-soft)] bg-[var(--surface)] px-3">
              <CalendarDays
                aria-hidden="true"
                className="text-[var(--text-muted)]"
                size={18}
              />
              <input
                className="min-h-9 w-full bg-transparent text-base text-[var(--foreground)] outline-none"
                defaultValue={range.endDate}
                name="endDate"
                required
                type="date"
              />
            </span>
          </label>
          <label className="flex min-h-12 items-center gap-2 rounded-lg bg-[var(--surface-muted)] px-3 text-sm font-medium text-[var(--text-muted)]">
            <input
              className="size-4 accent-[var(--primary)]"
              defaultChecked={range.includeEmpty}
              name="includeEmpty"
              type="checkbox"
              value="1"
            />
            显示无记录日期
          </label>
          <button className="bc-focus-ring min-h-12 w-full rounded-lg bg-[var(--primary)] px-5 text-base font-semibold text-white">
            查看汇总
          </button>
        </form>
      </AppDrawer>
    </div>
  );
}
