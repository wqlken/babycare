import Link from "next/link";
import { notFound } from "next/navigation";
import { SevenDaySummary } from "@/components/dashboard/seven-day-summary";
import { requireUser } from "@/lib/auth/guards";
import { getChildSummaryData } from "@/lib/dashboard";
import type { DaySummary } from "@/lib/summaries";
import { addDays, toLocalDateString } from "@/lib/time";

type PageProps = {
  params: Promise<{ childId: string }>;
  searchParams?: Promise<{
    endDate?: string;
    startDate?: string;
  }>;
};

const MAX_SUMMARY_DAYS = 31;

function isDateInput(value?: string) {
  return Boolean(value?.match(/^\d{4}-\d{2}-\d{2}$/));
}

function countInclusiveDays(startDate: string, endDate: string) {
  let days = 1;
  let currentDate = startDate;

  while (currentDate < endDate) {
    currentDate = addDays(currentDate, 1);
    days += 1;
  }

  return days;
}

type NormalizedDateRange = {
  endDate: string;
  error?: string;
  startDate: string;
};

function normalizeDateRange(query?: {
  endDate?: string;
  startDate?: string;
}): NormalizedDateRange {
  const today = toLocalDateString(new Date(), "Asia/Shanghai");
  const defaultStartDate = addDays(today, -6);
  const defaultRange = {
    startDate: defaultStartDate,
    endDate: today,
  };

  if (!query?.startDate && !query?.endDate) {
    return defaultRange;
  }

  if (!isDateInput(query.startDate) || !isDateInput(query.endDate)) {
    return {
      ...defaultRange,
      error: "请选择有效的开始日期和结束日期。",
    };
  }

  const startDate = query.startDate!;
  const endDate = query.endDate!;

  if (startDate > endDate) {
    return {
      ...defaultRange,
      error: "开始日期不能晚于结束日期，已显示近 7 日汇总。",
    };
  }

  if (countInclusiveDays(startDate, endDate) > MAX_SUMMARY_DAYS) {
    return {
      startDate: addDays(endDate, -(MAX_SUMMARY_DAYS - 1)),
      endDate,
      error: "当前最多支持查看 31 天，已按结束日期显示最近 31 天。",
    };
  }

  return {
    startDate,
    endDate,
  };
}

function formatSleep(minutes: number) {
  const hours = Math.floor(minutes / 60);
  const rest = minutes % 60;

  if (hours === 0) return `${rest}分`;
  return rest ? `${hours}小时${rest}分` : `${hours}小时`;
}

function buildRangeTotals(summaries: DaySummary[]) {
  return summaries.reduce(
    (total, summary) => ({
      feedingCount: total.feedingCount + summary.feedingCount,
      bottleCount: total.bottleCount + summary.bottleCount,
      breastCount: total.breastCount + summary.breastCount,
      bottleMl: total.bottleMl + summary.bottleMl,
      diaperCount: total.diaperCount + summary.diaperCount,
      sleepMinutes: total.sleepMinutes + summary.sleepMinutes,
    }),
    {
      feedingCount: 0,
      bottleCount: 0,
      breastCount: 0,
      bottleMl: 0,
      diaperCount: 0,
      sleepMinutes: 0,
    },
  );
}

export default async function SummaryPage({ params, searchParams }: PageProps) {
  const user = await requireUser();
  const [{ childId }, query] = await Promise.all([params, searchParams]);
  const range = normalizeDateRange(query);
  const data = await getChildSummaryData(user.id, childId, {
    startDate: range.startDate,
    endDate: range.endDate,
  });

  if (!data) {
    notFound();
  }

  const totals = buildRangeTotals(data.summaries);

  return (
    <section className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-sm font-medium text-[var(--primary-strong)]">
            {data.child.name}
          </p>
          <h1 className="mt-1 text-2xl font-semibold text-[#37413d]">
            历史汇总
          </h1>
          <p className="mt-2 text-sm text-[#766e66]">
            按日期范围查看喂养、尿布和睡眠的每日汇总。
          </p>
        </div>
        <Link
          className="bc-focus-ring inline-flex min-h-11 items-center justify-center rounded border border-[var(--border-soft)] bg-[var(--surface)] px-4 text-sm font-medium text-[var(--foreground)]"
          href="/"
        >
          返回首页
        </Link>
      </div>

      <form
        className="grid gap-3 rounded-lg border border-[var(--border-soft)] bg-[var(--surface)] p-4 shadow-sm sm:grid-cols-[1fr_1fr_auto]"
        method="get"
      >
        <label className="block">
          <span className="text-sm font-medium text-[#766e66]">开始日期</span>
          <input
            className="mt-2 min-h-11 w-full rounded border border-[var(--border-soft)] bg-[var(--surface)] px-3 text-[var(--foreground)]"
            defaultValue={range.startDate}
            name="startDate"
            required
            type="date"
          />
        </label>
        <label className="block">
          <span className="text-sm font-medium text-[#766e66]">结束日期</span>
          <input
            className="mt-2 min-h-11 w-full rounded border border-[var(--border-soft)] bg-[var(--surface)] px-3 text-[var(--foreground)]"
            defaultValue={range.endDate}
            name="endDate"
            required
            type="date"
          />
        </label>
        <button className="bc-focus-ring min-h-11 self-end rounded bg-[var(--primary)] px-5 text-sm font-semibold text-white">
          查看汇总
        </button>
      </form>

      {range.error ? (
        <p className="rounded border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-800">
          {range.error}
        </p>
      ) : null}

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-lg border border-[var(--border-soft)] bg-[var(--surface)] p-4 shadow-sm">
          <p className="text-sm text-[#766e66]">喂养合计</p>
          <p className="mt-2 text-2xl font-semibold text-[#37413d]">
            {totals.feedingCount}次
          </p>
          <p className="mt-1 text-xs text-[#766e66]">
            瓶喂 {totals.bottleCount} 次 / 母乳 {totals.breastCount} 次
          </p>
        </div>
        <div className="rounded-lg border border-[var(--border-soft)] bg-[var(--surface)] p-4 shadow-sm">
          <p className="text-sm text-[#766e66]">瓶喂总量</p>
          <p className="mt-2 text-2xl font-semibold text-[#37413d]">
            {totals.bottleMl} ml
          </p>
        </div>
        <div className="rounded-lg border border-[var(--border-soft)] bg-[var(--surface)] p-4 shadow-sm">
          <p className="text-sm text-[#766e66]">尿布合计</p>
          <p className="mt-2 text-2xl font-semibold text-[#37413d]">
            {totals.diaperCount}次
          </p>
        </div>
        <div className="rounded-lg border border-[var(--border-soft)] bg-[var(--surface)] p-4 shadow-sm">
          <p className="text-sm text-[#766e66]">睡眠合计</p>
          <p className="mt-2 text-2xl font-semibold text-[#37413d]">
            {formatSleep(totals.sleepMinutes)}
          </p>
        </div>
      </div>

      <SevenDaySummary
        summaries={data.summaries}
        title={`${range.startDate} 至 ${range.endDate}`}
      />
    </section>
  );
}
