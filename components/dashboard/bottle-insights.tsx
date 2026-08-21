import { buildBottleTrend, type DaySummary } from "@/lib/summaries";

type BottleInsightsProps = {
  today: DaySummary;
  summaries: DaySummary[];
};

function formatDate(date: string) {
  return date.slice(5).replace("-", "/");
}

function formatDuration(minutes: number) {
  const hours = Math.floor(minutes / 60);
  const rest = minutes % 60;

  if (hours === 0) return `${rest} 分钟`;
  return rest ? `${hours}小时${rest}分钟` : `${hours}小时`;
}

export function BottleInsights({ today, summaries }: BottleInsightsProps) {
  const trend = buildBottleTrend(summaries);

  return (
    <section className="grid gap-3 md:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
      <div className="rounded-lg border border-[var(--border-soft)] bg-[var(--surface)] p-4 shadow-sm">
        <h2 className="text-base font-semibold text-[#37413d]">
          今日喂养概览
        </h2>
        <div className="mt-4 grid grid-cols-2 gap-3">
          <div className="rounded-lg bg-[var(--accent-feeding-soft)] p-3">
            <p className="text-sm text-[#7b7168]">瓶喂总量</p>
            <p className="mt-2 text-2xl font-semibold text-[#425b55]">
              {today.bottleMl} ml
            </p>
            <p className="mt-1 text-xs text-[#7b7168]">
              {today.bottleCount} 次瓶喂
            </p>
          </div>
          <div className="rounded-lg bg-[var(--surface-muted)] p-3">
            <p className="text-sm text-[#7b7168]">母乳次数</p>
            <p className="mt-2 text-2xl font-semibold text-[#37413d]">
              {today.breastCount} 次
            </p>
            <p className="mt-1 text-xs text-[#7b7168]">
              母乳总时长 {formatDuration(today.breastMinutes)}
            </p>
          </div>
        </div>
      </div>
      <div className="rounded-lg border border-[var(--border-soft)] bg-[var(--surface)] p-4 shadow-sm">
        <h2 className="text-base font-semibold text-[#37413d]">近 7 日瓶喂趋势</h2>
        <div className="mt-4 flex h-32 items-end gap-2">
          {trend.map((point) => (
            <div
              className="flex min-w-0 flex-1 flex-col items-center gap-2"
              key={point.date}
            >
              <div className="flex h-20 w-full items-end rounded bg-[#f3eee7] px-1">
                <div
                  aria-label={`${formatDate(point.date)} ${point.amountMl} ml`}
                  className="w-full rounded bg-[var(--accent)]"
                  style={{ height: `${Math.max(8, point.percent)}%` }}
                  title={`${point.amountMl} ml`}
                />
              </div>
              <span className="text-[11px] text-[#7b7168]">
                {formatDate(point.date)}
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
