import {
  buildBottleProgress,
  buildBottleTrend,
  type DaySummary,
} from "@/lib/summaries";

type BottleInsightsProps = {
  today: DaySummary;
  summaries: DaySummary[];
  targetMl?: number;
};

function formatDate(date: string) {
  return date.slice(5).replace("-", "/");
}

export function BottleInsights({
  today,
  summaries,
  targetMl = 800,
}: BottleInsightsProps) {
  const progress = buildBottleProgress({
    currentMl: today.bottleMl,
    targetMl,
  });
  const trend = buildBottleTrend(summaries);
  const circumference = 2 * Math.PI * 42;
  const dashOffset = circumference * (1 - progress.percent / 100);

  return (
    <section className="grid gap-3 md:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
      <div className="rounded-lg border border-[var(--border-soft)] bg-[var(--surface)] p-4 shadow-sm">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h2 className="text-base font-semibold text-[#37413d]">
              今日奶量进度
            </h2>
            <p className="mt-1 text-sm text-[#7b7168]">
              {progress.currentMl} / {progress.targetMl} ml
            </p>
          </div>
          <div className="relative h-28 w-28 shrink-0">
            <svg className="h-28 w-28 -rotate-90" viewBox="0 0 100 100">
              <circle
                cx="50"
                cy="50"
                fill="none"
                r="42"
                stroke="var(--primary-soft)"
                strokeWidth="10"
              />
              <circle
                cx="50"
                cy="50"
                fill="none"
                r="42"
                stroke="var(--primary)"
                strokeDasharray={circumference}
                strokeDashoffset={dashOffset}
                strokeLinecap="round"
                strokeWidth="10"
              />
            </svg>
            <div className="absolute inset-0 grid place-items-center text-xl font-semibold text-[#425b55]">
              {progress.percent}%
            </div>
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
