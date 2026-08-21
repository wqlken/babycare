import { getAccessibleChild } from "@/lib/children/service";
import { prisma } from "@/lib/db";
import { getLocalDayRange } from "@/lib/time";
import { buildTimelineItems } from "@/lib/timeline";

type TimelineFeeding = {
  id: string;
  type: "breast" | "bottle";
  breastSide: "left" | "right" | "both" | "unknown" | null;
  startTime: Date;
  endTime: Date | null;
  amountMl: number | null;
  bottleContent:
    | "formula"
    | "expressed_breast_milk"
    | "mixed"
    | "other"
    | "unknown"
    | null;
  creatorDisplayName: string;
  notes: string | null;
  createdAt: Date;
  updatedAt: Date;
};

type TimelineDiaper = {
  id: string;
  type: "wet" | "dirty" | "both";
  stoolColor:
    | "yellow"
    | "brown"
    | "green"
    | "black"
    | "red"
    | "white"
    | "other"
    | "unknown"
    | null;
  stoolConsistency:
    | "watery"
    | "loose"
    | "soft"
    | "formed"
    | "hard"
    | "mucousy"
    | "other"
    | "unknown"
    | null;
  time: Date;
  creatorDisplayName: string;
  notes: string | null;
  createdAt: Date;
  updatedAt: Date;
};

type TimelineSleep = {
  id: string;
  startTime: Date;
  endTime: Date | null;
  creatorDisplayName: string;
  notes: string | null;
  createdAt: Date;
  updatedAt: Date;
};

export async function getTimelineData(
  userId: string,
  childId: string,
  input: {
    date: string;
    timezone?: string;
  },
) {
  const child = await getAccessibleChild(userId, childId);

  if (!child) {
    return null;
  }

  const timezone = input.timezone ?? "Asia/Shanghai";
  const range = getLocalDayRange(input.date, timezone);

  const [feedings, diapers, sleeps]: [
    TimelineFeeding[],
    TimelineDiaper[],
    TimelineSleep[],
  ] = await Promise.all([
    prisma.feedingRecord.findMany({
      where: {
        childId,
        deletedAt: null,
        startTime: {
          gte: range.start,
          lt: range.end,
        },
      },
      orderBy: { startTime: "desc" },
    }),
    prisma.diaperRecord.findMany({
      where: {
        childId,
        deletedAt: null,
        time: {
          gte: range.start,
          lt: range.end,
        },
      },
      orderBy: { time: "desc" },
    }),
    prisma.sleepRecord.findMany({
      where: {
        childId,
        deletedAt: null,
        startTime: {
          lt: range.end,
        },
        OR: [
          {
            endTime: null,
          },
          {
            endTime: {
              gt: range.start,
            },
          },
        ],
      },
      orderBy: { startTime: "desc" },
    }),
  ]);

  return {
    child,
    date: input.date,
    timelineItems: buildTimelineItems({ feedings, diapers, sleeps }),
  };
}
