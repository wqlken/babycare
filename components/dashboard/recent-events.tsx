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

export function RecentEvents({ childId, items }: RecentEventsProps) {
  return (
    <section className="space-y-3">
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-lg font-semibold text-slate-950">最近记录</h2>
        <Link
          className="text-sm font-medium text-sky-700"
          href={`/children/${childId}/timeline`}
        >
          查看全部
        </Link>
      </div>
      <div className="space-y-2">
        {items.map((item) => (
          <article
            className="rounded border border-slate-200 bg-white px-4 py-3"
            key={`${item.kind}-${item.id}`}
          >
            <div className="flex items-center justify-between gap-4">
              <div className="min-w-0">
                <p className="truncate font-medium text-slate-950">{item.title}</p>
                <p className="text-sm text-slate-500">{item.creatorDisplayName}</p>
              </div>
              <time className="shrink-0 text-sm text-slate-500">
                {formatTime(item.time)}
              </time>
            </div>
          </article>
        ))}
        {items.length === 0 ? (
          <p className="rounded border border-slate-200 bg-white px-4 py-3 text-sm text-slate-600">
            今天还没有记录。
          </p>
        ) : null}
      </div>
    </section>
  );
}
