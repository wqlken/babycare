import Link from "next/link";
import type { TimelineItem } from "@/lib/timeline";

type RecentEventsProps = {
  childId: string;
  items: TimelineItem[];
};

function formatTime(date: Date) {
  return new Intl.DateTimeFormat("zh-CN", {
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "Asia/Shanghai",
  }).format(date);
}

function formatItemTime(item: TimelineItem) {
  const start = formatTime(item.displayStartTime);

  if (item.feedingType === "breast" || item.kind === "sleep") {
    if (item.displayEndTime) {
      return `${start}-${formatTime(item.displayEndTime)}`;
    }

    return `${start} 开始`;
  }

  return start;
}

function formatDuration(minutes?: number) {
  if (minutes === undefined) return null;
  if (minutes < 1) return "不足1分钟";

  const hours = Math.floor(minutes / 60);
  const rest = minutes % 60;

  if (hours === 0) return `${rest}分钟`;
  return rest ? `${hours}小时${rest}分钟` : `${hours}小时`;
}

function getDetailText(item: TimelineItem) {
  if (item.feedingType !== "breast") {
    return item.creatorDisplayName;
  }

  const duration = formatDuration(item.durationMinutes);
  const durationText = item.displayEndTime
    ? duration
    : duration
      ? `进行中 · 已喂${duration}`
      : "进行中";

  return [durationText, item.creatorDisplayName].filter(Boolean).join(" · ");
}

export function RecentEvents({ childId, items }: RecentEventsProps) {
  return (
    <section className="space-y-3">
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-lg font-semibold text-[#37413d]">最近记录</h2>
        <Link
          className="text-sm font-medium text-[var(--primary-strong)]"
          href={`/children/${childId}/timeline`}
        >
          查看全部
        </Link>
      </div>
      <div className="space-y-2">
        {items.map((item) => (
          <article
            className="rounded-lg border border-[var(--border-soft)] bg-[var(--surface)] px-4 py-3 shadow-sm"
            key={`${item.kind}-${item.id}`}
          >
            <div className="flex items-center justify-between gap-4">
              <div className="min-w-0">
                <p className="truncate font-medium text-[#37413d]">{item.title}</p>
                <p className="text-sm text-[#7b7168]">{getDetailText(item)}</p>
              </div>
              <time className="shrink-0 text-sm text-[#7b7168]">
                {formatItemTime(item)}
              </time>
            </div>
          </article>
        ))}
        {items.length === 0 ? (
          <p className="rounded-lg border border-[var(--border-soft)] bg-[var(--surface)] px-4 py-3 text-sm text-[#766e66]">
            今天还没有记录。
          </p>
        ) : null}
      </div>
    </section>
  );
}
