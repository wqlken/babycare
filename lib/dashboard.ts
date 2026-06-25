import { prisma } from "@/lib/db";
import { summarizeDay } from "@/lib/summaries";
import { toLocalDateString } from "@/lib/time";
import { buildTimelineItems } from "@/lib/timeline";

export async function getDashboardData(childId: string) {
  const [child, feedings, diapers, sleeps] = await Promise.all([
    prisma.child.findUnique({
      where: { id: childId },
    }),
    prisma.feedingRecord.findMany({
      where: { childId },
      orderBy: { startTime: "desc" },
      take: 20,
    }),
    prisma.diaperRecord.findMany({
      where: { childId },
      orderBy: { time: "desc" },
      take: 20,
    }),
    prisma.sleepRecord.findMany({
      where: { childId },
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
    activeBreastfeeding:
      feedings.find((feeding) => feeding.type === "breast" && !feeding.endTime) ??
      null,
    activeSleep: sleeps.find((sleep) => !sleep.endTime) ?? null,
    timelineItems: buildTimelineItems({ feedings, diapers, sleeps }).slice(0, 8),
  };
}
