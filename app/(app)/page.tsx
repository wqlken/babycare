import { requireUser } from "@/lib/auth/guards";
import { ActiveTimers } from "@/components/dashboard/active-timers";
import { QuickActions } from "@/components/dashboard/quick-actions";
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
    ? await getDashboardData(currentChild.id)
    : null;

  return (
    <section className="space-y-6">
      <div>
        <p className="text-sm font-medium text-sky-700">Babycare</p>
        <h1 className="mt-2 text-3xl font-semibold text-slate-950">
          {currentChild?.name ?? "宝宝"} 的今日记录
        </h1>
        <p className="mt-2 text-slate-600">
          快速记录喂养、尿布和睡眠，家人可以一起查看当天状态。
        </p>
      </div>
      {currentChild && dashboard ? (
        <>
          <QuickActions childId={currentChild.id} />
          <ActiveTimers
            activeBreastfeeding={dashboard.activeBreastfeeding}
            activeSleep={dashboard.activeSleep}
          />
          <SummaryCards summary={dashboard.summary} />
        </>
      ) : null}
    </section>
  );
}
