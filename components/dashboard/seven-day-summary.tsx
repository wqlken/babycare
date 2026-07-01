import type { DaySummary } from "@/lib/summaries";

type SevenDaySummaryProps = {
  summaries: DaySummary[];
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

export function SevenDaySummary({ summaries }: SevenDaySummaryProps) {
  return (
    <section className="space-y-3">
      <h2 className="text-lg font-semibold text-slate-950">近 7 日汇总</h2>
      <div className="overflow-x-auto rounded border border-slate-200 bg-white">
        <table className="min-w-full text-left text-sm">
          <thead className="bg-slate-50 text-slate-500">
            <tr>
              <th className="px-3 py-2 font-medium">日期</th>
              <th className="px-3 py-2 font-medium">喂养</th>
              <th className="px-3 py-2 font-medium">瓶喂</th>
              <th className="px-3 py-2 font-medium">尿布</th>
              <th className="px-3 py-2 font-medium">睡眠</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {summaries.map((summary) => (
              <tr key={summary.date}>
                <td className="px-3 py-2 text-slate-700">
                  {formatDate(summary.date)}
                </td>
                <td className="px-3 py-2 text-slate-950">
                  {summary.feedingCount}次
                </td>
                <td className="px-3 py-2 text-slate-950">
                  {summary.bottleMl} ml
                </td>
                <td className="px-3 py-2 text-slate-950">
                  {summary.diaperCount}次
                </td>
                <td className="px-3 py-2 text-slate-950">
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
