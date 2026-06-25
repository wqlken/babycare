import type { DaySummary } from "@/lib/summaries";

type SummaryCardsProps = {
  summary: DaySummary;
};

export function SummaryCards({ summary }: SummaryCardsProps) {
  const cards = [
    { label: "今日喂养", value: `${summary.feedingCount}次` },
    { label: "瓶喂总量", value: `${summary.bottleMl} ml` },
    { label: "今日尿布", value: `${summary.diaperCount}次` },
    { label: "睡眠总计", value: `${Math.round(summary.sleepMinutes / 60)}小时` },
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
