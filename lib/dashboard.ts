import { prisma } from "@/lib/db";
import { buildDayRhythm } from "@/lib/day-rhythm";
import {
  buildDateRangeSummary,
  buildSevenDaySummary,
  summarizeDay,
} from "@/lib/summaries";
import { addDays, getLocalDayRange, toLocalDateString } from "@/lib/time";
import { buildTimelineItems } from "@/lib/timeline";
import { getAccessibleChild } from "@/lib/children/service";

type DashboardFeeding = {
  id: string;
  type: "breast" | "bottle";
  breastSide: "left" | "right" | "both" | "unknown" | null;
  startTime: Date;
  endTime: Date | null;
  amountMl: number | null;
  bottleContent: "formula" | "expressed_breast_milk" | "mixed" | "other" | "unknown" | null;
  creatorDisplayName: string;
  notes: string | null;
  createdAt: Date;
  updatedAt: Date;
};

type DashboardDiaper = {
  id: string;
  type: "wet" | "dirty" | "both";
  stoolColor: "yellow" | "brown" | "green" | "black" | "red" | "white" | "other" | "unknown" | null;
  stoolConsistency: "watery" | "loose" | "soft" | "formed" | "hard" | "mucousy" | "other" | "unknown" | null;
  time: Date;
  creatorDisplayName: string;
  notes: string | null;
  createdAt: Date;
  updatedAt: Date;
};

type DashboardSleep = {
  id: string;
  startTime: Date;
  endTime: Date | null;
  creatorDisplayName: string;
  notes: string | null;
  createdAt: Date;
  updatedAt: Date;
};

export async function getDashboardData(userId: string, childId: string) {
  const child = await getAccessibleChild(userId, childId);

  if (!child) {
    return null;
  }

  const today = toLocalDateString(new Date(), "Asia/Shanghai");
  const startDate = addDays(today, -6);
  const rangeStart = getLocalDayRange(startDate, "Asia/Shanghai").start;
  const rangeEnd = getLocalDayRange(addDays(today, 1), "Asia/Shanghai").start;

  const [feedings, diapers, sleeps]: [
    DashboardFeeding[],
    DashboardDiaper[],
    DashboardSleep[],
  ] = await Promise.all([
    prisma.feedingRecord.findMany({
      where: {
        childId,
        deletedAt: null,
        startTime: {
          gte: rangeStart,
          lt: rangeEnd,
        },
      },
      orderBy: { startTime: "desc" },
    }),
    prisma.diaperRecord.findMany({
      where: {
        childId,
        deletedAt: null,
        time: {
          gte: rangeStart,
          lt: rangeEnd,
        },
      },
      orderBy: { time: "desc" },
    }),
    prisma.sleepRecord.findMany({
      where: {
        childId,
        deletedAt: null,
        startTime: {
          gte: rangeStart,
          lt: rangeEnd,
        },
      },
      orderBy: { startTime: "desc" },
    }),
  ]);

  const summary = summarizeDay({
    date: today,
    timezone: "Asia/Shanghai",
    feedings,
    diapers,
    sleeps,
  });

  return {
    child,
    summary,
    lastFeedingAt:
      feedings
        .filter((feeding) => feeding.endTime || feeding.type === "bottle")
        .map((feeding) => feeding.endTime ?? feeding.startTime)
        .sort((left, right) => right.getTime() - left.getTime())[0] ?? null,
    lastDiaperAt: diapers[0]?.time ?? null,
    lastSleepAt:
      sleeps
        .filter((sleep) => sleep.endTime)
        .map((sleep) => sleep.endTime ?? sleep.startTime)
        .sort((left, right) => right.getTime() - left.getTime())[0] ?? null,
    activeBreastfeeding:
      feedings.find((feeding) => feeding.type === "breast" && !feeding.endTime) ??
      null,
    activeSleep: sleeps.find((sleep) => !sleep.endTime) ?? null,
    timelineItems: buildTimelineItems({ feedings, diapers, sleeps }).slice(0, 8),
    dayRhythm: buildDayRhythm({
      date: today,
      timezone: "Asia/Shanghai",
      feedings,
      diapers,
      sleeps,
    }),
    sevenDaySummary: buildSevenDaySummary({
      endDate: today,
      timezone: "Asia/Shanghai",
      feedings,
      diapers,
      sleeps,
    }),
  };
}

export async function getChildSummaryData(
  userId: string,
  childId: string,
  input: {
    startDate: string;
    endDate: string;
  },
) {
  const child = await getAccessibleChild(userId, childId);

  if (!child) {
    return null;
  }

  const rangeStart = getLocalDayRange(input.startDate, "Asia/Shanghai").start;
  const rangeEnd = getLocalDayRange(
    addDays(input.endDate, 1),
    "Asia/Shanghai",
  ).start;

  const [feedings, diapers, sleeps]: [
    DashboardFeeding[],
    DashboardDiaper[],
    DashboardSleep[],
  ] = await Promise.all([
    prisma.feedingRecord.findMany({
      where: {
        childId,
        deletedAt: null,
        OR: [
          {
            endTime: {
              gte: rangeStart,
              lt: rangeEnd,
            },
          },
          {
            endTime: null,
            startTime: {
              gte: rangeStart,
              lt: rangeEnd,
            },
          },
        ],
      },
      orderBy: { startTime: "desc" },
    }),
    prisma.diaperRecord.findMany({
      where: {
        childId,
        deletedAt: null,
        time: {
          gte: rangeStart,
          lt: rangeEnd,
        },
      },
      orderBy: { time: "desc" },
    }),
    prisma.sleepRecord.findMany({
      where: {
        childId,
        deletedAt: null,
        endTime: {
          not: null,
          gt: rangeStart,
        },
        startTime: {
          lt: rangeEnd,
        },
      },
      orderBy: { startTime: "desc" },
    }),
  ]);

  return {
    child,
    summaries: buildDateRangeSummary({
      startDate: input.startDate,
      endDate: input.endDate,
      timezone: "Asia/Shanghai",
      feedings,
      diapers,
      sleeps,
    }),
  };
}
