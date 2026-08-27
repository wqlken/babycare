import { hasSummaryRecords, type DaySummary } from "@/lib/summaries";
import { addDays, toLocalDateString } from "@/lib/time";

const MAX_SUMMARY_DAYS = 31;

export type NormalizedDateRange = {
  endDate: string;
  error?: string;
  includeEmpty: boolean;
  startDate: string;
};

export type SummaryRangeQuery = {
  endDate?: string;
  includeEmpty?: string;
  startDate?: string;
};

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

export function normalizeSummaryDateRange(
  query?: SummaryRangeQuery,
): NormalizedDateRange {
  const today = toLocalDateString(new Date(), "Asia/Shanghai");
  const defaultStartDate = addDays(today, -6);
  const includeEmpty = query?.includeEmpty === "1";
  const defaultRange = {
    startDate: defaultStartDate,
    endDate: today,
    includeEmpty,
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
      includeEmpty,
      error: "当前最多支持查看 31 天，已按结束日期显示最近 31 天。",
    };
  }

  return {
    startDate,
    endDate,
    includeEmpty,
  };
}

export function formatSummarySleep(minutes: number) {
  const hours = Math.floor(minutes / 60);
  const rest = minutes % 60;

  if (hours === 0) return `${rest}分`;
  return rest ? `${hours}小时${rest}分` : `${hours}小时`;
}

export function buildSummaryRangeTotals(summaries: DaySummary[]) {
  return summaries.reduce(
    (total, summary) => ({
      feedingCount: total.feedingCount + summary.feedingCount,
      bottleCount: total.bottleCount + summary.bottleCount,
      breastCount: total.breastCount + summary.breastCount,
      breastMinutes: total.breastMinutes + summary.breastMinutes,
      bottleMl: total.bottleMl + summary.bottleMl,
      diaperCount: total.diaperCount + summary.diaperCount,
      sleepMinutes: total.sleepMinutes + summary.sleepMinutes,
    }),
    {
      feedingCount: 0,
      bottleCount: 0,
      breastCount: 0,
      breastMinutes: 0,
      bottleMl: 0,
      diaperCount: 0,
      sleepMinutes: 0,
    },
  );
}

export function filterVisibleSummaries(input: {
  includeEmpty: boolean;
  summaries: DaySummary[];
}) {
  return input.includeEmpty
    ? input.summaries
    : input.summaries.filter(hasSummaryRecords);
}
