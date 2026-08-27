import { formatSummarySleep } from "@/lib/summary-range";

type SummaryTotals = {
  bottleCount: number;
  bottleMl: number;
  breastCount: number;
  diaperCount: number;
  feedingCount: number;
  sleepMinutes: number;
};

type SummaryTotalCardsProps = {
  totals: SummaryTotals;
};

export function SummaryTotalCards({ totals }: SummaryTotalCardsProps) {
  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
      <div className="rounded-lg border border-[var(--border-soft)] bg-[var(--surface)] p-4 shadow-sm">
        <p className="text-sm text-[#766e66]">喂养合计</p>
        <p className="mt-2 text-2xl font-semibold text-[#37413d]">
          {totals.feedingCount}次
        </p>
        <p className="mt-1 text-xs text-[#766e66]">
          瓶喂 {totals.bottleCount} 次 / 母乳 {totals.breastCount} 次
        </p>
      </div>
      <div className="rounded-lg border border-[var(--border-soft)] bg-[var(--surface)] p-4 shadow-sm">
        <p className="text-sm text-[#766e66]">瓶喂总量</p>
        <p className="mt-2 text-2xl font-semibold text-[#37413d]">
          {totals.bottleMl} ml
        </p>
      </div>
      <div className="rounded-lg border border-[var(--border-soft)] bg-[var(--surface)] p-4 shadow-sm">
        <p className="text-sm text-[#766e66]">尿布合计</p>
        <p className="mt-2 text-2xl font-semibold text-[#37413d]">
          {totals.diaperCount}次
        </p>
      </div>
      <div className="rounded-lg border border-[var(--border-soft)] bg-[var(--surface)] p-4 shadow-sm">
        <p className="text-sm text-[#766e66]">睡眠合计</p>
        <p className="mt-2 text-2xl font-semibold text-[#37413d]">
          {formatSummarySleep(totals.sleepMinutes)}
        </p>
      </div>
    </div>
  );
}
