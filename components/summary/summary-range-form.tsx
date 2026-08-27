import type { NormalizedDateRange } from "@/lib/summary-range";

type SummaryRangeFormProps = {
  range: NormalizedDateRange;
};

export function SummaryRangeForm({ range }: SummaryRangeFormProps) {
  return (
    <form
      className="grid gap-3 rounded-lg border border-[var(--border-soft)] bg-[var(--surface)] p-4 shadow-sm sm:grid-cols-[1fr_1fr_auto] lg:grid-cols-[1fr_1fr_auto_auto]"
      method="get"
    >
      <label className="block">
        <span className="text-sm font-medium text-[#766e66]">开始日期</span>
        <input
          className="mt-2 min-h-11 w-full rounded border border-[var(--border-soft)] bg-[var(--surface)] px-3 text-[var(--foreground)]"
          defaultValue={range.startDate}
          name="startDate"
          required
          type="date"
        />
      </label>
      <label className="block">
        <span className="text-sm font-medium text-[#766e66]">结束日期</span>
        <input
          className="mt-2 min-h-11 w-full rounded border border-[var(--border-soft)] bg-[var(--surface)] px-3 text-[var(--foreground)]"
          defaultValue={range.endDate}
          name="endDate"
          required
          type="date"
        />
      </label>
      <label className="flex min-h-11 items-center gap-2 self-end rounded border border-[var(--border-soft)] px-3 text-sm font-medium text-[#766e66]">
        <input
          className="size-4 accent-[var(--primary)]"
          defaultChecked={range.includeEmpty}
          name="includeEmpty"
          type="checkbox"
          value="1"
        />
        显示无记录日期
      </label>
      <button className="bc-focus-ring min-h-11 self-end rounded bg-[var(--primary)] px-5 text-sm font-semibold text-white">
        查看汇总
      </button>
    </form>
  );
}
