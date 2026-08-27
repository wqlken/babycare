import type { NormalizedDateRange } from "@/lib/summary-range";
import { CalendarDays } from "lucide-react";

type SummaryRangeFormProps = {
  range: NormalizedDateRange;
};

export function SummaryRangeForm({ range }: SummaryRangeFormProps) {
  return (
    <form
      className="rounded-lg border border-[var(--border-soft)] bg-[var(--surface)] px-3 py-3"
      method="get"
    >
      <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
        <div className="grid flex-1 gap-3 sm:grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] sm:items-end">
          <label className="block">
            <span className="text-sm font-medium text-[#766e66]">开始日期</span>
            <span className="mt-2 flex min-h-10 items-center gap-2 rounded-lg border border-[var(--border-soft)] bg-[var(--surface)] px-3">
              <CalendarDays
                aria-hidden="true"
                className="text-[var(--text-muted)]"
                size={18}
              />
              <input
                className="min-h-8 w-full bg-transparent text-sm text-[var(--foreground)] outline-none"
                defaultValue={range.startDate}
                name="startDate"
                required
                type="date"
              />
            </span>
          </label>
          <span className="hidden pb-2 text-sm font-medium text-[var(--text-muted)] sm:block">
            至
          </span>
          <label className="block">
            <span className="text-sm font-medium text-[#766e66]">结束日期</span>
            <span className="mt-2 flex min-h-10 items-center gap-2 rounded-lg border border-[var(--border-soft)] bg-[var(--surface)] px-3">
              <CalendarDays
                aria-hidden="true"
                className="text-[var(--text-muted)]"
                size={18}
              />
              <input
                className="min-h-8 w-full bg-transparent text-sm text-[var(--foreground)] outline-none"
                defaultValue={range.endDate}
                name="endDate"
                required
                type="date"
              />
            </span>
          </label>
        </div>
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
          <label className="flex min-h-10 items-center gap-2 rounded-lg bg-[var(--surface-muted)] px-3 text-sm font-medium text-[#766e66]">
            <input
              className="size-4 accent-[var(--primary)]"
              defaultChecked={range.includeEmpty}
              name="includeEmpty"
              type="checkbox"
              value="1"
            />
            显示无记录日期
          </label>
          <button className="bc-focus-ring min-h-10 rounded-lg bg-[var(--primary)] px-5 text-sm font-semibold text-white">
            查看汇总
          </button>
        </div>
      </div>
    </form>
  );
}
