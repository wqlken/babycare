import {
  addDays,
  getLocalDayRange,
  splitDurationByLocalDay,
} from "@/lib/time";

type FeedingSummaryInput = {
  type: "breast" | "bottle";
  startTime: Date;
  endTime: Date | null;
  amountMl: number | null;
};

type DiaperSummaryInput = {
  time: Date;
  type: "wet" | "dirty" | "both";
};

type SleepSummaryInput = {
  startTime: Date;
  endTime: Date | null;
};

export type DaySummary = {
  date: string;
  feedingCount: number;
  bottleCount: number;
  breastCount: number;
  breastMinutes: number;
  bottleMl: number;
  diaperCount: number;
  sleepMinutes: number;
};

export type SummaryInput = {
  date: string;
  timezone?: string;
  feedings: FeedingSummaryInput[];
  diapers: DiaperSummaryInput[];
  sleeps: SleepSummaryInput[];
};

export type DateRangeSummaryInput = {
  startDate: string;
  endDate: string;
  timezone?: string;
  feedings: FeedingSummaryInput[];
  diapers: DiaperSummaryInput[];
  sleeps: SleepSummaryInput[];
};

function isWithinRange(date: Date, start: Date, end: Date) {
  return date >= start && date < end;
}

export function hasSummaryRecords(summary: DaySummary) {
  return (
    summary.feedingCount > 0 ||
    summary.diaperCount > 0 ||
    summary.sleepMinutes > 0
  );
}

export function summarizeDay(input: SummaryInput): DaySummary {
  const timezone = input.timezone ?? "Asia/Shanghai";
  const range = getLocalDayRange(input.date, timezone);

  const feedings = input.feedings.filter((feeding) =>
    isWithinRange(feeding.endTime ?? feeding.startTime, range.start, range.end),
  );
  const diapers = input.diapers.filter((diaper) =>
    isWithinRange(diaper.time, range.start, range.end),
  );
  const breastMinutes = input.feedings.reduce((total, feeding) => {
    if (feeding.type !== "breast" || !feeding.endTime) {
      return total;
    }

    const split = splitDurationByLocalDay({
      start: feeding.startTime,
      end: feeding.endTime,
      timezone,
    });
    const dayPart = split.find((part) => part.date === input.date);

    return total + (dayPart?.minutes ?? 0);
  }, 0);
  const sleepMinutes = input.sleeps.reduce((total, sleep) => {
    if (!sleep.endTime) {
      return total;
    }

    const split = splitDurationByLocalDay({
      start: sleep.startTime,
      end: sleep.endTime,
      timezone,
    });
    const dayPart = split.find((part) => part.date === input.date);

    return total + (dayPart?.minutes ?? 0);
  }, 0);

  return {
    date: input.date,
    feedingCount: feedings.length,
    bottleCount: feedings.filter((feeding) => feeding.type === "bottle").length,
    breastCount: feedings.filter((feeding) => feeding.type === "breast").length,
    breastMinutes,
    bottleMl: feedings.reduce(
      (total, feeding) => total + (feeding.amountMl ?? 0),
      0,
    ),
    diaperCount: diapers.length,
    sleepMinutes,
  };
}

export function buildSevenDaySummary(input: {
  endDate: string;
  timezone?: string;
  feedings: FeedingSummaryInput[];
  diapers: DiaperSummaryInput[];
  sleeps: SleepSummaryInput[];
}) {
  return buildDateRangeSummary({
    startDate: addDays(input.endDate, -6),
    endDate: input.endDate,
    timezone: input.timezone,
    feedings: input.feedings,
    diapers: input.diapers,
    sleeps: input.sleeps,
  });
}

export function buildDateRangeSummary(input: DateRangeSummaryInput) {
  if (input.startDate > input.endDate) {
    throw new Error("开始日期不能晚于结束日期。");
  }

  const summaries: DaySummary[] = [];
  let currentDate = input.startDate;

  while (currentDate <= input.endDate) {
    summaries.push(
      summarizeDay({
        date: currentDate,
        timezone: input.timezone,
        feedings: input.feedings,
        diapers: input.diapers,
        sleeps: input.sleeps,
      }),
    );
    currentDate = addDays(currentDate, 1);
  }

  return summaries;
}

export function buildBottleProgress(input: {
  currentMl: number;
  targetMl: number;
}) {
  const targetMl = Math.max(1, Math.round(input.targetMl));
  const currentMl = Math.max(0, Math.round(input.currentMl));

  return {
    currentMl,
    targetMl,
    percent: Math.min(100, Math.round((currentMl / targetMl) * 100)),
  };
}

export function buildBottleTrend(summaries: DaySummary[]) {
  const maxMl = Math.max(1, ...summaries.map((summary) => summary.bottleMl));

  return summaries.map((summary) => ({
    date: summary.date,
    amountMl: summary.bottleMl,
    percent: Math.round((summary.bottleMl / maxMl) * 100),
  }));
}
