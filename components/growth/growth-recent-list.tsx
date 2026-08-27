import type { GrowthRecordItem } from "@/lib/growth/service";
import { formatGrowthRecordSummary } from "@/lib/growth/view-model";

type GrowthRecentListProps = {
  records: GrowthRecordItem[];
};

const dateTimeFormatter = new Intl.DateTimeFormat("zh-CN", {
  month: "2-digit",
  day: "2-digit",
  hour: "2-digit",
  minute: "2-digit",
  hourCycle: "h23",
});

export function GrowthRecentList({ records }: GrowthRecentListProps) {
  return (
    <div className="bc-card p-4">
      <div className="flex items-center justify-between gap-4">
        <h2 className="text-lg font-semibold text-[var(--foreground)]">
          最近测量
        </h2>
        <p className="text-sm text-[var(--text-muted)]">
          最近 {records.length} 条
        </p>
      </div>
      {records.length > 0 ? (
        <div className="mt-4 divide-y divide-[var(--border-soft)]">
          {records.map((record) => (
            <div
              className="flex flex-col gap-1 py-3 sm:flex-row sm:items-center sm:justify-between"
              key={record.id}
            >
              <div>
                <p className="font-medium text-[var(--foreground)]">
                  {formatGrowthRecordSummary(record)}
                </p>
                {record.notes ? (
                  <p className="mt-1 text-sm text-[var(--text-muted)]">
                    {record.notes}
                  </p>
                ) : null}
              </div>
              <p className="text-sm text-[var(--text-muted)]">
                {dateTimeFormatter.format(record.measuredAt)}
              </p>
            </div>
          ))}
        </div>
      ) : (
        <p className="mt-4 rounded-lg bg-[var(--surface-muted)] px-4 py-8 text-center text-sm text-[var(--text-muted)]">
          暂无测量记录。
        </p>
      )}
    </div>
  );
}
