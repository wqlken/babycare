import { requireUser } from "@/lib/auth/guards";
import { ActiveTimers } from "@/components/dashboard/active-timers";
import { BottleInsights } from "@/components/dashboard/bottle-insights";
import { DayRhythmChart } from "@/components/dashboard/day-rhythm-chart";
import { QuickActions } from "@/components/dashboard/quick-actions";
import { RecentEvents } from "@/components/dashboard/recent-events";
import { SevenDaySummary } from "@/components/dashboard/seven-day-summary";
import { SummaryCards } from "@/components/dashboard/summary-cards";
import {
  getChildDashboardTarget,
  listAccessibleChildren,
} from "@/lib/children/service";
import { getDashboardData } from "@/lib/dashboard";

export default async function Home() {
  const user = await requireUser();
  const target = await getChildDashboardTarget(user.id);
  const children = await listAccessibleChildren(user.id);
  const currentChild =
    target.kind === "child"
      ? children.find((child) => child.id === target.childId)
      : null;
  const dashboard = currentChild
    ? await getDashboardData(user.id, currentChild.id)
    : null;

  return (
    <section className="space-y-6">
      <div className="rounded-lg border border-[var(--border-soft)] bg-[var(--surface)] px-4 py-5 shadow-sm">
        <p className="text-sm font-medium text-[var(--primary-strong)]">Babycare</p>
        <h1 className="mt-2 text-3xl font-semibold text-[#37413d]">
          {currentChild?.name ?? "宝宝"} 的今日记录
        </h1>
        <p className="mt-2 text-[#766e66]">
          快速记录喂养、尿布和睡眠，家人可以一起查看当天状态。
        </p>
      </div>
      {currentChild && dashboard ? (
        <>
          <QuickActions childId={currentChild.id} />
          <ActiveTimers
            childId={currentChild.id}
            activeBreastfeeding={dashboard.activeBreastfeeding}
            activeSleep={dashboard.activeSleep}
          />
          <SummaryCards
            summary={dashboard.summary}
            lastFeedingAt={dashboard.lastFeedingAt}
            lastDiaperAt={dashboard.lastDiaperAt}
            lastSleepAt={dashboard.lastSleepAt}
          />
          <DayRhythmChart rhythm={dashboard.dayRhythm} />
          <BottleInsights
            today={dashboard.summary}
            summaries={dashboard.sevenDaySummary}
          />
          <SevenDaySummary
            actionHref={`/children/${currentChild.id}/summary`}
            summaries={dashboard.sevenDaySummary}
          />
          <RecentEvents
            childId={currentChild.id}
            items={dashboard.timelineItems}
          />
        </>
      ) : null}
    </section>
  );
}
