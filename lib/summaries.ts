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

function isWithinRange(date: Date, start: Date, end: Date) {
  return date >= start && date < end;
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
  return Array.from({ length: 7 }, (_, index) => {
    const date = addDays(input.endDate, index - 6);

    return summarizeDay({
      date,
      timezone: input.timezone,
      feedings: input.feedings,
      diapers: input.diapers,
      sleeps: input.sleeps,
    });
  });
}
