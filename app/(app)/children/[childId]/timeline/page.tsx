import Link from "next/link";
import { requireUser } from "@/lib/auth/guards";
import { addDays, toLocalDateString } from "@/lib/time";
import { getTimelineData } from "@/lib/timeline-data";
import { notFound } from "next/navigation";
import { TimelineRecordCard } from "@/components/timeline/timeline-record-card";
import { CalendarDays, ChevronLeft, ChevronRight } from "lucide-react";

type PageProps = {
  params: Promise<{ childId: string }>;
  searchParams?: Promise<{ date?: string; error?: string }>;
};

function isDateInput(value?: string) {
  return Boolean(value?.match(/^\d{4}-\d{2}-\d{2}$/));
}

function normalizeTimelineDate(query?: { date?: string }) {
  const today = toLocalDateString(new Date(), "Asia/Shanghai");

  if (!query?.date) {
    return {
      date: today,
    };
  }

  if (!isDateInput(query.date)) {
    return {
      date: today,
      error: "日期无效，已显示今天的记录。",
    };
  }

  return {
    date: query.date,
  };
}

export default async function TimelinePage({ params, searchParams }: PageProps) {
  const user = await requireUser();
  const { childId } = await params;
  const query = await searchParams;
  const selected = normalizeTimelineDate(query);
  const timeline = await getTimelineData(user.id, childId, {
    date: selected.date,
    timezone: process.env.FAMILY_TIMEZONE ?? "Asia/Shanghai",
  });

  if (!timeline) {
    notFound();
  }

  const previousDate = addDays(selected.date, -1);
  const nextDate = addDays(selected.date, 1);

  return (
    <section className="space-y-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-sm font-medium text-[var(--primary-strong)]">
            {timeline.child.name}
          </p>
          <h1 className="mt-1 text-2xl font-semibold text-[#37413d]">
            时间线
          </h1>
          <p className="mt-2 text-sm text-[#766e66]">
            查看并编辑指定日期的喂养、尿布和睡眠记录。
          </p>
        </div>
        <Link
          className="bc-focus-ring inline-flex min-h-11 items-center justify-center rounded border border-[var(--border-soft)] bg-[var(--surface)] px-4 text-sm font-medium text-[var(--foreground)]"
          href="/"
        >
          返回首页
        </Link>
      </div>

      <div className="rounded-lg border border-[var(--border-soft)] bg-[var(--surface)] px-3 py-3">
        <div className="grid gap-3 lg:grid-cols-[auto_1fr_auto] lg:items-center">
          <div className="grid grid-cols-3 gap-1 rounded-lg bg-[var(--surface-muted)] p-1">
            <Link
              className="bc-focus-ring inline-flex min-h-10 items-center justify-center gap-1 rounded-md px-3 text-sm font-medium text-[var(--foreground)]"
              href={`/children/${childId}/timeline?date=${previousDate}`}
            >
              <ChevronLeft aria-hidden="true" size={16} />
              上一天
            </Link>
            <Link
              className="bc-focus-ring inline-flex min-h-10 items-center justify-center rounded-md bg-[var(--surface)] px-3 text-sm font-semibold text-[var(--primary-strong)]"
              href={`/children/${childId}/timeline`}
            >
              今天
            </Link>
            <Link
              className="bc-focus-ring inline-flex min-h-10 items-center justify-center gap-1 rounded-md px-3 text-sm font-medium text-[var(--foreground)]"
              href={`/children/${childId}/timeline?date=${nextDate}`}
            >
              下一天
              <ChevronRight aria-hidden="true" size={16} />
            </Link>
          </div>
          <div className="text-center lg:text-left">
            <p className="text-xs font-medium text-[var(--text-muted)]">
              当前日期
            </p>
            <p className="mt-1 text-lg font-semibold text-[var(--foreground)]">
              {selected.date}
            </p>
          </div>
          <form className="flex flex-col gap-2 sm:flex-row sm:items-center" method="get">
            <label className="flex min-h-10 items-center gap-2 rounded-lg border border-[var(--border-soft)] bg-[var(--surface)] px-3">
              <CalendarDays
                aria-hidden="true"
                className="text-[var(--text-muted)]"
                size={18}
              />
              <span className="sr-only">选择日期</span>
              <input
                className="min-h-8 w-full bg-transparent text-sm text-[var(--foreground)] outline-none sm:w-36"
                defaultValue={selected.date}
                name="date"
                required
                type="date"
              />
            </label>
            <button className="bc-focus-ring min-h-10 rounded-lg bg-[var(--primary)] px-5 text-sm font-semibold text-white">
              查看
            </button>
          </form>
        </div>
      </div>

      {selected.error || query?.error ? (
        <p className="rounded border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
          {query?.error ?? selected.error}
        </p>
      ) : null}
      <div className="space-y-2">
        {timeline.timelineItems.map((item) => (
          <TimelineRecordCard
            childId={childId}
            item={item}
            key={`${item.kind}-${item.id}`}
            returnDate={selected.date}
          />
        ))}
        {timeline.timelineItems.length === 0 ? (
          <p className="rounded border border-slate-200 bg-white p-4 text-slate-600">
            这一天还没有记录。
          </p>
        ) : null}
      </div>
    </section>
  );
}
