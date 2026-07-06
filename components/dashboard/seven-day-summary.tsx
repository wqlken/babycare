import type { DaySummary } from "@/lib/summaries";
import Link from "next/link";

type SevenDaySummaryProps = {
  summaries: DaySummary[];
  title?: string;
  actionHref?: string;
  actionLabel?: string;
};

function formatSleep(minutes: number) {
  const hours = Math.floor(minutes / 60);
  const rest = minutes % 60;

  if (hours === 0) return `${rest}分`;
  return rest ? `${hours}小时${rest}分` : `${hours}小时`;
}

function formatDate(date: string) {
  return date.slice(5).replace("-", "/");
}

export function SevenDaySummary({
  summaries,
  title = "近 7 日汇总",
  actionHref,
  actionLabel = "查看历史汇总",
}: SevenDaySummaryProps) {
  return (
    <section className="space-y-3">
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-lg font-semibold text-[#37413d]">{title}</h2>
        {actionHref ? (
          <Link
            className="bc-focus-ring rounded border border-[var(--border-soft)] bg-[var(--surface)] px-3 py-2 text-sm font-medium text-[var(--foreground)]"
            href={actionHref}
          >
            {actionLabel}
          </Link>
        ) : null}
      </div>
      <div className="overflow-x-auto rounded-lg border border-[var(--border-soft)] bg-[var(--surface)] shadow-sm">
        <table className="min-w-full text-left text-sm">
          <thead className="bg-[#f3eee7] text-[#7b7168]">
            <tr>
              <th className="px-3 py-2 font-medium">日期</th>
              <th className="px-3 py-2 font-medium">喂养</th>
              <th className="px-3 py-2 font-medium">瓶喂</th>
              <th className="px-3 py-2 font-medium">尿布</th>
              <th className="px-3 py-2 font-medium">睡眠</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#eee5dc]">
            {summaries.map((summary) => (
              <tr key={summary.date}>
                <td className="px-3 py-2 text-[#766e66]">
                  {formatDate(summary.date)}
                </td>
                <td className="px-3 py-2 text-[#37413d]">
                  <span className="font-medium">{summary.feedingCount}次</span>
                  <span className="ml-1 whitespace-nowrap text-xs text-[#766e66]">
                    瓶{summary.bottleCount}/母{summary.breastCount}
                  </span>
                </td>
                <td className="px-3 py-2 text-[#37413d]">
                  {summary.bottleMl} ml
                </td>
                <td className="px-3 py-2 text-[#37413d]">
                  {summary.diaperCount}次
                </td>
                <td className="px-3 py-2 text-[#37413d]">
                  {formatSleep(summary.sleepMinutes)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
