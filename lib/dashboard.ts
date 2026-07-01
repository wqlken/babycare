import { prisma } from "@/lib/db";
import { summarizeDay } from "@/lib/summaries";
import { toLocalDateString } from "@/lib/time";
import { buildTimelineItems } from "@/lib/timeline";
import { getAccessibleChild } from "@/lib/children/service";

export async function getDashboardData(userId: string, childId: string) {
  const child = await getAccessibleChild(userId, childId);

  if (!child) {
    return null;
  }

  const [feedings, diapers, sleeps] = await Promise.all([
    prisma.feedingRecord.findMany({
      where: { childId, deletedAt: null },
      orderBy: { startTime: "desc" },
      take: 20,
    }),
    prisma.diaperRecord.findMany({
      where: { childId, deletedAt: null },
      orderBy: { time: "desc" },
      take: 20,
    }),
    prisma.sleepRecord.findMany({
      where: { childId, deletedAt: null },
      orderBy: { startTime: "desc" },
      take: 20,
    }),
  ]);

  const today = toLocalDateString(new Date(), "Asia/Shanghai");
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
  };
}
