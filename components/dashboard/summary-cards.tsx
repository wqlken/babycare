import type { DaySummary } from "@/lib/summaries";

type SummaryCardsProps = {
  summary: DaySummary;
  lastFeedingAt?: Date | null;
  lastDiaperAt?: Date | null;
  lastSleepAt?: Date | null;
};

function formatSince(date?: Date | null) {
  if (!date) return "暂无";

  const minutes = Math.max(0, Math.round((Date.now() - date.getTime()) / 60_000));
  if (minutes < 60) return `${minutes}分钟前`;

  const hours = Math.floor(minutes / 60);
  const rest = minutes % 60;
  return rest ? `${hours}小时${rest}分钟前` : `${hours}小时前`;
}

export function SummaryCards({
  summary,
  lastFeedingAt,
  lastDiaperAt,
  lastSleepAt,
}: SummaryCardsProps) {
  const cards = [
    { label: "今日喂养", value: `${summary.feedingCount}次` },
    { label: "瓶喂总量", value: `${summary.bottleMl} ml` },
    { label: "今日尿布", value: `${summary.diaperCount}次` },
    { label: "睡眠总计", value: `${Math.round(summary.sleepMinutes / 60)}小时` },
    { label: "上次喂养", value: formatSince(lastFeedingAt) },
    { label: "上次尿布", value: formatSince(lastDiaperAt) },
    { label: "上次睡眠", value: formatSince(lastSleepAt) },
  ];

  return (
    <div className="grid grid-cols-2 gap-3">
      {cards.map((card) => (
        <div className="rounded border border-slate-200 bg-white p-4" key={card.label}>
          <p className="text-sm text-slate-500">{card.label}</p>
          <p className="mt-2 text-2xl font-semibold text-slate-950">
            {card.value}
          </p>
        </div>
      ))}
    </div>
  );
}
